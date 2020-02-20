import { Issue, Level, IssueCounts as IssueCountMap, LEVELS } from './types'

export function countIssues(issues: Issue[]): IssueCountMap {
  const zeroedConfidenceCountMap: Map<Level, number> = new Map()
  LEVELS.forEach(confidence => {
    zeroedConfidenceCountMap.set(confidence, 0)
  })

  const issuesBySeverity: IssueCountMap = new Map()

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
