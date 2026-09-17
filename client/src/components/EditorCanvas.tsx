import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';
import { AlertTriangle, Flame } from 'lucide-react';

import { CollabSession } from '../lib/collaboration';
import { GoogleDocsToolbar } from './GoogleDocsToolbar';
import { ActivityActionType } from '../lib/types';

interface EditorCanvasProps {
  session: CollabSession;
  onEditorReady?: (editor: any) => void;
  onActivityLogged?: (type: ActivityActionType, actionText: string, snippet?: string) => void;
  showRuler?: boolean;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ 
  session, 
  onEditorReady, 
  onActivityLogged,
  showRuler = true 
}) => {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [collisionUsers, setCollisionUsers] = useState<string[]>([]);
  const lastTextRef = useRef<string>('');
  const debounceTimerRef = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      // CRDT History replaces standard prose history
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: session.doc,
      }),
      CollaborationCursor.configure({
        provider: session.provider,
        user: {
          name: session.user.name,
          color: session.user.color,
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Type @ to insert, or start typing here...',
      }),
    ],
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
    },
  }, [session.doc, session.provider]);

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Track text mutations and log activity
  useEffect(() => {
    if (!editor) return;

    // Initial text snapshot
    lastTextRef.current = editor.getText();

    const handleTransaction = ({ transaction }: any) => {
      if (!transaction.docChanged) return;

      const newText = editor.getText();
      const oldText = lastTextRef.current;
      lastTextRef.current = newText;

      const diff = newText.length - oldText.length;
      if (diff === 0) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (diff > 0) {
          // Extract short preview of the text that was added
          const sample = newText.trim().split(/\s+/).slice(-6).join(' ');
          onActivityLogged?.('insert', `Added text (+${diff} chars)`, sample ? `"${sample}"` : undefined);
        } else if (diff < 0) {
          onActivityLogged?.('delete', `Deleted text (${Math.abs(diff)} chars)`);
        }
      }, 1400);
    };

    editor.on('transaction', handleTransaction);
    return () => {
      editor.off('transaction', handleTransaction);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [editor, onActivityLogged]);

  // Cursor Contention / Multi-User Workzone Collision Detector
  useEffect(() => {
    if (!editor) return;

    const detectCollisions = () => {
      const editorDom = editor.view.dom;
      if (!editorDom) return;

      const remoteCarets = Array.from(
        editorDom.querySelectorAll('.collaboration-cursor__caret')
      ) as HTMLElement[];

      // Clear previous collision state
      editorDom.querySelectorAll('.cursor-collision-active').forEach((el) => {
        el.classList.remove('cursor-collision-active');
      });
      remoteCarets.forEach((c) => c.classList.remove('has-collision'));

      const carets: { el: HTMLElement; top: number; left: number; name: string }[] = [];

      // Check local user cursor
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorDom.contains(sel.anchorNode)) {
        try {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width !== 0 || rect.height !== 0) {
            carets.push({
              el: (range.startContainer.parentElement || editorDom) as HTMLElement,
              top: rect.top,
              left: rect.left,
              name: session.user.name + ' (You)',
            });
          }
        } catch {
          // ignore
        }
      }

      // Check remote carets
      remoteCarets.forEach((c) => {
        const rect = c.getBoundingClientRect();
        const labelEl = c.querySelector('.collaboration-cursor__label');
        const rawName = labelEl ? labelEl.textContent || 'Collaborator' : 'Collaborator';
        const cleanName = rawName.replace(' ⚠️ ACTIVE', '').trim();
        carets.push({
          el: c,
          top: rect.top,
          left: rect.left,
          name: cleanName,
        });
      });

      const colliding = new Set<string>();

      for (let i = 0; i < carets.length; i++) {
        for (let j = i + 1; j < carets.length; j++) {
          const c1 = carets[i];
          const c2 = carets[j];
          const dy = Math.abs(c1.top - c2.top);
          const dx = Math.abs(c1.left - c2.left);

          // If cursors are on the same line (dy < 30) and near each other (dx < 160)
          if (dy < 30 && dx < 160) {
            colliding.add(c1.name);
            colliding.add(c2.name);

            // Add wavy underline to parent paragraph/block
            const p1 = c1.el.closest('p, h1, h2, h3, li, blockquote') || c1.el;
            const p2 = c2.el.closest('p, h1, h2, h3, li, blockquote') || c2.el;
            p1?.classList.add('cursor-collision-active');
            p2?.classList.add('cursor-collision-active');

            if (c1.el.classList.contains('collaboration-cursor__caret')) {
              c1.el.classList.add('has-collision');
            }
            if (c2.el.classList.contains('collaboration-cursor__caret')) {
              c2.el.classList.add('has-collision');
            }
          }
        }
      }

      if (colliding.size >= 2) {
        setCollisionUsers(Array.from(colliding));
      } else {
        setCollisionUsers([]);
      }
    };

    session.provider.awareness.on('change', detectCollisions);
    editor.on('transaction', detectCollisions);
    editor.on('selectionUpdate', detectCollisions);
    const interval = setInterval(detectCollisions, 350);

    return () => {
      session.provider.awareness.off('change', detectCollisions);
      editor.off('transaction', detectCollisions);
      editor.off('selectionUpdate', detectCollisions);
      clearInterval(interval);
    };
  }, [editor, session]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-[#f0f4f9]">
      {/* Google Docs Toolbar */}
      <GoogleDocsToolbar editor={editor} onPrint={handlePrint} />

      {/* Google Docs Horizontal Ruler */}
      {showRuler && (
        <div className="h-4 bg-[#f9fbfd] border-b border-[#e0e0e0] flex items-center justify-center no-print relative select-none">
          <div className="w-[816px] h-full flex items-end justify-between px-18 text-[9px] text-gray-400 font-mono">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="h-1.5 w-px bg-gray-300 mb-0.5" />
                <span>{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Paper Canvas Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center relative">
        {/* Real-time Cursor Contention / Hotspot Warning Pill */}
        {collisionUsers.length > 0 && (
          <div className="sticky top-2 z-40 mb-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-pulse no-print">
            <Flame className="w-4 h-4 text-yellow-200" />
            <span>
              <strong>Active Cursor Workzone:</strong> {collisionUsers.join(' & ')} are working at the same cursor point!
            </span>
            <span className="bg-black/20 text-yellow-100 text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">
              WAVY UNDERLINE ACTIVE
            </span>
          </div>
        )}

        <div className="relative">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Document Telemetry Footer */}
      <div className="h-6 bg-white border-t border-[#dadce0] px-6 flex items-center justify-between text-[11px] text-gray-500 select-none no-print">
        <div className="flex items-center space-x-4">
          <span>Words: <strong>{wordCount}</strong></span>
          <span>Characters: <strong>{charCount}</strong></span>
          <span className="text-gray-400">|</span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: session.user.color }} />
            <span>Logged in as: <strong>{session.user.name}</strong></span>
          </span>
          {collisionUsers.length > 0 && (
            <>
              <span className="text-gray-400">|</span>
              <span className="text-amber-600 font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Hotspot: {collisionUsers.length} editors here</span>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <span>CRDT: YATA / Yjs v13</span>
          <span>•</span>
          <span>Sync: WebSocket v2</span>
        </div>
      </div>
    </div>
  );
};
