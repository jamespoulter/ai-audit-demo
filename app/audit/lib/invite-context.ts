import { cookies } from 'next/headers'

const COOKIE = 'aad_pending_invite_org'
const TTL_SECONDS = 24 * 60 * 60

export function setPendingInviteOrg(orgId: string): void {
  cookies().set(COOKIE, orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TTL_SECONDS,
  })
}

export function getPendingInviteOrg(): string | null {
  return cookies().get(COOKIE)?.value ?? null
}

export function clearPendingInviteOrg(): void {
  cookies().delete(COOKIE)
}
