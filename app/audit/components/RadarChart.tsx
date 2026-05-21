import { DIMENSIONS } from '../lib/questions'
import type { DimensionId, ScoreResult } from '../lib/types'

type Props = {
  scores: ScoreResult
  size?: number
}

// Axis order (clockwise from top): memory, thinking, deciding, creating.
const ORDER: DimensionId[] = ['memory', 'thinking', 'deciding', 'creating']
const ANGLES: Record<DimensionId, number> = {
  memory:   -Math.PI / 2,        // top
  thinking:  0,                  // right
  deciding:  Math.PI / 2,        // bottom
  creating:  Math.PI,            // left
}

export function RadarChart({ scores, size = 360 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.36
  const rings = [25, 50, 75, 100]

  const points = ORDER.map(d => {
    const pct = scores.byDimension[d].pct
    const r = (pct / 100) * radius
    const a = ANGLES[d]
    return { d, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
  })

  const polygon = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  const labelOffset = 22

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="auto"
      role="img"
      aria-label={`Radar chart of four dimension scores: ${ORDER.map(d => {
        const dim = DIMENSIONS.find(x => x.id === d)!
        return `${dim.label} ${scores.byDimension[d].pct}%`
      }).join(', ')}`}
      style={{ display: 'block', maxWidth: size, margin: '0 auto' }}
    >
      <title>4AI Brain audit radar</title>

      {/* Concentric rings */}
      {rings.map(pct => {
        const r = (pct / 100) * radius
        return (
          <circle
            key={pct}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="rgba(10, 22, 40, 0.12)"
            strokeWidth={pct === 100 ? 1.4 : 1}
            strokeDasharray={pct === 100 ? undefined : '3 4'}
          />
        )
      })}

      {/* Cross axes */}
      {ORDER.map(d => {
        const a = ANGLES[d]
        const x = cx + Math.cos(a) * radius
        const y = cy + Math.sin(a) * radius
        return (
          <line
            key={`axis-${d}`}
            x1={cx} y1={cy} x2={x} y2={y}
            stroke="rgba(10, 22, 40, 0.18)"
            strokeWidth={1}
          />
        )
      })}

      {/* Filled polygon */}
      <polygon
        points={polygon}
        fill="rgba(232, 104, 48, 0.20)"
        stroke="var(--orange, #e86830)"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />

      {/* Vertex dots */}
      {points.map(p => {
        const dim = DIMENSIONS.find(d => d.id === p.d)!
        return (
          <circle
            key={`dot-${p.d}`}
            cx={p.x} cy={p.y} r={5.5}
            fill={dim.colour}
            stroke="white"
            strokeWidth={1.5}
          />
        )
      })}

      {/* Axis labels */}
      {ORDER.map(d => {
        const dim = DIMENSIONS.find(x => x.id === d)!
        const a = ANGLES[d]
        const r = radius + labelOffset
        const x = cx + Math.cos(a) * r
        const y = cy + Math.sin(a) * r
        const anchor = a === 0 ? 'start' : a === Math.PI ? 'end' : 'middle'
        const dy = a === -Math.PI / 2 ? -4 : a === Math.PI / 2 ? 14 : 4
        return (
          <g key={`label-${d}`}>
            <text
              x={x} y={y + dy}
              textAnchor={anchor}
              fontFamily="DM Sans, sans-serif"
              fontSize={13}
              fontWeight={600}
              fill="var(--text-primary, #0a1628)"
            >
              {dim.label}
            </text>
            <text
              x={x} y={y + dy + 16}
              textAnchor={anchor}
              fontFamily="DM Sans, sans-serif"
              fontSize={12}
              fontWeight={500}
              fill={dim.colour}
            >
              {scores.byDimension[d].pct}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}
