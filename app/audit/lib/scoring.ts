import { QUESTION_BY_ID, QUESTIONS, STEP_ORDER } from './questions'

export { STEP_ORDER }
import type { Answer, Bucket, DimensionId, DimensionScore, ScoreResult } from './types'

export function bucketFor(pct: number): Bucket {
  if (pct < 25) return 'nascent'
  if (pct < 50) return 'emerging'
  if (pct < 75) return 'operational'
  return 'advanced'
}

export const BUCKET_LABEL: Record<Bucket, string> = {
  nascent: 'Nascent',
  emerging: 'Emerging',
  operational: 'Operational',
  advanced: 'Advanced',
}

export function score(answers: Answer[]): ScoreResult {
  const byId: Record<string, Answer> = Object.fromEntries(answers.map(a => [a.questionId, a]))

  const byDimension = {} as Record<DimensionId, DimensionScore>

  for (const dim of STEP_ORDER) {
    const dimQuestions = QUESTIONS.filter(q => q.dimension === dim)
    let weightedSum = 0
    let weightTotal = 0
    let answered = 0

    for (const q of dimQuestions) {
      const a = byId[q.id]
      if (!a || a.value == null) continue
      const w = q.weight ?? 1
      weightedSum += a.value * w
      weightTotal += w
      answered += 1
    }

    const raw = weightTotal > 0 ? weightedSum / weightTotal : 0
    const pct = weightTotal > 0 ? clamp(((raw - 1) / 4) * 100, 0, 100) : 0

    byDimension[dim] = {
      dimension: dim,
      raw: round1(raw),
      pct: Math.round(pct),
      bucket: bucketFor(pct),
      answered,
    }
  }

  const overallPct =
    STEP_ORDER.reduce((sum, d) => sum + byDimension[d].pct, 0) / STEP_ORDER.length

  return {
    byDimension,
    overall: {
      pct: Math.round(overallPct),
      bucket: bucketFor(overallPct),
    },
  }
}

export function lowestDimension(s: ScoreResult): DimensionId {
  return STEP_ORDER.reduce((lo, d) =>
    s.byDimension[d].pct < s.byDimension[lo].pct ? d : lo,
  STEP_ORDER[0])
}

export function highestDimension(s: ScoreResult): DimensionId {
  return STEP_ORDER.reduce((hi, d) =>
    s.byDimension[d].pct > s.byDimension[hi].pct ? d : hi,
  STEP_ORDER[0])
}

export function isAnswerValid(value: unknown): boolean {
  if (value === null) return true
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5
}

export function validateAnswers(answers: unknown): answers is Answer[] {
  if (!Array.isArray(answers)) return false
  for (const a of answers) {
    if (!a || typeof a !== 'object') return false
    const q = (a as Answer).questionId
    if (typeof q !== 'string' || !QUESTION_BY_ID[q]) return false
    if (!isAnswerValid((a as Answer).value)) return false
  }
  return true
}

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)) }
function round1(n: number) { return Math.round(n * 10) / 10 }
