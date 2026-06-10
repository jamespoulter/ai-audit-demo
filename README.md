# AI Audit Demo

A Next.js app that combines a workshop deck and a self-serve **4AI Brain Audit** — a 20-question, four-dimension assessment with a scored radar report, tool recommendations, and a shareable/printable result page. Includes magic-link accounts and team workspaces with aggregate radar.

## What's in here

- **`/`** — Landing page with CTAs to the audit, the deck, and sign-in.
- **`/audit`** — Self-serve audit landing.
- **`/audit/start` → `/audit/q/[1..4]` → `/audit/review`** — Multi-step audit flow. Answers persist via `localStorage` while in flight.
- **`/audit/results/[id]`** — Personalised report: SVG radar, per-dimension score cards, narrative, tool recommendations, share link, PDF.
- **`/audit/results/[id]/print`** — Print-optimised version (the "Download PDF" button opens this with `?autoprint=1` and triggers `window.print()`).
- **`/sign-in`** — Magic-link sign-in (passwordless).
- **`/account`** — Your past audits + teams you belong to. Create a new team here.
- **`/account/org/[id]`** — Team dashboard: aggregate radar across all responses, per-respondent list, invite panel (shareable link + email invites).
- **`/invite/[token]`** — Invite landing. Tags the next audit submission with the org so it lands on the team dashboard.
- **`/deck`** — Original 23-slide workshop deck (unchanged).

## Audit framework

Maps AI readiness across four dimensions:

| Dimension | Colour | What it covers |
|-----------|--------|----------------|
| Memory | `#7902f3` | Storing, retrieving, reusing what the team already knows |
| Thinking | `#f46c42` | Reasoning with AI — model choice, prompts, context |
| Deciding | `#c59f4d` | Moving from suggestion to commitment with clear owners |
| Creating | `#d1f503` | AI-assisted outputs that clients and audiences actually see |

Scores are computed server-side (1–5 Likert → 0–100% per dimension → Nascent / Emerging / Operational / Advanced bucket).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

The audit requires Postgres for submission storage. Vercel auto-injects `POSTGRES_URL` when you connect a Neon-backed Postgres database. Locally, add to `.env.local`:

```
POSTGRES_URL=postgres://...
```

The schema (submissions, users, sessions, orgs, invites) is created automatically on first request — no separate migration step.

For magic-link sign-in and team invite emails, set:

```
RESEND_API_KEY=re_...
AUTH_FROM_EMAIL=ThreePoint Audit <noreply@your-domain.com>  # optional; defaults to onboarding@resend.dev
```

Without `RESEND_API_KEY`, magic-link and invite URLs are logged to runtime logs instead of being sent — fine for local dev, not for production.

For the HubSpot marketing pipeline (see `docs/hubspot-runbook.md` for full setup):

```
HUBSPOT_ACCESS_TOKEN=pat-eu1-...        # private app token; sync is a no-op without it
HUBSPOT_PORTAL_ID=145752899
HUBSPOT_REGION=eu1
CRON_SECRET=...                         # protects /api/cron + /api/admin routes
HUBSPOT_AUDIT_FORM_GUID=...             # optional hidden form for hutk attribution
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=145752899 # enables the HubSpot tracking script
NEXT_PUBLIC_BOOKING_URL=...             # "Book a working session" CTA on results
```

Every audit submission is upserted to HubSpot (contact + company + scores +
timeline note) via a Neon-backed retry queue; `/api/cron/hubspot-sync` drains
failures every 15 minutes (vercel.json cron). `/api/admin/hubspot-setup`
creates all required contact properties; `/api/admin/hubspot-backfill` queues
historic submissions.

For Claude-generated report narratives (Phase 3 — shipped):

```
ANTHROPIC_API_KEY=...
```

When set, the results page generates a personalised three-paragraph narrative
via Claude (`claude-opus-4-8`) in the background and swaps it in for the
deterministic stub; without the key the stub renders alone. Synthesis is
idempotent per submission (`POST /api/audit/[id]/synthesize?force=1` to
regenerate).

## API routes

| Path | Method | Purpose |
|------|--------|---------|
| `/api/audit/submit` | POST | Validate + score + persist a submission. Returns `{ id }`. Tags the row with `user_id` (looks up or creates by email) and with `org_id` when a pending-invite cookie is set. |
| `/api/audit/[id]` | GET | Public submission (email redacted). |
| `/api/audit/[id]/pdf` | GET | 302 → `/audit/results/[id]/print?autoprint=1`. |
| `/api/audit/[id]/synthesize` | POST | Generates and persists narrative. v1 returns a deterministic stub; swap `synthesizeNarrative` in `app/audit/lib/narrative.ts` to call Claude in Phase 3. |
| `/api/auth/request` | POST | `{ email }` → emails a 15-minute magic-link. |
| `/api/auth/verify` | GET | Consumes the magic-link token, opens a 30-day session, redirects to `/account`. |
| `/api/auth/sign-out` | POST | Clears the session cookie. |
| `/api/org/create` | POST | `{ name }` → creates an org with the current user as admin. |
| `/api/org/[id]/invite` | POST | `{ emails? }` → creates a shareable invite link; if emails are provided, also sends branded invites via Resend. |

## Keyboard controls (deck)

| Key | Action |
|-----|--------|
| `→` / `Space` | Next slide |
| `←` | Previous slide |
| `G` | Slide sorter |
| `Esc` | Close sorter |
| `F` | Fullscreen |
| `Home` / `End` | First / Last slide |

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Neon serverless Postgres via `@neondatabase/serverless`
- `nanoid` for URL/session IDs
- Resend for transactional email (magic links + invites) — called via `fetch`, no SDK
- Zero external UI libraries — all custom CSS
- DM Sans + DM Serif Display fonts

## Deployment

Deployed to Vercel. Connect a Neon Postgres integration so `POSTGRES_URL` is available at runtime; push to `main` to auto-deploy.

## Phased roadmap

- **Phase 1 (shipped)** — Self-serve audit flow, scoring, static recommendations, radar, print-to-PDF, email-gated submission, stub narrative.
- **Phase A (shipped)** — Magic-link sign-in + `/account` dashboard.
- **Phase B (shipped)** — Team workspaces (orgs) with aggregate radar + per-respondent list.
- **Phase C (shipped)** — Invites: shareable link + branded email invites via Resend.
- **Phase 3 (shipped)** — Claude-generated narrative synthesis via `/synthesize`, with deterministic fallback.
- **HubSpot pipeline (shipped)** — CRM sync with retry queue, attribution capture, admin setup/backfill routes. See `docs/hubspot-runbook.md`.
- **Phase 2** — Facilitator mode (`/deck?facilitator=<sessionId>` overlay) + facilitator console + "email me a copy."
