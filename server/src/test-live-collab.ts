import * as Y from 'yjs';
import WebSocket from 'ws';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { WebsocketProvider } = require('y-websocket');

async function testLiveCollab() {
  console.log('--- Testing Live Collaborative WebSocket Synchronization ---');
  
  const doc1 = new Y.Doc();
  const doc2 = new Y.Doc();

  // @ts-ignore
  global.WebSocket = WebSocket;

  const provider1 = new WebsocketProvider('ws://localhost:4444', 'collab_test_room', doc1, { WebSocketPolyfill: WebSocket });
  const provider2 = new WebsocketProvider('ws://localhost:4444', 'collab_test_room', doc2, { WebSocketPolyfill: WebSocket });

  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('Provider 1 synced:', provider1.synced);
  console.log('Provider 2 synced:', provider2.synced);

  const t1 = doc1.getText('default');
  const t2 = doc2.getText('default');

  console.log('Client 1 typing "Distributed CRDT Engine "...');
  t1.insert(0, 'Distributed CRDT Engine ');

  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('Client 2 received text:', t2.toString());

  console.log('Client 2 appending "with Google Docs Look & Feel!"...');
  t2.insert(t2.length, 'with Google Docs Look & Feel!');

  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('Final text in Client 1:', t1.toString());
  console.log('Final text in Client 2:', t2.toString());

  if (t1.toString() === t2.toString() && t1.toString() === 'Distributed CRDT Engine with Google Docs Look & Feel!') {
    console.log('✅ PASS: Real-time peer-to-peer WebSocket CRDT sync succeeded perfectly!');
  } else {
    throw new Error('❌ FAIL: Real-time text mismatch!');
  }

  provider1.destroy();
  provider2.destroy();
  doc1.destroy();
  doc2.destroy();
  process.exit(0);
}

testLiveCollab().catch(err => {
  console.error(err);
  process.exit(1);
});
