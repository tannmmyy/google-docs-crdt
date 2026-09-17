import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { UserAwareness, ConnectionStatus, DocumentStats } from './types';
import { getRandomCollaborator } from './colors';

export interface CollabSession {
  doc: Y.Doc;
  provider: WebsocketProvider;
  persistence: IndexeddbPersistence;
  user: UserAwareness;
  roomName: string;
  destroy: () => void;
}

const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = `${wsProtocol}//${window.location.host}`;

export function createCollabSession(
  roomName: string = 'default',
  customUser?: UserAwareness
): CollabSession {
  const doc = new Y.Doc();

  // Local IndexedDB persistence (caching CRDT state offline)
  const persistence = new IndexeddbPersistence(`gdocs_${roomName}`, doc);

  // WebSocket sync provider
  const provider = new WebsocketProvider(WS_URL, roomName, doc, {
    connect: true,
  });

  const user = customUser || getRandomCollaborator();

  // Set user awareness (name, color, cursor)
  provider.awareness.setLocalStateField('user', {
    id: user.id,
    name: user.name,
    color: user.color,
    avatar: user.avatar,
  });

  const destroy = () => {
    provider.destroy();
    persistence.destroy();
    doc.destroy();
  };

  return {
    doc,
    provider,
    persistence,
    user,
    roomName,
    destroy,
  };
}

/**
 * Helper to compute live CRDT statistics
 */
export function getDocumentStats(doc: Y.Doc, provider: WebsocketProvider): DocumentStats {
  const encoded = Y.encodeStateAsUpdate(doc);
  const activePeers = provider.awareness.getStates().size;

  return {
    crdtByteSize: encoded.byteLength,
    updateCount: doc.store.clients.size,
    activePeers: Math.max(1, activePeers),
    lastSyncedAt: provider.synced ? new Date().toLocaleTimeString() : null,
    pendingLocalUpdates: 0,
  };
}
