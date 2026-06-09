# HubSpot Marketing Pipeline — Integration Plan

Covers both repos: **ai-audit-demo** (4AI Brain Audit funnel) and **kt-claude** (KT Claude Club waitlist).
Portal: **145752899** (EU1, `app-eu1.hubspot.com`).

## Where things stand today

### ai-audit-demo
The highest-intent lead source — a completed 20-question audit with email, name, org,
org size, marketing opt-in, and four dimension scores — currently writes **only to Neon
Postgres**. Nothing reaches HubSpot. `marketingOptIn` is captured and stored but never
acted on anywhere.

### kt-claude
`WaitlistForm.tsx` already posts to the HubSpot Forms Submissions API (portal
145752899, eu1, form GUID `6fa529b7-…`). Three problems found in review:

1. **`audience_type` does not exist as a contact property in the portal.** The form
   posts it as a required field. If the HubSpot form definition doesn't include it,
   every submission fails. Verify the form definition; create the property if missing.
2. **`subscriptionTypeId: 999` is a placeholder.** Consent submission with a
   non-existent subscription type ID is rejected. Replace with the real subscription
   type ID from Settings → Marketing → Email → Subscription Types.
3. **No `hutk` (HubSpot tracking cookie) in the submission context**, so contacts land
   as `DIRECT_TRAFFIC` with no page/campaign attribution — which matches what the
   portal data shows. Read the `hubspotutk` cookie and pass it in `context.hutk`,
   plus forward UTM params.

### HubSpot portal
- 259 contacts, active lead flow (several new leads per day), all `DIRECT_TRAFFIC`.
- One pipeline: default **Sales Pipeline** with stock stages.
- Existing custom AI-qualification properties already in use:
  `ai_readiness_level` (number), `ai_urgency` (Low/Medium/High),
  `ai_investment_readiness` (Budgeted/Ready if right fit/Exploring/Not yet),
  `ai_readiness_recommended` (Boardroom/Mastermind/Tie), `ai_prior_training`,
  `ai_preferred_format`, `ai_monthly_revenue_band`, plus Boardroom/Mastermind fit
  scores. **The audit should feed this scheme, not duplicate it.**
- No audit-specific or `audience_type` properties exist yet.

---

## Phase 0 — Fix the waitlist form (kt-claude) *(half a day)*

- [ ] Create `audience_type` contact property (enumeration: Solopreneur, Side-hustler,
      Freelancer, Services business, Small-team founder, AI-curious beginner) and add
      it to the HubSpot form, **or** confirm it already exists on the form definition.
- [ ] Replace `subscriptionTypeId: 999` with the portal's real marketing-information
      subscription type ID.
- [ ] Add `hutk` from the `hubspotutk` cookie + UTM passthrough to the submission
      `context` for attribution.
