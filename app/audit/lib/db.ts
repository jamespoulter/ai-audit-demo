import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import type { Submission, PublicSubmission } from './types'

let cachedSql: NeonQueryFunction<false, false> | null = null

function getSql(): NeonQueryFunction<false, false> {
  if (cachedSql) return cachedSql
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'POSTGRES_URL (or DATABASE_URL) is not set. Provision a Neon-backed Postgres instance and add the connection string to .env.local.'
    )
  }
  cachedSql = neon(url)
  return cachedSql
}

let initPromise: Promise<void> | null = null

/**
 * Idempotent schema bootstrap — runs once per process on first request.
 * Cheap on Postgres (CREATE TABLE IF NOT EXISTS), saves us a separate
 * migration step for the v1 micro app.
 */
async function ensureSchema(): Promise<void> {
  const sql = getSql()
  await sql`
    create table if not exists submissions (
      id               text primary key,
      created_at       timestamptz not null default now(),
      email            text not null,
      name             text,
      org_name         text,
      org_size         text,
      source           text not null,
      session_id       text,
      answers          jsonb not null,
      scores           jsonb not null,
      narrative        text,
      marketing_opt_in boolean not null default false
    );
  `
  await sql`create index if not exists submissions_email_idx   on submissions (email);`
  await sql`create index if not exists submissions_session_idx on submissions (session_id);`

  await sql`
    create table if not exists facilitator_sessions (
      session_id  text primary key,
      created_at  timestamptz not null default now(),
      label       text,
      answers     jsonb not null default '{}'::jsonb
    );
  `

  // ── Phase A: accounts ───────────────────────────────────────────
  await sql`
    create table if not exists users (
      id          text primary key,
      email       text not null unique,
      name        text,
      created_at  timestamptz not null default now()
    );
  `
  await sql`
    create table if not exists auth_tokens (
      token       text primary key,
      email       text not null,
      created_at  timestamptz not null default now(),
      expires_at  timestamptz not null,
      used_at     timestamptz
    );
  `
  await sql`create index if not exists auth_tokens_email_idx on auth_tokens (email);`
  await sql`
    create table if not exists sessions (
      token       text primary key,
      user_id     text not null references users(id) on delete cascade,
      created_at  timestamptz not null default now(),
      expires_at  timestamptz not null
    );
  `
  await sql`create index if not exists sessions_user_idx on sessions (user_id);`
  await sql`alter table submissions add column if not exists user_id text;`
  await sql`create index if not exists submissions_user_idx on submissions (user_id);`

  // ── Phase B: orgs ───────────────────────────────────────────────
  await sql`
    create table if not exists orgs (
      id              text primary key,
      name            text not null,
      created_at      timestamptz not null default now(),
      created_by      text not null references users(id) on delete restrict
    );
  `
  await sql`
    create table if not exists org_members (
      org_id      text not null references orgs(id) on delete cascade,
      user_id     text not null references users(id) on delete cascade,
      role        text not null default 'member',
      created_at  timestamptz not null default now(),
      primary key (org_id, user_id)
    );
  `
  await sql`create index if not exists org_members_user_idx on org_members (user_id);`
  await sql`alter table submissions add column if not exists org_id text;`
  await sql`create index if not exists submissions_org_idx on submissions (org_id);`

  // ── Phase C: invites ────────────────────────────────────────────
  await sql`
    create table if not exists org_invites (
      token       text primary key,
      org_id      text not null references orgs(id) on delete cascade,
      email       text,
      created_by  text not null references users(id) on delete cascade,
      created_at  timestamptz not null default now(),
      expires_at  timestamptz,
      accepted_by text references users(id),
      accepted_at timestamptz
    );
  `
  await sql`create index if not exists org_invites_org_idx on org_invites (org_id);`

  // ── HubSpot sync queue ──────────────────────────────────────────
  await sql`
    create table if not exists hubspot_sync_queue (
      submission_id  text primary key,
      status         text not null default 'pending',
      attempts       int  not null default 0,
      last_error     text,
      attribution    jsonb,
      origin         text,
      created_at     timestamptz not null default now(),
      updated_at     timestamptz not null default now()
    );
  `
  await sql`create index if not exists hubspot_queue_status_idx on hubspot_sync_queue (status);`
}

function ensureReady(): Promise<void> {
  if (!initPromise) initPromise = ensureSchema()
  return initPromise
}

