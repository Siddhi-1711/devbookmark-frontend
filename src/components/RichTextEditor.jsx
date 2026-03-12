import { useState, useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
  List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3,
  Highlighter, Undo, Redo, Table as TableIcon, X
} from 'lucide-react'

export default function RichTextEditor({ content, onChange }) {
  const [showTablePicker, setShowTablePicker] = useState(false)
  const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 })
  const tablePickerRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content === '') {
      editor.commands.clearContent()
    }
  }, [content])

  // Close table picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (tablePickerRef.current && !tablePickerRef.current.contains(e.target)) {
        setShowTablePicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!editor) return null

  const ToolbarButton = ({ onClick, active, title, children }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  )

  const setLink = () => {
    const url = window.prompt('Enter URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
    else editor.chain().focus().unsetLink().run()
  }

  const insertTable = (rows, cols) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    setShowTablePicker(false)
  }

  const GRID = 10

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition">

      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-30 bg-gray-800 border-b border-gray-700 p-2 flex flex-wrap gap-1">

        {/* History */}
        <div className="flex gap-1 pr-2 border-r border-gray-700">
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={15} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={15} /></ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 pr-2 border-r border-gray-700">
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 size={15} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={15} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={15} /></ToolbarButton>
        </div>

        {/* Text formatting */}
        <div className="flex gap-1 pr-2 border-r border-gray-700">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={15} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={15} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={15} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={15} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code"><Code size={15} /></ToolbarButton>
        </div>

        {/* Colors */}
        <div className="flex gap-1 pr-2 border-r border-gray-700 items-center">
          <div className="relative" title="Text color">
            <input
              type="color"
              onInput={e => editor.chain().focus().setColor(e.target.value).run()}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
              title="Text Color"
            />
          </div>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} active={editor.isActive('highlight')} title="Highlight"><Highlighter size={15} /></ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 pr-2 border-r border-gray-700">
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={15} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter size={15} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={15} /></ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 pr-2 border-r border-gray-700">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List size={15} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List"><ListOrdered size={15} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><Quote size={15} /></ToolbarButton>
        </div>

        {/* Link */}
        <div className="flex gap-1 pr-2 border-r border-gray-700">
          <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Insert Link"><LinkIcon size={15} /></ToolbarButton>
        </div>

        {/* Table picker */}
        <div className="flex gap-1 relative" ref={tablePickerRef}>
          <ToolbarButton
            onClick={() => setShowTablePicker(v => !v)}
            active={showTablePicker}
            title="Insert Table"
          >
            <TableIcon size={15} />
          </ToolbarButton>

          {showTablePicker && (
            <div className="absolute top-8 left-0 z-50 bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-2xl">
              <div className="text-gray-400 text-xs mb-2">
                {hoveredCell.row > 0
                  ? `${hoveredCell.col} × ${hoveredCell.row} table`
                  : 'Select table size'}
              </div>
              <div className="flex flex-col gap-0.5">
                {Array.from({ length: GRID }, (_, row) => (
                  <div key={row} className="flex gap-0.5">
                    {Array.from({ length: GRID }, (_, col) => (
                      <div
                        key={col}
                        onMouseEnter={() => setHoveredCell({ row: row + 1, col: col + 1 })}
                        onClick={() => insertTable(row + 1, col + 1)}
                        className={`w-5 h-5 rounded-sm border cursor-pointer transition ${
                          row < hoveredCell.row && col < hoveredCell.col
                            ? 'bg-blue-500 border-blue-400'
                            : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowTablePicker(false)}
                className="mt-2 text-gray-600 hover:text-gray-400 text-xs flex items-center gap-1"
              >
                <X size={11} /> Cancel
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="min-h-[300px] bg-gray-800 text-gray-200 px-5 py-4 max-w-none
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-3
          [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-2
          [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mb-2
          [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_p]:leading-relaxed
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-3
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-3
          [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-blue-500 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-gray-400
          [&_.ProseMirror_code]:bg-gray-700 [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-blue-300 [&_.ProseMirror_code]:text-sm
          [&_.ProseMirror_pre]:bg-gray-900 [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:mb-3
          [&_.ProseMirror_a]:text-blue-400 [&_.ProseMirror_a]:underline
          [&_.ProseMirror_span[style]]:![color:revert]
          [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:mb-4
          [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-gray-600 [&_.ProseMirror_td]:p-2 [&_.ProseMirror_td]:text-gray-200
          [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-gray-600 [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:bg-gray-700 [&_.ProseMirror_th]:font-semibold [&_.ProseMirror_th]:text-white
          [&_.ProseMirror_mark]:rounded [&_.ProseMirror_mark]:px-0.5"
      />
    </div>
  )
}