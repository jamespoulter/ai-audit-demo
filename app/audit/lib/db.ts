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
}

function ensureReady(): Promise<void> {
  if (!initPromise) initPromise = ensureSchema()
  return initPromise
}

export async function createSubmission(s: Submission): Promise<void> {
  await ensureReady()
  const sql = getSql()
  await sql`
    insert into submissions (
      id, created_at, email, name, org_name, org_size,
      source, session_id, answers, scores, narrative, marketing_opt_in
    ) values (
      ${s.id}, ${s.createdAt}, ${s.email}, ${s.name ?? null}, ${s.orgName ?? null}, ${s.orgSize ?? null},
      ${s.source}, ${s.sessionId ?? null}, ${JSON.stringify(s.answers)}::jsonb,
      ${JSON.stringify(s.scores)}::jsonb, ${s.narrative}, ${s.marketingOptIn}
    )
  `
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
