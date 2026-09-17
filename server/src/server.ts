import http from 'http';
import os from 'os';
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import { DiskPersistence } from './persistence';

// Helper to obtain local LAN IP
function getLocalIPAddress(): string {
  const interfaces = os.networkInterfaces();
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
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Attach persistence provider to y-websocket
utils.setPersistence({
  bindState: async (docName: string, ydoc: Y.Doc) => {
    DiskPersistence.initDocument(docName, ydoc);
  },
  writeState: async (docName: string, ydoc: Y.Doc) => {
    DiskPersistence.saveImmediate(docName, ydoc);
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
    const docs = DiskPersistence.listDocuments();
    res.json(docs);
  } catch (err: any) {
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
  DiskPersistence.saveMetadata(docId, meta);
  res.json(meta);
});

// Get document metadata
app.get('/api/documents/:id/metadata', (req, res) => {
  const meta = DiskPersistence.getMetadata(req.params.id);
  res.json(meta);
});

// Update document metadata (e.g. title)
app.patch('/api/documents/:id/metadata', (req, res) => {
  const meta = DiskPersistence.getMetadata(req.params.id);
  if (req.body.title) {
    meta.title = req.body.title;
  }
  meta.updatedAt = new Date().toISOString();
  DiskPersistence.saveMetadata(req.params.id, meta);
  res.json(meta);
});

// CRDT Stats for document
app.get('/api/documents/:id/stats', (req, res) => {
  const docName = req.params.id;
  const docsMap = utils.docs as Map<string, any>;
  const activeYDoc = docsMap.get(docName);

  let byteSize = 0;
  let clientsCount = 0;

  if (activeYDoc) {
    byteSize = Y.encodeStateAsUpdate(activeYDoc).byteLength;
    clientsCount = activeYDoc.conns ? activeYDoc.conns.size : 0;
  }

  const meta = DiskPersistence.getMetadata(docName);

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
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// Handle WebSocket Upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (conn: WebSocket, req: http.IncomingMessage) => {
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
