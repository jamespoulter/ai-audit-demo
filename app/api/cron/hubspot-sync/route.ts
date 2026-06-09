import { NextResponse } from 'next/server'
import {
  getSubmission,
  listPendingHubspotSync,
  markHubspotSync,
} from '@/app/audit/lib/db'
import { hubspotEnabled } from '@/app/lib/hubspot'
import { syncSubmissionToHubSpot, type Attribution } from '@/app/lib/hubspot-sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BATCH_SIZE = 25

/**
 * Retries failed/pending HubSpot syncs. Wired to a Vercel cron (see
 * vercel.json); Vercel sends `Authorization: Bearer ${CRON_SECRET}`.
 * Can also be hit manually with the same header after a backfill enqueue.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!hubspotEnabled()) {
    return NextResponse.json({ ok: true, skipped: 'HUBSPOT_ACCESS_TOKEN not set' })
  }

  const fallbackOrigin = new URL(req.url).origin
  const pending = await listPendingHubspotSync(BATCH_SIZE)
  let done = 0
  let failed = 0

  for (const row of pending) {
    try {
      const submission = await getSubmission(row.submissionId)
      if (!submission) {
        await markHubspotSync(row.submissionId, 'done', 'submission no longer exists')
        continue
      }
      await syncSubmissionToHubSpot(
        submission,
        row.origin || fallbackOrigin,
        (row.attribution as Attribution | null) ?? null
      )
      await markHubspotSync(row.submissionId, 'done')
      done++
    } catch (err) {
      await markHubspotSync(row.submissionId, 'error', String(err)).catch(() => {})
      failed++
    }
  }

  return NextResponse.json({ ok: true, picked: pending.length, done, failed })
}
