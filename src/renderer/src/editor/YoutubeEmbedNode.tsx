import { Node, mergeAttributes, nodeInputRule, nodePasteRule } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react'
import { createYoutubeUrlRegex } from './youtubeEmbed'

function YoutubeEmbedView({ node }: NodeViewProps): React.JSX.Element {
  const videoId = node.attrs.videoId as string
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`

  const open = (e: React.MouseEvent): void => {
    e.preventDefault()
    window.daylog.openExternal(watchUrl)
  }

  return (
    <NodeViewWrapper className="youtube-embed" contentEditable={false}>
      <a href={watchUrl} onClick={open} className="youtube-embed-link">
        <img src={thumbnailUrl} alt="YouTube video thumbnail" draggable={false} />
        <span className="youtube-embed-play" aria-hidden="true">
          ▶
        </span>
      </a>
    </NodeViewWrapper>
  )
}

export const YoutubeEmbed = Node.create({
  name: 'youtubeEmbed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      videoId: { default: null }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-youtube-embed]' }]
  },

  renderHTML({ node }) {
    return [
      'div',
      mergeAttributes({ 'data-youtube-embed': '', 'data-video-id': node.attrs.videoId })
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(YoutubeEmbedView)
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: createYoutubeUrlRegex(),
        type: this.type,
        getAttributes: (match) => ({ videoId: match[1] })
      })
    ]
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: createYoutubeUrlRegex(),
        type: this.type,
        getAttributes: (match) => ({ videoId: match[1] })
      })
    ]
  }
})
