import React, { useState, useEffect } from 'react';
import { CollabSession, createCollabSession } from '../lib/collaboration';
import { EditorCanvas } from './EditorCanvas';
import { Wifi, WifiOff, Users, ArrowRightLeft } from 'lucide-react';

interface SplitScreenViewProps {
  roomName: string;
  primarySession: CollabSession;
}

export const SplitScreenView: React.FC<SplitScreenViewProps> = ({
  roomName,
  primarySession,
}) => {
  const [secondarySession, setSecondarySession] = useState<CollabSession | null>(null);
  const [isAOffline, setIsAOffline] = useState(false);
  const [isBOffline, setIsBOffline] = useState(false);

  // Initialize second client session
  useEffect(() => {
    const peerB = createCollabSession(roomName, {
      id: 'peer_b_' + Math.random().toString(36).substring(2, 7),
      name: 'Collaborator B (Bob)',
      color: '#EA4335', // Red
      avatar: 'B',
    });

    setSecondarySession(peerB);

    return () => {
      peerB.destroy();
    };
  }, [roomName]);

  const togglePeerA = () => {
    if (isAOffline) {
      primarySession.provider.connect();
      setIsAOffline(false);
    } else {
      primarySession.provider.disconnect();
      setIsAOffline(true);
    }
  };

  const togglePeerB = () => {
    if (!secondarySession) return;
    if (isBOffline) {
      secondarySession.provider.connect();
      setIsBOffline(false);
    } else {
      secondarySession.provider.disconnect();
      setIsBOffline(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#e8eaed] overflow-hidden">
      {/* Top Banner Explaining Multi-Peer Simulation */}
      <div className="bg-[#1a73e8] text-white px-4 py-1.5 flex items-center justify-between text-xs select-none shadow-sm">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span className="font-semibold">Dual-Peer Live Collaborative Simulation</span>
          <span className="text-blue-200">|</span>
          <span className="text-blue-100">
            Type in either editor to see live remote cursors, selections, and CRDT conflict resolution.
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>CRDT Sync Active</span>
          </span>
        </div>
      </div>

      {/* Side-by-side Editors Container */}
      <div className="flex-1 flex divide-x-2 divide-gray-300 overflow-hidden">
        {/* Left Peer Pane */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: primarySession.user.color }} 
              />
              <span className="font-semibold text-gray-800">
                Peer 1: {primarySession.user.name} (Primary Window)
              </span>
            </div>

            <button
              onClick={togglePeerA}
              className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center space-x-1 transition-colors ${
                isAOffline 
                  ? 'bg-rose-100 text-rose-700 border border-rose-300 hover:bg-rose-200' 
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200'
              }`}
            >
              {isAOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              <span>{isAOffline ? 'Peer 1 Disconnected' : 'Peer 1 Online'}</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <EditorCanvas session={primarySession} showRuler={false} />
          </div>
        </div>

        {/* Right Peer Pane */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          {secondarySession ? (
            <>
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: secondarySession.user.color }} 
                  />
                  <span className="font-semibold text-gray-800">
                    Peer 2: {secondarySession.user.name} (Simulated Remote Peer)
                  </span>
                </div>

                <button
                  onClick={togglePeerB}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center space-x-1 transition-colors ${
                    isBOffline 
                      ? 'bg-rose-100 text-rose-700 border border-rose-300 hover:bg-rose-200' 
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200'
                  }`}
                >
                  {isBOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                  <span>{isBOffline ? 'Peer 2 Disconnected' : 'Peer 2 Online'}</span>
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <EditorCanvas session={secondarySession} showRuler={false} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-xs">
              Initializing Peer 2...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
