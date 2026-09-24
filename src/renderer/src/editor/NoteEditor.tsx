import { useEffect, useRef } from 'react'
import { EditorContent, useEditor, type JSONContent } from '@tiptap/react'
import { getEditorExtensions } from './extensions'
import { Toolbar } from './Toolbar'

const AUTOSAVE_DELAY_MS = 1000

const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] }

function parseContent(content: string | null): JSONContent {
  if (!content) return EMPTY_DOC
  try {
    return JSON.parse(content)
  } catch {
    return EMPTY_DOC
  }
}

export function NoteEditor({ date, initialContent }: { date: string; initialContent: string | null }) {
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: parseContent(initialContent),
    editorProps: {
      attributes: { class: 'note-content' },
      handleClick(_view, _pos, event) {
        const target = event.target as HTMLElement
        // The youtube-embed node view handles its own click (opens the
        // video externally) — don't double-dispatch here.
        if (target.closest('.youtube-embed')) return false
        const anchor = target.closest('a')
        if (anchor?.href) {
          event.preventDefault()
          window.daylog.openExternal(anchor.href)
          return true
        }
        return false
      }
    },
    onUpdate({ editor: e }) {
      scheduleSave(e.getJSON())
    }
  })

  function saveNow(json: JSONContent): void {
    window.daylog.saveNote(date, JSON.stringify(json))
  }

  function scheduleSave(json: JSONContent): void {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => saveNow(json), AUTOSAVE_DELAY_MS)
  }

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
  }, [])

  useEffect(() => {
    if (!import.meta.env.DEV || !editor) return
    // Dev-only hook so we can drive the editor from the main process /
    // devtools console while verifying behavior. Stripped from prod builds.
    ;(window as unknown as { __editor?: typeof editor }).__editor = editor
    return () => {
      delete (window as unknown as { __editor?: typeof editor }).__editor
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="note-editor-shell">
      <div className="toolbar-bar">
        <div className="column-width">
          <Toolbar editor={editor} />
        </div>
      </div>
      <div className="note-scroll-region">
        <div className="note-content-column column-width">
          <EditorContent
            editor={editor}
            onBlur={() => {
              if (saveTimeout.current) {
                clearTimeout(saveTimeout.current)
                saveTimeout.current = null
              }
              saveNow(editor.getJSON())
            }}
          />
        </div>
      </div>
    </div>
  )
}
