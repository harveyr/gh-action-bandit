import { Conclusion, Issue, ParsedLevelToken } from './types'
import * as kit from '@harveyr/github-actions-kit'
import { findParsedLevelForIssue } from './levels'

interface GetAnnotationArg {
  issue: Issue
  levels: ParsedLevelToken[]
}

export function getAnnotationLevel(arg: GetAnnotationArg): kit.AnnotationLevel {
  const level = findParsedLevelForIssue(arg)
  return level?.annotationLevel || 'warning'
}

export function getConclusion(
  annotations: kit.CheckRunAnnotation[],
): Conclusion {
  const levels: Set<kit.AnnotationLevel> = new Set()
  annotations.forEach(a => {
    levels.add(a.level)
  })
  if (levels.has('failure')) {
    return {
      conclusion: 'failure',
      summary: 'At least one annotation has the "failure" level',
    }
  }
  if (levels.has('warning')) {
    return {
      conclusion: 'neutral',
      summary: 'At least one annotation has the "warning" level',
    }
  }

  return {
    conclusion: 'success',
    summary: 'All issues are below the "warning" level',
  }
}

interface GetAnnotationArg {
  issue: Issue
  levels: ParsedLevelToken[]
}

export function getAnnotation(arg: GetAnnotationArg): kit.CheckRunAnnotation {
  const { issue } = arg
  const level = getAnnotationLevel(arg)
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
