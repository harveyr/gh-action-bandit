import * as kit from '@harveyr/github-actions-kit'
import { Issue, IssueCounts, Level, Report, LEVELS } from './types'

interface RunArg {
  banditPath: string
  paths: string[]
  configFile?: string
}

interface RunResult {
  command: string
  stdout: string
  stderr: string
  report: Report
}

export async function runBandit(arg: RunArg): Promise<RunResult> {
  const { banditPath, paths, configFile } = arg
  let args = ['--format', 'json', '--quiet']
  if (configFile) {
    args = args.concat(['-c', configFile])
  }
  args = args.concat(paths)

  const { stdout, stderr } = await kit.execAndCapture(banditPath, args, {
    failOnStdErr: false,
  })

  let report: Report | undefined
  try {
    report = JSON.parse(stdout)
  } catch (err) {
    console.error(`Failed to parse output: ${stdout}`)
    throw err
  }
  if (!report) {
    throw new Error('Failed to get report')
  }

  return {
    stdout,
    stderr,
    report,
    command: [banditPath].concat(args).join(' '),
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
