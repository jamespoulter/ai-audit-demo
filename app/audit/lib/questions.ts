import type { Dimension, Question } from './types'

export const DIMENSIONS: Dimension[] = [
  {
    id: 'memory',
    label: 'Memory',
    colour: '#7902f3',
    blurb: 'How your team stores, retrieves, and reuses what it already knows.',
  },
  {
    id: 'thinking',
    label: 'Thinking',
    colour: '#f46c42',
    blurb: 'How your team reasons with AI — choice of model, prompts, and context.',
  },
  {
    id: 'deciding',
    label: 'Deciding',
    colour: '#c59f4d',
    blurb: 'How decisions move from suggestion to commitment, with clear owners and audit trails.',
  },
  {
    id: 'creating',
    label: 'Creating',
    colour: '#d1f503',
    blurb: 'How AI shapes the outputs your clients and audiences actually see.',
  },
]

export const DIMENSION_BY_ID: Record<string, Dimension> = Object.fromEntries(
  DIMENSIONS.map(d => [d.id, d])
)

export const QUESTIONS: Question[] = [
  // ─── Memory ────────────────────────────────────────────────────
  {
    id: 'mem-1',
    dimension: 'memory',
    prompt: 'When a new brief lands, your team can find every related past brief in under a minute.',
    helper: 'Past briefs, proposals, decks — searchable in one place.',
    anchors: { low: 'Scattered across inboxes and drives', high: 'Single searchable source of truth' },
  },
  {
    id: 'mem-2',
    dimension: 'memory',
    prompt: 'You have an up-to-date written description of your brand voice that AI tools can use.',
    anchors: { low: 'Lives in people’s heads', high: 'Documented, versioned, AI-ready' },
  },
  {
    id: 'mem-3',
    dimension: 'memory',
    prompt: 'Client knowledge (preferences, history, do-nots) is captured outside any one person’s memory.',
    anchors: { low: 'Tribal knowledge', high: 'Captured in shared systems' },
  },
  {
    id: 'mem-4',
    dimension: 'memory',
    prompt: 'Meeting notes and decisions are reliably captured and retrievable later.',
    helper: 'Across calls, workshops, ad-hoc chats.',
    anchors: { low: 'Notes are inconsistent or missing', high: 'Captured, summarised, searchable' },
  },
  {
    id: 'mem-5',
    dimension: 'memory',
    prompt: 'When AI assists, it can pull in the right organisational context automatically.',
    helper: 'Via shared drives, custom GPTs, projects, or memory features.',
    anchors: { low: 'Every prompt starts from zero', high: 'Context is wired in by default' },
  },

  // ─── Thinking ──────────────────────────────────────────────────
  {
    id: 'thi-1',
    dimension: 'thinking',
    prompt: 'Your team chooses the right model for the task, not just a default one.',
    helper: 'E.g. reasoning models for analysis, fast models for drafts.',
    anchors: { low: 'One model for everything', high: 'Routed by task' },
  },
  {
    id: 'thi-2',
    dimension: 'thinking',
    prompt: 'You have a set of reusable prompts or templates for recurring jobs.',
    anchors: { low: 'Written fresh each time', high: 'Versioned, shared, improved' },
  },
  {
    id: 'thi-3',
    dimension: 'thinking',
    prompt: 'When a task is multi-step, your team breaks it into stages rather than one giant prompt.',
    anchors: { low: 'One mega-prompt', high: 'Stages with intermediate checks' },
  },
  {
    id: 'thi-4',
    dimension: 'thinking',
    prompt: 'Your team knows when NOT to use AI — when human judgement is faster or safer.',
    anchors: { low: 'AI by reflex', high: 'AI by intent' },
  },
  {
    id: 'thi-5',
    dimension: 'thinking',
    prompt: 'People share what’s working with AI across the team, not just individually.',
    anchors: { low: 'Siloed habits', high: 'Shared playbook' },
  },

  // ─── Deciding ──────────────────────────────────────────────────
  {
    id: 'dec-1',
    dimension: 'deciding',
    prompt: 'There is one source of truth for what action is next on each project.',
    anchors: { low: 'Scattered lists & inboxes', high: 'Single tool, one list' },
  },
  {
    id: 'dec-2',
    dimension: 'deciding',
    prompt: 'Every open action has a clear owner and a due date.',
    anchors: { low: 'Owners drift', high: 'Owner + date on every item' },
  },
  {
    id: 'dec-3',
    dimension: 'deciding',
    prompt: 'When a decision is made, there is a written record you can refer back to.',
    helper: 'Why, who, when — captured.',
    anchors: { low: 'Spoken & forgotten', high: 'Decision log exists' },
  },
  {
    id: 'dec-4',
    dimension: 'deciding',
    prompt: 'AI suggestions go through a clear approval step before they become actions.',
    anchors: { low: 'Auto-acted or ignored', high: 'Human gate is explicit' },
  },
  {
    id: 'dec-5',
    dimension: 'deciding',
    prompt: 'Status of work in flight is visible without anyone needing to ask.',
    anchors: { low: 'Need a chase email', high: 'Visible by default' },
  },

  // ─── Creating ──────────────────────────────────────────────────
  {
    id: 'cre-1',
    dimension: 'creating',
    prompt: 'AI helps produce real client-facing outputs, not just internal experiments.',
    anchors: { low: 'Only internal use', high: 'In the work the client sees' },
  },
  {
    id: 'cre-2',
    dimension: 'creating',
    prompt: 'There is a clear draft-to-final review loop for AI-assisted outputs.',
    anchors: { low: 'Ship from first draft', high: 'Defined review stages' },
  },
  {
    id: 'cre-3',
    dimension: 'creating',
    prompt: 'AI outputs reliably match your brand’s voice without heavy rewriting.',
    anchors: { low: 'Always sounds generic', high: 'Reads like us' },
  },
  {
    id: 'cre-4',
    dimension: 'creating',
    prompt: 'Recurring deliverables (status updates, reports, recaps) are at least partly automated.',
    anchors: { low: 'Manual every time', high: 'Triggered + assembled' },
  },
  {
    id: 'cre-5',
    dimension: 'creating',
    prompt: 'You measure whether AI is making outputs better, not just faster.',
    anchors: { low: 'Speed only', high: 'Quality tracked too' },
  },
]

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map(q => [q.id, q])
)

export function questionsForDimension(dimension: Dimension['id']): Question[] {
  return QUESTIONS.filter(q => q.dimension === dimension)
}

export const STEP_ORDER: Dimension['id'][] = ['memory', 'thinking', 'deciding', 'creating']
