// Minimal, one-way TipTap JSON -> Markdown serializer. Covers exactly the
// node/mark set the daylog editor enables (see src/renderer/src/editor/Editor.tsx).
// Not a general-purpose ProseMirror-to-markdown library, and not meant to
// round-trip perfectly — good enough for a readable mirror file.

export interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

export interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
  marks?: TiptapMark[]
}

function escapeInlineText(text: string): string {
  return text.replace(/([*_`~])/g, '\\$1')
}

function wrapWithMark(text: string, mark: TiptapMark): string {
  switch (mark.type) {
    case 'bold':
      return `**${text}**`
    case 'italic':
      return `*${text}*`
    case 'strike':
      return `~~${text}~~`
    case 'underline':
      return `<u>${text}</u>`
    case 'code':
      return `\`${text}\``
    case 'link': {
      const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : ''
      return `[${text}](${href})`
    }
    default:
      return text
  }
}

function renderTextNode(node: TiptapNode): string {
  const raw = node.text ?? ''
  const hasCode = node.marks?.some((m) => m.type === 'code')
  let text = hasCode ? raw : escapeInlineText(raw)

  const marks = node.marks ?? []
  // Apply link last so it wraps everything else: [**bold**](url) reads better
  // than **[bold](url)** and keeps the href intact regardless of other marks.
  const linkMark = marks.find((m) => m.type === 'link')
  const otherMarks = marks.filter((m) => m.type !== 'link')

  for (const mark of otherMarks) {
    text = wrapWithMark(text, mark)
  }
  if (linkMark) {
    text = wrapWithMark(text, linkMark)
  }

  return text
}

function renderInline(nodes: TiptapNode[] | undefined): string {
  if (!nodes) return ''
  return nodes
    .map((node) => {
      if (node.type === 'text') return renderTextNode(node)
      if (node.type === 'hardBreak') return '  \n'
      // Unknown inline node: fall back to any nested text.
      return renderInline(node.content)
    })
    .join('')
}

function renderListItems(items: TiptapNode[], ordered: boolean, start: number, depth: number): string {
  const indent = '  '.repeat(depth)
  return items
    .map((item, i) => {
      const marker = ordered ? `${start + i}.` : '-'
      const [firstBlock, ...restBlocks] = item.content ?? []
      const firstLine = firstBlock ? renderBlock(firstBlock, depth) : ''
      const rest = restBlocks.map((b) => renderBlock(b, depth + 1)).join('\n\n')
      const body = [`${indent}${marker} ${firstLine.trimStart()}`, rest].filter(Boolean).join('\n')
      return body
    })
    .join('\n')
}

function renderBlock(node: TiptapNode, depth = 0): string {
  switch (node.type) {
    case 'paragraph':
      return renderInline(node.content)
    case 'codeBlock': {
      const lang = typeof node.attrs?.language === 'string' ? node.attrs.language : ''
      const code = (node.content ?? []).map((n) => n.text ?? '').join('')
      return `\`\`\`${lang}\n${code}\n\`\`\``
    }
    case 'bulletList':
      return renderListItems(node.content ?? [], false, 1, depth)
    case 'orderedList': {
      const start = typeof node.attrs?.start === 'number' ? node.attrs.start : 1
      return renderListItems(node.content ?? [], true, start, depth)
    }
    case 'youtubeEmbed': {
      const videoId = typeof node.attrs?.videoId === 'string' ? node.attrs.videoId : ''
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
      const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      return `[![YouTube video](${thumbUrl})](${watchUrl})`
    }
    default:
      // Unknown block: try rendering its content, else its own text.
      if (node.content) return node.content.map((n) => renderBlock(n, depth)).join('\n\n')
      return node.text ?? ''
  }
}

export function tiptapDocToMarkdown(doc: TiptapNode): string {
  if (!doc.content) return ''
  return doc.content
    .map((node) => renderBlock(node))
    .filter((block) => block.length > 0)
    .join('\n\n')
    .trim()
}
