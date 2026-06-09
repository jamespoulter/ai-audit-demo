'use client'

import { useState } from 'react'

type Props = {
  id: string
  bookingUrl?: string
}

// Tag shared links so audit traffic from word-of-mouth is attributable.
const SHARE_PARAMS = 'utm_source=share&utm_medium=referral&utm_campaign=audit-results'

export function ShareBar({ id, bookingUrl }: Props) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    if (typeof window === 'undefined') return
    const base = `${window.location.origin}/audit/results/${id}`
    try {
      await navigator.clipboard.writeText(`${base}?${SHARE_PARAMS}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* fall back: leave button as-is */
    }
  }

  return (
    <div className="audit-sharebar">
      {bookingUrl && (
        <a
          href={withUtm(bookingUrl, 'audit-results', 'book-cta')}
          target="_blank"
          rel="noreferrer"
          className="audit-cta audit-cta-primary"
        >
          Book a working session →
        </a>
      )}
      <button type="button" className="audit-cta audit-cta-secondary" onClick={copyLink}>
        {copied ? 'Link copied' : 'Copy share link'}
      </button>
      <a
        href={`/api/audit/${id}/pdf`}
        target="_blank"
        rel="noreferrer"
        className="audit-cta audit-cta-secondary"
      >
        Download PDF
      </a>
    </div>
  )
}

function withUtm(url: string, campaign: string, content: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}utm_source=audit&utm_medium=app&utm_campaign=${campaign}&utm_content=${content}`
}