- [ ] Add the HubSpot tracking script (or confirm it's installed) on the waitlist page
      so `hubspotutk` exists to begin with.

## Phase 1 — Portal foundation *(half a day, no code)*

Create audit contact properties (group: "AI Brain Audit"):

| Property | Type | Notes |
|---|---|---|
| `audit_overall_score` | number | 0–100 |
| `audit_overall_band` | enum | Nascent / Emerging / Operational / Advanced |
| `audit_memory_score` / `audit_thinking_score` / `audit_deciding_score` / `audit_creating_score` | number | per-dimension 0–100 |
| `audit_strongest_dimension` / `audit_weakest_dimension` | enum | memory / thinking / deciding / creating |
| `audit_org_size` | enum | 1, 2-10, 11-50, 51-200, 200+ |
| `audit_results_url` | string | deep link to `/audit/results/[id]` |
| `audit_completed_at` | datetime | |
| `audit_count` | number | repeat audits = engagement signal |

Mapping into the existing scheme: write `audit_overall_score` → `ai_readiness_level`,
and derive `ai_urgency` (Nascent/Emerging → High, Operational → Medium, Advanced → Low,
or whatever matches how Boardroom/Mastermind routing currently consumes it).

## Phase 2 — Wire the audit app to HubSpot *(1–2 days of code)*

**Approach: server-side private app token** (`HUBSPOT_ACCESS_TOKEN`, scopes:
`crm.objects.contacts.write/read`, `crm.objects.companies.write`,
`crm.objects.deals.write`). The submit endpoint already runs server-side with all the
data; the CRM API lets us write score properties directly, which the Forms API can't
do cleanly.

1. **New module `app/lib/hubspot.ts`** — thin `fetch` wrapper (consistent with the
   repo's no-SDK style): `upsertContactByEmail(email, properties)`,
   `upsertCompanyAndAssociate(contactId, orgName, orgSize)`, `createNote(contactId, body)`.
2. **Hook `/api/audit/submit`** — after `createSubmission` succeeds, fire HubSpot sync
   **non-blocking** (never fail or slow the user's report on a HubSpot outage):
   - Upsert contact: email, name split, all Phase 1 properties, `lifecyclestage`.
   - Set contact as marketable **only when `marketingOptIn` is true** (EU portal —
     GDPR + marketing-contact tier limits).
   - Upsert company from `orgName`/`orgSize` and associate.
   - Attach a note summarising the four scores + results link.
3. **Resilience** — add a `hubspot_sync_queue` table in Neon (submission id, status,
   attempts, last error). Failed syncs get retried by a small
   `/api/cron/hubspot-sync` route on a Vercel cron. This is the difference between
   "demo integration" and "fully working pipeline".
4. **Attribution** — EmailGate reads `hubspotutk` cookie + UTM params from
   `sessionStorage` (captured on landing) and includes them in the submit body;
   server passes them through. Optionally fire a parallel Forms API submission (a
   hidden "Audit completed" HubSpot form) purely to register consent + analytics
   attribution the native way.
5. **Magic-link sign-ups** (`/api/auth/request`) — upsert a bare contact with
   `lifecyclestage=subscriber` so account-only users are visible in CRM too.
6. **Backfill** — one-off `scripts/backfill-hubspot.ts` that walks existing Neon
   submissions and upserts them (respecting opt-in for marketable status).

Env additions: `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_PORTAL_ID=145752899`.

## Phase 3 — Lifecycle + automation (in HubSpot) *(half a day, no code)*

- **Lists**: Audit completed (all); per-band lists; Waitlist (KT Claude Club);
  "Audit + opted in" (marketable nurture pool).
- **Lifecycle rules**: audit completed → `lead`; audit completed + opt-in →
  `marketingqualifiedlead`; org size 51-200/200+ + Nascent/Emerging band → flag for
  sales (these are the workshop-shaped buyers).
- **Workflows**:
  - *Audit nurture* (enrol on `audit_completed_at` set, opted-in only): Day 0 —
    results recap + results URL; Day 3 — playbook for `audit_weakest_dimension`
    (4 branch variants); Day 7 — book-a-workshop CTA.
  - *Sales handoff*: MQL + high-fit criteria → create deal in Sales Pipeline
    ("Appointment Scheduled" on meeting booked), assign owner, internal notification.
  - *Waitlist*: confirmation + Eventbrite-announcement sequence.
- Route `audit_overall_band` into `ai_readiness_recommended` so audit leads flow into
  the existing Boardroom/Mastermind qualification.

## Phase 4 — Measure *(ongoing)*

- UTM discipline on every CTA (deck → audit, waitlist → audit, share links:
  `utm_source=share` on the ShareBar URL).
- Dashboard: audit starts → completions → MQLs → meetings → deals won; waitlist
  signups; nurture email engagement by band.
- Later: Phase-3 Claude narrative (the `synthesizeNarrative` seam) can also generate
  the personalised Day-3 email body, stored on the contact for the workflow to send.

## Sequencing

Phase 0 first (the waitlist may be silently broken — live revenue risk), Phase 1 + 2
together as the core build, Phase 3 the same week, Phase 4 ongoing.

---

## Status

**Built (this branch + the matching kt-claude branch):**
- Phase 0 code: `/api/waitlist` server route (Forms API + CRM fallback), hutk
  forwarding, configurable subscription type ID, tracking script on the site.
- Phase 1 as code: `/api/admin/hubspot-setup` creates the property group, all
  `audit_*` properties and `audience_type` — one curl after deploy.
- Phase 2 complete: HubSpot client + sync, queue + 15-min cron retry,
  attribution capture, subscriber sync on magic-link, backfill route,
  UTM-tagged share links, booking CTA on results.

**Remaining (portal clicks + env vars — see `docs/hubspot-runbook.md`):**
- Private app token + Vercel env vars, run setup + backfill curls.
- Add `audience_type`/`message` fields to the waitlist form definition;
  set the real subscription type ID; create the hidden attribution form.
- Lists, Workflows A/B/C (nurture copy is in the runbook), dashboard.
