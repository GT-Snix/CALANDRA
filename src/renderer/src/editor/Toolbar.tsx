import type { Editor } from '@tiptap/react'
import {
  BoldIcon,
  BulletListIcon,
  CodeBlockIcon,
  ItalicIcon,
  LinkIcon,
  OrderedListIcon,
  StrikeIcon,
  UnderlineIcon
} from './icons'

function ToolbarButton({
  onClick,
  active,
  label,
  children
}: {
  onClick: () => void
  active?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      className={`toolbar-btn${active ? ' is-active' : ''}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="toolbar-divider" />
}

export function Toolbar({ editor }: { editor: Editor }) {
  const setLink = (): void => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL', previousUrl ?? 'https://')
    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  return (
    <div className="toolbar">
      <ToolbarButton
        label="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <StrikeIcon />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <BulletListIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Ordered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <OrderedListIcon />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Code block"
        active={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <CodeBlockIcon />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Link" active={editor.isActive('link')} onClick={setLink}>
        <LinkIcon />
      </ToolbarButton>
    </div>
  )
}
