const STATUS_LABELS = {
  SKIPPED: '已跳过',
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
  ];

  if (result.modeMessage) lines.push(`模式：${result.modeMessage}`);
  else if (result.mode === 'log') lines.push('模式：日志模式，会输出审核结果但不会拦截。');
  else if (result.mode === 'skip') lines.push('模式：已跳过检查。');

  if (result.rejectedFindings?.length) lines.push(`已拒绝候选集外模型问题：${result.rejectedFindings.length}`);
  lines.push('');

  for (const finding of result.findings || []) {
    const severity = SEVERITY_LABELS[finding.severity] || finding.severity || '中';
    lines.push(`- [${severity}] ${finding.ruleId || '未知规则'} ${finding.title || ''}`);
    if (finding.file) lines.push(`  位置：${finding.file}${finding.line ? `:${finding.line}` : ''}`);
    if (finding.evidence) lines.push(`  证据：${finding.evidence}`);
    if (finding.suggestion) lines.push(`  修复建议：${finding.suggestion}`);
  }

  return `${lines.join('\n')}\n`;
}
