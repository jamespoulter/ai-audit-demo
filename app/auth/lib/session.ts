import { cookies } from 'next/headers'
import { createSessionToken, deleteSession, getSessionUser, type UserRow } from '@/app/audit/lib/db'
import { customAlphabet } from 'nanoid'

const SESSION_COOKIE = 'aad_session'
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days

const tokenAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const sessionToken = customAlphabet(tokenAlphabet, 40)
const magicLinkToken = customAlphabet(tokenAlphabet, 40)

export function newSessionToken(): string {
  return sessionToken()
}

export function newMagicLinkToken(): string {
  return magicLinkToken()
}

export async function startSession(user: UserRow): Promise<void> {
  const token = newSessionToken()
  await createSessionToken(token, user.id, SESSION_TTL_SECONDS)

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

export async function endSession(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (token) await deleteSession(token)
  cookies().delete(SESSION_COOKIE)
}

export async function getCurrentUser(): Promise<UserRow | null> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    return await getSessionUser(token)
  } catch (err) {
    console.error('[auth/getCurrentUser] db error', err)
    return null
  }
}
