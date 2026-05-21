import { customAlphabet } from 'nanoid'

// URL-safe alphabet, lowercase only — easier to dictate aloud.
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'

const submissionId = customAlphabet(alphabet, 12)
const sessionId = customAlphabet(alphabet, 8)

export function newSubmissionId(): string {
  return submissionId()
}

export function newSessionId(): string {
  return sessionId()
}
