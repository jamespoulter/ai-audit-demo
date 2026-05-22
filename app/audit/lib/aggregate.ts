import { STEP_ORDER } from './questions'
import { bucketFor } from './scoring'
import type { DimensionId, DimensionScore, ScoreResult, Submission } from './types'

/**
 * Aggregate ScoreResult across many submissions — mean per-dimension percentages,
 * mean overall, bucketed against the same thresholds individual scores use.
 */
export function aggregateScores(submissions: Submission[]): ScoreResult | null {
  if (submissions.length === 0) return null

  const byDimension = {} as Record<DimensionId, DimensionScore>

  for (const dim of STEP_ORDER) {
    let pctSum = 0
    let rawSum = 0
    let answeredSum = 0
    let n = 0
    for (const s of submissions) {
      const d = s.scores?.byDimension?.[dim]
      if (!d) continue
      pctSum += d.pct
      rawSum += d.raw
      answeredSum += d.answered
      n += 1
    }
    const pct = n > 0 ? Math.round(pctSum / n) : 0
    const raw = n > 0 ? Math.round((rawSum / n) * 10) / 10 : 0
    byDimension[dim] = {
      dimension: dim,
      raw,
      pct,
      bucket: bucketFor(pct),
      answered: n > 0 ? Math.round(answeredSum / n) : 0,
    }
  }

  const overallPct = Math.round(
    STEP_ORDER.reduce((s, d) => s + byDimension[d].pct, 0) / STEP_ORDER.length
  )

  return {
    byDimension,
    overall: { pct: overallPct, bucket: bucketFor(overallPct) },
  }
}
