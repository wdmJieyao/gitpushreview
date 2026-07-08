import assert from 'node:assert/strict';

// Review runner fixtures should model staged data explicitly: pass the staged
// blob in fileContents, and omit the entry for staged deletions. Do not read
// working-tree files inside these helpers.

export function modelJson(findings = []) {
  return JSON.stringify({ findings });
}

export function acceptedFinding(overrides = {}) {
  return {
    source: 'default',
    ruleId: 'DEFAULT-SEC-001',
    score: 90,
    weightedScore: 90,
    blocking: 'hard',
    title: '测试问题',
    severity: 'critical',
    file: 'src/app.js',
    ...overrides,
  };
}

export function rejectedFinding(overrides = {}) {
  return acceptedFinding({
    ruleId: 'RULE-NOT-IN-CANDIDATES',
    title: '候选集外问题',
    ...overrides,
  });
}

export function assertCandidateRuleIds(result, expectedIds) {
  assert.deepEqual(result.candidateRuleIds, expectedIds);
}

export function assertCandidateSummaryShape(summary, expected = {}) {
  assert.equal(typeof summary.totalRules, 'number');
  assert.equal(typeof summary.selectedRules, 'number');
  assert.equal(typeof summary.excludedRules, 'number');
  assert.equal(summary.selectedRules, summary.totalRules - summary.excludedRules);
  assert.ok(summary.bySource && typeof summary.bySource === 'object');
  assert.ok(summary.byCapability && typeof summary.byCapability === 'object');
  assert.ok(Array.isArray(summary.topMatchReasons));
  assert.ok(Array.isArray(summary.topSkipReasons));
  assert.ok(Array.isArray(summary.duplicates));

  if (expected.selectedRules !== undefined) {
    assert.equal(summary.selectedRules, expected.selectedRules);
  }

  if (expected.duplicates !== undefined) {
    assert.deepEqual(summary.duplicates, expected.duplicates);
  }
}
