import React, { useState } from 'react';
import { 
  Home, 
  Compass, 
  FileText, 
  Users, 
  Activity, 
  ShieldAlert, 
  Columns, 
  History, 
  Info, 
  Settings, 
  LogOut, 
  ChevronRight, 
  ChevronLeft,
  Share2,
  FolderPlus,
  Sparkles,
  X,
  UserPlus
} from 'lucide-react';
import { UserAwareness } from '../lib/types';

interface GlassSidebarProps {
  activeTab: 'editor' | 'documents' | 'activity' | 'chaos' | 'split' | 'history';
  onSelectTab: (tab: 'editor' | 'documents' | 'activity' | 'chaos' | 'split' | 'history') => void;
  currentUser: UserAwareness;
  activeUsers: UserAwareness[];
  activityCount: number;
  onOpenProfileModal: () => void;
  onOpenShareModal: () => void;
  onNewDocument: () => void;
}

export const GlassSidebar: React.FC<GlassSidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  activeUsers,
  activityCount,
  onOpenProfileModal,
  onOpenShareModal,
  onNewDocument,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCollaboratorsModalOpen, setIsCollaboratorsModalOpen] = useState(false);

  return (
    <aside className="relative flex items-center h-full p-4 z-40 select-none no-print transition-all duration-300">
      {/* ------------------------------------------------------------- */}
      {/* 1. Collapsed Dock (Narrow Glass Capsule)                      */}
      {/* ------------------------------------------------------------- */}
      {!isExpanded ? (
        <div className="flex flex-col items-center justify-between w-14 h-[94vh] py-5 px-1.5 rounded-[32px] bg-gradient-to-b from-[#3a1523]/80 via-[#1f0914]/85 to-[#0e040a]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-300">
          {/* Top Traffic Light Dots */}
          <div 
            onClick={() => setIsExpanded(true)}
            className="flex flex-col items-center space-y-1.5 cursor-pointer group"
            title="Click to expand sidebar"
          >
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            </div>
            {/* Mini Brand Icon */}
            <div className="mt-3 w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Navigation Icon List with White Glowing Indicator */}
          <div className="flex flex-col items-center space-y-3 my-auto w-full">
            {/* Editor Tab */}
            <div className="relative w-full flex justify-center items-center">
              {activeTab === 'editor' && (
                <span className="absolute -left-1.5 w-1.5 h-6 bg-white rounded-r-full shadow-[0_0_10px_#fff]" />
              )}
              <button
                onClick={() => onSelectTab('editor')}
                className={`p-2.5 rounded-2xl transition-all ${
                  activeTab === 'editor'
                    ? 'text-white bg-white/20 shadow-inner'
                    : 'text-rose-200/70 hover:text-white hover:bg-white/10'
                }`}
                title="Document Editor"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>

            {/* Activity Feed Tab */}
            <div className="relative w-full flex justify-center items-center">
              {activeTab === 'activity' && (
                <span className="absolute -left-1.5 w-1.5 h-6 bg-white rounded-r-full shadow-[0_0_10px_#fff]" />
              )}
              <button
                onClick={() => onSelectTab('activity')}
                className={`p-2.5 rounded-2xl transition-all relative ${
                  activeTab === 'activity'
                    ? 'text-white bg-white/20 shadow-inner'
                    : 'text-rose-200/70 hover:text-white hover:bg-white/10'
                }`}
                title="Real-Time Activity Feed"
              >
                <Activity className="w-4 h-4" />
                {activityCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                )}
              </button>
            </div>

            {/* Split Screen Tab */}
            <div className="relative w-full flex justify-center items-center">
              {activeTab === 'split' && (
                <span className="absolute -left-1.5 w-1.5 h-6 bg-white rounded-r-full shadow-[0_0_10px_#fff]" />
              )}
              <button
                onClick={() => onSelectTab('split')}
                className={`p-2.5 rounded-2xl transition-all ${
                  activeTab === 'split'
                    ? 'text-white bg-white/20 shadow-inner'
                    : 'text-rose-200/70 hover:text-white hover:bg-white/10'
                }`}
                title="Dual Peer Split Screen"
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>

            {/* Chaos & CRDT Tab */}
            <div className="relative w-full flex justify-center items-center">
              {activeTab === 'chaos' && (
                <span className="absolute -left-1.5 w-1.5 h-6 bg-white rounded-r-full shadow-[0_0_10px_#fff]" />
              )}
              <button
                onClick={() => onSelectTab('chaos')}
                className={`p-2.5 rounded-2xl transition-all ${
                  activeTab === 'chaos'
                    ? 'text-white bg-white/20 shadow-inner'
                    : 'text-rose-200/70 hover:text-white hover:bg-white/10'
                }`}
                title="Chaos & Distributed Testing Lab"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            </div>

            {/* Version History Tab */}
            <div className="relative w-full flex justify-center items-center">
              {activeTab === 'history' && (
                <span className="absolute -left-1.5 w-1.5 h-6 bg-white rounded-r-full shadow-[0_0_10px_#fff]" />
              )}
              <button
                onClick={() => onSelectTab('history')}
                className={`p-2.5 rounded-2xl transition-all ${
                  activeTab === 'history'
                    ? 'text-white bg-white/20 shadow-inner'
                    : 'text-rose-200/70 hover:text-white hover:bg-white/10'
                }`}
                title="Version History Snapshots"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom: Expand Toggle & User Profile Avatar */}
          <div className="flex flex-col items-center space-y-3">
            <button
              onClick={() => setIsExpanded(true)}
              className="p-1.5 text-rose-200/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div
              onClick={onOpenProfileModal}
              title={`${currentUser.name} (Click to edit)`}
              className="w-9 h-9 rounded-full border-2 border-white/40 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-md hover:scale-110 transition-transform"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.avatar}
            </div>
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* 2. Expanded Glass Panel (Exact Match to User UI Reference!)   */
        /* ------------------------------------------------------------- */
        <div className="flex flex-col justify-between w-72 h-[94vh] p-6 rounded-[32px] bg-gradient-to-b from-[#421727]/85 via-[#230a17]/90 to-[#0e040a]/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-white font-sans transition-all duration-300 relative overflow-hidden">
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top: Window Traffic Lights + Brand Header */}
          <div>
            <div className="flex items-center justify-between">
              {/* Traffic Light Dots */}
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-sm cursor-pointer" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-sm cursor-pointer" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-sm cursor-pointer" />
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-rose-200/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Brand Title */}
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white flex items-center space-x-1.5">
                    <span>SynoraDocs</span>
                  </h2>
                  <p className="text-[10px] text-rose-200/60 font-medium tracking-wide uppercase">Real-Time CRDT</p>
                </div>
              </div>

              <button
                onClick={onNewDocument}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-rose-100 transition-colors"
                title="Create New Document"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Category: MENU */}
            <div className="mt-6">
              <span className="text-[11px] font-bold text-rose-200/50 tracking-wider uppercase">
                MENU
              </span>

              <div className="mt-2.5 space-y-1">
                {/* Home / Editor */}
                <button
                  onClick={() => onSelectTab('editor')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    activeTab === 'editor'
                      ? 'bg-white/20 text-white font-semibold shadow-inner border border-white/20 backdrop-blur-md'
                      : 'text-rose-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Home className="w-4 h-4" />
                    <span>Home Editor</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                </button>

                {/* Activity Feed */}
                <button
                  onClick={() => onSelectTab('activity')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    activeTab === 'activity'
                      ? 'bg-white/20 text-white font-semibold shadow-inner border border-white/20 backdrop-blur-md'
                      : 'text-rose-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Activity Feed</span>
                  </div>
                  {activityCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                      {activityCount}
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
                  )}
                </button>

                {/* Split Screen Mode */}
                <button
                  onClick={() => onSelectTab('split')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    activeTab === 'split'
                      ? 'bg-white/20 text-white font-semibold shadow-inner border border-white/20 backdrop-blur-md'
                      : 'text-rose-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Columns className="w-4 h-4 text-cyan-400" />
                    <span>Dual Peer Mode</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                </button>

                {/* Active Collaborators */}
                <button
                  onClick={() => setIsCollaboratorsModalOpen(true)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs text-rose-100/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer group text-left"
                  title="View all active collaborators"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Users className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="truncate font-medium">Collaborators</span>
                  </div>
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <div className="flex items-center -space-x-2">
                      {activeUsers.slice(0, 3).map((u) => (
                        <div
                          key={u.id}
                          className="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-[#240916] text-white shadow-sm ring-1 ring-white/20"
                          style={{ backgroundColor: u.color }}
                          title={u.name}
                        >
                          {u.avatar}
                        </div>
                      ))}
                    </div>
                    {activeUsers.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-white/15 text-[10px] text-white font-bold border border-white/20 shadow-xs">
                        +{activeUsers.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-white/10" />

            {/* Distributed Tools */}
            <div className="space-y-1">
              {/* Chaos & CRDT Telemetry */}
              <button
                onClick={() => onSelectTab('chaos')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'chaos'
                    ? 'bg-white/20 text-white font-semibold border border-white/20'
                    : 'text-rose-100/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Chaos & Telemetry</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              </button>

              {/* Version History */}
              <button
                onClick={() => onSelectTab('history')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-white/20 text-white font-semibold border border-white/20'
                    : 'text-rose-100/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <History className="w-4 h-4 text-rose-300" />
                  <span>Version History</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              </button>

              {/* Share */}
              <button
                onClick={onOpenShareModal}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs text-rose-100/70 hover:bg-white/10 hover:text-white transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Share2 className="w-4 h-4 text-pink-400" />
                  <span>Share Document</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              </button>
            </div>
          </div>

          {/* Bottom User Card (Exact Match to Image Footer!) */}
          <div className="pt-3 border-t border-white/10">
            <div
              onClick={onOpenProfileModal}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer transition-all hover:scale-[1.02] shadow-sm"
              title="Click to edit user profile"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-full text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-md border border-white/30"
                  style={{ backgroundColor: currentUser.color }}
                >
                  {currentUser.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-rose-200/60 truncate font-medium mt-0.5">
                    Active Collaborator
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. Active Collaborators Popover Modal                         */}
      {/* ------------------------------------------------------------- */}
      {isCollaboratorsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#240916]/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] max-w-md w-full overflow-hidden border border-white/20 text-white">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Active Collaborators</h3>
                  <p className="text-[11px] text-rose-200/60">
                    {activeUsers.length} {activeUsers.length === 1 ? 'peer' : 'peers'} connected to this room
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCollaboratorsModalOpen(false)} 
                className="text-rose-200/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
              {activeUsers.map((user) => {
                const isYou = user.id === currentUser.id;
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative">
                        <div
                          className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center border border-white/30 shadow-sm"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.avatar}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#240916] rounded-full" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate flex items-center space-x-1.5">
                          <span>{user.name}</span>
                          {isYou && (
                            <span className="text-[10px] text-rose-200/70 font-normal bg-white/10 px-1.5 py-0.2 rounded-md">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active now</span>
                        </p>
                      </div>
                    </div>

                    {isYou ? (
                      <button
                        onClick={() => {
                          setIsCollaboratorsModalOpen(false);
                          onOpenProfileModal();
                        }}
                        className="text-[11px] px-2.5 py-1 bg-white/10 hover:bg-white/20 text-rose-100 rounded-xl border border-white/15 transition-colors font-medium"
                      >
                        Edit You
                      </button>
                    ) : (
                      <div 
                        className="w-3.5 h-3.5 rounded-full border border-white/30"
                        style={{ backgroundColor: user.color }}
                        title={`Cursor color: ${user.color}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3.5 bg-white/5 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-rose-200/60 font-medium">Want to invite others?</span>
              <button
                onClick={() => {
                  setIsCollaboratorsModalOpen(false);
                  onOpenShareModal();
                }}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-md border border-white/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
