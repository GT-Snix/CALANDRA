type IconProps = { className?: string }

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const
}

export function BoldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4h8a4 4 0 0 1 0 8H6z" />
      <path d="M6 12h9a4 4 0 0 1 0 8H6z" />
    </svg>
  )
}

export function ItalicIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  )
}

export function UnderlineIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4v6a6 6 0 0 0 12 0V4" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  )
}

export function StrikeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <path d="M16 6.5c-.7-1-2-1.7-4-1.7-3 0-4.5 1.3-4.5 3 0 1.6 1.3 2.3 3 2.7" />
      <path d="M8 17.5c.7 1 2.2 1.7 4.2 1.7 2.8 0 4.3-1.2 4.3-3" />
    </svg>
  )
}

export function BulletListIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
    </svg>
  )
}

export function OrderedListIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <text x="2" y="8" fontSize="7" fill="currentColor" stroke="none">
        1
      </text>
      <text x="2" y="14.5" fontSize="7" fill="currentColor" stroke="none">
        2
      </text>
      <text x="2" y="21" fontSize="7" fill="currentColor" stroke="none">
        3
      </text>
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
    </svg>
  )
}

export function CodeBlockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <polyline points="8 6 3 12 8 18" />
      <polyline points="16 6 21 12 16 18" />
    </svg>
  )
}

export function LinkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 15 15 9" />
      <path d="M11 6l1.5-1.5a3.5 3.5 0 0 1 5 5L16 11" />
      <path d="M13 18l-1.5 1.5a3.5 3.5 0 0 1-5-5L8 13" />
    </svg>
  )
}
