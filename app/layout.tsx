import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { AttributionCapture } from './AttributionCapture'

const HUBSPOT_PORTAL_ID = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID
const HUBSPOT_REGION = process.env.NEXT_PUBLIC_HUBSPOT_REGION || 'eu1'

export const metadata: Metadata = {
  title: 'AI Audit Demo',
  description: 'A standalone AI audit deck experience — Workshop 2: Designing the Workflows',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AttributionCapture />
        {children}
        {HUBSPOT_PORTAL_ID && (
          <Script
            id="hs-script-loader"
            src={`https://js-${HUBSPOT_REGION}.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  )
}
