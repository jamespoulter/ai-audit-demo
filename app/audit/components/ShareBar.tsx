'use client'

import { useState } from 'react'

type Props = {
  id: string
}

export function ShareBar({ id }: Props) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* fall back: leave button as-is */
    }
  }

  return (
    <div className="audit-sharebar">
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
