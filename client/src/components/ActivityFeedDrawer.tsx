import React, { useState, useMemo } from 'react';
import { 
  X, 
  Activity, 
  PlusCircle, 
  MinusCircle, 
  Type, 
  Table, 
  UserCheck, 
  Clock, 
  Filter, 
  Trash2,
  Sparkles,
  Edit2
} from 'lucide-react';
import { ActivityItem, UserAwareness } from '../lib/types';

interface ActivityFeedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityItem[];
  currentUser: UserAwareness;
  onClearFeed?: () => void;
}

export const ActivityFeedDrawer: React.FC<ActivityFeedDrawerProps> = ({
  isOpen,
  onClose,
  activities,
  currentUser,
  onClearFeed,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesFilter = filterType === 'all' || act.type === filterType;
      const matchesSearch = searchTerm.trim() === '' || 
        act.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.actionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (act.snippet && act.snippet.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [activities, filterType, searchTerm]);

  if (!isOpen) return null;

  const getActionBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'insert':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <PlusCircle className="w-3 h-3 text-emerald-600" />
            <span>INSERT</span>
          </span>
        );
      case 'delete':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <MinusCircle className="w-3 h-3 text-rose-600" />
            <span>DELETE</span>
          </span>
        );
      case 'format':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Type className="w-3 h-3 text-indigo-600" />
            <span>FORMAT</span>
          </span>
        );
      case 'table':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Table className="w-3 h-3 text-amber-600" />
            <span>TABLE</span>
          </span>
        );
      case 'join':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
            <UserCheck className="w-3 h-3 text-cyan-600" />
            <span>JOINED</span>
          </span>
        );
      case 'rename':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Edit2 className="w-3 h-3 text-purple-600" />
            <span>PROFILE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
            <Sparkles className="w-3 h-3 text-gray-500" />
            <span>EVENT</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed top-14 right-0 w-96 h-[calc(100vh-3.5rem)] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col font-sans transition-all duration-300 no-print">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-semibold flex items-center space-x-2">
              <span>Real-Time Activity Feed</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h3>
            <p className="text-[11px] text-gray-300">Live audit log of all collaborator edits</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close Activity Feed"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 border-b border-gray-100 bg-gray-50 space-y-2">
        <input
          type="text"
          placeholder="Search by user or text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
            {['all', 'insert', 'delete', 'format', 'join'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize transition-colors ${
                  filterType === f
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {onClearFeed && activities.length > 0 && (
            <button
              onClick={onClearFeed}
              className="text-[10px] text-gray-400 hover:text-rose-600 flex items-center space-x-0.5 p-1"
              title="Clear activity feed"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-12">
            <Activity className="w-10 h-10 mb-2 opacity-30 text-gray-400" />
            <p className="text-xs font-semibold text-gray-600">No activity recorded yet</p>
            <p className="text-[11px] text-gray-400 mt-0.5 max-w-[200px]">
              Edits, formatting, and collaborator joins will stream in live right here!
            </p>
          </div>
        ) : (
          filteredActivities.map((item) => {
            const isMe = item.userId === currentUser.id;
            return (
              <div key={item.id} className="pt-3 first:pt-0 group">
                <div className="flex items-start space-x-2.5">
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5"
                    style={{ backgroundColor: item.userColor }}
                    title={item.userName}
                  >
                    {item.userAvatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="text-xs font-semibold text-gray-900 truncate">
                          {item.userName}
                        </span>
                        {isMe && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">
                            You
                          </span>
                        )}
                      </div>
                      {getActionBadge(item.type)}
                    </div>

                    <p className="text-xs text-gray-700 mt-0.5 font-medium leading-tight">
                      {item.actionText}
                    </p>

                    {/* Diff snippet preview */}
                    {item.snippet && (
                      <div className="mt-1.5 p-1.5 bg-gray-50 border border-gray-200 rounded text-[11px] font-mono text-gray-800 break-words leading-relaxed">
                        {item.type === 'delete' ? (
                          <span className="text-rose-700 line-through bg-rose-50 px-1 py-0.5 rounded">
                            {item.snippet}
                          </span>
                        ) : item.type === 'insert' ? (
                          <span className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">
                            {item.snippet}
                          </span>
                        ) : (
                          <span className="text-indigo-700">
                            {item.snippet}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center space-x-1 mt-1 text-[10px] text-gray-400 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer telemetry */}
      <div className="p-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
        <span>Total Events: <strong>{activities.length}</strong></span>
        <span className="text-emerald-600 font-medium flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time CRDT Sync</span>
        </span>
      </div>
    </div>
  );
};
