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
          <span className="flex items-center text-xs text-gray-500 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors" title="All changes saved to cloud">
            <Cloud className="w-4 h-4 mr-1 text-gray-500" />
            <Check className="w-3 h-3 text-green-600 -ml-2 mr-1" />
            <span className="text-[12px]">Saved to Drive</span>
          </span>
        );
      case 'connecting':
        return (
          <span className="flex items-center text-xs text-amber-600 px-2 py-1 rounded animate-pulse">
            <Cloud className="w-4 h-4 mr-1" />
            <span className="text-[12px]">Connecting...</span>
          </span>
        );
      case 'offline':
      case 'disconnected':
        return (
          <span className="flex items-center text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200" title="Offline mode: changes are cached locally in IndexedDB and will sync upon reconnection">
            <CloudOff className="w-4 h-4 mr-1" />
            <span className="text-[12px] font-medium">Offline (IndexedDB Active)</span>
          </span>
        );
    }
  };

  return (
    <header className="bg-white border-b border-[#dadce0] px-4 pt-2.5 pb-1 select-none flex flex-col no-print">
      <div className="flex items-center justify-between">
        {/* Left: Brand Logo + Title & Menus */}
        <div className="flex items-center space-x-3">
          {/* App Brand Logo */}
          <div 
            onClick={onNewDocument} 
            title="Create New Document"
            className="cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 group mr-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1a73e8] via-[#4338ca] to-[#7c3aed] flex items-center justify-center shadow-sm group-hover:shadow-md text-white relative overflow-hidden transition-shadow">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" stroke="#60a5fa" strokeWidth="2" />
                <line x1="9" y1="17" x2="13" y2="17" stroke="#93c5fd" strokeWidth="2" />
                <circle cx="16" cy="17" r="1.2" fill="#34d399" stroke="none" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col">
            {/* Document Title & Save Status */}
            <div className="flex items-center space-x-2">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  autoFocus
                  className="font-normal text-[18px] text-gray-800 border border-blue-500 rounded px-1.5 py-0.5 focus:outline-none"
                />
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  className="font-normal text-[18px] text-[#202124] hover:border hover:border-gray-300 rounded px-1.5 py-0.5 cursor-pointer max-w-md truncate"
                  title="Click to rename document"
                >
                  {title}
                </h1>
              )}
              {getStatusBadge()}
            </div>

            {/* Menu Bar */}
            <div ref={menuRef} className="flex items-center space-x-0.5 -ml-1 text-[13px] text-[#202124] relative">
              {/* File Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                  className={`px-2 py-0.5 rounded hover:bg-gray-100 ${activeMenu === 'file' ? 'bg-gray-100 font-medium' : ''}`}
                >
                  File
                </button>
                {activeMenu === 'file' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded shadow-lg z-50 py-1.5 text-xs text-gray-700">
                    <button
                      onClick={() => { onNewDocument(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2"
                    >
                      <FolderPlus className="w-4 h-4 text-gray-500" />
                      <span>New Document</span>
                    </button>
                    <button
                      onClick={() => { onOpenHistoryModal(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2"
                    >
                      <History className="w-4 h-4 text-gray-500" />
                      <span>Version history</span>
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => { onExportMarkdown(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2"
                    >
                      <FileDown className="w-4 h-4 text-gray-500" />
                      <span>Download as Markdown (.md)</span>
                    </button>
                    <button
                      onClick={() => { onExportHtml(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2"
                    >
                      <FileCode className="w-4 h-4 text-gray-500" />
                      <span>Download as HTML (.html)</span>
                    </button>
                    <button
                      onClick={() => { onPrint(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2"
                    >
                      <Printer className="w-4 h-4 text-gray-500" />
                      <span>Print (Ctrl+P)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Edit Menu */}
              <button
                onClick={() => document.execCommand('undo')}
                className="px-2 py-0.5 rounded hover:bg-gray-100"
              >
                Edit
              </button>

              {/* View Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
                  className={`px-2 py-0.5 rounded hover:bg-gray-100 ${activeMenu === 'view' ? 'bg-gray-100 font-medium' : ''}`}
                >
                  View
                </button>
                {activeMenu === 'view' && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded shadow-lg z-50 py-1.5 text-xs text-gray-700">
                    <button
                      onClick={() => { onToggleSplitScreen(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2"
                    >
                      <Columns className="w-4 h-4 text-gray-500" />
                      <span>{isSplitScreen ? 'Exit Split Screen' : 'Split-Screen Multi-Peer'}</span>
                    </button>
                    <button
                      onClick={() => { onToggleChaosPanel(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2"
                    >
                      <Activity className="w-4 h-4 text-gray-500" />
                      <span>{isChaosPanelOpen ? 'Hide Chaos Panel' : 'Show Chaos & CRDT Panel'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Tools Menu */}
              <button
                onClick={onToggleChaosPanel}
                className="px-2 py-0.5 rounded hover:bg-gray-100 flex items-center"
              >
                Distributed Tools
              </button>
            </div>
          </div>
        </div>

        {/* Right: User Profile Chip + Presence Avatars + Action Controls + Share Button */}
        <div className="flex items-center space-x-2.5">
          {/* Current User Name Pill (Click to Change Name) */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-xs text-gray-700 transition-colors shadow-xs"
            title="Click to change your display name and color"
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentUser.color }} />
            <span className="font-semibold max-w-[120px] truncate">{currentUser.name}</span>
            <span className="text-[10px] text-gray-400 font-normal">(You)</span>
            <Edit3 className="w-3 h-3 text-gray-500 ml-0.5" />
          </button>

          {/* Active Collaborators Avatar Stack */}
          <div className="flex items-center -space-x-2 overflow-hidden px-1">
            {activeUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => user.id === currentUser.id && setIsProfileModalOpen(true)}
                title={`${user.name} ${user.id === currentUser.id ? '(You - click to edit)' : ''}`}
                className="relative inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white text-white font-bold text-xs shadow-sm hover:z-20 hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: user.color }}
              >
                {user.avatar}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
            ))}
          </div>

          {/* Quick Split Screen Multi-Peer Simulator */}
          <button
            onClick={onToggleSplitScreen}
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              isSplitScreen 
                ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title="Open side-by-side collaborative window to test real-time typing and cursor presence"
          >
            <Columns className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            <span>{isSplitScreen ? 'Single Mode' : 'Dual Peer Test'}</span>
          </button>

          {/* Real-Time Activity Feed Button */}
          <button
            onClick={onToggleActivityFeed}
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              isActivityFeedOpen 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold shadow-xs' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title="Real-Time Activity Feed: See who changed what in real-time"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            <span>Activity</span>
            {activityCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
                {activityCount}
              </span>
            )}
          </button>

          {/* Chaos / CRDT Telemetry Inspector */}
          <button
            onClick={onToggleChaosPanel}
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              isChaosPanelOpen 
                ? 'bg-amber-50 border-amber-300 text-amber-800' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title="Inspect CRDT state and simulate network drops / latency"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
            <span>Chaos & CRDT</span>
          </button>

          {/* Share Button */}
          <button
            onClick={onOpenShareModal}
            className="flex items-center px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs rounded-full shadow-sm hover:shadow transition-all space-x-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Edit User Name & Color Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-800">Change Your Name & Color</h3>
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Your Collaborator Display Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your name (e.g. Alex)..."
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Pick Your Cursor & Avatar Color
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {COLLAB_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setProfileColor(col.hex)}
                      className={`flex items-center space-x-1.5 p-1.5 rounded-lg border text-[11px] transition-all ${
                        profileColor === col.hex 
                          ? 'border-blue-600 bg-blue-50 font-bold ring-2 ring-blue-300' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: col.hex }} />
                      <span className="truncate">{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center space-x-2">
                <span className="text-[11px] text-gray-500">Live Preview:</span>
                <div 
                  className="w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: profileColor }}
                >
                  {profileName.trim().charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-semibold text-gray-800 truncate">{profileName || 'Your Name'}</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
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
