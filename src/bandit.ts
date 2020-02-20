import * as kit from '@harveyr/github-actions-kit'
import { Issue, IssueCounts, Level, Report, LEVELS } from './types'

interface RunArg {
  banditPath: string
  paths: string[]
  format: 'csv' | 'html' | 'json' | 'screen' | 'txt' | 'xml' | 'yaml'
  configFile?: string
}

interface RunResult {
  stdout: string
  stderr: string
  report?: Report
}

export async function runBandit(arg: RunArg): Promise<RunResult> {
  const { banditPath, paths, configFile, format } = arg
  const isJson = format === 'json'

  let args = ['--format', format]
  if (isJson) {
    args.push('--quiet')
  }
  if (configFile) {
    args = args.concat(['-c', configFile])
  }
  args = args.concat(paths)

  const { stdout, stderr } = await kit.execAndCapture(banditPath, args, {
    failOnStdErr: false,
  })

  let report: Report | undefined
  if (isJson) {
    try {
      report = JSON.parse(stdout)
    } catch (err) {
      console.error(`Failed to parse output: ${stdout}`)
      throw err
    }
  }

  return {
    stdout,
    stderr,
    report,
  }
}

export function countIssues(issues: Issue[]): IssueCounts {
  const zeroedConfidenceCountMap: Map<Level, number> = new Map()
  LEVELS.forEach(confidence => {
    zeroedConfidenceCountMap.set(confidence, 0)
  })

  const issuesBySeverity: IssueCounts = new Map()

  issues.forEach(issue => {
    const severity: Level = issue.issue_severity
    const confidence: Level = issue.issue_confidence
    const severityMap =
      issuesBySeverity.get(severity) || new Map(zeroedConfidenceCountMap)
    const confidenceCount = severityMap.get(confidence) || 0

    severityMap.set(confidence, confidenceCount + 1)
    issuesBySeverity.set(severity, severityMap)
  })

  return issuesBySeverity
}
