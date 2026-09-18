"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const Y = __importStar(require("yjs"));
const persistence_1 = require("./persistence");
// Helper to obtain local LAN IP
function getLocalIPAddress() {
    const interfaces = os_1.default.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utils = require('y-websocket/bin/utils');
const PORT = Number(process.env.PORT) || 3000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ noServer: true });
// Attach persistence provider to y-websocket
utils.setPersistence({
    bindState: async (docName, ydoc) => {
        persistence_1.DiskPersistence.initDocument(docName, ydoc);
    },
    writeState: async (docName, ydoc) => {
        persistence_1.DiskPersistence.saveImmediate(docName, ydoc);
    }
});
// REST API
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), version: '1.0.0' });
});
// Return network info for multi-computer connections
app.get('/api/network-info', (req, res) => {
    const localIp = getLocalIPAddress();
    res.json({
        localIp,
        serverPort: PORT,
        clientPort: PORT,
        localUrl: `http://localhost:${PORT}`,
        networkUrl: `http://${localIp}:${PORT}`,
        wsNetworkUrl: `ws://${localIp}:${PORT}`
    });
});
// List documents
app.get('/api/documents', (req, res) => {
    try {
        const docs = persistence_1.DiskPersistence.listDocuments();
        res.json(docs);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Create new document
app.post('/api/documents', (req, res) => {
    const { title } = req.body;
    const docId = 'doc_' + Math.random().toString(36).substring(2, 9);
    const meta = {
        id: docId,
        title: title || 'Untitled Document',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updateCount: 0
    };
    persistence_1.DiskPersistence.saveMetadata(docId, meta);
    res.json(meta);
});
// Get document metadata
app.get('/api/documents/:id/metadata', (req, res) => {
    const meta = persistence_1.DiskPersistence.getMetadata(req.params.id);
    res.json(meta);
});
// Update document metadata (e.g. title)
app.patch('/api/documents/:id/metadata', (req, res) => {
    const meta = persistence_1.DiskPersistence.getMetadata(req.params.id);
    if (req.body.title) {
        meta.title = req.body.title;
    }
    meta.updatedAt = new Date().toISOString();
    persistence_1.DiskPersistence.saveMetadata(req.params.id, meta);
    res.json(meta);
});
// CRDT Stats for document
app.get('/api/documents/:id/stats', (req, res) => {
    const docName = req.params.id;
    const docsMap = utils.docs;
    const activeYDoc = docsMap.get(docName);
    let byteSize = 0;
    let clientsCount = 0;
    if (activeYDoc) {
        byteSize = Y.encodeStateAsUpdate(activeYDoc).byteLength;
        clientsCount = activeYDoc.conns ? activeYDoc.conns.size : 0;
    }
    const meta = persistence_1.DiskPersistence.getMetadata(docName);
    res.json({
        id: docName,
        title: meta.title,
        activeInMemory: !!activeYDoc,
        activeClients: clientsCount,
        crdtByteSize: byteSize,
        updatedAt: meta.updatedAt,
        updateCount: meta.updateCount
    });
});
// Serve frontend static assets
const CLIENT_DIST = path_1.default.resolve(__dirname, '../../client/dist');
if (fs_1.default.existsSync(CLIENT_DIST)) {
    app.use(express_1.default.static(CLIENT_DIST));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path_1.default.join(CLIENT_DIST, 'index.html'));
    });
}
// Handle WebSocket Upgrade
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
wss.on('connection', (conn, req) => {
    // Extract docName from url path e.g. /my-doc-room or /ws/my-doc-room or default
    let url = req.url || '/';
    url = url.split('?')[0];
    if (url.startsWith('/ws/')) {
        url = url.slice(3);
    }
    const docName = url.slice(1) || 'default';
    console.log(`[WS] Client connected from ${req.socket.remoteAddress} to document: ${docName}`);
    utils.setupWSConnection(conn, req, { docName, gc: true });
});
server.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIPAddress();
    console.log(`===================================================`);
    console.log(`🚀 Real-Time Collaborative Google Docs Server (Single-Port Unified)`);
    console.log(`💻 Local URL:      http://localhost:${PORT}`);
    console.log(`🌐 Network URL:    http://${localIp}:${PORT}`);
    console.log(`📡 WebSocket:      ws://${localIp}:${PORT}`);
    console.log(`===================================================`);
});
