'use client'

import { useEffect } from 'react'
import { captureAttribution } from '@/app/audit/lib/attribution'

/** Mounted once in the root layout; records first-touch UTMs. */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution()
  }, [])
  return null
}
