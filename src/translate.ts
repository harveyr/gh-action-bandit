import { Conclusion, Issue, IssueCounts } from './types'
import * as kit from '@harveyr/github-actions-kit'

export function getAnnotationLevel(issue: Issue): kit.AnnotationLevel {
  const { issue_severity, issue_confidence } = issue
  if (issue_severity === 'HIGH') {
    if (issue_confidence === 'HIGH' || issue_confidence === 'MEDIUM') {
      return 'failure'
    }
    return 'warning'
  }
  if (issue_severity === 'MEDIUM') {
    if (issue_confidence === 'HIGH') {
      return 'failure'
    }
    return 'warning'
  }

  // The low-severity issues I've seen are more of "FYI"-style notices than
  // danger warnings. Leaving them as "notice" for now.

  // Catch-all
  return 'notice'
}
export function getConclusion(issueCounts: IssueCounts): Conclusion {
  const high = issueCounts.get('HIGH')
  // Fail on any high-severity issues.
  if (high?.get('HIGH') || high?.get('MEDIUM') || high?.get('LOW')) {
    return {
      conclusion: 'failure',
      summary: 'Bandit reported high-severity issues',
    }
  }

  const medium = issueCounts.get('MEDIUM')
  if (medium?.get('HIGH') || medium?.get('MEDIUM')) {
    return {
      conclusion: 'neutral',
      summary:
        'Bandit reported medium-severity issues with high or medium confidence',
    }
  }
  if (medium?.get('LOW')) {
    return {
      conclusion: 'neutral',
      summary: 'Bandit reported medium-severity issues with low confidence',
    }
  }

  const low = issueCounts.get('LOW')
  if (low?.get('HIGH') || low?.get('MEDIUM')) {
    return {
      conclusion: 'neutral',
      summary:
        'Bandit reported low-severity issues with high or medium confidence',
    }
  }
  if (low?.get('LOW')) {
    return {
      conclusion: 'success',
      summary: 'Bandit reported low-severity issues with low confidence',
    }
  }

  return {
    conclusion: 'success',
    summary: 'Bandit reported nothing scary',
  }
}

export function getAnnotation(issue: Issue): kit.CheckRunAnnotation {
  const level = getAnnotationLevel(issue)
  const message =
    [
      `ID: ${issue.test_id}`,
      `Name: ${issue.test_name}`,
      `Severity: ${issue.issue_severity}`,
      `Confidence: ${issue.issue_confidence}`,
    ].join(' | ') + `\n${issue.more_info}`

  return {
    level,
    startLine: issue.line_number,
    endLine: Math.max(...issue.line_range),
    path: issue.filename,
    title: issue.issue_text,
    message,
  }
}
