import React, { useState, useEffect } from 'react';
import { X, History, Bookmark, Check, Clock, Database } from 'lucide-react';
import * as Y from 'yjs';
import { CollabSession } from '../lib/collaboration';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CollabSession;
}

interface SnapshotItem {
  id: string;
  name: string;
  timestamp: string;
  author: string;
  sizeBytes: number;
  preview: string;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([]);
  const [newVersionName, setNewVersionName] = useState('');

  // Load existing snapshots from localStorage
  useEffect(() => {
    if (!isOpen) return;
    const key = `gdocs_snapshots_${session.roomName}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setSnapshots(JSON.parse(stored));
      } catch {
        setSnapshots([]);
      }
    } else {
      // Create initial automatic snapshot
      const text = session.doc.getText('default').toString();
      const initial: SnapshotItem = {
        id: 'snap_init',
        name: 'Initial State',
        timestamp: new Date().toLocaleTimeString(),
        author: session.user.name,
        sizeBytes: Y.encodeStateAsUpdate(session.doc).byteLength,
        preview: text.substring(0, 100) || 'Empty document',
      };
      setSnapshots([initial]);
      localStorage.setItem(key, JSON.stringify([initial]));
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newVersionName.trim() || `Revision ${snapshots.length + 1}`;
    const text = session.doc.getText('default').toString();
    const item: SnapshotItem = {
      id: 'snap_' + Date.now(),
      name,
      timestamp: new Date().toLocaleTimeString(),
      author: session.user.name,
      sizeBytes: Y.encodeStateAsUpdate(session.doc).byteLength,
      preview: text.substring(0, 120) || '(No text)',
    };

    const updated = [item, ...snapshots];
    setSnapshots(updated);
    localStorage.setItem(`gdocs_snapshots_${session.roomName}`, JSON.stringify(updated));
    setNewVersionName('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Version History</h3>
              <p className="text-xs text-gray-500">CRDT state vector snapshots</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Snapshot creator */}
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <form onSubmit={handleCreateSnapshot} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Name current version (e.g. Final Draft)..."
              value={newVersionName}
              onChange={(e) => setNewVersionName(e.target.value)}
              className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Snapshot</span>
            </button>
          </form>
        </div>

        {/* Snapshots list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {snapshots.map((s, idx) => (
            <div
              key={s.id}
              className="border border-gray-200 rounded-xl p-3.5 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-gray-900">{s.name}</span>
                  {idx === 0 && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-center text-[11px] text-gray-500 space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{s.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-gray-500">
                <span>By: <strong>{s.author}</strong></span>
                <span>•</span>
                <span className="flex items-center">
                  <Database className="w-3 h-3 mr-1 text-gray-400" />
                  {s.sizeBytes} bytes CRDT
                </span>
              </div>

              <div className="mt-2 text-[11px] text-gray-600 bg-white p-2 rounded border border-gray-100 font-mono truncate">
                "{s.preview}"
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
