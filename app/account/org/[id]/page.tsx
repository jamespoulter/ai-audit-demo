import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  getOrg,
  isMember,
  listMembers,
  listSubmissionsForOrg,
} from '@/app/audit/lib/db'
import { aggregateScores } from '@/app/audit/lib/aggregate'
import { BUCKET_LABEL, STEP_ORDER } from '@/app/audit/lib/scoring'
import { getCurrentUser } from '@/app/auth/lib/session'
import { RadarChart } from '@/app/audit/components/RadarChart'
import { ScoreCard } from '@/app/audit/components/ScoreCard'
import { DimensionLegend } from '@/app/audit/components/DimensionLegend'
import { InvitePanel } from './InvitePanel'

export const dynamic = 'force-dynamic'

type Params = { id: string }

export default async function OrgDashboardPage({ params }: { params: Params }) {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const org = await getOrg(params.id)
  if (!org) notFound()
  if (!(await isMember(org.id, user.id))) {
    redirect('/account')
  }

  const [members, submissions] = await Promise.all([
    listMembers(org.id),
    listSubmissionsForOrg(org.id),
  ])

  const aggregate = aggregateScores(submissions)

  return (
    <main className="audit-shell audit-shell-results">
      <div className="audit-container audit-container-wide">
        <div className="audit-step-meta">
          <span>
            <Link href="/account" className="audit-back">← Back to account</Link>
          </span>
          <span>Signed in as <strong style={{ color: 'var(--text-secondary)' }}>{user.email}</strong></span>
        </div>

        <h1 className="audit-h1">{org.name}</h1>
        <p className="audit-lede">
          {submissions.length === 0
            ? 'No responses yet — invite your team using the panel below and their results will land here as they submit.'
            : `${submissions.length} response${submissions.length === 1 ? '' : 's'} from your team. Aggregate scores below.`}
        </p>

        {aggregate && (
          <>
            <DimensionLegend />
            <section className="audit-radar-section">
              <RadarChart scores={aggregate} size={420} />
              <div className="audit-score-grid">
                {STEP_ORDER.map(d => (
                  <ScoreCard key={d} score={aggregate.byDimension[d]} />
                ))}
              </div>
            </section>
          </>
        )}

        <InvitePanel orgId={org.id} />

        <section style={{ marginTop: 32 }}>
          <h2 className="audit-h3" style={{ marginTop: 0 }}>Responses ({submissions.length})</h2>
          {submissions.length === 0 ? (
            <p className="audit-lede-small">No responses to show yet.</p>
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
                        <span className="account-submission-date">{s.name || s.email}</span>
                        <span className="account-submission-org">{date}</span>
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

        <section style={{ marginTop: 32 }}>
          <h2 className="audit-h3" style={{ marginTop: 0 }}>Members ({members.length})</h2>
          <ul className="org-member-list">
            {members.map(m => (
              <li key={m.userId}>
                <span>{m.name || m.email}</span>
                <span className="org-member-meta">{m.email}</span>
                <span className="org-member-role">{m.role}</span>
              </li>
            ))}
          </ul>
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
