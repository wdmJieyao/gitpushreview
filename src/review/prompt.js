function renderDeterministicContext({ routes = [], deterministicFindings = [], ruleRouting }) {
  const routeText = routes.length
    ? routes.map((route) => `- ${route.file}: labels=${route.labels.join(', ') || 'none'} capabilities=${(route.capabilities || []).join(', ') || 'none'} dialects=${route.dialectCandidates.join(', ') || 'none'} fallback=${route.unknownLimited ? 'unknown-limited' : 'none'}`).join('\n')
    : '无';
  const findingText = deterministicFindings.length
    ? deterministicFindings.map((finding) => `- ${finding.ruleId} [${finding.blocking}] ${finding.file || ''}${finding.line ? `:${finding.line}` : ''} ${finding.evidence || ''}`).join('\n')
    : '无';
  const routingText = ruleRouting
    ? `totalRules=${ruleRouting.totalRules} selectedRules=${ruleRouting.selectedRules} excludedRules=${ruleRouting.excludedRules}`
    : '无';
  return `# Deterministic Gate Context\n\n## Routes\n${routeText}\n\n## Rule Routing\n${routingText}\n\n## Findings\n${findingText}`;
}

export function buildReviewMessages({ reviewAgent, policy, bdrContext, rules, diff, files, routes = [], deterministicFindings = [], ruleRouting }) {
  return [
    {
      role: 'system',
      content: `${reviewAgent}\n\n只返回 JSON，不要输出 Markdown 或额外说明。JSON 必须包含 findings 数组。每个 finding 必须包含 source、ruleId、title、severity、score、weightedScore、blocking、file、line、evidence、suggestion。所有面向用户的字段必须使用中文，尤其是 title、evidence、suggestion；JSON 字段名和枚举值保持英文。只对已经进入候选集的规则产出 finding；候选集由文件能力、公共兜底和 paths 共同决定。不匹配 paths 或能力路由时不得产出 finding。只有规则 hardBlock 为 true 且 diff 证据高置信、无明显白名单或豁免说明时，blocking 才允许为 hard；否则使用 soft 或 none。`,
    },
    {
      role: 'user',
      content: [
        '# Policy',
        policy,
        '# BDR Context',
        bdrContext.text,
        '# Markdown Rules',
        rules
          .map(
            (rule) =>
              `## ${rule.id} ${rule.title}\nsource: ${rule.source}\nscore: ${rule.score}\nseverity: ${rule.severity}\nweight: ${rule.weight}\nhardBlock: ${rule.hardBlock}\npaths:\n${(rule.paths || []).map((item) => `- ${item}`).join('\n')}\ncapabilities:\n${(rule.capabilities || []).map((item) => `- ${item}`).join('\n')}\nscope: ${rule.scope || ''}\n${rule.body}`,
          )
          .join('\n\n'),
        renderDeterministicContext({ routes, deterministicFindings, ruleRouting }),
        '# Changed Files',
        files.join('\n'),
        '# Staged Diff',
        diff,
      ].join('\n\n'),
    },
  ];
}
