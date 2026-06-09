'use client'

/**
 * First-touch attribution, captured on landing and replayed at submit time
 * so the HubSpot sync can credit the campaign that actually brought the
 * visitor in (instead of everything reporting as direct traffic).
 */

const KEY = 'ai-audit-demo:attribution'

export type StoredAttribution = {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  pageUri?: string
  pageName?: string
}

const UTM_PARAMS: [string, keyof StoredAttribution][] = [
  ['utm_source', 'utmSource'],
  ['utm_medium', 'utmMedium'],
  ['utm_campaign', 'utmCampaign'],
  ['utm_term', 'utmTerm'],
  ['utm_content', 'utmContent'],
]

/** Call once on page load. First touch wins — later visits don't overwrite. */
export function captureAttribution() {
  if (typeof window === 'undefined') return
  try {
    if (window.localStorage.getItem(KEY)) return
    const params = new URLSearchParams(window.location.search)
    const found: StoredAttribution = {}
    for (const [param, key] of UTM_PARAMS) {
      const v = params.get(param)
      if (v) found[key] = v
    }
    if (Object.keys(found).length === 0) return
    found.pageUri = window.location.href
    found.pageName = document.title
    window.localStorage.setItem(KEY, JSON.stringify(found))
  } catch {
    /* privacy mode — ignore */
  }
}

/** Stored UTMs + the live hubspotutk cookie + current page context. */
export function loadAttribution(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  let stored: StoredAttribution = {}
  try {
    stored = JSON.parse(window.localStorage.getItem(KEY) || '{}')
  } catch {
    /* ignore */
  }
  const out: Record<string, string> = { ...stored }
  const hutk = readCookie('hubspotutk')
  if (hutk) out.hutk = hutk
  if (!out.pageUri) out.pageUri = window.location.href
  if (!out.pageName) out.pageName = document.title
  return out
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
