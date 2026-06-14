import test from 'node:test';
import assert from 'node:assert/strict';
import { runRuleEvidence } from '../src/evidence/rule-evidence.js';

test('runRuleEvidence extracts rule-defined static evidence without deciding blocking', () => {
  const findings = runRuleEvidence({
    rules: [{ id: 'DIY-PAY-001', title: '支付回调必须幂等', severity: 'high', evidencePatterns: ['pay-callback|payment callback|检测到支付回调变更'] }],
    routes: [{ file: 'docs/payment.rulebook' }],
    fileContents: { 'docs/payment.rulebook': 'payment callback must be idempotent' },
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].source, 'static-evidence');
  assert.equal(findings[0].ruleId, 'DIY-PAY-001');
  assert.equal(findings[0].blocking, 'none');
  assert.equal(findings[0].score, 0);
  assert.match(findings[0].evidence, /支付回调/);
});


test('runRuleEvidence scans only files matched by the routed rule', () => {
  const findings = runRuleEvidence({
    rules: [{ id: 'DIY-PAY-001', title: '支付回调必须幂等', evidencePatterns: ['pay-callback|payment callback|检测到支付回调变更'] }],
    routes: [{ file: 'docs/payment.rulebook' }, { file: 'docs/notes.rulebook' }],
    fileContents: {
      'docs/payment.rulebook': 'payment callback must be idempotent',
      'docs/notes.rulebook': 'payment callback appears in unrelated notes',
    },
    ruleRouting: {
      matchesByRule: {
        'DIY-PAY-001': [{ file: 'docs/payment.rulebook', reason: 'signal-content' }],
      },
    },
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].file, 'docs/payment.rulebook');
});
