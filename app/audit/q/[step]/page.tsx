'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DIMENSIONS, STEP_ORDER, questionsForDimension } from '@/app/audit/lib/questions'
import { loadDraft, saveDraft, upsertAnswer } from '@/app/audit/lib/clientStore'
import { QuestionScale } from '@/app/audit/components/QuestionScale'
import type { Answer, AnswerValue } from '@/app/audit/lib/types'

type Params = { step: string }

export default function StepPage({ params }: { params: Params }) {
  const router = useRouter()
  const stepIndex = Math.max(1, Math.min(4, parseInt(params.step, 10) || 1)) - 1
  const dimension = STEP_ORDER[stepIndex]
  const dim = DIMENSIONS.find(d => d.id === dimension)!
  const questions = useMemo(() => questionsForDimension(dimension), [dimension])

  const [answers, setAnswers] = useState<Answer[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const d = loadDraft()
    setAnswers(d.answers)
    setLoaded(true)
  }, [])

  function valueFor(qid: string): AnswerValue {
    const a = answers.find(x => x.questionId === qid)
    return a ? a.value : null
  }

  function setValue(qid: string, value: AnswerValue) {
    setAnswers(prev => {
      const next = upsertAnswer(prev, { questionId: qid, value })
      const d = loadDraft()
      saveDraft({ ...d, answers: next })
      return next
    })
  }

  function next() {
    if (stepIndex < 3) router.push(`/audit/q/${stepIndex + 2}`)
    else router.push('/audit/review')
  }

  function prev() {
    if (stepIndex > 0) router.push(`/audit/q/${stepIndex}`)
    else router.push('/audit/start')
  }

  const answeredCount = questions.filter(q => valueFor(q.id) !== null).length
  const totalAnswered = answers.filter(a => a.value !== null).length
  const totalQuestions = STEP_ORDER.reduce((s, d) => s + questionsForDimension(d).length, 0)

  return (
    <main className="audit-shell">
      <div className="audit-container audit-container-narrow">
        <div className="audit-step-meta">
          <span>Step {stepIndex + 1} of 4 · <span style={{ color: dim.colour }}>{dim.label}</span></span>
          <Link href="/audit" className="audit-back">← Back to overview</Link>
        </div>

        <div className="audit-progress">
          <div
            className="audit-progress-fill"
            style={{ width: `${(totalAnswered / totalQuestions) * 100}%`, background: dim.colour }}
          />
        </div>

        <h1 className="audit-h2" style={{ borderLeftColor: dim.colour }}>
          {dim.label}
        </h1>
        <p className="audit-lede-small">{dim.blurb}</p>

        <div className="audit-q-list">
          {questions.map(q => (
            <QuestionScale
              key={q.id}
              question={q}
              value={valueFor(q.id)}
              onChange={v => setValue(q.id, v)}
              colour={dim.colour}
            />
          ))}
        </div>

        <div className="audit-cta-row audit-cta-row-split">
          <button type="button" className="audit-cta audit-cta-secondary" onClick={prev}>
            ← Back
          </button>
          <div className="audit-step-count">{answeredCount}/{questions.length} answered</div>
          <button
            type="button"
            className="audit-cta audit-cta-primary"
            onClick={next}
            disabled={!loaded}
          >
            {stepIndex < 3 ? 'Next dimension →' : 'Review & submit →'}
          </button>
        </div>
      </div>
    </main>
  )
}
