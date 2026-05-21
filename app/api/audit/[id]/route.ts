import { NextResponse } from 'next/server'
import { getPublicSubmission } from '@/app/audit/lib/db'

export const runtime = 'nodejs'

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id
  if (!id || !/^[a-z0-9]{8,32}$/.test(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }

  try {
    const submission = await getPublicSubmission(id)
    if (!submission) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    return NextResponse.json(submission)
  } catch (err) {
    console.error('[audit/[id]] db error', err)
    return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 })
  }
}
