import { notFound } from 'next/navigation'
import { getPublicSubmission } from '@/app/audit/lib/db'
import { STEP_ORDER } from '@/app/audit/lib/questions'
import { BUCKET_LABEL } from '@/app/audit/lib/scoring'
import { buildStubNarrative } from '@/app/audit/lib/narrative'
import { pickRecs } from '@/app/audit/lib/recommendations'
import { RadarChart } from '@/app/audit/components/RadarChart'
import { ScoreCard } from '@/app/audit/components/ScoreCard'
import { RecommendationBlock } from '@/app/audit/components/RecommendationBlock'
import { AutoPrint } from './AutoPrint'

export const dynamic = 'force-dynamic'

type Params = { id: string }
type SearchParams = { autoprint?: string }

export default async function PrintPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const submission = await getPublicSubmission(params.id)
  if (!submission) notFound()

  const scores = submission.scores
  const narrative = submission.narrative ?? buildStubNarrative(scores)
  const { perDimension, nextFocus } = pickRecs(scores)
  const shouldAutoPrint = searchParams.autoprint === '1'

  return (
    <main className="audit-print">
      {shouldAutoPrint && <AutoPrint />}

      <header className="audit-print-cover">
        <div className="audit-print-eyebrow">ThreePoint · 4AI Brain Audit</div>
        <h1>4AI Brain Audit Report</h1>
        <p className="audit-print-sub">
          {submission.orgName ? `Prepared for ${submission.orgName}` : 'Personal audit report'}
          {' · '}
          {new Date(submission.createdAt).toLocaleDateString()}
        </p>
        <p className="audit-print-overall">
          Overall: <strong>{BUCKET_LABEL[scores.overall.bucket]}</strong> · {scores.overall.pct}%
        </p>
      </header>

      <section className="audit-print-section avoid-break">
        <h2>Your radar</h2>
        <RadarChart scores={scores} size={460} />
        <div className="audit-score-grid">
          {STEP_ORDER.map(d => (
            <ScoreCard key={d} score={scores.byDimension[d]} />
          ))}
        </div>
      </section>

      <section className="audit-print-section avoid-break">
        <h2>What this means</h2>
        {narrative.split(/\n\n+/).map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: renderInline(p) }} />
        ))}
      </section>

      <section className="audit-print-section avoid-break">
        <h2>Where to focus first</h2>
        <RecommendationBlock
          rec={nextFocus.rec}
          eyebrow={`Highest-leverage move · ${BUCKET_LABEL[nextFocus.rec.bucket]} for ${nextFocus.dimension}`}
        />
      </section>

      <section className="audit-print-section">
        <h2>By dimension</h2>
        {perDimension.map(r => (
          <div key={`${r.dimension}-${r.bucket}`} className="avoid-break" style={{ marginBottom: 24 }}>
            <RecommendationBlock rec={r} />
          </div>
        ))}
      </section>

      <footer className="audit-print-footer">
        ThreePoint · 4AI Brain Audit · {submission.id}
      </footer>
    </main>
  )
}

function renderInline(s: string): string {
  const escaped = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}
