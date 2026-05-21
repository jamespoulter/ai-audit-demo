'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearDraft, loadDraft } from '../lib/clientStore'
import type { OrgSize } from '../lib/types'

const ORG_SIZES: { value: OrgSize; label: string }[] = [
  { value: '1',      label: '1' },
  { value: '2-10',   label: '2–10' },
  { value: '11-50',  label: '11–50' },
  { value: '51-200', label: '51–200' },
  { value: '200+',   label: '200+' },
]

export function EmailGate() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [orgSize, setOrgSize] = useState<OrgSize | ''>('')
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Read whatever was saved in /audit/start so org/name aren't asked twice.
  if (typeof window !== 'undefined' && !name && !orgName) {
    const draft = loadDraft()
    if (draft.context.name && !name) setName(draft.context.name)
    if (draft.context.orgName && !orgName) setOrgName(draft.context.orgName)
    if (draft.context.orgSize && !orgSize) setOrgSize(draft.context.orgSize)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const draft = loadDraft()
    if (draft.answers.length === 0) {
      setError('No answers found yet — start the audit from the beginning.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/audit/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          orgName: orgName || undefined,
          orgSize: orgSize || undefined,
          source: 'self-serve',
          answers: draft.answers,
          marketingOptIn,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Submission failed (${res.status})`)
      }
      const data = await res.json()
      clearDraft()
      router.push(`/audit/results/${data.id}`)
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <form className="audit-gate" onSubmit={handleSubmit}>
      <h2 className="audit-gate-h">Where should we send the report?</h2>
      <p className="audit-gate-blurb">
        We need an email to give you a shareable link. We don't sell or share it.
      </p>

      <label className="audit-field">
        <span className="audit-field-label">Email *</span>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@company.com"
        />
      </label>

      <div className="audit-field-row">
        <label className="audit-field">
          <span className="audit-field-label">Name</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
            placeholder="Optional"
          />
        </label>
        <label className="audit-field">
          <span className="audit-field-label">Organisation</span>
          <input
            type="text"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            autoComplete="organization"
            placeholder="Optional"
          />
        </label>
      </div>

      <label className="audit-field">
        <span className="audit-field-label">Org size</span>
        <select value={orgSize} onChange={e => setOrgSize(e.target.value as OrgSize)}>
          <option value="">—</option>
          {ORG_SIZES.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <label className="audit-checkbox">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={e => setMarketingOptIn(e.target.checked)}
        />
        <span>Send me occasional emails about the workshop and related material. (Optional.)</span>
      </label>

      {error && <div className="audit-error">{error}</div>}

      <button type="submit" disabled={submitting} className="audit-cta audit-cta-primary">
        {submitting ? 'Generating report…' : 'Get my report →'}
      </button>
    </form>
  )
}
