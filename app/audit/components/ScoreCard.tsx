import { DIMENSION_BY_ID } from '../lib/questions'
import { BUCKET_LABEL } from '../lib/scoring'
import type { DimensionScore } from '../lib/types'

type Props = {
  score: DimensionScore
}

export function ScoreCard({ score }: Props) {
  const dim = DIMENSION_BY_ID[score.dimension]
  return (
    <div className="audit-score-card" style={{ borderLeftColor: dim.colour }}>
      <div className="audit-score-card-head">
        <span className="audit-score-card-label">{dim.label}</span>
        <span className="audit-score-card-pct">{score.pct}%</span>
      </div>
      <div className="audit-score-card-bar">
        <div
          className="audit-score-card-bar-fill"
          style={{ width: `${score.pct}%`, background: dim.colour }}
        />
      </div>
      <div className="audit-score-card-foot">
        <span className="audit-score-card-bucket">{BUCKET_LABEL[score.bucket]}</span>
        <span className="audit-score-card-meta">{score.answered}/5 answered</span>
      </div>
    </div>
  )
}