export async function createSubmission(s: Submission, userId: string | null = null): Promise<void> {
  await ensureReady()
  const sql = getSql()
  await sql`
    insert into submissions (
      id, created_at, email, name, org_name, org_size,
      source, session_id, answers, scores, narrative, marketing_opt_in, user_id
    ) values (
      ${s.id}, ${s.createdAt}, ${s.email}, ${s.name ?? null}, ${s.orgName ?? null}, ${s.orgSize ?? null},
      ${s.source}, ${s.sessionId ?? null}, ${JSON.stringify(s.answers)}::jsonb,
      ${JSON.stringify(s.scores)}::jsonb, ${s.narrative}, ${s.marketingOptIn}, ${userId}
    )
  `
}

export type UserRow = {
  id: string
  email: string
  name: string | null
  createdAt: string
}

export async function getOrCreateUserByEmail(email: string, name?: string): Promise<UserRow> {
  await ensureReady()
  const sql = getSql()
  const normalised = email.trim().toLowerCase()

  const existing = await sql`select * from users where email = ${normalised} limit 1` as Record<string, unknown>[]
  if (existing.length > 0) {
    const u = existing[0]
    if (name && !u.name) {
      await sql`update users set name = ${name} where id = ${u.id as string}`
      u.name = name
    }
    return rowToUser(u)
  }

  const { newSubmissionId } = await import('./ids')
  const id = newSubmissionId()
  const created = await sql`
    insert into users (id, email, name) values (${id}, ${normalised}, ${name ?? null})
    returning *
  ` as Record<string, unknown>[]
  return rowToUser(created[0])
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`select * from users where email = ${email.trim().toLowerCase()} limit 1` as Record<string, unknown>[]
  return rows.length > 0 ? rowToUser(rows[0]) : null
}

export async function getUserById(id: string): Promise<UserRow | null> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`select * from users where id = ${id} limit 1` as Record<string, unknown>[]
  return rows.length > 0 ? rowToUser(rows[0]) : null
}

export async function listSubmissionsForUser(user: UserRow): Promise<Submission[]> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`
    select * from submissions
    where user_id = ${user.id} or email = ${user.email}
    order by created_at desc
  ` as Record<string, unknown>[]
  return rows.map(rowToSubmission)
}

// ─── Magic-link tokens ─────────────────────────────────────────────
export async function createAuthToken(token: string, email: string, ttlSeconds: number): Promise<void> {
  await ensureReady()
  const sql = getSql()
  const expires = new Date(Date.now() + ttlSeconds * 1000).toISOString()
  await sql`
    insert into auth_tokens (token, email, expires_at)
    values (${token}, ${email.trim().toLowerCase()}, ${expires})
  `
}

export async function consumeAuthToken(token: string): Promise<{ email: string } | null> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`
    select * from auth_tokens
    where token = ${token}
      and used_at is null
      and expires_at > now()
    limit 1
  ` as Record<string, unknown>[]
  if (rows.length === 0) return null
  await sql`update auth_tokens set used_at = now() where token = ${token}`
  return { email: rows[0].email as string }
}

// ─── Sessions ──────────────────────────────────────────────────────
export async function createSessionToken(token: string, userId: string, ttlSeconds: number): Promise<void> {
  await ensureReady()
  const sql = getSql()
  const expires = new Date(Date.now() + ttlSeconds * 1000).toISOString()
  await sql`
    insert into sessions (token, user_id, expires_at)
    values (${token}, ${userId}, ${expires})
  `
}

export async function getSessionUser(token: string): Promise<UserRow | null> {
  if (!token) return null
  await ensureReady()
  const sql = getSql()
  const rows = await sql`
    select u.* from sessions s
    join users u on u.id = s.user_id
    where s.token = ${token} and s.expires_at > now()
    limit 1
  ` as Record<string, unknown>[]
  return rows.length > 0 ? rowToUser(rows[0]) : null
}

export async function deleteSession(token: string): Promise<void> {
  if (!token) return
  await ensureReady()
  const sql = getSql()
  await sql`delete from sessions where token = ${token}`
}

function rowToUser(row: Record<string, unknown>): UserRow {
  return {
    id: row.id as string,
    email: row.email as string,
    name: (row.name as string | null) ?? null,
    createdAt: new Date(row.created_at as string).toISOString(),
  }
}

export async function getSubmission(id: string): Promise<Submission | null> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`select * from submissions where id = ${id} limit 1` as Record<string, unknown>[]
  if (rows.length === 0) return null
  return rowToSubmission(rows[0])
}

export async function getPublicSubmission(id: string): Promise<PublicSubmission | null> {
  const s = await getSubmission(id)
  if (!s) return null
  const { email, ...rest } = s
  return rest
}

