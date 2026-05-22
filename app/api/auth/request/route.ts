import { NextResponse } from 'next/server'
import { createAuthToken } from '@/app/audit/lib/db'
import { newMagicLinkToken } from '@/app/auth/lib/session'
import { magicLinkEmail, sendEmail } from '@/app/auth/lib/email'

export const runtime = 'nodejs'

const TOKEN_TTL_SECONDS = 15 * 60

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

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!isEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const token = newMagicLinkToken()
  try {
    await createAuthToken(token, email, TOKEN_TTL_SECONDS)
  } catch (err) {
    console.error('[auth/request] db error', err)
    return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 })
  }

  const origin = new URL(req.url).origin
  const url = `${origin}/api/auth/verify?token=${encodeURIComponent(token)}`

  try {
    const { subject, html, text } = magicLinkEmail({ url, email })
    await sendEmail({ to: email, subject, html, text })
  } catch (err) {
    console.error('[auth/request] email send error', err)
    // We still return success to avoid leaking which emails exist — but log
    // the URL so the operator can debug from runtime logs.
    console.warn(`[auth/request] failover — magic link for ${email}: ${url}`)
  }

  return NextResponse.json({ ok: true })
}
