/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {countIssues} from '../src/bandit'
import {Issue} from '../src/types'


test('test count issues', async () => {
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
    test_name: ''
  }

  const issues: Issue[] = [
    // 3 x low severity, low confidence
    {...baseIssue},
    {...baseIssue},
    {...baseIssue},
    // 2 x high severity, medium confidence
    {...baseIssue, issue_severity: 'HIGH', issue_confidence: "MEDIUM"},
    {...baseIssue, issue_severity: 'HIGH', issue_confidence: "MEDIUM"},
    // 1 x medium severity, high confidence
    {...baseIssue, issue_severity: 'MEDIUM', issue_confidence: "HIGH"},
  ]

  const result = countIssues(issues)

  expect(result.get('LOW')!.get('LOW')).toEqual(3)
  expect(result.get('HIGH')!.get('MEDIUM')).toEqual(2)
  expect(result.get('MEDIUM')!.get('HIGH')).toEqual(1)
  // Zero for these:
  expect(result.get('LOW')!.get('MEDIUM')).toEqual(0)
  expect(result.get('LOW')!.get('HIGH')).toEqual(0)
  expect(result.get('MEDIUM')!.get('LOW')).toEqual(0)
  expect(result.get('MEDIUM')!.get('MEDIUM')).toEqual(0)
  expect(result.get('HIGH')!.get('LOW')).toEqual(0)
  expect(result.get('HIGH')!.get('HIGH')).toEqual(0)
})
