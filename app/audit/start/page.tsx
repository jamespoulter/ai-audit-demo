'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadDraft, saveDraft } from '../lib/clientStore'
import type { OrgSize } from '../lib/types'

const ORG_SIZES: { value: OrgSize; label: string }[] = [
  { value: '1',      label: '1 (solo)' },
  { value: '2-10',   label: '2–10' },
  { value: '11-50',  label: '11–50' },
  { value: '51-200', label: '51–200' },
  { value: '200+',   label: '200+' },
]

export default function StartPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [orgSize, setOrgSize] = useState<OrgSize | ''>('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const d = loadDraft()
    if (d.context.name) setName(d.context.name)
    if (d.context.orgName) setOrgName(d.context.orgName)
    if (d.context.orgSize) setOrgSize(d.context.orgSize)
    setLoaded(true)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const d = loadDraft()
    saveDraft({
      ...d,
      context: {
        name: name || undefined,
        orgName: orgName || undefined,
        orgSize: orgSize || undefined,
      },
    })
    router.push('/audit/q/1')
  }

  function skip() {
    router.push('/audit/q/1')
  }

  return (
    <main className="audit-shell">
      <div className="audit-container audit-container-narrow">
        <div className="audit-step-meta">
          <span>Step 0 · Quick context</span>
          <Link href="/audit" className="audit-back">← Back</Link>
        </div>
        <h1 className="audit-h2">Tell us a little about you</h1>
        <p className="audit-lede-small">
          Optional — it just makes the report feel less generic. You can skip and head straight in.
        </p>

        <form className="audit-form" onSubmit={handleSubmit}>
          <label className="audit-field">
            <span className="audit-field-label">Your name</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Optional"
              autoComplete="name"
            />
          </label>
          <label className="audit-field">
            <span className="audit-field-label">Organisation</span>
            <input
              type="text"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="Optional"
              autoComplete="organization"
            />
          </label>
          <label className="audit-field">
            <span className="audit-field-label">Team size</span>
            <select value={orgSize} onChange={e => setOrgSize(e.target.value as OrgSize)}>
              <option value="">—</option>
              {ORG_SIZES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>

          <div className="audit-cta-row">
            <button type="submit" className="audit-cta audit-cta-primary" disabled={!loaded}>
              Continue →
            </button>
            <button type="button" className="audit-cta audit-cta-secondary" onClick={skip}>
              Skip this
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
