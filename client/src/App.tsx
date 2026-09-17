import React, { useState, useEffect, useMemo } from 'react';
import { createCollabSession, CollabSession } from './lib/collaboration';
import { UserAwareness, ConnectionStatus } from './lib/types';
import { GoogleDocsHeader } from './components/GoogleDocsHeader';
import { EditorCanvas } from './components/EditorCanvas';
import { SplitScreenView } from './components/SplitScreenView';
import { NetworkChaosPanel } from './components/NetworkChaosPanel';
import { ShareModal } from './components/ShareModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';

export const App: React.FC = () => {
  // Extract room from query parameter or default
  const [roomName, setRoomName] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || 'default';
  });

  const [docTitle, setDocTitle] = useState('Untitled Document');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [activeUsers, setActiveUsers] = useState<UserAwareness[]>([]);
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [isChaosPanelOpen, setIsChaosPanelOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  // Initialize primary collaboration session
  const session: CollabSession = useMemo(() => {
    return createCollabSession(roomName);
  }, [roomName]);

  // Cleanup session on unmount or room change
  useEffect(() => {
    return () => {
      session.destroy();
    };
  }, [session]);

  // Fetch document title from server
  useEffect(() => {
    fetch(`/api/documents/${roomName}/metadata`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.title) {
          setDocTitle(data.title);
        }
      })
      .catch(() => {
        // use fallback title
      });
  }, [roomName]);

  // Track connection status and awareness
  useEffect(() => {
    const provider = session.provider;

    const handleStatus = (event: { status: 'connected' | 'connecting' | 'disconnected' }) => {
      if (isSimulatedOffline) {
        setConnectionStatus('offline');
      } else {
        setConnectionStatus(event.status);
      }
    };

    const handleAwareness = () => {
      const states = provider.awareness.getStates();
      const users: UserAwareness[] = [];
      states.forEach((state: any) => {
        if (state.user) {
          users.push(state.user);
        }
      });
      setActiveUsers(users);
    };

    provider.on('status', handleStatus);
    provider.awareness.on('change', handleAwareness);

    // Initial awareness state
    handleAwareness();

    return () => {
      provider.off('status', handleStatus);
      provider.awareness.off('change', handleAwareness);
    };
  }, [session, isSimulatedOffline]);

  const handleTitleChange = async (newTitle: string) => {
    setDocTitle(newTitle);
    try {
      await fetch(`/api/documents/${roomName}/metadata`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
    } catch (err) {
      console.error('Failed to update title on server:', err);
    }
  };

  const handleToggleOffline = () => {
    if (isSimulatedOffline) {
      session.provider.connect();
      setIsSimulatedOffline(false);
      setConnectionStatus('connecting');
    } else {
      session.provider.disconnect();
      setIsSimulatedOffline(true);
      setConnectionStatus('offline');
    }
  };

  const handleNewDocument = () => {
    const newRoom = 'doc_' + Math.random().toString(36).substring(2, 9);
    window.location.search = `?room=${newRoom}`;
  };

  const handleJoinRoom = (newRoom: string) => {
    window.location.search = `?room=${encodeURIComponent(newRoom)}`;
  };

  const handleExportMarkdown = () => {
    if (!editorInstance) return;
    const text = editorInstance.getText();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    if (!editorInstance) return;
    const html = editorInstance.getHTML();
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${docTitle}</title>
<style>
body { font-family: Roboto, Arial, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; color: #202124; }
h1, h2, h3 { color: #000; }
pre { background: #f1f3f4; padding: 12px; border-radius: 4px; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #dadce0; padding: 8px; }
</style>
</head>
<body>
${html}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateUser = (newName: string, newColor: string) => {
    session.user.name = newName;
    session.user.color = newColor;
    session.user.avatar = newName.trim().charAt(0).toUpperCase() || 'U';

    session.provider.awareness.setLocalStateField('user', {
      id: session.user.id,
      name: newName,
      color: newColor,
      avatar: session.user.avatar,
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f0f4f9]">
      {/* Authentic Google Docs Header */}
      <GoogleDocsHeader
        title={docTitle}
        onTitleChange={handleTitleChange}
        connectionStatus={connectionStatus}
        activeUsers={activeUsers}
        currentUser={session.user}
        onUpdateUser={handleUpdateUser}
        onToggleSplitScreen={() => setIsSplitScreen(!isSplitScreen)}
        isSplitScreen={isSplitScreen}
        onToggleChaosPanel={() => setIsChaosPanelOpen(!isChaosPanelOpen)}
        isChaosPanelOpen={isChaosPanelOpen}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onExportMarkdown={handleExportMarkdown}
        onExportHtml={handleExportHtml}
        onPrint={() => window.print()}
        onNewDocument={handleNewDocument}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {isSplitScreen ? (
          <SplitScreenView roomName={roomName} primarySession={session} />
        ) : (
          <EditorCanvas
            session={session}
            onEditorReady={(editor) => setEditorInstance(editor)}
          />
        )}

        {/* Distributed Chaos & CRDT Telemetry Drawer */}
        <NetworkChaosPanel
          session={session}
          isOpen={isChaosPanelOpen}
          onClose={() => setIsChaosPanelOpen(false)}
          isSimulatedOffline={isSimulatedOffline}
          onToggleOffline={handleToggleOffline}
        />
      </main>

      {/* Modals */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomName={roomName}
        onJoinRoom={handleJoinRoom}
      />

      <VersionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        session={session}
      />
    </div>
  );
};
