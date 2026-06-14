function toArray(value) {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

function parsePattern(item, rule) {
  const parts = String(item || '').split('|');
  if (parts.length >= 3) {
    return {
      id: parts[0] || `${rule.id}-EVIDENCE`,
      regex: parts[1] || '',
      message: parts.slice(2).join('|') || rule.title,
    };
  }
  return { id: `${rule.id}-EVIDENCE`, regex: String(item || ''), message: rule.title };
}

function safeRegExp(pattern) {
  try {
    return new RegExp(pattern, 'im');
  } catch {
    return null;
  }
}

function lineOf(content, index) {
  if (index < 0) return 1;
  return content.slice(0, index).split(/\r?\n/).length;
}

function matchedFilesFor(rule, ruleRouting) {
  const byRule = ruleRouting?.matchesByRule?.[rule.id];
  if (!byRule) return null;
  return new Set(byRule.map((item) => item.file));
}

export function runRuleEvidence({ rules = [], routes = [], fileContents = {}, ruleRouting } = {}) {
  const findings = [];
  for (const rule of rules) {
    const patterns = toArray(rule.evidencePatterns).map((item) => parsePattern(item, rule)).filter((item) => item.regex);
    if (!patterns.length) continue;
    const allowedFiles = matchedFilesFor(rule, ruleRouting);
    const scopedRoutes = allowedFiles ? routes.filter((route) => allowedFiles.has(route.file)) : routes;
    for (const route of scopedRoutes) {
      const content = fileContents[route.file] || '';
      if (!content) continue;
      for (const pattern of patterns) {
        const regex = safeRegExp(pattern.regex);
        if (!regex) continue;
        const match = regex.exec(content);
        if (!match) continue;
        findings.push({
          source: 'static-evidence',
          ruleId: rule.id,
          evidenceId: pattern.id,
          title: `静态证据：${rule.title}`,
          severity: rule.severity || 'medium',
          score: 0,
          weightedScore: 0,
          blocking: 'none',
          file: route.file,
          line: lineOf(content, match.index),
          evidence: pattern.message,
          suggestion: '请结合规则正文和 diff 进行复审。',
        });
      }
    }
  }
  return findings;
}
