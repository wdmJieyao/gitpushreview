export function renderReport(result) {
  const lines = [
    `GitPushReview: ${result.decision.status}`,
    `Score: ${result.decision.totalScore}`,
    '',
  ];

  for (const finding of result.findings) {
    lines.push(`- [${finding.severity || 'medium'}] ${finding.ruleId || 'UNKNOWN'} ${finding.title || ''}`);
    if (finding.file) lines.push(`  at ${finding.file}${finding.line ? `:${finding.line}` : ''}`);
    if (finding.evidence) lines.push(`  evidence: ${finding.evidence}`);
    if (finding.suggestion) lines.push(`  suggestion: ${finding.suggestion}`);
  }

  return `${lines.join('\n')}\n`;
}
