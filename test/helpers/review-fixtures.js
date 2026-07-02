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
