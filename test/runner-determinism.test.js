import test from 'node:test';
import assert from 'node:assert/strict';
import { makeInitializedWorkspace } from './helpers/workspace.js';
import { acceptedFinding, modelJson, rejectedFinding } from './helpers/review-fixtures.js';
import { runReview } from '../src/review/runner.js';

test('runReview returns stable candidates, accepted IDs, rejected IDs, and status for repeated input', async () => {
  const { dir } = await makeInitializedWorkspace({ prefix: 'gpr-runner-stable-' });
  const input = {
    cwd: dir,
    diff: 'diff --git a/src/main/java/App.java b/src/main/java/App.java\n+class App {}\n',
    files: ['src/main/java/App.java'],
    fileContents: { 'src/main/java/App.java': 'class App {}\n' },
    modelInvoker: async () => modelJson([
      rejectedFinding({ ruleId: 'DEFAULT-MYSQL-DML-001', score: 100, weightedScore: 100, blocking: 'hard' }),
      acceptedFinding({ ruleId: 'DEFAULT-JAVA-SPR-005', score: 85, weightedScore: 85, blocking: 'hard' }),
    ]),
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  };

  const runs = [];
  for (let index = 0; index < 10; index += 1) {
    const result = await runReview(input);
    runs.push({
      selected: result.ruleRouting.decisions.filter((item) => item.matched).map((item) => item.ruleId),
      accepted: result.findings.map((item) => item.ruleId),
      rejected: result.rejectedFindings.map((item) => item.ruleId),
      status: result.decision.status,
    });
  }

  for (const run of runs.slice(1)) {
    assert.deepEqual(run, runs[0]);
  }
});
