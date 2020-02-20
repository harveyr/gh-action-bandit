import * as core from '@actions/core'
import * as kit from '@harveyr/github-actions-kit'
import { countIssues, runBandit } from './bandit'
import { Issue, IssueCounts } from './types'

interface Conclusion {
  conclusion: kit.CheckRunConclusion
  summary: string
}

function getConclusion(issueCounts: IssueCounts): Conclusion {
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

function getAnnotationLevel(issue: Issue): kit.AnnotationLevel {
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

interface PostAnnotationsArg {
  issues: Issue[]
  text: string
  githubToken: string
}

async function postAnnotations(arg: PostAnnotationsArg): Promise<void> {
  const { githubToken, issues } = arg

  const counts = countIssues(issues)
  const { conclusion, summary } = getConclusion(counts)

  const annotations: kit.CheckRunAnnotation[] = issues.map(issue => {
    const level = getAnnotationLevel(issue)
    const message = [
      `ID: ${issue.test_id}`,
      `Name: ${issue.test_name}`,
      `Severity: ${issue.issue_severity}`,
      `Confidence: ${issue.issue_confidence}`,
    ].join(' | ')
    return {
      level,
      startLine: issue.line_number,
      endLine: Math.max(...issue.line_range),
      path: issue.filename,
      title: issue.issue_text,
      message,
    }
  })

  console.log(
    'Posting %s annotations with conclusion "%s"',
    annotations.length,
    conclusion,
  )
  await kit.postCheckRun({
    githubToken,
    name: 'Bandit',
    conclusion,
    summary,
    annotations,
    text: JSON.stringify(issues, null, 2),
  })
}

async function run(): Promise<void> {
  const paths = kit
    .getInputSafe('paths', { required: true })
    .split(' ')
    .filter(path => {
      return path.trim()
    })
    .filter(path => {
      return Boolean(path)
    })

  const banditPath = kit.getInputSafe('bandit-path', { required: true })
  const configFile = kit.getInputSafe('config-file', { required: false })
  const githubToken = kit.getInputSafe('github-token', { required: false })

  const result = await runBandit({
    banditPath,
    paths,
    format: 'yaml',
    configFile,
  })
  const { report } = result

  const errors = report?.errors || []
  if (errors.length) {
    console.error(`Bandit reported errors: ${JSON.stringify(errors)}`)
    core.setFailed(`Bandit reported errors`)
  }

  const issues = report?.results || []
  if (issues.length) {
    if (githubToken) {
      await postAnnotations({
        githubToken,
        issues,
        text: result.stderr + result.stdout,
      })
    } else {
      core.warning('Not posting annotations because no GitHub token provided')
    }
  }

  if (issues.length) {
    core.setFailed(`Bandit reported ${issues.length} issues`)
  }
}

run().catch(err => {
  core.setFailed(`${err}`)
})
