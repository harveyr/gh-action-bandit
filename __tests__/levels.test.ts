/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { findParsedLevelForIssue, parseToken } from '../src/levels'
import { Issue } from '../src/types'

test('test parse token', async () => {
  expect(parseToken('MEDIUM-HIGH|notice')).toEqual({
    severity: 'MEDIUM',
    confidence: 'HIGH',
    annotationLevel: 'notice',
    token: 'MEDIUM-HIGH|notice',
  })
})

test('test find level or issue', async () => {
  const baseIssue: Issue = {
    code: 'asdf',
    filename: 'asdf',
    issue_confidence: 'LOW',
    issue_severity: 'LOW',
    issue_text: '',
    line_number: 1,
    line_range: [1],
    more_info: '',
    test_id: '',
    test_name: '',
  }

  expect(
    findParsedLevelForIssue({
      levels: [parseToken('MEDIUM-HIGH|failure')],
      issue: {
        ...baseIssue,
        issue_severity: 'MEDIUM',
        issue_confidence: 'HIGH',
      },
    }),
  ).toBeTruthy()

  // Now try it with a few items in the array. Second one matches.
  expect(
    findParsedLevelForIssue({
      levels: [
        parseToken('MEDIUM-LOW|failure'),
        parseToken('MEDIUM-HIGH|failure'),
      ],
      issue: {
        ...baseIssue,
        issue_severity: 'MEDIUM',
        issue_confidence: 'HIGH',
      },
    }),
  ).toBeTruthy()

  // Now test a miss
  expect(
    findParsedLevelForIssue({
      levels: [
        parseToken('MEDIUM-HIGH|failure'),
        parseToken('MEDIUM-LOW|failure'),
      ],
      issue: {
        ...baseIssue,
        issue_severity: 'MEDIUM',
        issue_confidence: 'MEDIUM',
      },
    }),
  ).toBeFalsy()
})
