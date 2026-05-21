'use client'

import type { AnswerValue, Question } from '../lib/types'

type Props = {
  question: Question
  value: AnswerValue
  onChange: (value: AnswerValue) => void
  colour: string
}

const SCALE: AnswerValue[] = [1, 2, 3, 4, 5]

export function QuestionScale({ question, value, onChange, colour }: Props) {
  return (
    <div className="audit-q">
      <div className="audit-q-prompt">{question.prompt}</div>
      {question.helper && <div className="audit-q-helper">{question.helper}</div>}

      <div className="audit-q-scale" role="radiogroup" aria-label={question.prompt}>
        {SCALE.map(n => {
          const active = value === n
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              className={`audit-q-pip ${active ? 'is-active' : ''}`}
              style={active ? { background: colour, borderColor: colour } : undefined}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          )
        })}
        <button
          type="button"
          className={`audit-q-skip ${value === null ? 'is-active' : ''}`}
          onClick={() => onChange(null)}
        >
          Skip
        </button>
      </div>

      <div className="audit-q-anchors">
        <span>{question.anchors.low}</span>
        <span>{question.anchors.high}</span>
      </div>
    </div>
  )
}
