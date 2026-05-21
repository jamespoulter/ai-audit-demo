'use client'

/**
 * Simplified geometric marks for the tools FW evaluates in W2.
 * Not pixel-accurate brand logos — abstracted geometric forms that
 * read on a dark deck without leaning on trademarks. Brand colours
 * are approximate, used as colour cues rather than authoritative.
 */

type MarkProps = { size?: number }

const S = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24' })

export function ChatGPTMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#10a37f" />
      <path
        d="M12 5.5c1.6 0 3 .9 3.6 2.4 1.6.2 2.9 1.5 2.9 3.2 0 .8-.3 1.6-.8 2.2.5.5.8 1.3.8 2.1 0 1.7-1.3 3-3 3-.6 1.5-2 2.6-3.6 2.6s-3-1.1-3.6-2.6c-1.7 0-3-1.3-3-3 0-.8.3-1.6.8-2.1-.5-.6-.8-1.4-.8-2.2 0-1.7 1.3-3 2.9-3.2.6-1.5 2-2.4 3.6-2.4z"
        fill="none"
        stroke="white"
        strokeWidth="1.4"
        opacity="0.9"
      />
      <circle cx="12" cy="12" r="2" fill="white" />
    </svg>
  )
}

export function ClaudeMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#d97757" />
      {/* Anthropic-style asterisk-burst */}
      <g stroke="white" strokeWidth="1.7" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5.5" y1="12" x2="18.5" y2="12" />
        <line x1="7.5" y1="7.5" x2="16.5" y2="16.5" />
        <line x1="16.5" y1="7.5" x2="7.5" y2="16.5" />
      </g>
    </svg>
  )
}

export function GeminiMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <defs>
        <linearGradient id="gem-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4285f4" />
          <stop offset="100%" stopColor="#9b72cb" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#gem-grad)" />
      {/* Four-pointed sparkle */}
      <path
        d="M12 4 C12 8, 16 12, 20 12 C16 12, 12 16, 12 20 C12 16, 8 12, 4 12 C8 12, 12 8, 12 4 Z"
        fill="white"
      />
    </svg>
  )
}

export function DriveMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#1f1f1f" />
      {/* Three-colour triangle */}
      <path d="M9 4 L15 4 L20 13 L17 18 L11 8 Z" fill="#fbbc04" />
      <path d="M11 8 L17 18 L7 18 L4 13 Z" fill="#34a853" />
      <path d="M9 4 L4 13 L7 18 L13 8 Z" fill="#4285f4" />
    </svg>
  )
}

export function NotionMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <rect width="24" height="24" rx="4" fill="white" />
      <text
        x="12"
        y="17"
        fontFamily="DM Serif Display, Georgia, serif"
        fontSize="16"
        fontWeight="700"
        fill="#1f1f1f"
        textAnchor="middle"
      >
        N
      </text>
    </svg>
  )
}

export function SheetsMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#0f9d58" />
      <g stroke="white" strokeWidth="1.4" fill="none">
        <rect x="6" y="6" width="12" height="12" rx="0.5" />
        <line x1="6" y1="10" x2="18" y2="10" />
        <line x1="6" y1="14" x2="18" y2="14" />
        <line x1="10" y1="6" x2="10" y2="18" />
        <line x1="14" y1="6" x2="14" y2="18" />
      </g>
    </svg>
  )
}

export function DocsMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#4285f4" />
      <g stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <rect x="6.5" y="5" width="11" height="14" rx="1" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="15" x2="13" y2="15" />
      </g>
    </svg>
  )
}

export function MondayMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#ff3d57" />
      <g stroke="white" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M5 16 Q 8 8 11 16" />
        <path d="M11 16 Q 14 8 17 16" />
      </g>
      <circle cx="19" cy="16" r="1.4" fill="#ffcc00" />
    </svg>
  )
}

export function ProductiveMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#5b3df8" />
      <text
        x="12"
        y="17"
        fontFamily="DM Serif Display, Georgia, serif"
        fontSize="14"
        fontWeight="700"
        fill="white"
        textAnchor="middle"
      >
        P
      </text>
    </svg>
  )
}

export function PowerPointMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#d24726" />
      <g fill="white">
        <path d="M7 6 L13 6 A 5 5 0 0 1 13 16 L11 16 L11 19 L7 19 Z" />
        <circle cx="13" cy="11" r="2.4" fill="#d24726" />
      </g>
    </svg>
  )
}

export function ReadMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#fb6a3c" />
      <g stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M5 8 Q 12 5 19 8" />
        <path d="M5 12 L19 12" />
        <path d="M5 16 Q 12 19 19 16" />
      </g>
    </svg>
  )
}

export function GranolaMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#1a1a1a" />
      <g fill="#f5e6d3">
        <circle cx="9" cy="9" r="2" />
        <circle cx="15" cy="9" r="2" />
        <circle cx="12" cy="14" r="2" />
        <circle cx="9" cy="17" r="1.4" />
        <circle cx="16" cy="17" r="1.4" />
      </g>
    </svg>
  )
}

