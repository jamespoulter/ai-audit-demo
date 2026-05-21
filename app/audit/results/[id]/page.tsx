import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublicSubmission } from '@/app/audit/lib/db'
import { STEP_ORDER } from '@/app/audit/lib/questions'
import { BUCKET_LABEL } from '@/app/audit/lib/scoring'
import { buildStubNarrative } from '@/app/audit/lib/narrative'
import { pickRecs } from '@/app/audit/lib/recommendations'
import { RadarChart } from '@/app/audit/components/RadarChart'
import { ScoreCard } from '@/app/audit/components/ScoreCard'
import { RecommendationBlock } from '@/app/audit/components/RecommendationBlock'
import { DimensionLegend } from '@/app/audit/components/DimensionLegend'
import { ShareBar } from '@/app/audit/components/ShareBar'

export const dynamic = 'force-dynamic'

type Params = { id: string }

export default async function ResultsPage({ params }: { params: Params }) {
  const submission = await getPublicSubmission(params.id)
  if (!submission) notFound()

  const scores = submission.scores
  const narrative = submission.narrative ?? buildStubNarrative(scores)
  const { perDimension, nextFocus } = pickRecs(scores)

  return (
    <main className="audit-shell audit-shell-results">
      <div className="audit-container audit-container-wide">
        <div className="audit-step-meta">
          <span>Your audit · {submission.orgName ?? 'Personal report'}</span>
          <Link href="/audit" className="audit-back">Take it again →</Link>
        </div>

        <h1 className="audit-h1">Your 4AI Brain audit</h1>
        <p className="audit-lede">
          Overall, you're sitting in the <strong>{BUCKET_LABEL[scores.overall.bucket]}</strong> band
          at <strong>{scores.overall.pct}%</strong> across the four dimensions.
        </p>

        <DimensionLegend />

        <section className="audit-radar-section">
          <RadarChart scores={scores} size={420} />
          <div className="audit-score-grid">
            {STEP_ORDER.map(d => (
              <ScoreCard key={d} score={scores.byDimension[d]} />
            ))}
          </div>
        </section>

        <ShareBar id={submission.id} />

        <section className="audit-narrative">
          <h2 className="audit-h3">What this means</h2>
          <NarrativeBlock narrative={narrative} />
        </section>

        <section className="audit-recs">
          <h2 className="audit-h3">Where to focus first</h2>
          <RecommendationBlock
            rec={nextFocus.rec}
            eyebrow={`Highest-leverage move · ${BUCKET_LABEL[nextFocus.rec.bucket]} for ${nextFocus.dimension}`}
          />
        </section>

        <section className="audit-recs">
          <h2 className="audit-h3">By dimension</h2>
          <div className="audit-rec-grid">
            {perDimension.map(r => (
              <RecommendationBlock key={`${r.dimension}-${r.bucket}`} rec={r} />
            ))}
          </div>
        </section>

        <footer className="audit-footer">
          <p>ThreePoint · 4AI Brain Audit · Generated {new Date(submission.createdAt).toLocaleDateString()}</p>
          <Link href="/deck" className="audit-cta audit-cta-secondary">Open the workshop deck →</Link>
        </footer>
      </div>
    </main>
  )
}

function NarrativeBlock({ narrative }: { narrative: string }) {
  // Tiny inline renderer — paragraphs separated by blank lines, **bold** spans.
  const paragraphs = narrative.split(/\n\n+/)
  return (
    <div className="audit-narrative-body">
      {paragraphs.map((p, i) => (
        <p key={i} dangerouslySetInnerHTML={{ __html: renderInline(p) }} />
      ))}
    </div>
  )
}

function renderInline(s: string): string {
  // Escape, then re-introduce **bold**. No user-supplied input reaches this in v1
  // (the stub builder produces the strings), but we still escape defensively in
  // case Phase 3 feeds Claude output through here.
  const escaped = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}
