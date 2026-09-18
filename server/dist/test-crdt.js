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
const Y = __importStar(require("yjs"));
function runConvergenceTest() {
    console.log('--- TEST 1: CRDT Concurrent Edits & Convergence Verification ---');
    const docA = new Y.Doc();
    const docB = new Y.Doc();
    const textA = docA.getText('content');
    const textB = docB.getText('content');
    // Initial common text
    textA.insert(0, 'Hello world! Real-time collaborative editor.');
    const initialUpdate = Y.encodeStateAsUpdate(docA);
    Y.applyUpdate(docB, initialUpdate);
    console.log('Initial sync state:');
    console.log('Doc A:', textA.toString());
    console.log('Doc B:', textB.toString());
    if (textA.toString() !== textB.toString()) {
        throw new Error('Initial sync mismatch');
    }
    console.log('\n--- Simulating Network Partition with Concurrent Mutations ---');
    // Client A types while offline
    textA.insert(0, '[A: Prefix] ');
    textA.insert(textA.length, ' [A: Suffix]');
    // Client B types concurrently while offline
    textB.insert(0, '[B: Urgent Note] ');
    textB.delete(18, 5); // Delete 'world'
    console.log('Partitioned Doc A state:', textA.toString());
    console.log('Partitioned Doc B state:', textB.toString());
    console.log('\n--- Simulating Partition Healing (Sync Protocol v2 Exchange) ---');
    // Generate differential state updates
    const stateVectorA = Y.encodeStateVector(docA);
    const stateVectorB = Y.encodeStateVector(docB);
    const diffForA = Y.encodeStateAsUpdate(docB, stateVectorA);
    const diffForB = Y.encodeStateAsUpdate(docA, stateVectorB);
    // Apply differential updates
    Y.applyUpdate(docA, diffForA);
    Y.applyUpdate(docB, diffForB);
    console.log('\n--- Convergence Verification ---');
    console.log('Converged Doc A:', textA.toString());
    console.log('Converged Doc B:', textB.toString());
    if (textA.toString() === textB.toString()) {
        console.log('✅ SUCCESS: Both documents converged to the exact same deterministic state!');
    }
    else {
        throw new Error('❌ FAILURE: Documents diverged!');
    }
    console.log('\n--- TEST 2: Stress Simulation (100 Concurrent Randomized Operations) ---');
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();
    const t1 = doc1.getText('stress');
    const t2 = doc2.getText('stress');
    for (let i = 0; i < 50; i++) {
        const pos1 = Math.floor(Math.random() * (t1.length + 1));
        t1.insert(pos1, `A${i}`);
        const pos2 = Math.floor(Math.random() * (t2.length + 1));
        t2.insert(pos2, `B${i}`);
    }
    // Cross sync all updates
    const update1 = Y.encodeStateAsUpdate(doc1);
    const update2 = Y.encodeStateAsUpdate(doc2);
    Y.applyUpdate(doc2, update1);
    Y.applyUpdate(doc1, update2);
    if (t1.toString() === t2.toString()) {
        console.log(`✅ SUCCESS: 100 concurrent mutations converged! Final length: ${t1.length} chars.`);
    }
    else {
        throw new Error('❌ FAILURE: Divergence under concurrent stress test!');
    }
}
try {
    runConvergenceTest();
}
catch (err) {
    console.error(err);
    process.exit(1);
}