export function Base44Mark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#7c3aed" />
      <g fill="white">
        <text
          x="12"
          y="17"
          fontFamily="DM Serif Display, Georgia, serif"
          fontSize="14"
          fontWeight="700"
          fill="white"
          textAnchor="middle"
        >
          B
        </text>
      </g>
    </svg>
  )
}

export function GoogleChatMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#1f8e3d" />
      <path
        d="M5 7 A 2 2 0 0 1 7 5 L17 5 A 2 2 0 0 1 19 7 L19 14 A 2 2 0 0 1 17 16 L11 16 L7 19 L7 16 A 2 2 0 0 1 5 14 Z"
        fill="white"
      />
    </svg>
  )
}

export function GmailMark({ size = 20 }: MarkProps) {
  return (
    <svg {...S(size)} aria-hidden>
      <rect width="24" height="24" rx="4" fill="white" />
      <path d="M4 7 L4 18 L8 18 L8 11 L12 14 L16 11 L16 18 L20 18 L20 7 L16 7 L12 10 L8 7 Z" fill="#ea4335" />
    </svg>
  )
}

// Tool registry — maps a string id to mark + name + colour for use in chips/legends.
export type ToolId =
  | 'chatgpt' | 'claude' | 'gemini'
  | 'drive' | 'notion' | 'sheets' | 'docs'
  | 'monday' | 'productive'
  | 'powerpoint' | 'read' | 'granola' | 'base44'
  | 'gchat' | 'gmail'

export const TOOLS: Record<ToolId, { name: string; colour: string; Mark: (p: MarkProps) => JSX.Element }> = {
  chatgpt:    { name: 'ChatGPT',       colour: '#10a37f', Mark: ChatGPTMark },
  claude:     { name: 'Claude',        colour: '#d97757', Mark: ClaudeMark },
  gemini:     { name: 'Gemini',        colour: '#4285f4', Mark: GeminiMark },
  drive:      { name: 'Google Drive',  colour: '#fbbc04', Mark: DriveMark },
  notion:     { name: 'Notion',        colour: '#ffffff', Mark: NotionMark },
  sheets:     { name: 'Google Sheets', colour: '#0f9d58', Mark: SheetsMark },
  docs:       { name: 'Google Docs',   colour: '#4285f4', Mark: DocsMark },
  monday:     { name: 'Monday.com',    colour: '#ff3d57', Mark: MondayMark },
  productive: { name: 'Productive',    colour: '#5b3df8', Mark: ProductiveMark },
  powerpoint: { name: 'PowerPoint',    colour: '#d24726', Mark: PowerPointMark },
  read:       { name: 'Read.ai',       colour: '#fb6a3c', Mark: ReadMark },
  granola:    { name: 'Granola',       colour: '#f5e6d3', Mark: GranolaMark },
  base44:     { name: 'Base44',        colour: '#7c3aed', Mark: Base44Mark },
  gchat:      { name: 'Google Chat',   colour: '#1f8e3d', Mark: GoogleChatMark },
  gmail:      { name: 'Gmail',         colour: '#ea4335', Mark: GmailMark },
}

type ChipProps = {
  id: ToolId
  size?: 'sm' | 'md' | 'lg'
}

export function ToolChip({ id, size = 'md' }: ChipProps) {
  const tool = TOOLS[id]
  if (!tool) return null
  const markSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20
  const cls = size === 'sm' ? 'tool-chip tool-chip-sm' : size === 'lg' ? 'tool-chip tool-chip-lg' : 'tool-chip'
  return (
    <span className={cls}>
      <tool.Mark size={markSize} />
      <span className="tool-chip-label">{tool.name}</span>
    </span>
  )
}

type GridProps = {
  ids: ToolId[]
  highlight?: ToolId   // optional — render this one with full opacity, others dimmed
  size?: 'sm' | 'md' | 'lg'
}

export function ToolChipGrid({ ids, highlight, size }: GridProps) {
  return (
    <div className="tool-chip-grid">
      {ids.map(id => (
        <span key={id} className={highlight && highlight !== id ? 'tool-chip-dim' : 'tool-chip-bright'}>
          <ToolChip id={id} size={size} />
        </span>
      ))}
    </div>
  )
}

type CandidateRowProps = {
  region: 'memory' | 'thinking' | 'deciding' | 'creating'
  label: string
  ids: ToolId[]
}

export function ToolCandidateRow({ region, label, ids }: CandidateRowProps) {
  return (
    <div className={`tool-candidate-row tool-candidate-${region}`}>
      <div className="tool-candidate-label">{label}</div>
      <div className="tool-candidate-pick">Pick one →</div>
      <div className="tool-candidate-options">
        {ids.map(id => <ToolChip key={id} id={id} size="sm" />)}
      </div>
    </div>
  )
}
