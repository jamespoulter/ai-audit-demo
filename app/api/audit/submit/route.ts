import { NextResponse } from 'next/server'
import {
  addOrgMember,
  createSubmission,
  enqueueHubspotSync,
  getOrCreateUserByEmail,
  getOrg,
  markHubspotSync,
  setSubmissionOrg,
} from '@/app/audit/lib/db'
import { hubspotEnabled } from '@/app/lib/hubspot'
import { syncSubmissionToHubSpot, type Attribution } from '@/app/lib/hubspot-sync'
import { newSubmissionId } from '@/app/audit/lib/ids'
import { score, validateAnswers } from '@/app/audit/lib/scoring'
import {
  clearPendingInviteOrg,
  getPendingInviteOrg,
} from '@/app/audit/lib/invite-context'
import type { OrgSize, Source, Submission } from '@/app/audit/lib/types'

export const runtime = 'nodejs'

const VALID_ORG_SIZES: OrgSize[] = ['1', '2-10', '11-50', '51-200', '200+']
const VALID_SOURCES: Source[] = ['self-serve', 'facilitator']

function isEmail(s: unknown): s is string {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (!isEmail(body.email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }
  if (!validateAnswers(body.answers)) {
    return NextResponse.json({ error: 'invalid_answers' }, { status: 400 })
  }

  const source: Source = VALID_SOURCES.includes(body.source) ? body.source : 'self-serve'
  const orgSize: OrgSize | undefined = VALID_ORG_SIZES.includes(body.orgSize) ? body.orgSize : undefined

  const scores = score(body.answers)

  const submission: Submission = {
    id: newSubmissionId(),
    createdAt: new Date().toISOString(),
    email: body.email,
    name: typeof body.name === 'string' && body.name ? body.name.slice(0, 200) : undefined,
    orgName: typeof body.orgName === 'string' && body.orgName ? body.orgName.slice(0, 200) : undefined,
    orgSize,
    source,
    sessionId: typeof body.sessionId === 'string' ? body.sessionId : undefined,
    answers: body.answers,
    scores,
    narrative: null,
    marketingOptIn: Boolean(body.marketingOptIn),
  }

  try {
    const user = await getOrCreateUserByEmail(submission.email, submission.name)
    await createSubmission(submission, user.id)

    const pendingOrgId = getPendingInviteOrg()
    if (pendingOrgId) {
      const org = await getOrg(pendingOrgId)
      if (org) {
        await setSubmissionOrg(submission.id, org.id)
        await addOrgMember(org.id, user.id, 'member')
      }
      clearPendingInviteOrg()
    }
  } catch (err) {
    console.error('[audit/submit] db error', err)
    return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 })
  }

  // CRM sync. Queue-then-sync so a crash or HubSpot outage never loses the
  // lead: the row stays 'pending' and the cron retries it.
  if (hubspotEnabled()) {
    const attribution = sanitizeAttribution(body.attribution)
    const origin = new URL(req.url).origin
    try {
      await enqueueHubspotSync(submission.id, attribution, origin)
      await syncSubmissionToHubSpot(submission, origin, attribution)
      await markHubspotSync(submission.id, 'done')
    } catch (err) {
      console.error('[audit/submit] hubspot sync failed — queued for retry', err)
      await markHubspotSync(submission.id, 'error', String(err)).catch(() => {})
    }
  }

  return NextResponse.json({ id: submission.id })
}

const ATTRIBUTION_KEYS: (keyof Attribution)[] = [
  'hutk', 'pageUri', 'pageName',
  'utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent',
]

function sanitizeAttribution(raw: unknown): Attribution | null {
  if (!raw || typeof raw !== 'object') return null
  const out: Record<string, string> = {}
  for (const key of ATTRIBUTION_KEYS) {
    const v = (raw as Record<string, unknown>)[key]
    if (typeof v === 'string' && v.length > 0) out[key] = v.slice(0, 500)
  }
  return Object.keys(out).length > 0 ? (out as Attribution) : null
}
