export function buildReviewMessages({ reviewAgent, policy, bdrContext, rules, diff, files }) {
  return [
    {
      role: 'system',
      content: `${reviewAgent}\n\n只返回 JSON，不要输出 Markdown 或额外说明。JSON 必须包含 findings 数组。每个 finding 必须包含 source、ruleId、title、severity、score、weightedScore、blocking、file、line、evidence、suggestion。所有面向用户的字段必须使用中文，尤其是 title、evidence、suggestion；JSON 字段名和枚举值保持英文。只对匹配规则 paths 的文件应用该规则；不匹配 paths 时不得产出 finding。只有规则 hardBlock 为 true 且 diff 证据高置信、无明显白名单或豁免说明时，blocking 才允许为 hard；否则使用 soft 或 none。`,
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
              `## ${rule.id} ${rule.title}\nsource: ${rule.source}\nscore: ${rule.score}\nseverity: ${rule.severity}\nweight: ${rule.weight}\nhardBlock: ${rule.hardBlock}\npaths:\n${(rule.paths || []).map((item) => `- ${item}`).join('\n')}\n${rule.body}`,
          )
          .join('\n\n'),
        '# Changed Files',
        files.join('\n'),
        '# Staged Diff',
        diff,
      ].join('\n\n'),
    },
  ];
}
