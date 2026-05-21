import Link from 'next/link'
import { DimensionLegend } from './components/DimensionLegend'

export const metadata = {
  title: '4AI Brain Audit',
  description: 'Map your organisation\'s AI readiness across Memory, Thinking, Deciding, and Creating.',
}

export default function AuditLanding() {
  return (
    <main className="audit-shell">
      <div className="audit-container">
        <div className="audit-eyebrow">ThreePoint · 4AI Brain Audit</div>
        <h1 className="audit-h1">
          Where does your team actually stand on AI?
        </h1>
        <p className="audit-lede">
          A 20-question, four-dimension audit you can complete in about ten minutes.
          You'll get a scored report, tool recommendations, and a clear next move —
          all on one page.
        </p>

        <DimensionLegend />

        <div className="audit-cta-row">
          <Link href="/audit/start" className="audit-cta audit-cta-primary">
            Start the audit →
          </Link>
          <Link href="/deck" className="audit-cta audit-cta-secondary">
            Open the workshop deck
          </Link>
        </div>

        <ul className="audit-meta-list">
          <li><strong>~10 min</strong> to complete</li>
          <li><strong>20 questions</strong> across four dimensions</li>
          <li><strong>One page</strong> of personalised recommendations</li>
          <li><strong>Shareable link</strong> and printable PDF</li>
        </ul>
      </div>
    </main>
  )
}
