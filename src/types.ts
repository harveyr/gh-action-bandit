import { CheckRunConclusion } from '@harveyr/github-actions-kit'

export type Level = 'LOW' | 'MEDIUM' | 'HIGH'

export const LEVELS: Level[] = ['LOW', 'MEDIUM', 'HIGH']

export type IssueCounts = Map<Level, Map<Level, number>>

export interface Report {
  errors: []
  generated_at: string
  metrics: {
    _totals: Metrics
    [filename: string]: Metrics
  }
  results: Issue[]
}

interface Metrics {
  'CONFIDENCE.HIGH': number
  'CONFIDENCE.LOW': number
  'CONFIDENCE.MEDIUM': number
  'CONFIDENCE.UNDEFINED': number
  'SEVERITY.HIGH': number
  'SEVERITY.LOW': number
  'SEVERITY.MEDIUM': number
  'SEVERITY.UNDEFINED': number
  loc: number
  nosec: number
}

export interface Issue {
  code: string
  filename: string
  issue_confidence: Level
  issue_severity: Level
  issue_text: string
  line_number: number
  line_range: number[]
  more_info: string
  test_id: string
  test_name: string
}

export interface Conclusion {
  conclusion: CheckRunConclusion
  summary: string
}
