'use client'

import type { Answer, OrgSize } from './types'

const KEY = 'ai-audit-demo:draft'

export type DraftContext = {
  name?: string
  orgName?: string
  orgSize?: OrgSize
}

export type Draft = {
  context: DraftContext
  answers: Answer[]
}

const empty: Draft = { context: {}, answers: [] }

export function loadDraft(): Draft {
  if (typeof window === 'undefined') return empty
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return { context: {}, answers: [] }
    const parsed = JSON.parse(raw)
    return {
      context: parsed.context ?? {},
      answers: Array.isArray(parsed.answers) ? parsed.answers : [],
    }
  } catch {
    return { context: {}, answers: [] }
  }
}

export function saveDraft(draft: Draft) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft))
  } catch {
    /* quota / privacy mode — silently ignore */
  }
}

export function clearDraft() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(KEY)
  } catch { /* noop */ }
}

export function upsertAnswer(answers: Answer[], a: Answer): Answer[] {
  const i = answers.findIndex(x => x.questionId === a.questionId)
  if (i === -1) return [...answers, a]
  const next = answers.slice()
  next[i] = a
  return next
}
