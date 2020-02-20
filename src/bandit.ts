import * as kit from '@harveyr/github-actions-kit'
import { Report } from './types'

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
