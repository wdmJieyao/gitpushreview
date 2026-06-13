import test from 'node:test';
import assert from 'node:assert/strict';
import { renderReport } from '../src/format/report.js';

test('renderReport includes status and finding titles', () => {
  const text = renderReport({
    decision: { status: 'SOFT_BLOCK', totalScore: 70 },
    findings: [{ ruleId: 'A', title: 'Risky change', severity: 'high', file: 'a.js', line: 1, evidence: 'e', suggestion: 's' }],
  });
  assert.match(text, /SOFT_BLOCK/);
  assert.match(text, /Risky change/);
});
