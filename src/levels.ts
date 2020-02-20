import { Issue, Level, ParsedLevelToken, LEVELS } from './types'
import {
  tokenize,
  isAnnotationLevel,
  AnnotationLevel,
} from '@harveyr/github-actions-kit'

const BANDIT_LEVEL_DELIMITER = '-'
const ANNOTATION_LEVEL_DELIMITER = '|'

function parseToken(token: string): ParsedLevelToken {
  const errMessage = `Invalid level token: ${token}`

  const parts = token.split(ANNOTATION_LEVEL_DELIMITER)
  if (parts.length !== 2) {
    throw new Error(errMessage)
  }

  const annotationLevel = parts[1] as AnnotationLevel
  if (!isAnnotationLevel(annotationLevel)) {
    throw new Error(
      errMessage + ` (invalid annotation level: ${annotationLevel})`,
    )
  }

  const banditParts = parts[0].split(BANDIT_LEVEL_DELIMITER) as Level[]
  if (banditParts.length !== 2) {
    throw new Error(errMessage)
  }
  banditParts.forEach(level => {
    if (!LEVELS.includes(level)) {
      throw new Error(errMessage + ` (invalid level: ${level})`)
    }
  })
  const [severity, confidence] = banditParts

  return { severity, confidence, annotationLevel, token }
}

export function processLevelInput(raw: string): ParsedLevelToken[] {
  return tokenize(raw).map(parseToken)
}

function getBanditTokenPrefix(issue: Issue): string {
  return [issue.issue_severity, issue.issue_confidence].join(
    BANDIT_LEVEL_DELIMITER,
  )
}

export function findParsedLevelForIssue(
  levels: ParsedLevelToken[],
  issue: Issue,
): ParsedLevelToken | undefined {
  const prefix = getBanditTokenPrefix(issue)
  return levels.find(level => {
    return level.token.indexOf(prefix) === 0
  })
}
