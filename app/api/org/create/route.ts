import { NextResponse } from 'next/server'
import { createOrg } from '@/app/audit/lib/db'
import { getCurrentUser } from '@/app/auth/lib/session'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name || name.length > 200) {
    return NextResponse.json({ error: 'invalid_name' }, { status: 400 })
  }

  try {
    const org = await createOrg(name, user.id)
    return NextResponse.json({ id: org.id, name: org.name })
  } catch (err) {
    console.error('[org/create] db error', err)
    return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 })
  }
}
