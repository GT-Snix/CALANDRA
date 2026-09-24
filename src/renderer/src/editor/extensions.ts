import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import type { AnyExtension } from '@tiptap/core'
import { YoutubeEmbed } from './YoutubeEmbedNode'

export function getEditorExtensions(): AnyExtension[] {
  return [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      horizontalRule: false,
      link: false,
      underline: false
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      HTMLAttributes: { class: 'note-link' }
    }),
    YoutubeEmbed
  ]
}
