import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Cloud, 
  CloudOff, 
  Check, 
  Share2, 
  Columns, 
  Activity, 
  Download, 
  FolderPlus, 
  History,
  FileDown,
  Printer,
  FileCode,
  Globe,
  Edit3,
  X,
  User
} from 'lucide-react';
import { UserAwareness, ConnectionStatus } from '../lib/types';
import { COLLAB_COLORS } from '../lib/colors';

interface GoogleDocsHeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  connectionStatus: ConnectionStatus;
  activeUsers: UserAwareness[];
  currentUser: UserAwareness;
  onUpdateUser?: (name: string, color: string) => void;
  onToggleActivityFeed: () => void;
  isActivityFeedOpen: boolean;
  activityCount: number;
  onToggleSplitScreen: () => void;
  isSplitScreen: boolean;
  onToggleChaosPanel: () => void;
  isChaosPanelOpen: boolean;
  onOpenShareModal: () => void;
  onOpenHistoryModal: () => void;
  onExportMarkdown: () => void;
  onExportHtml: () => void;
  onPrint: () => void;
  onNewDocument: () => void;
}

export const GoogleDocsHeader: React.FC<GoogleDocsHeaderProps> = ({
  title,
  onTitleChange,
  connectionStatus,
  activeUsers,
  currentUser,
  onUpdateUser,
  onToggleActivityFeed,
  isActivityFeedOpen,
  activityCount,
  onToggleSplitScreen,
  isSplitScreen,
  onToggleChaosPanel,
  isChaosPanelOpen,
  onOpenShareModal,
  onOpenHistoryModal,
  onExportMarkdown,
  onExportHtml,
  onPrint,
  onNewDocument,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [inputTitle, setInputTitle] = useState(title);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileColor, setProfileColor] = useState(currentUser.color);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputTitle(title);
  }, [title]);

  useEffect(() => {
    setProfileName(currentUser.name);
    setProfileColor(currentUser.color);
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (inputTitle.trim() && inputTitle !== title) {
      onTitleChange(inputTitle.trim());
    } else {
      setInputTitle(title);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileName.trim() && onUpdateUser) {
      onUpdateUser(profileName.trim(), profileColor);
    }
    setIsProfileModalOpen(false);
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <span className="flex items-center text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full backdrop-blur-md cursor-pointer transition-colors shadow-xs hover:bg-emerald-500/20" title="All changes synced in real-time across peers">
            <Cloud className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            <Check className="w-3 h-3 text-emerald-300 -ml-1.5 mr-1" />
            <span className="text-[11px] font-medium">Saved to Drive</span>
          </span>
        );
      case 'connecting':
        return (
          <span className="flex items-center text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full backdrop-blur-md animate-pulse">
            <Cloud className="w-3.5 h-3.5 mr-1 text-amber-400" />
            <span className="text-[11px] font-medium">Connecting...</span>
          </span>
        );
      case 'offline':
      case 'disconnected':
        return (
          <span className="flex items-center text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-full backdrop-blur-md" title="Offline mode: changes are cached locally in IndexedDB and will sync upon reconnection">
            <CloudOff className="w-3.5 h-3.5 mr-1 text-rose-400" />
            <span className="text-[11px] font-medium">Offline (IndexedDB Active)</span>
          </span>
        );
    }
  };

  return (
    <header className="mx-4 mt-3 mb-1 px-5 py-2.5 rounded-[26px] bg-gradient-to-r from-[#3a1523]/85 via-[#1f0914]/90 to-[#2c0e1c]/85 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] select-none flex flex-col no-print relative overflow-visible transition-all duration-300">
      {/* Subtle ambient glass highlight */}
      <div className="absolute -top-12 left-1/4 w-72 h-16 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        {/* Left: Brand Logo + Title & Menus */}
        <div className="flex items-center space-x-3.5">
          {/* App Brand Logo */}
          <div 
            onClick={onNewDocument} 
            title="Create New Document"
            className="cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-indigo-600 flex items-center justify-center border border-white/25 shadow-[0_4px_15px_rgba(225,29,72,0.35)] group-hover:shadow-[0_4px_20px_rgba(225,29,72,0.5)] text-white relative overflow-hidden transition-all">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" stroke="#fecdd3" strokeWidth="2" />
                <line x1="9" y1="17" x2="13" y2="17" stroke="#fda4af" strokeWidth="2" />
                <circle cx="16" cy="17" r="1.2" fill="#34d399" stroke="none" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col">
            {/* Document Title & Save Status */}
            <div className="flex items-center space-x-2.5">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  autoFocus
                  className="font-semibold text-[17px] text-white bg-white/10 border border-rose-400/50 rounded-xl px-2.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-rose-500/40 backdrop-blur-md"
                />
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  className="font-semibold text-[17px] text-white hover:bg-white/10 rounded-xl px-2 py-0.5 cursor-pointer max-w-md truncate transition-colors tracking-tight flex items-center space-x-1.5"
                  title="Click to rename document"
                >
                  <span>{title}</span>
                </h1>
              )}
              {getStatusBadge()}
            </div>

            {/* Menu Bar */}
            <div ref={menuRef} className="flex items-center space-x-1 -ml-1 mt-0.5 text-[12.5px] text-rose-200/80 relative">
              {/* File Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                  className={`px-2.5 py-0.5 rounded-lg hover:bg-white/10 hover:text-white transition-all ${
                    activeMenu === 'file' ? 'bg-white/15 text-white font-medium shadow-inner' : ''
                  }`}
                >
                  File
                </button>
                {activeMenu === 'file' && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-[#240916]/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 py-2 text-xs text-rose-100">
                    <button
                      onClick={() => { onNewDocument(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 hover:text-white flex items-center space-x-2.5 transition-colors"
                    >
                      <FolderPlus className="w-4 h-4 text-rose-400" />
                      <span>New Document</span>
                    </button>
                    <button
                      onClick={() => { onOpenHistoryModal(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 hover:text-white flex items-center space-x-2.5 transition-colors"
                    >
                      <History className="w-4 h-4 text-rose-400" />
                      <span>Version History</span>
                    </button>
                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={() => { onExportMarkdown(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 hover:text-white flex items-center space-x-2.5 transition-colors"
                    >
                      <FileDown className="w-4 h-4 text-rose-400" />
                      <span>Download as Markdown (.md)</span>
                    </button>
                    <button
                      onClick={() => { onExportHtml(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 hover:text-white flex items-center space-x-2.5 transition-colors"
                    >
                      <FileCode className="w-4 h-4 text-rose-400" />
                      <span>Download as HTML (.html)</span>
                    </button>
                    <button
                      onClick={() => { onPrint(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 hover:text-white flex items-center space-x-2.5 transition-colors"
                    >
                      <Printer className="w-4 h-4 text-rose-400" />
                      <span>Print (Ctrl+P)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Edit Menu */}
              <button
                onClick={() => document.execCommand('undo')}
                className="px-2.5 py-0.5 rounded-lg hover:bg-white/10 hover:text-white transition-all"
              >
                Edit
              </button>

              {/* View Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
                  className={`px-2.5 py-0.5 rounded-lg hover:bg-white/10 hover:text-white transition-all ${
                    activeMenu === 'view' ? 'bg-white/15 text-white font-medium shadow-inner' : ''
                  }`}
                >
                  View
                </button>
                {activeMenu === 'view' && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-[#240916]/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 py-2 text-xs text-rose-100">
                    <button
                      onClick={() => { onToggleSplitScreen(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 hover:text-white flex items-center space-x-2.5 transition-colors"
                    >
                      <Columns className="w-4 h-4 text-cyan-400" />
                      <span>{isSplitScreen ? 'Exit Split Screen' : 'Split-Screen Multi-Peer'}</span>
                    </button>
                    <button
                      onClick={() => { onToggleChaosPanel(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 hover:text-white flex items-center space-x-2.5 transition-colors"
                    >
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span>{isChaosPanelOpen ? 'Hide Chaos Panel' : 'Show Chaos & CRDT Panel'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Tools Menu */}
              <button
                onClick={onToggleChaosPanel}
                className="px-2.5 py-0.5 rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center"
              >
                Distributed Tools
              </button>
            </div>
          </div>
        </div>

        {/* Right: User Profile Chip + Presence Avatars + Action Controls + Share Button */}
        <div className="flex items-center space-x-2">
          {/* Current User Name Pill (Click to Change Name) */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white backdrop-blur-md transition-all shadow-sm hover:scale-[1.02]"
            title="Click to change your display name and color"
          >
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white/30" style={{ backgroundColor: currentUser.color }} />
            <span className="font-semibold max-w-[110px] truncate">{currentUser.name}</span>
            <span className="text-[10px] text-rose-200/60 font-normal">(You)</span>
            <Edit3 className="w-3 h-3 text-rose-200/70 ml-0.5" />
          </button>

          {/* Active Collaborators Avatar Stack */}
          <div className="flex items-center -space-x-2 overflow-hidden px-1">
            {activeUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => user.id === currentUser.id && setIsProfileModalOpen(true)}
                title={`${user.name} ${user.id === currentUser.id ? '(You - click to edit)' : ''}`}
                className="relative inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white/40 text-white font-bold text-xs shadow-md hover:z-20 hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: user.color }}
              >
                {user.avatar}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#240916] rounded-full" />
              </div>
            ))}
          </div>

          {/* Quick Split Screen Multi-Peer Simulator */}
          <button
            onClick={onToggleSplitScreen}
            className={`flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all shadow-sm ${
              isSplitScreen 
                ? 'bg-white/25 border-white/40 text-white font-semibold shadow-inner' 
                : 'bg-white/10 border-white/15 text-rose-100 hover:bg-white/15 hover:text-white'
            }`}
            title="Open side-by-side collaborative window to test real-time typing and cursor presence"
          >
            <Columns className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            <span>{isSplitScreen ? 'Single Mode' : 'Dual Peer Test'}</span>
          </button>

          {/* Real-Time Activity Feed Button */}
          <button
            onClick={onToggleActivityFeed}
            className={`flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all shadow-sm ${
              isActivityFeedOpen 
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200 font-semibold shadow-inner' 
                : 'bg-white/10 border-white/15 text-rose-100 hover:bg-white/15 hover:text-white'
            }`}
            title="Real-Time Activity Feed: See who changed what in real-time"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            <span>Activity</span>
            {activityCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[10px] font-bold">
                {activityCount}
              </span>
            )}
          </button>

          {/* Chaos / CRDT Telemetry Inspector */}
          <button
            onClick={onToggleChaosPanel}
            className={`flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all shadow-sm ${
              isChaosPanelOpen 
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-200 font-semibold shadow-inner' 
                : 'bg-white/10 border-white/15 text-rose-100 hover:bg-white/15 hover:text-white'
            }`}
            title="Inspect CRDT state and simulate network drops / latency"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            <span>Chaos & CRDT</span>
          </button>

          {/* Share Button */}
          <button
            onClick={onOpenShareModal}
            className="flex items-center px-5 py-2 bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-xs rounded-full shadow-[0_4px_15px_rgba(225,29,72,0.4)] border border-white/20 transition-all hover:scale-105 active:scale-95 space-x-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Edit User Name & Color Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#240916]/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] max-w-sm w-full overflow-hidden border border-white/20 text-white">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-white">Change Your Name & Color</h3>
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(false)} 
                className="text-rose-200/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-rose-200/80 mb-1">
                  Your Collaborator Display Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your name (e.g. Alex)..."
                  className="w-full text-xs bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/40 focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium backdrop-blur-md"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-rose-200/80 mb-1.5">
                  Pick Your Cursor & Avatar Color
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {COLLAB_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setProfileColor(col.hex)}
                      className={`flex items-center space-x-1.5 p-1.5 rounded-xl border text-[11px] transition-all ${
                        profileColor === col.hex 
                          ? 'border-rose-400 bg-rose-500/20 text-white font-bold ring-2 ring-rose-400/50' 
                          : 'border-white/10 bg-white/5 hover:bg-white/10 text-rose-200/80'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: col.hex }} />
                      <span className="truncate">{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center space-x-2.5">
                <span className="text-[11px] text-rose-200/60">Live Preview:</span>
                <div 
                  className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md border border-white/30"
                  style={{ backgroundColor: profileColor }}
                >
                  {profileName.trim().charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-semibold text-white truncate">{profileName || 'Your Name'}</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-rose-200/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-95 text-white font-semibold rounded-xl shadow-[0_4px_15px_rgba(225,29,72,0.4)] border border-white/20 transition-all"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
