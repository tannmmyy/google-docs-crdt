import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Link, Users, Lock, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  onJoinRoom: (newRoom: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  roomName,
  onJoinRoom,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLan, setCopiedLan] = useState(false);
  const [newRoomInput, setNewRoomInput] = useState('');
  const [networkUrl, setNetworkUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/network-info')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.networkUrl) {
          setNetworkUrl(`${data.networkUrl}/?room=${encodeURIComponent(roomName)}`);
        }
      })
      .catch(() => {});
  }, [roomName, isOpen]);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/?room=${encodeURIComponent(roomName)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyLan = () => {
    if (networkUrl) {
      navigator.clipboard.writeText(networkUrl);
      setCopiedLan(true);
      setTimeout(() => setCopiedLan(false), 2500);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomInput.trim()) {
      onJoinRoom(newRoomInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Share with Collaborators</h3>
              <p className="text-xs text-gray-500">Real-time CRDT multi-user session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* General Access Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-start space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-800">General access: Anyone with the link</div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Anyone on the internet with this link can view and edit with synchronized presence and cursors.
              </div>
            </div>
          </div>

          {/* Copy Link Section */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Document Session Link (This Computer)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm ${
                  copied 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-[#1a73e8] hover:bg-[#1557b0] text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Connect from Second Computer / Phone (LAN) */}
          {networkUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center space-x-2 text-blue-900 font-semibold text-xs">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <span>Open on Another Computer / Laptop / Mobile</span>
              </div>
              <p className="text-[11px] text-blue-700 leading-tight">
                Any device connected to the same Wi-Fi / Local Network can open this exact link to edit simultaneously:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={networkUrl}
                  className="flex-1 text-xs bg-white border border-blue-200 rounded-lg px-3 py-2 text-blue-950 font-mono focus:outline-none font-medium"
                />
                <button
                  onClick={handleCopyLan}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm ${
                    copiedLan 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copiedLan ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLan ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Open another tab button */}
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            <span>Open in New Browser Window (Test Remote User)</span>
          </a>

          <div className="border-t border-gray-100 pt-3">
            <form onSubmit={handleJoin} className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Switch to Room or Document ID
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="e.g. project-roadmap"
                  value={newRoomInput}
                  onChange={(e) => setNewRoomInput(e.target.value)}
                  className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium rounded-full shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
