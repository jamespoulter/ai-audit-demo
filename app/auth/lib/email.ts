type SendArgs = {
  to: string
  subject: string
  html: string
  text: string
}

const DEFAULT_FROM = 'ThreePoint Audit <onboarding@resend.dev>'

/**
 * Minimal Resend wrapper — no SDK dependency. If `RESEND_API_KEY` is not set,
 * we log the email payload to the server log (useful during local dev or when
 * production hasn't been wired up to Resend yet) and return a synthetic id.
 */
export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.AUTH_FROM_EMAIL || DEFAULT_FROM

  if (!apiKey) {
    console.warn(
      `[auth/email] RESEND_API_KEY not set — skipping real send.\n` +
      `  to:      ${to}\n` +
      `  subject: ${subject}\n` +
      `  text:    ${text}`
    )
    return { id: 'dev-fallback' }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Resend send failed (${res.status}): ${body}`)
  }

  const data = (await res.json()) as { id: string }
  return data
}

export function magicLinkEmail({ url, email }: { url: string; email: string }) {
  const text =
    `Sign in to your ThreePoint AI Audit account.\n\n` +
    `Click this link to sign in:\n${url}\n\n` +
    `If you didn't request this, you can safely ignore the email — the link expires in 15 minutes.\n\n` +
    `— ThreePoint`

  const html = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0a1628; max-width: 540px; margin: 0 auto; padding: 32px 24px;">
      <tr><td>
        <p style="font-size: 12px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #e86830; margin: 0 0 18px;">ThreePoint · AI Audit</p>
        <h1 style="font-family: 'Georgia', serif; font-size: 28px; font-weight: 400; line-height: 1.15; color: #0a1628; margin: 0 0 12px;">Sign in to your audit account</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #5a6578; margin: 0 0 28px;">
          You asked to sign in as <strong style="color: #0a1628;">${escapeHtml(email)}</strong>.
          Click below to continue — the link works once and expires in 15 minutes.
        </p>
        <p style="margin: 0 0 28px;">
          <a href="${url}" style="display: inline-block; padding: 14px 24px; background: #e86830; color: white; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 10px;">Sign in &rarr;</a>
        </p>
        <p style="font-size: 13px; line-height: 1.6; color: #8b95a5; margin: 0 0 6px;">Or paste this link into your browser:</p>
        <p style="font-size: 12px; line-height: 1.5; color: #8b95a5; word-break: break-all; margin: 0 0 32px;">${escapeHtml(url)}</p>
        <p style="font-size: 12px; line-height: 1.5; color: #8b95a5; margin: 0; border-top: 1px solid #e2ddd5; padding-top: 18px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </td></tr>
    </table>
  `

  return { subject: 'Sign in to your AI Audit account', html, text }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
