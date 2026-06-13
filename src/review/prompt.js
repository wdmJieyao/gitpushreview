export function buildReviewMessages({ reviewAgent, policy, bdrContext, rules, diff, files }) {
  return [
    {
      role: 'system',
      content: `${reviewAgent}\n\nReturn only JSON with a findings array. Each finding must include source, ruleId, title, severity, score, weightedScore, blocking, file, line, evidence, and suggestion.`,
    },
    {
      role: 'user',
      content: [
        '# Policy',
        policy,
        '# BDR Context',
        bdrContext.text,
        '# Markdown Rules',
        rules.map((rule) => `## ${rule.id} ${rule.title}\nsource: ${rule.source}\nscore: ${rule.score}\nweight: ${rule.weight}\nhardBlock: ${rule.hardBlock}\n${rule.body}`).join('\n\n'),
        '# Changed Files',
        files.join('\n'),
        '# Staged Diff',
        diff,
      ].join('\n\n'),
    },
  ];
}
