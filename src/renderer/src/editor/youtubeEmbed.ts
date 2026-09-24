const YOUTUBE_URL_SOURCE =
  '(?:https?://)?(?:www\\.|m\\.)?(?:youtube\\.com/(?:watch\\?(?:.*&)?v=|embed/|shorts/)|youtu\\.be/)([a-zA-Z0-9_-]{11})(?:\\S*)?'

// Each rule needs its own RegExp instance: the 'g' flag makes exec/test
// stateful via lastIndex, and TipTap's paste/input rules run independently.
export function createYoutubeUrlRegex(): RegExp {
  return new RegExp(YOUTUBE_URL_SOURCE, 'g')
}
