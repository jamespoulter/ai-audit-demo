import type { DimensionId, Submission } from '@/app/audit/lib/types'
import { BUCKET_LABEL, highestDimension, lowestDimension } from '@/app/audit/lib/scoring'
import {
  associateContactToCompany,
  createCompany,
  createNoteForContact,
  findCompanyByName,
  hubspotEnabled,
  submitForm,
  upsertContactByEmail,
  upsertContactWithFallback,
} from './hubspot'

/**
 * Attribution captured client-side (first touch) and passed through the
 * submit body. hutk is HubSpot's `hubspotutk` analytics cookie — sending it
 * with a Forms API submission ties the contact to their full session
 * history instead of landing as DIRECT_TRAFFIC.
 */
export type Attribution = {
  hutk?: string
  pageUri?: string
  pageName?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
}

const DIMENSIONS: DimensionId[] = ['memory', 'thinking', 'deciding', 'creating']

/** Audit band → the portal's existing ai_urgency routing (Low/Medium/High). */
const URGENCY_BY_BUCKET: Record<string, string> = {
  nascent: 'High',
  emerging: 'High',
  operational: 'Medium',
  advanced: 'Low',
}

function splitName(name?: string): { firstname?: string; lastname?: string } {
  if (!name) return {}
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return { firstname: parts[0] }
  return { firstname: parts[0], lastname: parts.slice(1).join(' ') }
}

export function buildAuditContactProperties(s: Submission, resultsUrl: string): Record<string, string> {
  const props: Record<string, string> = {
    ...splitName(s.name),
    audit_overall_score: String(s.scores.overall.pct),
    audit_overall_band: BUCKET_LABEL[s.scores.overall.bucket],
    audit_strongest_dimension: highestDimension(s.scores),
    audit_weakest_dimension: lowestDimension(s.scores),
    audit_results_url: resultsUrl,
    audit_completed_at: s.createdAt,
    // Feed the portal's existing AI-qualification scheme.
    ai_readiness_level: String(s.scores.overall.pct),
    ai_urgency: URGENCY_BY_BUCKET[s.scores.overall.bucket] ?? 'Medium',
  }
  for (const d of DIMENSIONS) {
    props[`audit_${d}_score`] = String(s.scores.byDimension[d].pct)
  }
  if (s.orgName) props.company = s.orgName
  if (s.orgSize) props.audit_org_size = s.orgSize
  // Lifecycle: every completed audit is at least a lead; an explicit
  // marketing opt-in on a scored assessment is MQL-grade intent.
  props.lifecyclestage = s.marketingOptIn ? 'marketingqualifiedlead' : 'lead'
  if (s.marketingOptIn) props.hs_marketable_status = 'true'
  return props
}

/** Properties HubSpot may legitimately reject per-record (stage can't move backwards, etc.). */
const RISKY_KEYS = ['lifecyclestage', 'hs_marketable_status', 'ai_readiness_level', 'ai_urgency']

function noteHtml(s: Submission, resultsUrl: string): string {
  const dims = DIMENSIONS.map(
    d => `${d[0].toUpperCase()}${d.slice(1)}: ${s.scores.byDimension[d].pct}%`
  ).join(' · ')
  return (
    `<strong>4AI Brain Audit completed</strong> — ${BUCKET_LABEL[s.scores.overall.bucket]} band, ` +
    `${s.scores.overall.pct}% overall.<br/>${dims}<br/>` +
    (s.orgName ? `Org: ${s.orgName}${s.orgSize ? ` (${s.orgSize})` : ''}<br/>` : '') +
    `Marketing opt-in: ${s.marketingOptIn ? 'yes' : 'no'}<br/>` +
    `<a href="${resultsUrl}">View full report</a>`
  )
}

/**
 * Push one submission into HubSpot: contact upsert (scores + lifecycle),
 * company association, a timeline note, and — when configured — a Forms API
 * submission carrying the hutk for native attribution. Throws on failure so
 * the caller can queue a retry; never call this on the critical path
 * without a catch.
 */
export async function syncSubmissionToHubSpot(
  s: Submission,
  origin: string,
  attribution?: Attribution | null
): Promise<{ skipped: boolean; contactId?: string }> {
  if (!hubspotEnabled()) return { skipped: true }

  const resultsUrl = `${origin}/audit/results/${s.id}`
  const props = buildAuditContactProperties(s, resultsUrl)
  const { id: contactId } = await upsertContactWithFallback(s.email, props, RISKY_KEYS)

  if (s.orgName) {
    try {
      const existing = await findCompanyByName(s.orgName)
      const company = existing ?? (await createCompany({ name: s.orgName }))
      await associateContactToCompany(contactId, company.id)
    } catch (err) {
      // Company association is nice-to-have — never fail the sync over it.
      console.warn('[hubspot-sync] company association failed', err)
    }
  }

  try {
    await createNoteForContact(contactId, noteHtml(s, resultsUrl))
  } catch (err) {
    console.warn('[hubspot-sync] note creation failed', err)
  }

  // Native attribution + consent via a hidden "audit completed" form.
  const formGuid = process.env.HUBSPOT_AUDIT_FORM_GUID
  const portalId = process.env.HUBSPOT_PORTAL_ID
  if (formGuid && portalId && attribution?.hutk) {
    try {
      await submitForm({
        portalId,
        formGuid,
        fields: [{ objectTypeId: '0-1', name: 'email', value: s.email }],
        context: {
          hutk: attribution.hutk,
          pageUri: attribution.pageUri || `${origin}/audit/review`,
          pageName: attribution.pageName || '4AI Brain Audit',
        },
        consentText: s.marketingOptIn
          ? 'I agree to receive occasional emails about the workshop and related material.'
          : undefined,
      })
    } catch (err) {
      console.warn('[hubspot-sync] forms attribution submit failed', err)
    }
  }

  return { skipped: false, contactId }
}

/** Light-touch sync for magic-link sign-ups: make the person visible in CRM. */
export async function syncSubscriberToHubSpot(email: string): Promise<void> {
  if (!hubspotEnabled()) return
  await upsertContactWithFallback(email, { lifecyclestage: 'subscriber' }, ['lifecyclestage'])
}
