import * as kit from '@harveyr/github-actions-kit'
import { codeBlock } from './markdown'
import { getConclusion } from './translate'

interface PostAnnotationsArg {
  command: string
  text: string
  annotations: kit.CheckRunAnnotation[]
  githubToken: string
}

export async function postAnnotations(arg: PostAnnotationsArg): Promise<void> {
  const { githubToken, annotations, command, text } = arg

  const { conclusion, summary: conclusionSummary } = getConclusion(annotations)

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
