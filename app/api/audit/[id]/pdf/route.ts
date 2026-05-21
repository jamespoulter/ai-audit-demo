import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * v1: redirect to the print-optimised results page with autoprint=1. Keeps
 * the URL stable so a future real PDF backend can swap in without breaking
 * any shared links.
 */
export function GET(req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id
  if (!id || !/^[a-z0-9]{8,32}$/.test(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }
  const url = new URL(`/audit/results/${id}/print?autoprint=1`, req.url)
  return NextResponse.redirect(url, 302)
}
