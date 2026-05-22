import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/auth/lib/session'
import { listOrgsForUser, listSubmissionsForUser } from '@/app/audit/lib/db'
import { BUCKET_LABEL } from '@/app/audit/lib/scoring'
import { CreateOrgForm } from './CreateOrgForm'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const [submissions, orgs] = await Promise.all([
    listSubmissionsForUser(user),
    listOrgsForUser(user.id),
  ])

  return (
    <main className="audit-shell">
      <div className="audit-container audit-container-wide">
        <div className="audit-step-meta">
          <span>
            Signed in as <strong style={{ color: 'var(--text-secondary)' }}>{user.email}</strong>
          </span>
          <form method="post" action="/api/auth/sign-out" style={{ margin: 0 }}>
            <button type="submit" className="audit-back" style={{ background: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
              Sign out
            </button>
          </form>
        </div>

        <h1 className="audit-h1">{user.name ? `Welcome, ${user.name}` : 'Your account'}</h1>
        <p className="audit-lede">
          Your past audits and team workspaces in one place.
        </p>

        <div className="audit-cta-row">
          <Link href="/audit" className="audit-cta audit-cta-primary">
            Take a new audit →
          </Link>
        </div>

        <section style={{ marginTop: 24 }}>
          <h2 className="audit-h3" style={{ marginTop: 0 }}>Teams</h2>
          {orgs.length === 0 ? (
            <p className="audit-lede-small" style={{ marginBottom: 12 }}>
              Create a team workspace to collect responses from colleagues and view an aggregate radar.
            </p>
          ) : (
            <ul className="account-submission-list" style={{ marginBottom: 16 }}>
              {orgs.map(o => (
                <li key={o.id}>
                  <Link href={`/account/org/${o.id}`} className="account-submission-card" style={{ gridTemplateColumns: '1fr auto 24px' }}>
                    <div className="account-submission-meta">
                      <span className="account-submission-date">{o.name}</span>
                      <span className="account-submission-org">
                        {o.role === 'admin' ? 'Admin' : 'Member'} · created {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="account-submission-bucket">Open dashboard</span>
                    <div className="account-submission-arrow">→</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <CreateOrgForm />
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 className="audit-h3" style={{ marginTop: 0 }}>Your audits ({submissions.length})</h2>
          {submissions.length === 0 ? (
            <p className="audit-lede-small">You haven't submitted an audit under this email yet. Take one above and it'll appear here.</p>
          ) : (
            <ul className="account-submission-list">
              {submissions.map(s => {
                const date = new Date(s.createdAt).toLocaleDateString(undefined, {
                  day: 'numeric', month: 'short', year: 'numeric',
                })
                return (
                  <li key={s.id}>
                    <Link href={`/audit/results/${s.id}`} className="account-submission-card">
                      <div className="account-submission-meta">
                        <span className="account-submission-date">{date}</span>
                        {s.orgName && <span className="account-submission-org">{s.orgName}</span>}
                      </div>
                      <div className="account-submission-score">
                        <span className="account-submission-pct">{s.scores.overall.pct}%</span>
                        <span className="account-submission-bucket">{BUCKET_LABEL[s.scores.overall.bucket]}</span>
                      </div>
                      <div className="account-submission-chips">
                        <Pill colour="#7902f3" label="Mem" pct={s.scores.byDimension.memory.pct} />
                        <Pill colour="#f46c42" label="Thi" pct={s.scores.byDimension.thinking.pct} />
                        <Pill colour="#c59f4d" label="Dec" pct={s.scores.byDimension.deciding.pct} />
                        <Pill colour="#d1f503" label="Cre" pct={s.scores.byDimension.creating.pct} />
                      </div>
                      <div className="account-submission-arrow">→</div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

function Pill({ colour, label, pct }: { colour: string; label: string; pct: number }) {
  return (
    <span className="account-submission-pill" style={{ borderColor: colour }}>
      <span className="account-submission-pill-label" style={{ color: colour }}>{label}</span>
      <span className="account-submission-pill-pct">{pct}%</span>
    </span>
  )
}
