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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiskPersistence = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Y = __importStar(require("yjs"));
const STORAGE_DIR = path.resolve(__dirname, '../storage');
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
// In-memory debounce timers for disk flushing
const writeDebounceTimers = new Map();
class DiskPersistence {
    static getDocPath(docName) {
        const safeName = docName.replace(/[^a-zA-Z0-9_-]/g, '_');
        return path.join(STORAGE_DIR, `${safeName}.ydoc`);
    }
    static getMetaPath(docName) {
        const safeName = docName.replace(/[^a-zA-Z0-9_-]/g, '_');
        return path.join(STORAGE_DIR, `${safeName}.meta.json`);
    }
    /**
     * Loads persisted Yjs document from disk if available
     */
    static initDocument(docName, ydoc) {
        const filePath = this.getDocPath(docName);
        if (fs.existsSync(filePath)) {
            try {
                const updateBuffer = fs.readFileSync(filePath);
                const update = new Uint8Array(updateBuffer);
                Y.applyUpdate(ydoc, update);
                console.log(`[Persistence] Loaded ${docName} (${update.byteLength} bytes) from disk.`);
            }
            catch (err) {
                console.error(`[Persistence] Failed to load ${docName} from disk:`, err);
            }
        }
        else {
            console.log(`[Persistence] New document created: ${docName}`);
            this.saveMetadata(docName, {
                id: docName,
                title: docName === 'default' ? 'Untitled Document' : docName,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                updateCount: 0
            });
        }
        // Subscribe to document updates and persist to disk
        ydoc.on('update', (update) => {
            this.scheduleSave(docName, ydoc);
        });
    }
    /**
     * Debounced save of document CRDT state to disk
     */
    static scheduleSave(docName, ydoc, delayMs = 1000) {
        const existing = writeDebounceTimers.get(docName);
        if (existing) {
            clearTimeout(existing);
        }
        const timer = setTimeout(() => {
            this.saveImmediate(docName, ydoc);
            writeDebounceTimers.delete(docName);
        }, delayMs);
        writeDebounceTimers.set(docName, timer);
    }
    /**
     * Immediately encodes state and writes to disk
     */
    static saveImmediate(docName, ydoc) {
        try {
            const stateUpdate = Y.encodeStateAsUpdate(ydoc);
            const filePath = this.getDocPath(docName);
            fs.writeFileSync(filePath, Buffer.from(stateUpdate));
            // Update metadata
            const meta = this.getMetadata(docName);
            meta.updatedAt = new Date().toISOString();
            meta.updateCount = (meta.updateCount || 0) + 1;
            this.saveMetadata(docName, meta);
            console.log(`[Persistence] Saved ${docName} (${stateUpdate.byteLength} bytes) to disk.`);
        }
        catch (err) {
            console.error(`[Persistence] Error writing ${docName} to disk:`, err);
        }
    }
    static getMetadata(docName) {
        const metaPath = this.getMetaPath(docName);
        if (fs.existsSync(metaPath)) {
            try {
                return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            }
            catch {
                // fallback below
            }
        }
        return {
            id: docName,
            title: docName === 'default' ? 'Untitled Document' : docName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updateCount: 0
        };
    }
    static saveMetadata(docName, meta) {
        const metaPath = this.getMetaPath(docName);
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
    }
    static listDocuments() {
        const files = fs.readdirSync(STORAGE_DIR);
        const metaFiles = files.filter(f => f.endsWith('.meta.json'));
        const results = [];
        for (const f of metaFiles) {
            try {
                const content = fs.readFileSync(path.join(STORAGE_DIR, f), 'utf-8');
                results.push(JSON.parse(content));
            }
            catch {
                // ignore malformed
            }
        }
        return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
}
exports.DiskPersistence = DiskPersistence;
