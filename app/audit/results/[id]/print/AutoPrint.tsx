'use client'

import { useEffect } from 'react'

export function AutoPrint() {
  useEffect(() => {
    const t = window.setTimeout(() => window.print(), 250)
    return () => window.clearTimeout(t)
  }, [])
  return null
}
