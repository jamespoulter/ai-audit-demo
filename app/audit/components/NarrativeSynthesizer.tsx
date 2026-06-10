'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Rendered on the results page while the submission has no stored
 * narrative: kicks off Claude synthesis in the background, then refreshes
 * the page so the personalised copy replaces the deterministic stub.
 */
export function NarrativeSynthesizer({ id }: { id: string }) {
  const router = useRouter()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    fetch(`/api/audit/${id}/synthesize`, { method: 'POST' })
      .then(res => {
        if (res.ok) router.refresh()
      })
      .catch(() => {
        /* stub narrative is already on screen — nothing to do */
      })
  }, [id, router])

  return null
}
