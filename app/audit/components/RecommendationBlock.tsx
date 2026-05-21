import { ToolCandidateRow } from '@/app/deck/ToolMarks'
import { DIMENSION_BY_ID } from '../lib/questions'
import { BUCKET_LABEL } from '../lib/scoring'
import type { Recommendation } from '../lib/types'

type Props = {
  rec: Recommendation
  eyebrow?: string
}

export function RecommendationBlock({ rec, eyebrow }: Props) {
  const dim = DIMENSION_BY_ID[rec.dimension]
  return (
    <article className="audit-rec">
      <header className="audit-rec-head">
        <div className="audit-rec-eyebrow" style={{ color: dim.colour }}>
          {eyebrow ?? `${dim.label} · ${BUCKET_LABEL[rec.bucket]}`}
        </div>
        <h3 className="audit-rec-headline">{rec.headline}</h3>
      </header>
      <p className="audit-rec-body">{rec.body}</p>

      {rec.workflowSteps && rec.workflowSteps.length > 0 && (
        <ol className="audit-rec-steps">
          {rec.workflowSteps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      )}

      <ToolCandidateRow region={rec.dimension} label="Tools to try" ids={rec.tools} />
    </article>
  )
}
