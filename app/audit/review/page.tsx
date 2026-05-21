'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DIMENSIONS, QUESTION_BY_ID, STEP_ORDER, questionsForDimension } from '../lib/questions'
import { loadDraft } from '../lib/clientStore'
import { EmailGate } from '../components/EmailGate'
import type { Answer } from '../lib/types'

export default function ReviewPage() {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setAnswers(loadDraft().answers)
    setLoaded(true)
  }, [])

  const answeredCount = answers.filter(a => a.value !== null).length
  const totalQuestions = STEP_ORDER.reduce((s, d) => s + questionsForDimension(d).length, 0)

  return (
    <main className="audit-shell">
      <div className="audit-container audit-container-narrow">
        <div className="audit-step-meta">
          <span>Final step · Review</span>
          <Link href="/audit/q/4" className="audit-back">← Back to questions</Link>
        </div>

        <h1 className="audit-h2">Review your answers</h1>
        <p className="audit-lede-small">
          {loaded ? `${answeredCount} of ${totalQuestions} questions answered.` : 'Loading…'} You can jump back to any dimension to change an answer.
        </p>

        {loaded && DIMENSIONS.map(dim => {
          const dimQs = questionsForDimension(dim.id)
          const stepNumber = STEP_ORDER.indexOf(dim.id) + 1
          return (
            <section key={dim.id} className="audit-review-section">
              <header className="audit-review-head">
                <h2 style={{ color: dim.colour }}>{dim.label}</h2>
                <Link
                  href={`/audit/q/${stepNumber}`}
                  className="audit-review-edit"
                >
                  Edit
                </Link>
              </header>
              <ul className="audit-review-list">
                {dimQs.map(q => {
                  const a = answers.find(x => x.questionId === q.id)
                  const v = a?.value ?? null
                  return (
                    <li key={q.id}>
                      <span className="audit-review-q">{QUESTION_BY_ID[q.id].prompt}</span>
                      <span className="audit-review-v">
                        {v === null ? '—' : v}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}

        <EmailGate />
      </div>
    </main>
  )
}