export async function updateNarrative(id: string, narrative: string): Promise<void> {
  await ensureReady()
  const sql = getSql()
  await sql`update submissions set narrative = ${narrative} where id = ${id}`
}

function rowToSubmission(row: Record<string, unknown>): Submission {
  return {
    id: row.id as string,
    createdAt: new Date(row.created_at as string).toISOString(),
    email: row.email as string,
    name: (row.name as string) ?? undefined,
    orgName: (row.org_name as string) ?? undefined,
    orgSize: (row.org_size as Submission['orgSize']) ?? undefined,
    source: row.source as Submission['source'],
    sessionId: (row.session_id as string) ?? undefined,
    answers: row.answers as Submission['answers'],
    scores: row.scores as Submission['scores'],
    narrative: (row.narrative as string) ?? null,
    marketingOptIn: Boolean(row.marketing_opt_in),
  }
}

// ─── Orgs ──────────────────────────────────────────────────────────
export type OrgRow = {
  id: string
  name: string
  createdAt: string
  createdBy: string
}

export type OrgMember = {
  orgId: string
  userId: string
  role: 'admin' | 'member'
  createdAt: string
  email: string
  name: string | null
}

export async function createOrg(name: string, userId: string): Promise<OrgRow> {
  await ensureReady()
  const sql = getSql()
  const { newSubmissionId } = await import('./ids')
  const id = newSubmissionId()
  const rows = await sql`
    insert into orgs (id, name, created_by) values (${id}, ${name}, ${userId})
    returning *
  ` as Record<string, unknown>[]
  await sql`
    insert into org_members (org_id, user_id, role) values (${id}, ${userId}, 'admin')
    on conflict do nothing
  `
  return rowToOrg(rows[0])
}

export async function addOrgMember(orgId: string, userId: string, role: 'admin' | 'member' = 'member'): Promise<void> {
  await ensureReady()
  const sql = getSql()
  await sql`
    insert into org_members (org_id, user_id, role)
    values (${orgId}, ${userId}, ${role})
    on conflict (org_id, user_id) do nothing
  `
}

export async function getOrg(id: string): Promise<OrgRow | null> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`select * from orgs where id = ${id} limit 1` as Record<string, unknown>[]
  return rows.length > 0 ? rowToOrg(rows[0]) : null
}

export async function listOrgsForUser(userId: string): Promise<Array<OrgRow & { role: string }>> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`
    select o.*, m.role as member_role
    from orgs o
    join org_members m on m.org_id = o.id
    where m.user_id = ${userId}
    order by o.created_at desc
  ` as Record<string, unknown>[]
  return rows.map(r => ({ ...rowToOrg(r), role: r.member_role as string }))
}

export async function listMembers(orgId: string): Promise<OrgMember[]> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`
    select m.*, u.email, u.name
    from org_members m
    join users u on u.id = m.user_id
    where m.org_id = ${orgId}
    order by m.created_at asc
  ` as Record<string, unknown>[]
  return rows.map(r => ({
    orgId: r.org_id as string,
    userId: r.user_id as string,
    role: r.role as 'admin' | 'member',
    createdAt: new Date(r.created_at as string).toISOString(),
    email: r.email as string,
    name: (r.name as string | null) ?? null,
  }))
}

export async function isMember(orgId: string, userId: string): Promise<boolean> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`select 1 from org_members where org_id = ${orgId} and user_id = ${userId}` as Record<string, unknown>[]
  return rows.length > 0
}

export async function setSubmissionOrg(submissionId: string, orgId: string): Promise<void> {
  await ensureReady()
  const sql = getSql()
  await sql`update submissions set org_id = ${orgId} where id = ${submissionId}`
}

export async function listSubmissionsForOrg(orgId: string): Promise<Submission[]> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`
    select * from submissions
    where org_id = ${orgId}
    order by created_at desc
  ` as Record<string, unknown>[]
  return rows.map(rowToSubmission)
}

function rowToOrg(row: Record<string, unknown>): OrgRow {
  return {
    id: row.id as string,
    name: row.name as string,
    createdAt: new Date(row.created_at as string).toISOString(),
    createdBy: row.created_by as string,
  }
}

// ─── HubSpot sync queue ────────────────────────────────────────────
export type HubspotQueueRow = {
  submissionId: string
  status: 'pending' | 'done' | 'error'
  attempts: number
  lastError: string | null
  attribution: Record<string, string> | null
  origin: string | null
}

