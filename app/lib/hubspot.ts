/**
 * Minimal HubSpot client — no SDK, fetch only (same style as the Resend
 * wrapper in app/auth/lib/email.ts). All calls require HUBSPOT_ACCESS_TOKEN
 * (a private-app token with crm.objects.{contacts,companies}.write and
 * crm.schemas access). When the token is missing every helper is a no-op
 * guarded by `hubspotEnabled()` so the app runs fine without HubSpot.
 */

const API_BASE = 'https://api.hubapi.com'
const TIMEOUT_MS = 8000

export class HubSpotError extends Error {
  status: number
  body: string
  constructor(status: number, body: string, path: string) {
    super(`HubSpot ${status} on ${path}: ${body.slice(0, 500)}`)
    this.name = 'HubSpotError'
    this.status = status
    this.body = body
  }
}

export function hubspotEnabled(): boolean {
  return Boolean(process.env.HUBSPOT_ACCESS_TOKEN)
}

async function hsFetch(path: string, init: RequestInit = {}): Promise<any> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN
  if (!token) throw new Error('HUBSPOT_ACCESS_TOKEN is not set')
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  const text = await res.text()
  if (!res.ok) throw new HubSpotError(res.status, text, path)
  return text ? JSON.parse(text) : null
}

// ─── Contacts ──────────────────────────────────────────────────────

/**
 * Create-or-update a contact keyed on email. Uses the batch upsert
 * endpoint (idProperty=email) so a single round-trip is race-safe.
 */
export async function upsertContactByEmail(
  email: string,
  properties: Record<string, string>
): Promise<{ id: string }> {
  const data = await hsFetch('/crm/v3/objects/contacts/batch/upsert', {
    method: 'POST',
    body: JSON.stringify({
      inputs: [{ idProperty: 'email', id: email.trim().toLowerCase(), properties }],
    }),
  })
  return { id: String(data.results?.[0]?.id ?? '') }
}

/**
 * Some properties can be rejected per-record (e.g. lifecyclestage cannot
 * move backwards, hs_marketable_status needs Marketing Hub). Retry once
 * with only the always-safe subset so a stale CRM state never loses the
 * audit data itself.
 */
export async function upsertContactWithFallback(
  email: string,
  properties: Record<string, string>,
  riskyKeys: string[]
): Promise<{ id: string }> {
  try {
    return await upsertContactByEmail(email, properties)
  } catch (err) {
    if (!(err instanceof HubSpotError) || err.status !== 400) throw err
    const safe: Record<string, string> = {}
    for (const [k, v] of Object.entries(properties)) {
      if (!riskyKeys.includes(k)) safe[k] = v
    }
    return await upsertContactByEmail(email, safe)
  }
}

// ─── Companies ─────────────────────────────────────────────────────

export async function findCompanyByName(name: string): Promise<{ id: string } | null> {
  const data = await hsFetch('/crm/v3/objects/companies/search', {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [
        { filters: [{ propertyName: 'name', operator: 'EQ', value: name }] },
      ],
      properties: ['name'],
      limit: 1,
    }),
  })
  const hit = data.results?.[0]
  return hit ? { id: String(hit.id) } : null
}

export async function createCompany(properties: Record<string, string>): Promise<{ id: string }> {
  const data = await hsFetch('/crm/v3/objects/companies', {
    method: 'POST',
    body: JSON.stringify({ properties }),
  })
  return { id: String(data.id) }
}

export async function associateContactToCompany(contactId: string, companyId: string): Promise<void> {
  await hsFetch(
    `/crm/v4/objects/contacts/${contactId}/associations/default/companies/${companyId}`,
    { method: 'PUT' }
  )
}

// ─── Notes ─────────────────────────────────────────────────────────

const NOTE_TO_CONTACT_ASSOCIATION_TYPE_ID = 202

export async function createNoteForContact(contactId: string, html: string): Promise<void> {
  await hsFetch('/crm/v3/objects/notes', {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        hs_note_body: html,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: NOTE_TO_CONTACT_ASSOCIATION_TYPE_ID,
            },
          ],
        },
      ],
    }),
  })
}

// ─── Forms API (public, unauthenticated) ───────────────────────────

export type FormField = { objectTypeId: '0-1'; name: string; value: string }

/**
 * Submit to the public Forms API. Used to register attribution (hutk) and
 * consent the native way alongside the CRM upsert that carries the scores.
 */
export async function submitForm(args: {
  portalId: string
  formGuid: string
  region?: string
  fields: FormField[]
  context: { hutk?: string; pageUri?: string; pageName?: string }
  consentText?: string
}): Promise<void> {
  const region = args.region || process.env.HUBSPOT_REGION || 'eu1'
  const url = `https://api-${region}.hsforms.com/submissions/v3/integration/submit/${args.portalId}/${args.formGuid}`
  const payload: Record<string, unknown> = {
    submittedAt: Date.now(),
    fields: args.fields,
    context: args.context,
  }
  if (args.consentText) {
    payload.legalConsentOptions = {
      consent: { consentToProcess: true, text: args.consentText },
    }
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) {
    throw new HubSpotError(res.status, await res.text().catch(() => ''), 'forms-submit')
  }
}

// ─── Property setup (idempotent, used by /api/admin/hubspot-setup) ─

export async function ensureContactPropertyGroup(name: string, label: string): Promise<'created' | 'exists'> {
  try {
    await hsFetch('/crm/v3/properties/contacts/groups', {
      method: 'POST',
      body: JSON.stringify({ name, label }),
    })
    return 'created'
  } catch (err) {
    if (err instanceof HubSpotError && err.status === 409) return 'exists'
    throw err
  }
}

export type PropertyDef = {
  name: string
  label: string
  groupName: string
  type: 'string' | 'number' | 'enumeration' | 'datetime'
  fieldType: 'text' | 'number' | 'select' | 'radio' | 'date'
  options?: { label: string; value: string }[]
  description?: string
}

export async function ensureContactProperty(def: PropertyDef): Promise<'created' | 'exists'> {
  try {
    await hsFetch('/crm/v3/properties/contacts', {
      method: 'POST',
      body: JSON.stringify(def),
    })
    return 'created'
  } catch (err) {
    if (err instanceof HubSpotError && err.status === 409) return 'exists'
    throw err
  }
}
