'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CreateOrgForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/org/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to create team (${res.status})`)
      }
      const data = await res.json()
      router.push(`/account/org/${data.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <form className="audit-gate" onSubmit={handleSubmit} style={{ padding: 20, marginTop: 0 }}>
      <h3 style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: 20, margin: 0 }}>
        Start a team
      </h3>
      <p className="audit-gate-blurb">Become its admin. You'll be able to invite colleagues and see the aggregate radar.</p>
      <div className="audit-field-row" style={{ gridTemplateColumns: '1fr auto', alignItems: 'end', gap: 10 }}>
        <label className="audit-field">
          <span className="audit-field-label">Team name</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Acme Marketing"
            required
            maxLength={200}
          />
        </label>
        <button type="submit" disabled={submitting || !name.trim()} className="audit-cta audit-cta-primary">
          {submitting ? 'Creating…' : 'Create team →'}
        </button>
      </div>
      {error && <div className="audit-error">{error}</div>}
    </form>
  )
}
