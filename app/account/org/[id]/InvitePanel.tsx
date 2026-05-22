'use client'

import { useState } from 'react'

type Props = { orgId: string }

type Result = {
  link: string
  emailsSent: string[]
  emailsFailed: string[]
}

export function InvitePanel({ orgId }: Props) {
  const [emails, setEmails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    setSubmitting(true)
    setLinkCopied(false)

    const parsed = emails
      .split(/[\s,;]+/)
      .map(s => s.trim())
      .filter(Boolean)

    try {
      const res = await fetch(`/api/org/${orgId}/invite`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ emails: parsed }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Invite failed (${res.status})`)
      }
      const data: Result = await res.json()
      setResult(data)
      setEmails('')
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  async function copyLink() {
    if (!result?.link) return
    try {
      await navigator.clipboard.writeText(result.link)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 1800)
    } catch { /* noop */ }
  }

  return (
    <section className="audit-gate" style={{ marginTop: 24, padding: 24 }}>
      <h2 className="audit-gate-h">Invite your team</h2>
      <p className="audit-gate-blurb">
        Generate a shareable link to drop in Slack or send branded invites by email.
        Each respondent's submission lands on this dashboard.
      </p>

      <form className="audit-form" onSubmit={generate}>
        <label className="audit-field">
          <span className="audit-field-label">Email addresses (optional — comma or newline separated)</span>
          <textarea
            value={emails}
            onChange={e => setEmails(e.target.value)}
            placeholder="alice@team.co, bob@team.co"
            rows={3}
            style={{
              padding: '12px 14px',
              fontSize: 15,
              fontFamily: 'inherit',
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              resize: 'vertical',
              minHeight: 80,
            }}
          />
        </label>

        {error && <div className="audit-error">{error}</div>}

        <div className="audit-cta-row" style={{ margin: 0 }}>
          <button type="submit" disabled={submitting} className="audit-cta audit-cta-primary">
            {submitting ? 'Generating…' : emails.trim() ? 'Send invites + get link →' : 'Get shareable link →'}
          </button>
        </div>
      </form>

      {result && (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
          <div className="audit-field-label" style={{ marginBottom: 8 }}>Shareable link</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <code style={{
              flex: 1, minWidth: 260, padding: '10px 12px', background: 'var(--cream)',
              border: '1px solid var(--border)', borderRadius: 8, fontSize: 13,
              wordBreak: 'break-all', color: 'var(--text-primary)',
            }}>
              {result.link}
            </code>
            <button type="button" className="audit-cta audit-cta-secondary" onClick={copyLink}>
              {linkCopied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {result.emailsSent.length > 0 && (
            <p className="audit-lede-small" style={{ marginTop: 14, color: 'var(--text-secondary)' }}>
              ✓ Sent invites to: <strong>{result.emailsSent.join(', ')}</strong>
            </p>
          )}
          {result.emailsFailed.length > 0 && (
            <p className="audit-error" style={{ marginTop: 10 }}>
              Couldn't send to: {result.emailsFailed.join(', ')}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
