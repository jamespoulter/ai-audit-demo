import { NextResponse } from 'next/server'
import {
  addOrgMember,
  createSubmission,
  getOrCreateUserByEmail,
  getOrg,
  setSubmissionOrg,
} from '@/app/audit/lib/db'
import { newSubmissionId } from '@/app/audit/lib/ids'
import { score, validateAnswers } from '@/app/audit/lib/scoring'
import {
  clearPendingInviteOrg,
  getPendingInviteOrg,
} from '@/app/audit/lib/invite-context'
import type { OrgSize, Source, Submission } from '@/app/audit/lib/types'

export const runtime = 'nodejs'

const VALID_ORG_SIZES: OrgSize[] = ['1', '2-10', '11-50', '51-200', '200+']
const VALID_SOURCES: Source[] = ['self-serve', 'facilitator']

function isEmail(s: unknown): s is string {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (!isEmail(body.email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }
  if (!validateAnswers(body.answers)) {
    return NextResponse.json({ error: 'invalid_answers' }, { status: 400 })
  }

  const source: Source = VALID_SOURCES.includes(body.source) ? body.source : 'self-serve'
  const orgSize: OrgSize | undefined = VALID_ORG_SIZES.includes(body.orgSize) ? body.orgSize : undefined

  const scores = score(body.answers)

  const submission: Submission = {
    id: newSubmissionId(),
    createdAt: new Date().toISOString(),
    email: body.email,
    name: typeof body.name === 'string' && body.name ? body.name.slice(0, 200) : undefined,
    orgName: typeof body.orgName === 'string' && body.orgName ? body.orgName.slice(0, 200) : undefined,
    orgSize,
    source,
    sessionId: typeof body.sessionId === 'string' ? body.sessionId : undefined,
    answers: body.answers,
    scores,
    narrative: null,
    marketingOptIn: Boolean(body.marketingOptIn),
  }

  try {
    const user = await getOrCreateUserByEmail(submission.email, submission.name)
    await createSubmission(submission, user.id)

    const pendingOrgId = getPendingInviteOrg()
    if (pendingOrgId) {
      const org = await getOrg(pendingOrgId)
      if (org) {
        await setSubmissionOrg(submission.id, org.id)
        await addOrgMember(org.id, user.id, 'member')
      }
      clearPendingInviteOrg()
    }
  } catch (err) {
    console.error('[audit/submit] db error', err)
    return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 })
  }

  return NextResponse.json({ id: submission.id })
}
