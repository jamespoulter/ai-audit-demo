import type { ScoreResult, Submission } from './types'
import { BUCKET_LABEL, highestDimension, lowestDimension } from './scoring'
import { DIMENSION_BY_ID } from './questions'

/**
 * Deterministic narrative built from scores. Used in v1 and as a fallback
 * whenever the AI synthesis endpoint hasn't been called (or hasn't been
 * implemented yet). Phase 3 swaps in a Claude-generated version in
 * `synthesizeNarrative` below.
 */
export function buildStubNarrative(scores: ScoreResult): string {
  const hi = highestDimension(scores)
  const lo = lowestDimension(scores)
  const hiDim = DIMENSION_BY_ID[hi]
  const loDim = DIMENSION_BY_ID[lo]
  const overall = scores.overall

  const paragraphs: string[] = []

  paragraphs.push(
    `Overall, your team sits in the **${BUCKET_LABEL[overall.bucket]}** band at ${overall.pct}%. That's the headline — the detail underneath it is where the work is.`
  )

  if (hi !== lo) {
    paragraphs.push(
      `Your strongest dimension is **${hiDim.label}** (${scores.byDimension[hi].pct}%). ${hiDim.blurb} Lean into this — it's the platform you build the rest from.`
    )
    paragraphs.push(
      `Your biggest gap is **${loDim.label}** (${scores.byDimension[lo].pct}%). ${loDim.blurb} The recommendation below for ${loDim.label} is the highest-leverage move you can make in the next 30 days.`
    )
  } else {
    paragraphs.push(
      `Your four dimensions are evenly balanced — no single area dominates. That makes the prioritised recommendations below your roadmap rather than a triage list.`
    )
  }

  return paragraphs.join('\n\n')
}

export type SynthesizeOptions = {
  submission: Submission
}

/**
 * Seam for Phase 3. Today this is the stub. Tomorrow swap the body to call
 * Anthropic with prompt caching on the framework copy. No other file in the
 * app needs to change.
 */
export async function synthesizeNarrative({ submission }: SynthesizeOptions): Promise<string> {
  // TODO(phase-3): replace with Anthropic SDK call (Sonnet 4.6 default).
  return buildStubNarrative(submission.scores)
}
