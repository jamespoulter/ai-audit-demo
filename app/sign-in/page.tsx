import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/auth/lib/session'
import { SignInForm } from './SignInForm'

export const dynamic = 'force-dynamic'

type SearchParams = { error?: string; sent?: string }

const ERRORS: Record<string, string> = {
  invalid_link: 'That link doesn’t look right. Try requesting a new one.',
  expired: 'That sign-in link has expired or has already been used. Request a new one below.',
  storage: 'We hit a problem looking up your account. Please try again in a moment.',
}

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser()
  if (user) redirect('/account')

  const errorMessage = searchParams.error ? ERRORS[searchParams.error] : null
  const sent = searchParams.sent === '1'

  return (
    <main className="audit-shell">
      <div className="audit-container audit-container-narrow">
        <div className="audit-step-meta">
          <span>Sign in</span>
          <Link href="/" className="audit-back">← Home</Link>
        </div>

        <h1 className="audit-h1" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
          Sign in to your audit account
        </h1>
        <p className="audit-lede-small">
          Enter your email and we'll send you a magic sign-in link. No password to remember.
        </p>

        {errorMessage && <div className="audit-error" style={{ marginBottom: 20 }}>{errorMessage}</div>}

        {sent ? (
          <div className="audit-gate" style={{ marginTop: 16 }}>
            <h2 className="audit-gate-h">Check your inbox</h2>
            <p className="audit-gate-blurb">
              We’ve sent you a sign-in link. It’s valid for the next 15 minutes. You can close this tab.
            </p>
            <Link href="/sign-in" className="audit-cta audit-cta-secondary" style={{ alignSelf: 'flex-start' }}>
              Use a different email
            </Link>
          </div>
        ) : (
          <SignInForm />
        )}

        <p className="audit-lede-small" style={{ marginTop: 28, fontSize: 13, color: 'var(--text-muted)' }}>
          New here?{' '}
          <Link href="/audit" style={{ color: 'var(--orange)', textDecoration: 'none', fontWeight: 600 }}>
            Take the audit
          </Link>{' '}
          first — you can sign in afterwards to see your report any time.
        </p>
      </div>
    </main>
  )
}
