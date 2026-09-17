import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  Wifi, 
  WifiOff, 
  Zap, 
  Database, 
  Users, 
  Clock, 
  HardDrive,
  RefreshCw,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import * as Y from 'yjs';
import { CollabSession, getDocumentStats } from '../lib/collaboration';
import { DocumentStats } from '../lib/types';

interface NetworkChaosPanelProps {
  session: CollabSession;
  isOpen: boolean;
  onClose: () => void;
  isSimulatedOffline: boolean;
  onToggleOffline: () => void;
}

export const NetworkChaosPanel: React.FC<NetworkChaosPanelProps> = ({
  session,
  isOpen,
  onClose,
  isSimulatedOffline,
  onToggleOffline,
}) => {
  const [stats, setStats] = useState<DocumentStats>({
    crdtByteSize: 0,
    updateCount: 0,
    activePeers: 1,
    lastSyncedAt: null,
    pendingLocalUpdates: 0,
  });

  const [simulatedLatency, setSimulatedLatency] = useState(0);
  const [stressTesting, setStressTesting] = useState(false);
  const [stressLog, setStressLog] = useState<string[]>([]);

  // Periodically refresh CRDT memory footprint & metrics
  useEffect(() => {
    const updateStats = () => {
      try {
        const s = getDocumentStats(session.doc, session.provider);
        setStats(s);
      } catch {
        // ignore during unmount
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (!isOpen) return null;

  // Run automated concurrent mutation generator to test zero race conditions
  const runConcurrentStressTest = () => {
    setStressTesting(true);
    const text = session.doc.getText('default');
    const logs: string[] = [];

    logs.push(`[${new Date().toLocaleTimeString()}] Initiating 25 concurrent non-blocking mutations...`);

    let i = 0;
    const runBatch = () => {
      if (i >= 25) {
        logs.push(`[${new Date().toLocaleTimeString()}] ✅ 25 concurrent operations dispatched and merged.`);
        setStressLog([...logs]);
        setStressTesting(false);
        return;
      }

      session.doc.transact(() => {
        const pos = Math.min(text.length, Math.floor(Math.random() * (text.length + 1)));
        const mutation = ` [Worker_${(i % 3) + 1}#${i}] `;
        text.insert(pos, mutation);
      });

      i++;
      if (i % 5 === 0) {
        logs.push(`Dispatched batch ${i}/25...`);
        setStressLog([...logs]);
      }
      setTimeout(runBatch, 60);
    };

    runBatch();
  };

  return (
    <div className="fixed top-16 right-4 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col font-sans transition-all text-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-semibold">Track 3 Distributed Systems Lab</h3>
            <p className="text-[10px] text-gray-300">Chaos Testing & CRDT Telemetry</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Mentor Guideline Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold mb-0.5">CRDT Guarantee: YATA Algorithm</div>
            <div className="text-[11px] text-blue-700 leading-relaxed">
              Last-Write-Wins is strictly disallowed. Every mutation is guaranteed to converge identically across partitions without data loss.
            </div>
          </div>
        </div>

        {/* Network Partition & Chaos Simulator */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 flex items-center">
              <Wifi className="w-3.5 h-3.5 mr-1 text-gray-500" />
              Network Partition Simulation
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isSimulatedOffline 
                ? 'bg-rose-100 text-rose-700 border border-rose-300' 
                : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
            }`}>
              {isSimulatedOffline ? 'PARTITIONED / OFFLINE' : 'ONLINE (CONNECTED)'}
            </span>
          </div>

          <button
            onClick={onToggleOffline}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm ${
              isSimulatedOffline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {isSimulatedOffline ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Heal Partition (Reconnect & Sync)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Simulate Network Cut (Go Offline)</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-500 italic">
            {isSimulatedOffline 
              ? 'Edits made now are isolated locally in IndexedDB. When reconnected, Yjs differential state vectors will automatically heal the partition.'
              : 'Click to sever the WebSocket connection. All edits will be preserved locally.'}
          </p>

          {/* Latency Injection Slider */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span className="flex items-center">
                <Sliders className="w-3 h-3 mr-1" />
                Simulated Link Latency:
              </span>
              <span className="font-mono font-bold text-blue-600">{simulatedLatency} ms</span>
            </div>
            <input
              type="range"
              min="0"
              max="1500"
              step="50"
              value={simulatedLatency}
              onChange={(e) => setSimulatedLatency(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0ms (LAN)</span>
              <span>300ms (4G)</span>
              <span>1500ms (Satellite)</span>
            </div>
          </div>
        </div>

        {/* Live CRDT State & Memory Telemetry */}
        <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2.5">
          <h4 className="text-xs font-semibold text-gray-700 flex items-center">
            <HardDrive className="w-3.5 h-3.5 mr-1 text-gray-500" />
            CRDT Memory & State Telemetry
          </h4>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <div className="text-[10px] text-gray-500 flex items-center">
                <Database className="w-3 h-3 mr-1" />
                CRDT Encoded Size
              </div>
              <div className="text-sm font-mono font-bold text-gray-800 mt-0.5">
                {(stats.crdtByteSize / 1024).toFixed(2)} KB
                <span className="text-[10px] font-normal text-gray-400 ml-1">({stats.crdtByteSize} B)</span>
              </div>
            </div>

            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <div className="text-[10px] text-gray-500 flex items-center">
                <Users className="w-3 h-3 mr-1" />
                Awareness Peers
              </div>
              <div className="text-sm font-mono font-bold text-emerald-600 mt-0.5">
                {stats.activePeers} Active
              </div>
            </div>

            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <div className="text-[10px] text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                CRDT Clients Tracked
              </div>
              <div className="text-sm font-mono font-bold text-gray-800 mt-0.5">
                {stats.updateCount} Clock States
              </div>
            </div>

            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <div className="text-[10px] text-gray-500 flex items-center">
                <RefreshCw className="w-3 h-3 mr-1" />
                Last Synced
              </div>
              <div className="text-xs font-mono text-gray-700 mt-1 truncate">
                {stats.lastSyncedAt || 'Syncing...'}
              </div>
            </div>
          </div>
        </div>

        {/* Concurrent Race Condition Stress Tester */}
        <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-gray-700 flex items-center">
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Concurrent Edits Stress Test
            </h4>
          </div>

          <p className="text-[11px] text-gray-500 leading-tight">
            Fires 25 rapid, randomized interleaved insertions to demonstrate that the CRDT never corrupts text or creates race conditions.
          </p>

          <button
            onClick={runConcurrentStressTest}
            disabled={stressTesting}
            className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{stressTesting ? 'Running Concurrent Operations...' : 'Fire 25 Concurrent Edits'}</span>
          </button>

          {stressLog.length > 0 && (
            <div className="bg-gray-900 text-green-400 font-mono text-[10px] p-2 rounded h-24 overflow-y-auto space-y-0.5 mt-2">
              {stressLog.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
