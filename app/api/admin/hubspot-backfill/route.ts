import { NextResponse } from 'next/server'
import { enqueueUnsyncedSubmissions } from '@/app/audit/lib/db'
import { hubspotEnabled } from '@/app/lib/hubspot'

export const runtime = 'nodejs'

/**
 * Queues every historic submission that has never been synced to HubSpot.
 * The cron (/api/cron/hubspot-sync) then drains the queue in batches —
 * or hit the cron route manually to drain it immediately.
 *
 *   curl -X POST https://<host>/api/admin/hubspot-backfill \
 *        -H "authorization: Bearer $CRON_SECRET"
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!hubspotEnabled()) {
    return NextResponse.json({ error: 'HUBSPOT_ACCESS_TOKEN not set' }, { status: 503 })
  }

  const origin = new URL(req.url).origin
  const queued = await enqueueUnsyncedSubmissions(origin)
  return NextResponse.json({ ok: true, queued })
}
