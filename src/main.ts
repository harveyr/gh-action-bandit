import * as core from '@actions/core'
import * as kit from '@harveyr/github-actions-kit'
import { runBandit } from './bandit'
import { processLevelInput } from './levels'
import { postAnnotations } from './github'
import { getAnnotation } from './translate'

async function run(): Promise<void> {
  const paths = kit.tokenize(kit.getInputSafe('paths', { required: true }))
  const levels = processLevelInput(
    kit.getInputSafe('annotation-levels', { required: true }),
  )
  console.log('FIXME: levels', JSON.stringify(levels))

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
  if (!issues.length) {
    core.info('Bandit found no issues')
    return
  }

  const annotations = issues.map(issue => {
    return getAnnotation({
      issue,
      levels,
    })
  })

  if (githubToken) {
    await postAnnotations({
      githubToken,
      command,
      annotations,
      text: result.stderr + JSON.stringify(issues, null, 2),
    })
  } else {
    core.warning('Not posting annotations because no GitHub token provided')
  }

  if (issues.length) {
    core.setFailed(`Bandit reported ${issues.length} issues`)
  }
}

run().catch(err => {
  core.setFailed(`${err}`)
})
