# HubSpot Runbook — turning the integration on

The code syncs every audit submission and waitlist signup into HubSpot. This
runbook is the portal-side half: one-time setup, then the lists, workflows and
emails that turn captured leads into booked sessions. Allow ~2 hours.

## 1. One-time setup (15 min)

1. **Private app** — Settings → Integrations → Private Apps → Create.
   Scopes: `crm.objects.contacts.read/write`, `crm.objects.companies.read/write`,
   `crm.schemas.contacts.write`, `crm.objects.notes.write` (under Engagements).
   Copy the token.
2. **Vercel env vars** (ai-audit-demo project):
   ```
   HUBSPOT_ACCESS_TOKEN=pat-eu1-…
   HUBSPOT_PORTAL_ID=145752899
   HUBSPOT_REGION=eu1
   CRON_SECRET=<random string>           # protects cron + admin routes
   NEXT_PUBLIC_HUBSPOT_PORTAL_ID=145752899   # enables tracking script
   NEXT_PUBLIC_BOOKING_URL=<HubSpot meeting link>   # results-page CTA
   HUBSPOT_AUDIT_FORM_GUID=<see step 4>  # optional, native attribution
   ```
   kt-claude project: `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_SUBSCRIPTION_TYPE_ID`
   (see step 5), and optionally `HUBSPOT_PORTAL_ID` / `HUBSPOT_FORM_GUID` /
   `HUBSPOT_REGION` overrides.
3. **Create the properties** — after deploy:
   ```
   curl -X POST https://<audit-host>/api/admin/hubspot-setup \
        -H "authorization: Bearer $CRON_SECRET"
   ```
   Creates the "AI Brain Audit" property group, all `audit_*` properties, and
   `audience_type` (used by the waitlist). Idempotent — safe to re-run.
4. **Optional but recommended: hidden "Audit completed" form** — Marketing →
   Forms → Create → embedded, single email field, name it "4AI Audit completed
   (system)". Put its GUID in `HUBSPOT_AUDIT_FORM_GUID`. This is what links a
   contact's ad/social session to their audit (otherwise everyone is "offline
   source").
5. **Subscription type ID** — Settings → Marketing → Email → Subscription
   Types → note the ID of "Marketing Information" (or create one). Set it as
   `HUBSPOT_SUBSCRIPTION_TYPE_ID` on kt-claude.
6. **Waitlist form field** — Marketing → Forms → the KT Claude Club form →
   add the (now existing) `audience_type` property as a field, plus
   `message`. Without this the Forms API rejects those fields and the code
   falls back to a raw CRM upsert (lead kept, analytics lost).
7. **Backfill** historic audit submissions:
   ```
   curl -X POST https://<audit-host>/api/admin/hubspot-backfill -H "authorization: Bearer $CRON_SECRET"
   curl https://<audit-host>/api/cron/hubspot-sync -H "authorization: Bearer $CRON_SECRET"   # repeat until done=0
   ```

## 2. Active lists (10 min)

| List | Filter |
|---|---|
| `Audit — completed (all)` | `audit_completed_at` is known |
| `Audit — Nascent/Emerging` | `audit_overall_band` is any of Nascent, Emerging |
| `Audit — Operational/Advanced` | `audit_overall_band` is any of Operational, Advanced |
| `Audit — nurture pool` | `audit_completed_at` known AND marketing contact AND `lifecyclestage` ≥ MQL |
| `Audit — sales-ready` | `audit_org_size` any of 51-200, 200+ AND `audit_overall_band` any of Nascent, Emerging |
| `Waitlist — KT Claude Club` | `audience_type` is known |

## 3. Workflow A — Audit nurture (30 min)

**Enrolment:** `audit_completed_at` is known AND contact is marketable.
Re-enrolment on `audit_completed_at` changes.

- **Day 0 — "Your 4AI Brain audit, in one page"**
  Subject: `Your AI readiness: {{ audit_overall_band }} ({{ audit_overall_score }}%)`
  Body: one-paragraph recap, the four dimension scores, button → `{{ audit_results_url }}`.
  P.S. — "Forward this to whoever owns ops; the team version of the audit takes 6 minutes."
  (Share loop: the results link already carries share UTMs.)
- **Day 3 — weakest-dimension playbook.** Branch on `audit_weakest_dimension`:
  - *memory* — Subject: `The fix for "we solved this already, where is it?"` — 3 concrete steps to stand up a team knowledge base + Claude Projects pattern. CTA: results page.
  - *thinking* — Subject: `Your team is using AI like a search bar` — model choice, prompt patterns, context discipline. CTA: results page.
  - *deciding* — Subject: `AI suggests. Nobody decides. Here's the bottleneck.` — decision-rights checklist, owner per workflow. CTA: results page.
  - *creating* — Subject: `From internal drafts to client-ready output` — review gates + brand-safe generation workflow. CTA: results page.
- **Day 7 — "Want this done with you in the room?"**
  Subject: `30 days to move {{ audit_weakest_dimension }} one band`
  Body: what a working session covers, social proof, button → the
  `NEXT_PUBLIC_BOOKING_URL` meeting link. If/then branch: Nascent/Emerging get
  "workshop" framing; Operational/Advanced get "advanced operating cadence"
  framing.
- **Goal:** meeting booked (kills the sequence on conversion).

## 4. Workflow B — Sales handoff (10 min)

**Enrolment:** member of `Audit — sales-ready`, OR meeting booked from Workflow A.
Actions: set `lifecyclestage = salesqualifiedlead` (meeting) → create deal in
**Sales Pipeline** at *Appointment Scheduled*, deal name
`{{ company }} — AI working session`, owner = James → in-app + email
notification with the contact's audit note (scores + report link are on the
contact timeline already).

## 5. Workflow C — Waitlist (10 min)

**Enrolment:** form submission = KT Claude Club waitlist form.
- Immediately: confirmation email — "You're on the list. Capped at 30 seats."
- Set `lifecyclestage = lead`.
- When booking opens: one-off send to `Waitlist — KT Claude Club` with the
  Eventbrite link (the form promised the link 24h early — honour it).

## 6. Programme routing

The sync already writes `ai_readiness_level` (overall %) and `ai_urgency`
(High for Nascent/Emerging, Medium for Operational, Low for Advanced), so
audit leads flow into the existing Boardroom/Mastermind qualification
workflows untouched.

## 7. Dashboard (15 min)

Single "Audit funnel" dashboard:
1. Contacts created by week, split by first form/source (waitlist vs audit).
2. Funnel: `audit_completed_at` known → MQL → meeting booked → deal won.
3. Average `audit_overall_score` by month (is the audience maturing?).
4. Nurture email performance (Workflow A sends/opens/clicks per branch).
5. Deals created from Workflow B, by stage.

## 8. Health checks

- `hubspot_sync_queue` rows with `status='error'` → check `last_error`;
  the cron retries up to 6 times every 15 minutes.
- Contacts arriving as `DIRECT_TRAFFIC` after the tracking script ships =
  hutk not reaching the Forms API — check `HUBSPOT_AUDIT_FORM_GUID`.
- The waitlist response `{ ok: true, via: "crm" }` in logs means the Forms
  API is rejecting fields — fix the form definition (step 1.6).
