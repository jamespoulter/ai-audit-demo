import { NextResponse } from 'next/server'
import { consumeAuthToken, getOrCreateUserByEmail } from '@/app/audit/lib/db'
import { startSession } from '@/app/auth/lib/session'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') ?? ''

  if (!/^[A-Za-z0-9]{30,80}$/.test(token)) {
    return NextResponse.redirect(new URL('/sign-in?error=invalid_link', req.url))
  }

  let consumed: { email: string } | null
  try {
    consumed = await consumeAuthToken(token)
  } catch (err) {
    console.error('[auth/verify] db error', err)
    return NextResponse.redirect(new URL('/sign-in?error=storage', req.url))
  }

  if (!consumed) {
    return NextResponse.redirect(new URL('/sign-in?error=expired', req.url))
  }

  try {
    const user = await getOrCreateUserByEmail(consumed.email)
    await startSession(user)
  } catch (err) {
    console.error('[auth/verify] session error', err)
    return NextResponse.redirect(new URL('/sign-in?error=storage', req.url))
  }

  return NextResponse.redirect(new URL('/account', req.url))
}
