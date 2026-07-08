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
      candidates: result.candidateRuleIds,
      accepted: result.findings.map((item) => item.ruleId),
      rejected: result.rejectedFindings.map((item) => item.ruleId),
      status: result.decision.status,
    });
  }

  for (const run of runs.slice(1)) {
    assert.deepEqual(run, runs[0]);
  }
});


test('runReview candidate summary is stable when staged file order changes', async () => {
  const { dir } = await makeInitializedWorkspace({ prefix: 'gpr-runner-order-' });
  const base = {
    cwd: dir,
    diff: 'diff --git a/src/main/java/App.java b/src/main/java/App.java\n+class App {}\n' +
      'diff --git a/src/pages/Login.vue b/src/pages/Login.vue\n+<template><div /></template>\n',
    fileContents: {
      'src/main/java/App.java': 'class App {}\n',
      'src/pages/Login.vue': '<template><div /></template>\n',
    },
    modelInvoker: async () => modelJson([]),
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  };

  const first = await runReview({ ...base, files: ['src/main/java/App.java', 'src/pages/Login.vue'] });
  const second = await runReview({ ...base, files: ['src/pages/Login.vue', 'src/main/java/App.java'] });

  assert.ok(first.candidateRuleIds.length > 0);
  assert.equal(typeof first.candidateSummary.selectedRules, 'number');
  assert.deepEqual(second.candidateRuleIds, first.candidateRuleIds);
  assert.deepEqual(second.candidateSummary, first.candidateSummary);
  assert.equal(second.decision.status, first.decision.status);
});
