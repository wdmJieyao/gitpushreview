export function normalizeFinding(finding, rulesById = new Map()) {
  const rule = rulesById.get(finding.ruleId);
  const blocking = rule && rule.hardBlock === false && finding.blocking === 'hard'
    ? 'soft'
    : finding.blocking;
  return {
    ...finding,
    blocking,
    weightedScore: finding.weightedScore ?? Number(finding.score || 0),
  };
}

export function splitFindingsByCandidateSet(findings = [], candidateRules = [], allRules = candidateRules) {
  const candidateIds = new Set(candidateRules.map((rule) => rule.id));
  const rulesById = new Map(allRules.map((rule) => [rule.id, rule]));
  const accepted = [];
  const rejected = [];

  for (const finding of findings) {
    if (candidateIds.has(finding.ruleId)) {
      accepted.push(normalizeFinding(finding, rulesById));
    } else {
      rejected.push({
        ...finding,
        rejectReason: 'rule-not-in-candidate-set',
        weightedScore: finding.weightedScore ?? Number(finding.score || 0),
      });
    }
  }

  const sortByStableKey = (a, b) => [
    String(a.ruleId || '').localeCompare(String(b.ruleId || '')),
    String(a.file || '').localeCompare(String(b.file || '')),
    Number(a.line || 0) - Number(b.line || 0),
    String(a.title || '').localeCompare(String(b.title || '')),
  ].find((value) => value !== 0) || 0;

  return {
    accepted: accepted.sort(sortByStableKey),
    rejected: rejected.sort(sortByStableKey),
  };
}
