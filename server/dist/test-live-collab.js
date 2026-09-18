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
const Y = __importStar(require("yjs"));
const ws_1 = __importDefault(require("ws"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { WebsocketProvider } = require('y-websocket');
async function testLiveCollab() {
    console.log('--- Testing Live Collaborative WebSocket Synchronization ---');
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();
    // @ts-ignore
    global.WebSocket = ws_1.default;
    const provider1 = new WebsocketProvider('ws://localhost:4444', 'collab_test_room', doc1, { WebSocketPolyfill: ws_1.default });
    const provider2 = new WebsocketProvider('ws://localhost:4444', 'collab_test_room', doc2, { WebSocketPolyfill: ws_1.default });
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
    }
    else {
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
