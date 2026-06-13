export const REVIEW_AGENT = `# Review Agent

Review only staged changes. Use BDR, default rules, project rules, and DIY rules in priority order. Return findings with evidence tied to the diff.
`;

export const POLICY = `# Review Policy

\`\`\`yaml
softBlockScore: 60
hardBlockScore: 90
ciSoftBlockBehavior: fail
\`\`\`
`;

export const RULES_INDEX = `# Rule Index

## BDR

\`\`\`yaml
enabled: true
provider: bdr
path: ../vendor/bdr
priority: 10
weight: 1.0
mode: soft-by-default
hardBlockWhen:
  - obvious_bug
  - security_vulnerability
  - data_loss
  - auth_bypass
\`\`\`

## Default Rules

\`\`\`yaml
enabled: true
provider: markdown
priority: 20
weight: 1.0
files:
  - ../docs/default/code-review.md
  - ../docs/default/security.md
  - ../docs/default/concurrency.md
\`\`\`

## Project Rules

\`\`\`yaml
enabled: true
provider: markdown
priority: 50
weight: 1.5
files:
  - ../docs/project/architecture.md
  - ../docs/project/api-contract.md
\`\`\`

## DIY Rules

\`\`\`yaml
enabled: true
provider: markdown
priority: 100
weight: 2.0
files:
  - ../docs/diy/auth.md
requiredRules: []
hardBlockOnViolation: true
\`\`\`
`;

export const REVIEW_MODEL = {
  provider: 'openai-compatible',
  baseUrl: 'https://api.example.com/v1',
  apiKeyEnv: 'GITPUSHREVIEW_API_KEY',
  model: 'gpt-4.1',
  timeoutMs: 60000,
};

export const DEFAULT_DOCS = {
  'docs/default/code-review.md': '# Code Review Rules\n\n## DEFAULT-CODE-001 Avoid obvious runtime errors\n\n```yaml\nscore: 50\nseverity: high\nhardBlock: false\n```\n\nNew code should avoid obvious null, undefined, or missing import errors.\n',
  'docs/default/security.md': '# Security Rules\n\n## DEFAULT-SEC-001 Do not introduce secret leaks\n\n```yaml\nscore: 90\nseverity: critical\nhardBlock: true\n```\n\nDo not commit API keys, passwords, tokens, cookies, or private keys.\n',
  'docs/default/concurrency.md': '# Concurrency Rules\n\n## DEFAULT-CONC-001 Protect shared mutable state\n\n```yaml\nscore: 60\nseverity: high\nhardBlock: false\n```\n\nConcurrent code should protect shared mutable state or explain why it is safe.\n',
  'docs/default/performance.md': '# Performance Rules\n\n## DEFAULT-PERF-001 Avoid avoidable repeated expensive work\n\n```yaml\nscore: 30\nseverity: medium\nhardBlock: false\n```\n\nAvoid repeated I/O, network calls, or full scans inside hot loops.\n',
  'docs/default/maintainability.md': '# Maintainability Rules\n\n## DEFAULT-MAINT-001 Keep changes understandable\n\n```yaml\nscore: 25\nseverity: medium\nhardBlock: false\n```\n\nPrefer small cohesive functions and clear names in newly changed code.\n',
  'docs/project/architecture.md': '# Project Architecture Rules\n\nAdd project architecture rules here.\n',
  'docs/project/api-contract.md': '# API Contract Rules\n\nAdd API compatibility rules here.\n',
  'docs/project/data-model.md': '# Data Model Rules\n\nAdd data model consistency rules here.\n',
  'docs/diy/auth.md': '# DIY Auth Rules\n\nAdd high-priority project-specific auth rules here.\n',
  'docs/diy/payment.md': '# DIY Payment Rules\n\nAdd high-priority payment rules here.\n',
  'docs/diy/logging.md': '# DIY Logging Rules\n\nAdd high-priority logging rules here.\n',
};
