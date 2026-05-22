import { redirect } from 'next/navigation'
import Link from 'next/link'
import { acceptInvite, addOrgMember, getInvite, getOrg } from '@/app/audit/lib/db'
import { setPendingInviteOrg } from '@/app/audit/lib/invite-context'
import { getCurrentUser } from '@/app/auth/lib/session'

export const dynamic = 'force-dynamic'

type Params = { token: string }

export default async function InvitePage({ params }: { params: Params }) {
  const invite = await getInvite(params.token)

  if (!invite) {
    return (
      <main className="audit-shell">
        <div className="audit-container audit-container-narrow">
          <h1 className="audit-h2">Invite not found</h1>
          <p className="audit-lede-small">This invite link is invalid or has been revoked.</p>
          <div className="audit-cta-row">
            <Link href="/audit" className="audit-cta audit-cta-primary">Take the audit anyway →</Link>
          </div>
        </div>
      </main>
    )
  }

  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
    return (
      <main className="audit-shell">
        <div className="audit-container audit-container-narrow">
          <h1 className="audit-h2">Invite expired</h1>
          <p className="audit-lede-small">Ask the person who invited you for a fresh link.</p>
          <div className="audit-cta-row">
            <Link href="/audit" className="audit-cta audit-cta-primary">Take the audit anyway →</Link>
          </div>
        </div>
      </main>
    )
  }

  const org = await getOrg(invite.orgId)
  if (!org) {
    return (
      <main className="audit-shell">
        <div className="audit-container audit-container-narrow">
          <h1 className="audit-h2">Invite no longer valid</h1>
          <p className="audit-lede-small">The team that sent this invite no longer exists.</p>
        </div>
      </main>
    )
  }

  // Stamp a cookie so /api/audit/submit can tag the resulting submission with
  // org_id when the user finishes. Works for both anonymous and signed-in users.
  setPendingInviteOrg(org.id)

  // If the user is already signed in, also add them to the org membership immediately
  // and mark the invite accepted.
  const user = await getCurrentUser()
  if (user) {
    await addOrgMember(org.id, user.id, 'member')
    if (!invite.acceptedAt) await acceptInvite(invite.token, user.id)
  }

  // Send them straight into the audit.
  redirect('/audit')
}
