import type { Bucket, DimensionId, Recommendation, ScoreResult } from './types'
import { lowestDimension } from './scoring'
import { STEP_ORDER } from './questions'

const BUCKET_NEXT: Record<Bucket, Bucket> = {
  nascent: 'emerging',
  emerging: 'operational',
  operational: 'advanced',
  advanced: 'advanced',
}

// 4 dimensions × 4 buckets = 16 entries. Reuses existing ToolId values
// from app/deck/ToolMarks.tsx so RecommendationBlock can render chips.
export const RECS: Recommendation[] = [
  // ─── Memory ────────────────────────────────────────────────────
  {
    dimension: 'memory', bucket: 'nascent',
    headline: 'Get a single home for briefs and brand assets',
    body: 'Pick one place — Drive, Notion, or similar — and move every active brief, deck, and brand reference into it. You can\'t build memory until you have a single shelf.',
    tools: ['drive', 'notion'],
    workflowSteps: ['Inventory where things live today', 'Pick one canonical home', 'Migrate the last 90 days of work'],
  },
  {
    dimension: 'memory', bucket: 'emerging',
    headline: 'Write the brand voice down — once',
    body: 'Capture your brand voice, do-nots, and audience definitions in a single document the team (and AI tools) can reference. Templates beat tribal knowledge.',
    tools: ['notion', 'docs'],
  },
  {
    dimension: 'memory', bucket: 'operational',
    headline: 'Wire context into AI by default',
    body: 'Move from copy-pasting context into prompts to having it loaded automatically — via project knowledge in Claude, custom GPTs, or Gemini gems.',
    tools: ['claude', 'chatgpt', 'gemini'],
  },
  {
    dimension: 'memory', bucket: 'advanced',
    headline: 'Build a retrievable client knowledge graph',
    body: 'Per-client memory: history, preferences, do-nots, past deliverables — surfaced by AI on demand, not searched manually.',
    tools: ['notion', 'claude'],
  },

  // ─── Thinking ──────────────────────────────────────────────────
  {
    dimension: 'thinking', bucket: 'nascent',
    headline: 'Pilot more than one model',
    body: 'Choose two complementary AI tools and ask people to use both for two weeks. Compare. You can\'t route work to the right brain if your team only knows one.',
    tools: ['chatgpt', 'claude', 'gemini'],
  },
  {
    dimension: 'thinking', bucket: 'emerging',
    headline: 'Match the model to the job',
    body: 'Reasoning for analysis, fast models for drafts, multimodal for visual tasks. Document a one-page "which model when" cheat sheet.',
    tools: ['claude', 'chatgpt'],
  },
  {
    dimension: 'thinking', bucket: 'operational',
    headline: 'Library your best prompts',
    body: 'Stop writing prompts fresh. Capture and version the 10–20 you use weekly. Share them. Measure which ones win.',
    tools: ['notion', 'claude'],
  },
  {
    dimension: 'thinking', bucket: 'advanced',
    headline: 'Stage multi-step work explicitly',
    body: 'Replace one-shot mega-prompts with named stages (research → outline → draft → critique). Each stage has its own check.',
    tools: ['claude', 'chatgpt'],
  },

  // ─── Deciding ──────────────────────────────────────────────────
  {
    dimension: 'deciding', bucket: 'nascent',
    headline: 'Pick one place for next actions',
    body: 'Choose a single tool to hold every open action across projects. Stop tracking work in inbox screenshots and side chats.',
    tools: ['monday', 'productive', 'notion'],
  },
  {
    dimension: 'deciding', bucket: 'emerging',
    headline: 'Owner + due date on every item',
    body: 'No action should exist without a name beside it and a date under it. Make this the bar for the next 30 days.',
    tools: ['monday', 'productive'],
  },
  {
    dimension: 'deciding', bucket: 'operational',
    headline: 'Write a decision log',
    body: 'For meaningful calls — strategy shifts, hires, big creative directions — capture the why in one place. AI can summarise the meeting; you decide what gets enshrined.',
    tools: ['notion', 'granola', 'read'],
  },
  {
    dimension: 'deciding', bucket: 'advanced',
    headline: 'Make the AI → human handoff explicit',
    body: 'Define which AI suggestions auto-act, which require approval, and which never act. Wire that into your actual tools, not a slide.',
    tools: ['monday', 'claude'],
  },

  // ─── Creating ──────────────────────────────────────────────────
  {
    dimension: 'creating', bucket: 'nascent',
    headline: 'Ship one client-facing AI-assisted artefact',
    body: 'Pick a real deliverable — a recap, a proposal section, a content draft — and let AI help end-to-end. Move past internal experiments.',
    tools: ['claude', 'chatgpt', 'docs'],
  },
  {
    dimension: 'creating', bucket: 'emerging',
    headline: 'Define a draft → review → ship loop',
    body: 'Three stages, two reviewers, one named owner. The same loop for AI-assisted work as for human work — just with the right entry points.',
    tools: ['docs', 'notion'],
  },
  {
    dimension: 'creating', bucket: 'operational',
    headline: 'Tighten brand voice in the loop',
    body: 'Build a brand-voice checker into your review stage — a custom GPT, a Claude project, or a checklist. Reject anything that reads generic.',
    tools: ['claude', 'chatgpt'],
  },
  {
    dimension: 'creating', bucket: 'advanced',
    headline: 'Trigger and assemble recurring outputs',
    body: 'Status updates, weekly recaps, post-meeting summaries — these should assemble themselves. You review and ship.',
    tools: ['granola', 'read', 'monday'],
  },
]

const RECS_BY_KEY: Record<string, Recommendation> = Object.fromEntries(
  RECS.map(r => [`${r.dimension}:${r.bucket}`, r])
)

export function recFor(dimension: DimensionId, bucket: Bucket): Recommendation {
  return RECS_BY_KEY[`${dimension}:${bucket}`]
}

export type RecPick = {
  perDimension: Recommendation[]
  nextFocus: { dimension: DimensionId; rec: Recommendation }
}

export function pickRecs(scores: ScoreResult): RecPick {
  const perDimension = STEP_ORDER.map(d => recFor(d, scores.byDimension[d].bucket))

  const focusDim = lowestDimension(scores)
  const focusBucket = BUCKET_NEXT[scores.byDimension[focusDim].bucket]
  const nextFocus = { dimension: focusDim, rec: recFor(focusDim, focusBucket) }

  return { perDimension, nextFocus }
}
