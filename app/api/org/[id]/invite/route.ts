import { NextResponse } from 'next/server'
import { createInvite, getOrg, isMember } from '@/app/audit/lib/db'
import { getCurrentUser, newMagicLinkToken } from '@/app/auth/lib/session'
import { sendEmail } from '@/app/auth/lib/email'

export const runtime = 'nodejs'

function inviteEmail({ url, orgName, inviterEmail }: { url: string; orgName: string; inviterEmail: string }) {
  const text =
    `${inviterEmail} has invited you to take the ThreePoint AI Audit on behalf of ${orgName}.\n\n` +
    `Take the audit here:\n${url}\n\n` +
    `Your responses will appear on the ${orgName} team dashboard.\n\n— ThreePoint`

  const html = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0a1628; max-width: 540px; margin: 0 auto; padding: 32px 24px;">
      <tr><td>
        <p style="font-size: 12px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #e86830; margin: 0 0 18px;">ThreePoint · AI Audit invitation</p>
        <h1 style="font-family: 'Georgia', serif; font-size: 28px; font-weight: 400; line-height: 1.15; color: #0a1628; margin: 0 0 12px;">${escapeHtml(orgName)} would like your input</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #5a6578; margin: 0 0 24px;">
          <strong style="color: #0a1628;">${escapeHtml(inviterEmail)}</strong> has invited you to take the 4AI Brain Audit on behalf of <strong style="color: #0a1628;">${escapeHtml(orgName)}</strong>. It takes about ten minutes.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #5a6578; margin: 0 0 28px;">
          Your answers feed into the team's aggregate radar — so the more responses, the clearer the picture.
        </p>
        <p style="margin: 0 0 28px;">
          <a href="${url}" style="display: inline-block; padding: 14px 24px; background: #e86830; color: white; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 10px;">Take the audit &rarr;</a>
        </p>
        <p style="font-size: 12px; line-height: 1.5; color: #8b95a5; margin: 0; border-top: 1px solid #e2ddd5; padding-top: 18px;">
          If you weren't expecting this, you can ignore the email. — ThreePoint
        </p>
      </td></tr>
    </table>
  `

  return { subject: `${orgName} invited you to the 4AI Brain Audit`, html, text }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isEmail(s: unknown): s is string {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

type Result = {
  link: string
  emailsSent: string[]
  emailsFailed: string[]
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const orgId = ctx.params.id
  const org = await getOrg(orgId)
  if (!org) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  if (!(await isMember(orgId, user.id))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let body: any
  try { body = await req.json() } catch { body = {} }

  const emails: string[] = Array.isArray(body?.emails)
    ? body.emails.filter(isEmail).map((e: string) => e.trim().toLowerCase()).slice(0, 50)
    : []

  // Always create a shareable, multi-use link (email-less invite).
  const shareToken = newMagicLinkToken()
  await createInvite({ token: shareToken, orgId, createdBy: user.id })

  const origin = new URL(req.url).origin
  const link = `${origin}/invite/${shareToken}`

  const result: Result = { link, emailsSent: [], emailsFailed: [] }

  for (const email of emails) {
    const token = newMagicLinkToken()
    try {
      await createInvite({ token, orgId, email, createdBy: user.id, ttlSeconds: 14 * 24 * 60 * 60 })
      const url = `${origin}/invite/${token}`
      const { subject, html, text } = inviteEmail({ url, orgName: org.name, inviterEmail: user.email })
      await sendEmail({ to: email, subject, html, text })
      result.emailsSent.push(email)
    } catch (err) {
      console.error('[org/invite] send error', email, err)
      result.emailsFailed.push(email)
    }
  }

  return NextResponse.json(result)
}
