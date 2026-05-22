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
