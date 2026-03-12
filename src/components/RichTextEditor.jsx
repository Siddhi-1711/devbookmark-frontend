import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { useEffect, useMemo, useState } from 'react'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Table as TableIcon } from 'lucide-react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
  List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3,
  Highlighter, Undo, Redo, Plus
} from 'lucide-react'

export default function RichTextEditor({ content, onChange }) {
const [showTablePicker, setShowTablePicker] = useState(false)
const [tableSize, setTableSize] = useState({ rows: 0, cols: 0 })
  const editor = useEditor({
    extensions: [
     StarterKit.configure({
       underline: false,
     }),
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
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px]',
      },
    },
  })

  useEffect(() => {
    if (editor && content === '') {
      editor.commands.clearContent()
    }
  }, [content, editor])

  if (!editor) return null

  const currentColor = editor.getAttributes('textStyle').color || '#ffffff'

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
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
  }

  const grid = useMemo(() => {
    return Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => ({
        rows: r + 1,
        cols: c + 1,
      }))
    )
  }, [])

  const insertTable = (rows, cols) => {
    editor.chain().focus().insertTable({
      rows,
      cols,
      withHeaderRow: true,
    }).run()

    setShowTablePicker(false)
    setTableSize({ rows: 0, cols: 0 })
  }


const addRowAfter = () => {
  editor.chain().focus().addRowAfter().run()
}

const addColumnAfter = () => {
  editor.chain().focus().addColumnAfter().run()
}
  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition bg-gray-800">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-20 bg-gray-800/95 backdrop-blur border-b border-gray-700 p-2 flex flex-wrap gap-1">
        {/* History */}
        <div className="flex gap-1 pr-2 border-r border-gray-700">
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
            <Undo size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
            <Redo size={15} />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 pr-2 border-r border-gray-700">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={15} />
          </ToolbarButton>
        </div>

        {/* Text formatting */}
        <div className="flex gap-1 pr-2 border-r border-gray-700">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          >
            <Bold size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          >
            <Italic size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="Inline Code"
          >
            <Code size={15} />
          </ToolbarButton>
        </div>

        {/* Colors */}
        <div className="flex gap-1 pr-2 border-r border-gray-700 items-center">
          <label
            title="Text Color"
            className="w-7 h-7 rounded overflow-hidden border border-gray-600 cursor-pointer bg-gray-900 flex items-center justify-center"
          >
            <input
              type="color"
              value={currentColor}
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              className="w-10 h-10 scale-150 cursor-pointer bg-transparent border-0 p-0"
            />
          </label>

          <ToolbarButton
            onClick={() => editor.chain().focus().unsetColor().run()}
            title="Remove Text Color"
          >
            <span className="text-xs font-bold">A</span>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
            active={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter size={15} />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 pr-2 border-r border-gray-700">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight size={15} />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 pr-2 border-r border-gray-700">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote size={15} />
          </ToolbarButton>
        </div>

        {/* Link */}
        <div className="flex gap-1 pr-2 border-r border-gray-700">
          <ToolbarButton
            onClick={setLink}
            active={editor.isActive('link')}
            title="Insert Link"
          >
            <LinkIcon size={15} />
          </ToolbarButton>
        </div>

        {/* Table Picker */}
        <div className="relative flex items-center gap-1 pl-2 border-l border-gray-700">
          <ToolbarButton
            onClick={() => setShowTablePicker((prev) => !prev)}
            title="Insert Table"
          >
            <TableIcon size={15} />
          </ToolbarButton>

          <ToolbarButton
            onClick={addRowAfter}
            title="Add Row"
          >
            <Plus size={14} />
            <span className="ml-1 text-[11px]">R</span>
          </ToolbarButton>

          <ToolbarButton
            onClick={addColumnAfter}
            title="Add Column"
          >
            <Plus size={14} />
            <span className="ml-1 text-[11px]">C</span>
          </ToolbarButton>

          {showTablePicker && (
            <div className="absolute top-10 left-0 z-30 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[160px]">
              <div className="mb-2 text-xs text-gray-300">
                {tableSize.rows && tableSize.cols
                  ? `${tableSize.rows} x ${tableSize.cols}`
                  : 'Select table size'}
              </div>

              <div className="grid grid-cols-4 gap-1">
                {grid.flat().map((cell, index) => {
                  const active =
                    cell.rows <= tableSize.rows && cell.cols <= tableSize.cols

                  return (
                    <button
                      key={index}
                      type="button"
                      onMouseEnter={() => setTableSize({ rows: cell.rows, cols: cell.cols })}
                      onClick={() => insertTable(cell.rows, cell.cols)}
                      className={`w-6 h-6 border rounded-sm transition ${
                        active
                          ? 'bg-blue-500 border-blue-400'
                          : 'bg-gray-800 border-gray-600 hover:border-gray-400'
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="overflow-x-auto">
        <EditorContent
          editor={editor}
          className="min-h-[300px] bg-gray-800 px-5 py-4 prose prose-invert prose-sm max-w-none
            [&_.ProseMirror]:outline-none
            [&_.ProseMirror]:text-gray-200
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
            [&_.ProseMirror_span[style*='color']]:text-inherit
            [&_.ProseMirror_table]:border-collapse
            [&_.ProseMirror_table]:mb-4
            [&_.ProseMirror_table]:min-w-full
            [&_.ProseMirror_table]:w-max
            [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-gray-600 [&_.ProseMirror_td]:p-2 [&_.ProseMirror_td]:min-w-[120px] [&_.ProseMirror_td]:align-top
            [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-gray-600 [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:bg-gray-700 [&_.ProseMirror_th]:font-semibold [&_.ProseMirror_th]:text-white [&_.ProseMirror_th]:min-w-[120px] [&_.ProseMirror_th]:align-top
            [&_.ProseMirror_mark]:rounded [&_.ProseMirror_mark]:px-0.5
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-600
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
        />
      </div>
    </div>
  )
}