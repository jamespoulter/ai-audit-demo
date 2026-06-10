import Anthropic from '@anthropic-ai/sdk'
import type { ScoreResult, Submission } from './types'
import { BUCKET_LABEL, highestDimension, lowestDimension } from './scoring'
import { DIMENSION_BY_ID, QUESTION_BY_ID, STEP_ORDER } from './questions'

/**
 * Deterministic narrative built from scores. Used as the immediate render
 * and as the fallback whenever Claude synthesis is unavailable or fails.
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

const SYSTEM_PROMPT = `You are a senior AI-adoption consultant at ThreePoint writing the personalised summary at the top of a client's 4AI Brain Audit report. The audit measures a team's AI readiness across four dimensions:

- Memory: storing, retrieving and reusing what the team already knows
- Thinking: reasoning with AI — model choice, prompts, context discipline
- Deciding: moving from AI suggestion to commitment with clear owners
- Creating: AI-assisted outputs that clients and audiences actually see

Scores are 0–100% per dimension and map to bands: Nascent (<25%), Emerging (<50%), Operational (<75%), Advanced (75%+).

Write exactly three short paragraphs (no more than 160 words total), in British English, addressed directly to the reader as "you"/"your team":
1. The headline: what their overall position actually means in practice — not a restatement of the number.
2. Their strongest dimension and the specific behaviour in their answers that earned it; tell them how to lean on it.
3. Their weakest dimension, the cost of leaving it as-is, and the single highest-leverage move for the next 30 days.

Be specific to their answers — reference concrete behaviours from the low-scoring and high-scoring questions, not generic advice. Confident, direct, warm; no hedging, no jargon, no flattery.

Formatting rules: plain prose paragraphs separated by blank lines. **Bold** is the only formatting allowed — use it sparingly for the dimension names and the one move you recommend. No headings, no lists, no emoji.`

function buildUserPrompt(s: Submission): string {
  const lines: string[] = []
  if (s.name) lines.push(`Respondent: ${s.name}`)
  if (s.orgName) lines.push(`Organisation: ${s.orgName}${s.orgSize ? ` (${s.orgSize} people)` : ''}`)
  lines.push(`Overall: ${s.scores.overall.pct}% — ${BUCKET_LABEL[s.scores.overall.bucket]}`)
  lines.push('')

  for (const d of STEP_ORDER) {
    const ds = s.scores.byDimension[d]
    lines.push(`${DIMENSION_BY_ID[d].label}: ${ds.pct}% (${BUCKET_LABEL[ds.bucket]})`)
    for (const a of s.answers) {
      const q = QUESTION_BY_ID[a.questionId]
      if (!q || q.dimension !== d) continue
      lines.push(`  - "${q.prompt}" → ${a.value === null ? 'skipped' : `${a.value}/5`}`)
    }
  }

  lines.push('')
  lines.push('Write the three-paragraph summary for this report.')
  return lines.join('\n')
}

/**
 * Claude-generated narrative (Phase 3). Falls back to the deterministic
 * stub when ANTHROPIC_API_KEY is unset or the API call fails, so the
 * report always renders.
 */
export async function synthesizeNarrative({ submission }: SynthesizeOptions): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return buildStubNarrative(submission.scores)
  }

  try {
    const client = new Anthropic()
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      // Short, latency-sensitive copy — low effort keeps the report snappy.
      output_config: { effort: 'low' },
      // Note: the system prompt is well below Opus's ~4096-token minimum
      // cacheable prefix, so prompt caching would be a no-op here. Revisit
      // if the framework copy grows (add cache_control on a system block).
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(submission) }],
    })

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('\n\n')
      .trim()

    return text || buildStubNarrative(submission.scores)
  } catch (err) {
    console.warn('[narrative] Claude synthesis failed — falling back to stub', err)
    return buildStubNarrative(submission.scores)
  }
}
