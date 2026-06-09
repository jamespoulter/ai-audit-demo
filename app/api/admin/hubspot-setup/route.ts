import { NextResponse } from 'next/server'
import {
  ensureContactProperty,
  ensureContactPropertyGroup,
  hubspotEnabled,
  type PropertyDef,
} from '@/app/lib/hubspot'

export const runtime = 'nodejs'

const GROUP = 'ai_brain_audit'

const BAND_OPTIONS = ['Nascent', 'Emerging', 'Operational', 'Advanced'].map(b => ({
  label: b,
  value: b,
}))

const DIMENSION_OPTIONS = ['memory', 'thinking', 'deciding', 'creating'].map(d => ({
  label: d[0].toUpperCase() + d.slice(1),
  value: d,
}))

const PROPERTIES: PropertyDef[] = [
  { name: 'audit_overall_score', label: 'Audit — Overall score', groupName: GROUP, type: 'number', fieldType: 'number', description: '4AI Brain Audit overall score, 0–100.' },
  { name: 'audit_overall_band', label: 'Audit — Overall band', groupName: GROUP, type: 'enumeration', fieldType: 'select', options: BAND_OPTIONS },
  { name: 'audit_memory_score', label: 'Audit — Memory score', groupName: GROUP, type: 'number', fieldType: 'number' },
  { name: 'audit_thinking_score', label: 'Audit — Thinking score', groupName: GROUP, type: 'number', fieldType: 'number' },
  { name: 'audit_deciding_score', label: 'Audit — Deciding score', groupName: GROUP, type: 'number', fieldType: 'number' },
  { name: 'audit_creating_score', label: 'Audit — Creating score', groupName: GROUP, type: 'number', fieldType: 'number' },
  { name: 'audit_strongest_dimension', label: 'Audit — Strongest dimension', groupName: GROUP, type: 'enumeration', fieldType: 'select', options: DIMENSION_OPTIONS },
  { name: 'audit_weakest_dimension', label: 'Audit — Weakest dimension', groupName: GROUP, type: 'enumeration', fieldType: 'select', options: DIMENSION_OPTIONS, description: 'Drives the nurture-workflow branch.' },
  { name: 'audit_org_size', label: 'Audit — Org size', groupName: GROUP, type: 'enumeration', fieldType: 'select', options: ['1', '2-10', '11-50', '51-200', '200+'].map(v => ({ label: v, value: v })) },
  { name: 'audit_results_url', label: 'Audit — Results URL', groupName: GROUP, type: 'string', fieldType: 'text' },
  { name: 'audit_completed_at', label: 'Audit — Completed at', groupName: GROUP, type: 'datetime', fieldType: 'date' },
  // Used by the KT Claude Club waitlist form (kt-claude repo).
  {
    name: 'audience_type',
    label: 'Audience type',
    groupName: GROUP,
    type: 'enumeration',
    fieldType: 'radio',
    options: [
      'Solopreneur', 'Side-hustler', 'Freelancer',
      'Services business', 'Small-team founder', 'AI-curious beginner',
    ].map(v => ({ label: v, value: v })),
    description: 'Self-selected segment from the KT Claude Club waitlist form.',
  },
]

/**
 * One-off idempotent portal setup: creates the "AI Brain Audit" property
 * group and every property the sync writes. Safe to re-run.
 *
 *   curl -X POST https://<host>/api/admin/hubspot-setup \
 *        -H "authorization: Bearer $CRON_SECRET"
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!hubspotEnabled()) {
    return NextResponse.json({ error: 'HUBSPOT_ACCESS_TOKEN not set' }, { status: 503 })
  }

  const results: Record<string, string> = {}
  try {
    results[`group:${GROUP}`] = await ensureContactPropertyGroup(GROUP, 'AI Brain Audit')
    for (const def of PROPERTIES) {
      results[def.name] = await ensureContactProperty(def)
    }
  } catch (err) {
    console.error('[hubspot-setup] failed', err)
    return NextResponse.json({ error: String(err), results }, { status: 502 })
  }

  return NextResponse.json({ ok: true, results })
}
