import { NextResponse } from 'next/server'
import { getSubmission, updateNarrative } from '@/app/audit/lib/db'
import { synthesizeNarrative } from '@/app/audit/lib/narrative'

export const runtime = 'nodejs'

/**
 * Phase 1: deterministic stub via `synthesizeNarrative`. Phase 3 swaps
 * that single function to call Anthropic — the API surface here doesn't
 * change.
 */
export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id
  if (!id || !/^[a-z0-9]{8,32}$/.test(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }

  let submission
  try {
    submission = await getSubmission(id)
  } catch (err) {
    console.error('[audit/[id]/synthesize] db read error', err)
    return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 })
  }
  if (!submission) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const narrative = await synthesizeNarrative({ submission })

  try {
    await updateNarrative(id, narrative)
  } catch (err) {
    console.error('[audit/[id]/synthesize] db write error', err)
    return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 })
  }

  return NextResponse.json({ narrative })
}
