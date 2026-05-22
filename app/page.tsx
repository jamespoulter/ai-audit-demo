import Link from 'next/link'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a1628',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      color: 'white',
      flexDirection: 'column',
      gap: 28,
      padding: 32,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#e86830' }}>
        ThreePoint · AI Readiness
      </div>
      <h1 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 'clamp(36px, 6vw, 72px)',
        fontWeight: 400,
        lineHeight: 1.05,
        color: 'white',
        maxWidth: 720,
        margin: 0,
      }}>
        The 4AI Brain Audit
      </h1>
      <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', maxWidth: 540, lineHeight: 1.6, margin: 0 }}>
        A 10-minute, four-dimension audit that maps your organisation's AI readiness across Memory, Thinking, Deciding, and Creating.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
        <Link href="/audit" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '16px 32px',
          background: '#e86830',
          color: 'white',
          borderRadius: 10,
          textDecoration: 'none',
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: '0.01em',
        }}>
          Take the audit →
        </Link>
        <Link href="/deck" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '16px 32px',
          background: 'transparent',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 10,
          textDecoration: 'none',
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: '0.01em',
        }}>
          Open workshop deck
        </Link>
      </div>
      <Link href="/sign-in" style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', marginTop: 8 }}>
        Already taken the audit? <span style={{ color: 'white', fontWeight: 600 }}>Sign in →</span>
      </Link>

      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 16 }}>
        ThreePoint · Facilitated by James Poulter
      </p>
    </div>
  )
}
