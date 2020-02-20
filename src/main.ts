import * as core from '@actions/core'
import * as kit from '@harveyr/github-actions-kit'
import { countIssues, runBandit } from './bandit'
import { getAnnotation, getConclusion } from './translate'
import { Issue } from './types'
import { codeBlock } from './markdown'
import { processLevelInput } from './levels'

interface PostAnnotationsArg {
  command: string
  text: string
  issues: Issue[]
  githubToken: string
}

async function postAnnotations(arg: PostAnnotationsArg): Promise<void> {
  const { githubToken, command, text, issues } = arg

  const counts = countIssues(issues)
  const { conclusion, summary: conclusionSummary } = getConclusion(counts)
  const annotations: kit.CheckRunAnnotation[] = issues.map(getAnnotation)

  const summary = [
    conclusionSummary,
    '\n',
    'Ran command:',
    codeBlock(command),
  ].join('\n')

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
    text: codeBlock(text),
  })
}

async function run(): Promise<void> {
  const paths = kit.tokenize(kit.getInputSafe('paths', { required: true }))
  const levels = processLevelInput(
    kit.getInputSafe('annotation-levels', { required: true }),
  )
  console.log('levels', levels)

  if (!paths.length) {
    core.warning('No paths provided. Not running Bandit.')
    return
  }

  const banditPath = kit.getInputSafe('bandit-path', { required: true })
  const configFile = kit.getInputSafe('config-file', { required: false })
  const githubToken = kit.getInputSafe('github-token', { required: false })

  const result = await runBandit({
    banditPath,
    paths,
    configFile,
  })
  const { command, report } = result

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
        command,
        issues,
        text: result.stderr + JSON.stringify(issues, null, 2),
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
