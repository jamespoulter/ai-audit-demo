'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Sign-in failed (${res.status})`)
      }
      router.replace('/sign-in?sent=1')
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <form className="audit-gate" onSubmit={handleSubmit} style={{ marginTop: 16 }}>
      <label className="audit-field">
        <span className="audit-field-label">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@company.com"
        />
      </label>

      {error && <div className="audit-error">{error}</div>}

      <button type="submit" disabled={submitting || !email} className="audit-cta audit-cta-primary">
        {submitting ? 'Sending link…' : 'Send me a sign-in link →'}
      </button>
    </form>
  )
}