export async function enqueueHubspotSync(
  submissionId: string,
  attribution: Record<string, string> | null,
  origin: string
): Promise<void> {
  await ensureReady()
  const sql = getSql()
  await sql`
    insert into hubspot_sync_queue (submission_id, attribution, origin)
    values (${submissionId}, ${attribution ? JSON.stringify(attribution) : null}::jsonb, ${origin})
    on conflict (submission_id) do update
      set status = 'pending', updated_at = now()
  `
}

export async function markHubspotSync(
  submissionId: string,
  status: 'done' | 'error',
  error?: string
): Promise<void> {
  await ensureReady()
  const sql = getSql()
  await sql`
    update hubspot_sync_queue
    set status = ${status},
        attempts = attempts + 1,
        last_error = ${error ?? null},
        updated_at = now()
    where submission_id = ${submissionId}
  `
}

const MAX_SYNC_ATTEMPTS = 6

export async function listPendingHubspotSync(limit: number): Promise<HubspotQueueRow[]> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`
    select * from hubspot_sync_queue
    where status in ('pending', 'error') and attempts < ${MAX_SYNC_ATTEMPTS}
    order by updated_at asc
    limit ${limit}
  ` as Record<string, unknown>[]
  return rows.map(r => ({
    submissionId: r.submission_id as string,
    status: r.status as HubspotQueueRow['status'],
    attempts: r.attempts as number,
    lastError: (r.last_error as string | null) ?? null,
    attribution: (r.attribution as Record<string, string> | null) ?? null,
    origin: (r.origin as string | null) ?? null,
  }))
}

/** Backfill helper: queue every submission that has never been synced. */
export async function enqueueUnsyncedSubmissions(origin: string): Promise<number> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`
    insert into hubspot_sync_queue (submission_id, origin)
    select s.id, ${origin} from submissions s
    left join hubspot_sync_queue q on q.submission_id = s.id
    where q.submission_id is null
    returning submission_id
  ` as Record<string, unknown>[]
  return rows.length
}

// ─── Invites ───────────────────────────────────────────────────────
export type InviteRow = {
  token: string
  orgId: string
  email: string | null
  createdBy: string
  createdAt: string
  expiresAt: string | null
  acceptedBy: string | null
  acceptedAt: string | null
}

export async function createInvite(args: {
  token: string
  orgId: string
  email?: string | null
  createdBy: string
  ttlSeconds?: number
}): Promise<void> {
  await ensureReady()
  const sql = getSql()
  const expires = args.ttlSeconds
    ? new Date(Date.now() + args.ttlSeconds * 1000).toISOString()
    : null
  await sql`
    insert into org_invites (token, org_id, email, created_by, expires_at)
    values (${args.token}, ${args.orgId}, ${args.email ?? null}, ${args.createdBy}, ${expires})
  `
}

export async function getInvite(token: string): Promise<InviteRow | null> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`select * from org_invites where token = ${token} limit 1` as Record<string, unknown>[]
  if (rows.length === 0) return null
  const r = rows[0]
  return {
    token: r.token as string,
    orgId: r.org_id as string,
    email: (r.email as string | null) ?? null,
    createdBy: r.created_by as string,
    createdAt: new Date(r.created_at as string).toISOString(),
    expiresAt: r.expires_at ? new Date(r.expires_at as string).toISOString() : null,
    acceptedBy: (r.accepted_by as string | null) ?? null,
    acceptedAt: r.accepted_at ? new Date(r.accepted_at as string).toISOString() : null,
  }
}

export async function acceptInvite(token: string, userId: string): Promise<void> {
  await ensureReady()
  const sql = getSql()
  await sql`
    update org_invites
    set accepted_by = ${userId}, accepted_at = now()
    where token = ${token}
  `
}

export async function listInvitesForOrg(orgId: string): Promise<InviteRow[]> {
  await ensureReady()
  const sql = getSql()
  const rows = await sql`
    select * from org_invites
    where org_id = ${orgId}
    order by created_at desc
  ` as Record<string, unknown>[]
  return rows.map(r => ({
    token: r.token as string,
    orgId: r.org_id as string,
    email: (r.email as string | null) ?? null,
    createdBy: r.created_by as string,
    createdAt: new Date(r.created_at as string).toISOString(),
    expiresAt: r.expires_at ? new Date(r.expires_at as string).toISOString() : null,
    acceptedBy: (r.accepted_by as string | null) ?? null,
    acceptedAt: r.accepted_at ? new Date(r.accepted_at as string).toISOString() : null,
  }))
}
