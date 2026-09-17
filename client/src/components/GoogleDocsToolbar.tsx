import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Undo,
  Redo,
  Printer,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Baseline,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Table as TableIcon,
  RemoveFormatting,
  ChevronDown,
} from 'lucide-react';

interface GoogleDocsToolbarProps {
  editor: Editor | null;
  onPrint: () => void;
}

export const GoogleDocsToolbar: React.FC<GoogleDocsToolbarProps> = ({ editor, onPrint }) => {
  const [zoom, setZoom] = useState('100%');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const colorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
      if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) {
        setShowHighlightPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor) {
    return null;
  }

  const TEXT_COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  ];

  const HIGHLIGHT_COLORS = [
    'transparent', '#fef7e0', '#e6f4ea', '#e8f0fe', '#fce8e6', '#f3e8fd', '#feefe3', '#e4f7fb'
  ];

  const handleTextStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else if (value === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (value === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (value === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'paragraph';
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="bg-[#280e1a]/80 backdrop-blur-2xl px-3.5 py-1.5 border border-white/15 flex items-center space-x-1 flex-wrap text-rose-100/90 rounded-2xl mx-auto my-2 shadow-[0_15px_35px_rgba(0,0,0,0.6)] no-print max-w-4xl justify-center">
      {/* Undo & Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 hover:bg-white/15 hover:text-white disabled:opacity-20 rounded-xl transition-colors"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 hover:bg-white/15 hover:text-white disabled:opacity-20 rounded-xl transition-colors"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-4 h-4" />
      </button>

      <button
        onClick={onPrint}
        className="p-1.5 hover:bg-[#d3e3fd] hover:text-[#041e49] rounded transition-colors"
        title="Print (Ctrl+P)"
      >
        <Printer className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-gray-300 mx-1" />

      {/* Zoom selector */}
      <select
        value={zoom}
        onChange={(e) => {
          setZoom(e.target.value);
          const el = document.querySelector('.ProseMirror') as HTMLElement;
          if (el) {
            const scale = parseInt(e.target.value) / 100;
            el.style.transform = `scale(${scale})`;
            el.style.transformOrigin = 'top center';
          }
        }}
        className="bg-transparent hover:bg-[#d3e3fd] px-1.5 py-1 text-xs rounded border-none focus:outline-none cursor-pointer"
      >
        <option value="75">75%</option>
        <option value="90">90%</option>
        <option value="100">100%</option>
        <option value="125">125%</option>
        <option value="150">150%</option>
      </select>

      <div className="h-5 w-px bg-gray-300 mx-1" />

      {/* Heading Style Dropdown */}
      <select
        value={getCurrentHeading()}
        onChange={handleTextStyleChange}
        className="bg-transparent hover:bg-[#d3e3fd] px-2 py-1 text-xs font-medium rounded border-none focus:outline-none cursor-pointer"
      >
        <option value="paragraph">Normal text</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <div className="h-5 w-px bg-gray-300 mx-1" />

      {/* Bold */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('bold') ? 'bg-[#d3e3fd] text-[#041e49] font-bold' : 'hover:bg-[#d3e3fd]'
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>

      {/* Italic */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('italic') ? 'bg-[#d3e3fd] text-[#041e49]' : 'hover:bg-[#d3e3fd]'
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>

      {/* Underline */}
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('underline') ? 'bg-[#d3e3fd] text-[#041e49]' : 'hover:bg-[#d3e3fd]'
        }`}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>

      {/* Strikethrough */}
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('strike') ? 'bg-[#d3e3fd] text-[#041e49]' : 'hover:bg-[#d3e3fd]'
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      {/* Text Color Picker */}
      <div className="relative" ref={colorRef}>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-1.5 hover:bg-[#d3e3fd] rounded flex items-center space-x-0.5"
          title="Text color"
        >
          <Baseline className="w-4 h-4" />
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 grid grid-cols-5 gap-1.5 w-44">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  editor.chain().focus().setColor(c).run();
                  setShowColorPicker(false);
                }}
                className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Text Highlight Color */}
      <div className="relative" ref={highlightRef}>
        <button
          onClick={() => setShowHighlightPicker(!showHighlightPicker)}
          className="p-1.5 hover:bg-[#d3e3fd] rounded flex items-center space-x-0.5"
          title="Highlight color"
        >
          <Highlighter className="w-4 h-4" />
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
        {showHighlightPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 grid grid-cols-4 gap-1.5 w-40">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  if (c === 'transparent') {
                    editor.chain().focus().unsetHighlight().run();
                  } else {
                    editor.chain().focus().toggleHighlight({ color: c }).run();
                  }
                  setShowHighlightPicker(false);
                }}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform flex items-center justify-center text-[10px]"
                style={{ backgroundColor: c }}
              >
                {c === 'transparent' ? '✕' : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-5 w-px bg-gray-300 mx-1" />

      {/* Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-[#d3e3fd] text-[#041e49]' : 'hover:bg-[#d3e3fd]'
        }`}
        title="Align left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-[#d3e3fd] text-[#041e49]' : 'hover:bg-[#d3e3fd]'
        }`}
        title="Align center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-[#d3e3fd] text-[#041e49]' : 'hover:bg-[#d3e3fd]'
        }`}
        title="Align right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive({ textAlign: 'justify' }) ? 'bg-[#d3e3fd] text-[#041e49]' : 'hover:bg-[#d3e3fd]'
        }`}
        title="Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-gray-300 mx-1" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('bulletList') ? 'bg-[#d3e3fd] text-[#041e49]' : 'hover:bg-[#d3e3fd]'
        }`}
        title="Bulleted list"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('orderedList') ? 'bg-[#d3e3fd] text-[#041e49]' : 'hover:bg-[#d3e3fd]'
        }`}
        title="Numbered list"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('taskList') ? 'bg-[#d3e3fd] text-[#041e49]' : 'hover:bg-[#d3e3fd]'
        }`}
        title="Checklist"
      >
        <CheckSquare className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-gray-300 mx-1" />

      {/* Blockquote & Code */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('blockquote') ? 'bg-[#d3e3fd] text-[#041e49]' : 'hover:bg-[#d3e3fd]'
        }`}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('codeBlock') ? 'bg-[#d3e3fd] text-[#041e49]' : 'hover:bg-[#d3e3fd]'
        }`}
        title="Code block"
      >
        <Code className="w-4 h-4" />
      </button>

      {/* Table */}
      <button
        onClick={insertTable}
        className="p-1.5 hover:bg-[#d3e3fd] rounded transition-colors"
        title="Insert 3x3 Table"
      >
        <TableIcon className="w-4 h-4" />
      </button>

      {/* Clear Formatting */}
      <button
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="p-1.5 hover:bg-[#d3e3fd] rounded transition-colors"
        title="Clear formatting"
      >
        <RemoveFormatting className="w-4 h-4" />
      </button>
    </div>
  );
};
