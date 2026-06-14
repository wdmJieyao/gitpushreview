const STATUS_LABELS = {
  PASS: '通过',
  SOFT_BLOCK: '软拦截',
  HARD_BLOCK: '强拦截',
};

const SEVERITY_LABELS = {
  critical: '严重',
  high: '高',
  medium: '中',
  low: '低',
};

export function renderReport(result) {
  const lines = [
    `审核结果：${STATUS_LABELS[result.decision.status] || result.decision.status}`,
    `总分：${result.decision.totalScore}`,
    '',
  ];

  for (const finding of result.findings) {
    const severity = SEVERITY_LABELS[finding.severity] || finding.severity || '中';
    lines.push(`- [${severity}] ${finding.ruleId || '未知规则'} ${finding.title || ''}`);
    if (finding.file) lines.push(`  位置：${finding.file}${finding.line ? `:${finding.line}` : ''}`);
    if (finding.evidence) lines.push(`  证据：${finding.evidence}`);
    if (finding.suggestion) lines.push(`  修复建议：${finding.suggestion}`);
  }

  return `${lines.join('\n')}\n`;
}
