import { DIMENSIONS } from '../lib/questions'

export function DimensionLegend() {
  return (
    <div className="audit-legend">
      {DIMENSIONS.map(d => (
        <span key={d.id} className="audit-legend-item">
          <span className="audit-legend-dot" style={{ background: d.colour }} />
          {d.label}
        </span>
      ))}
    </div>
  )
}
