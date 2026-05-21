import type { ToolId } from '@/app/deck/ToolMarks'

export type DimensionId = 'memory' | 'thinking' | 'deciding' | 'creating'

export type Bucket = 'nascent' | 'emerging' | 'operational' | 'advanced'

export type AnswerValue = 1 | 2 | 3 | 4 | 5 | null

export type OrgSize = '1' | '2-10' | '11-50' | '51-200' | '200+'

export type Source = 'self-serve' | 'facilitator'

export type Dimension = {
  id: DimensionId
  label: string
  colour: string
  blurb: string
}

export type Question = {
  id: string
  dimension: DimensionId
  prompt: string
  helper?: string
  anchors: { low: string; high: string }
  weight?: number
}

export type Answer = {
  questionId: string
  value: AnswerValue
}

export type DimensionScore = {
  dimension: DimensionId
  raw: number
  pct: number
  bucket: Bucket
  answered: number
}

export type ScoreResult = {
  byDimension: Record<DimensionId, DimensionScore>
  overall: { pct: number; bucket: Bucket }
}

export type Recommendation = {
  dimension: DimensionId
  bucket: Bucket
  headline: string
  body: string
  tools: ToolId[]
  workflowSteps?: string[]
}

export type Submission = {
  id: string
  createdAt: string
  email: string
  name?: string
  orgName?: string
  orgSize?: OrgSize
  source: Source
  sessionId?: string
  answers: Answer[]
  scores: ScoreResult
  narrative: string | null
  marketingOptIn: boolean
}

export type PublicSubmission = Omit<Submission, 'email'>
