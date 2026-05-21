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
      gap: 32,
      padding: 32,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#e86830' }}>
        ThreePoint · AI Readiness Workshop
      </div>
      <h1 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 'clamp(36px, 6vw, 72px)',
        fontWeight: 400,
        lineHeight: 1.05,
        color: 'white',
        maxWidth: 700,
        margin: 0,
      }}>
        The 4AI Brain Audit
      </h1>
      <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', maxWidth: 520, lineHeight: 1.6, margin: 0 }}>
        A facilitated workshop that maps your organisation's AI readiness across four dimensions: Memory, Thinking, Deciding, and Creating.
      </p>
      <Link href="/deck" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '16px 40px',
        background: '#e86830',
        color: 'white',
        borderRadius: 10,
        textDecoration: 'none',
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: '0.01em',
      }}>
        Open Workshop →
      </Link>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        ThreePoint · Facilitated by James Poulter
      </p>
    </div>
  )
}
