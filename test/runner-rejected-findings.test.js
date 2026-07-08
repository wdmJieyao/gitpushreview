import test from 'node:test';
import assert from 'node:assert/strict';
import { makeInitializedWorkspace } from './helpers/workspace.js';
import { acceptedFinding, modelJson, rejectedFinding } from './helpers/review-fixtures.js';
import { runReview } from '../src/review/runner.js';

test('runReview rejects model findings outside routed candidate rules', async () => {
  const { dir } = await makeInitializedWorkspace({ prefix: 'gpr-runner-reject-' });

  const result = await runReview({
    cwd: dir,
    diff: 'diff --git a/src/main/resources/application-prod.yml b/src/main/resources/application-prod.yml\n+spring.application.name: app\n+management.endpoints.web.exposure.include: "*"\n',
    files: ['src/main/resources/application-prod.yml'],
    fileContents: { 'src/main/resources/application-prod.yml': 'spring.application.name: app\nmanagement.endpoints.web.exposure.include: "*"\n' },
    modelInvoker: async () => modelJson([
      acceptedFinding({ ruleId: 'DEFAULT-JAVA-SPR-005', score: 85, weightedScore: 85, blocking: 'hard' }),
      rejectedFinding({ ruleId: 'DEFAULT-MYSQL-DML-001', score: 100, weightedScore: 100, blocking: 'hard' }),
    ]),
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  });

  assert.deepEqual(result.findings.map((finding) => finding.ruleId), ['DEFAULT-JAVA-SPR-005']);
  assert.deepEqual(result.rejectedFindings.map((finding) => finding.ruleId), ['DEFAULT-MYSQL-DML-001']);
  assert.equal(result.rejectedFindings[0].rejectReason, 'rule-not-in-candidate-set');
  assert.ok(result.candidateRuleIds.includes('DEFAULT-JAVA-SPR-005'));
  assert.equal(result.candidateRuleIds.includes('DEFAULT-MYSQL-DML-001'), false);
  assert.equal(typeof result.candidateSummary.selectedRules, 'number');
  assert.equal(result.decision.status, 'SOFT_BLOCK');
});

test('runReview rejected findings do not affect final block status', async () => {
  const { dir } = await makeInitializedWorkspace({ prefix: 'gpr-runner-reject-pass-' });

  const result = await runReview({
    cwd: dir,
    diff: 'diff --git a/README.md b/README.md\n+plain notes\n',
    files: ['README.md'],
    fileContents: { 'README.md': 'plain notes\n' },
    modelInvoker: async () => modelJson([
      rejectedFinding({ ruleId: 'DEFAULT-MYSQL-DML-001', score: 100, weightedScore: 100, blocking: 'hard' }),
    ]),
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  });

  assert.deepEqual(result.findings, []);
  assert.equal(result.rejectedFindings.length, 1);
  assert.equal(result.decision.status, 'PASS');
});
