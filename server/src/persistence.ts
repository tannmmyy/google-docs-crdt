import * as fs from 'fs';
import * as path from 'path';
import * as Y from 'yjs';

const STORAGE_DIR = path.resolve(__dirname, '../storage');

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

interface DocumentMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  updateCount: number;
}

// In-memory debounce timers for disk flushing
const writeDebounceTimers = new Map<string, NodeJS.Timeout>();

export class DiskPersistence {
  private static getDocPath(docName: string): string {
    const safeName = docName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(STORAGE_DIR, `${safeName}.ydoc`);
  }

  private static getMetaPath(docName: string): string {
    const safeName = docName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(STORAGE_DIR, `${safeName}.meta.json`);
  }

  /**
   * Loads persisted Yjs document from disk if available
   */
  public static initDocument(docName: string, ydoc: Y.Doc): void {
    const filePath = this.getDocPath(docName);
    if (fs.existsSync(filePath)) {
      try {
        const updateBuffer = fs.readFileSync(filePath);
        const update = new Uint8Array(updateBuffer);
        Y.applyUpdate(ydoc, update);
        console.log(`[Persistence] Loaded ${docName} (${update.byteLength} bytes) from disk.`);
      } catch (err) {
        console.error(`[Persistence] Failed to load ${docName} from disk:`, err);
      }
    } else {
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
    ydoc.on('update', (update: Uint8Array) => {
      this.scheduleSave(docName, ydoc);
    });
  }

  /**
   * Debounced save of document CRDT state to disk
   */
  public static scheduleSave(docName: string, ydoc: Y.Doc, delayMs = 1000): void {
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
  public static saveImmediate(docName: string, ydoc: Y.Doc): void {
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
    } catch (err) {
      console.error(`[Persistence] Error writing ${docName} to disk:`, err);
    }
  }

  public static getMetadata(docName: string): DocumentMetadata {
    const metaPath = this.getMetaPath(docName);
    if (fs.existsSync(metaPath)) {
      try {
        return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch {
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

  public static saveMetadata(docName: string, meta: DocumentMetadata): void {
    const metaPath = this.getMetaPath(docName);
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
  }

  public static listDocuments(): DocumentMetadata[] {
    const files = fs.readdirSync(STORAGE_DIR);
    const metaFiles = files.filter(f => f.endsWith('.meta.json'));
    const results: DocumentMetadata[] = [];

    for (const f of metaFiles) {
      try {
        const content = fs.readFileSync(path.join(STORAGE_DIR, f), 'utf-8');
        results.push(JSON.parse(content));
      } catch {
        // ignore malformed
      }
    }

    return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}
