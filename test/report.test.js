import test from 'node:test';
import assert from 'node:assert/strict';
import { renderReport } from '../src/format/report.js';

test('renderReport includes status and finding titles', () => {
  const text = renderReport({
    decision: { status: 'SOFT_BLOCK', totalScore: 70 },
    findings: [{ ruleId: 'A', title: 'Risky change', severity: 'high', file: 'a.js', line: 1, evidence: 'e', suggestion: 's' }],
  });
  assert.match(text, /审核结果：软拦截/);
  assert.match(text, /总分：70/);
  assert.match(text, /\[高\] A Risky change/);
  assert.match(text, /位置：a.js:1/);
  assert.match(text, /证据：e/);
  assert.match(text, /修复建议：s/);
  assert.match(text, /Risky change/);
});


test('renderReport lists rejected findings with reject reasons', () => {
  const text = renderReport({
    decision: { status: 'PASS', totalScore: 0 },
    findings: [],
    rejectedFindings: [
      { ruleId: 'DEFAULT-MYSQL-DML-001', rejectReason: 'rule-not-in-candidate-set', title: '候选集外问题', file: 'db/test.sql' },
    ],
  });

  assert.match(text, /已拒绝候选集外模型问题：1/);
  assert.match(text, /DEFAULT-MYSQL-DML-001：rule-not-in-candidate-set/);
  assert.match(text, /db\/test\.sql/);
});
