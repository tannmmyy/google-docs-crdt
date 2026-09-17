# Google Docs - Real-Time Collaborative Document Editor (CRDT Engine)

A production-grade, full-stack collaborative rich-text editor modeled directly after **Google Docs**, engineered specifically to fulfill the distributed systems challenge requirements in **Track 3: Full Stack Engineering - 01 Real-Time Collaborative Document Editor**.

![Google Docs CRDT](https://img.shields.io/badge/CRDT-Yjs%20(YATA)-blue)
![Network](https://img.shields.io/badge/Networking-WebSocket%20Sync%20Protocol-green)
![Editor](https://img.shields.io/badge/Editor-ProseMirror%20%2F%20TipTap-orange)
![Persistence](https://img.shields.io/badge/Persistence-Disk%20%2B%20IndexedDB-purple)

---

## 🌟 Key Distributed Systems Features

1. **Conflict-Free Replicated Data Type (CRDT)**:
   - Uses the **Yjs** CRDT engine implementing the **YATA** (Yet Another Transformation Approach) algorithm.
   - Strictly eliminates **Last-Write-Wins (LWW)** race conditions.
   - Operations (insertions, deletions, formatting) commute deterministically across latent and out-of-order networks.

2. **Live Presence & Synchronized Cursors**:
   - Synchronized remote caret positions with distinctive collaborator colors and floating name tags.
   - Real-time active selection highlighting across paragraphs and nested formatting.
   - Header avatar stack showing connected collaborators with active connection indicators.

3. **Dual-Layer Persistence & Network Partition Recovery**:
   - **Local Cache (Client)**: Powered by `y-indexeddb`, mutations made while disconnected are queued locally in browser IndexedDB.
   - **Disk Storage (Server)**: Yjs binary document updates are debounced and persisted to `server/storage/{docName}.ydoc`. Documents survive server restarts and reconnections with 100% fidelity.
   - **Sync Protocol v2**: On network recovery, clients exchange differential state vectors to reconcile missed mutations without duplicate writes.

4. **Google Docs Visuals & Formatting**:
   - Authentic Google Docs header with editable document title, auto-save status (*"Saved to Drive"*), and action menu (File, Edit, View, Insert, Format, Tools).
   - Rich formatting toolbar: Bold, Italic, Underline, Strikethrough, Heading styles, Text colors, Highlight colors, Text alignment, Bulleted/Numbered lists, Checklists (task items), Blockquotes, Code blocks, and Tables.
   - Document paper canvas with realistic margin guides, A4/Letter proportion, shadow, ruler, and zoom control.
   - Export to Markdown (`.md`), HTML (`.html`), and PDF / Print (`Ctrl+P`).

5. **Track 3 Mentor Evaluation & Chaos Suite**:
   - **Dual-Peer Simulator**: 1-click side-by-side split screen running two isolated collaborative peers in the same browser window for immediate live testing of simultaneous typing and cursor tracking.
   - **Chaos Panel**:
     - Network severance simulation: toggle client offline to test partitioned editing and subsequent healing.
     - Artificial latency slider (0ms - 1500ms) to test performance on high-latency networks.
     - Concurrent race-condition stress tester: dispatches 25 randomized concurrent mutations to prove zero data corruption or divergence.
     - Real-time CRDT telemetry: encoded byte size, clock states, awareness peer count.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js LTS (v24+ installed)

### Running the Application

1. **Start the Collaborative CRDT Server**:
   ```bash
   cd server
   npm run dev
   ```
   *Runs WebSocket and REST API server on `http://localhost:4444` and `ws://localhost:4444`.*

2. **Start the Google Docs Web Client**:
   ```bash
   cd client
   npm run dev
   ```
   *Runs Vite development server on `http://localhost:3000`.*

3. Open `http://localhost:3000` in your web browser.

---

## 🧪 Testing and Verification

### 1. Automated CRDT Convergence Test
Run the automated distributed systems test suite:
```bash
cd server
npm run test:crdt
```
This tests:
- Concurrent out-of-order edits under simulated network partitioning.
- Differential state vector exchange (partition healing).
- 100 randomized stress mutations verifying that both document states converge identically.

### 2. Live Collaboration & Cursor Testing
- Click **"Dual Peer Test"** in the top bar to open two side-by-side collaborative editors in the same window.
- Type in Peer 1 and observe live character synchronization and caret movement in Peer 2.
- Highlight text in Peer 1 to observe remote selection highlighting in Peer 2.

### 3. Partition Healing Test
- Click **"Chaos & CRDT"** in the top header.
- Click **"Simulate Network Cut (Go Offline)"** on Peer 1.
- Type a sentence in Peer 1 while disconnected.
- Type a different sentence in Peer 2.
- Click **"Heal Partition (Reconnect & Sync)"**.
- Observe both streams instantly reconcile with zero data loss.
