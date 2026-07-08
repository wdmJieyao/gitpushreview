import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdownRules } from '../src/rules/markdown.js';
import { parseRuleIndex } from '../src/rules/index.js';

test('parseMarkdownRules extracts multiple rules and metadata', () => {
  const markdown = `# Rules

## DIY-AUTH-001 Tenant check

\`\`\`yaml
score: 60
severity: high
hardBlock: true
paths:
  - backend/**/*.py
\`\`\`

Must check tenant.

## DIY-LOG-001 Mask secrets

\`\`\`yaml
score: 40
severity: medium
hardBlock: false
\`\`\`

Do not log secrets.
`;

  const rules = parseMarkdownRules(markdown, { source: 'diy', file: 'auth.md', weight: 2 });
  assert.equal(rules.length, 2);
  assert.equal(rules[0].id, 'DIY-AUTH-001');
  assert.equal(rules[0].score, 60);
  assert.equal(rules[0].hardBlock, true);
  assert.deepEqual(rules[0].paths, ['backend/**/*.py']);
});

test('parseRuleIndex extracts providers', () => {
  const markdown = `# Rule Index

## DIY Rules

\`\`\`yaml
enabled: true
provider: markdown
priority: 100
weight: 2.0
files:
  - ../docs/diy/auth.md
requiredRules:
  - DIY-AUTH-001
hardBlockOnViolation: true
\`\`\`
`;
  const sources = parseRuleIndex(markdown);
  assert.equal(sources.length, 1);
  assert.equal(sources[0].provider, 'markdown');
  assert.equal(sources[0].priority, 100);
  assert.deepEqual(sources[0].files, ['../docs/diy/auth.md']);
});


test('parseMarkdownRules keeps optional capability routing metadata', () => {
  const markdown = `# Rules

## DEFAULT-MQ-KAFKA-001 Kafka config

\`\`\`yaml
score: 80
severity: high
hardBlock: false
scope: common
paths:
  - src/main/resources/**/*.yml
capabilities:
  - middleware.mq
  - middleware.mq.kafka
\`\`\`

Kafka config must be safe.
`;

  const rules = parseMarkdownRules(markdown, { source: 'default', file: 'mq.md', weight: 1 });
  assert.deepEqual(rules[0].capabilities, ['middleware.mq', 'middleware.mq.kafka']);
  assert.equal(rules[0].scope, 'common');
  assert.deepEqual(rules[0].paths, ['src/main/resources/**/*.yml']);
});


test('parseMarkdownRules keeps required capability metadata', () => {
  const markdown = `# Rules

## DEFAULT-SQL-MYSQL-001 MySQL rule

\`\`\`yaml
score: 80
severity: high
hardBlock: true
paths:
  - "**/*.sql"
capabilities:
  - persistence.sql
requiredCapabilities:
  - persistence.sql.mysql
\`\`\`

MySQL SQL must be safe.
`;

  const rules = parseMarkdownRules(markdown, { source: 'default', file: 'mysql.md', weight: 1 });
  assert.deepEqual(rules[0].capabilities, ['persistence.sql']);
  assert.deepEqual(rules[0].requiredCapabilities, ['persistence.sql.mysql']);
});


test('parseMarkdownRules keeps rule-driven signal and evidence metadata', () => {
  const markdown = '# Rules\n\n' +
    '## DIY-PAY-001 Payment callback\n\n' +
    '\`\`\`yaml\n' +
    'score: 80\n' +
    'severity: high\n' +
    'hardBlock: false\n' +
    'allowUnknownExpansion: true\n' +
    'signalPaths:\n' +
    '  - docs/**/*.rulebook\n' +
    'signalContent:\n' +
    '  - payment callback\n' +
    '  - idempotent\n' +
    'evidencePatterns:\n' +
    '  - pay-callback|payment callback|检测到支付回调变更\n' +
    '\`\`\`\n\n' +
    'Payment callback must be idempotent.\n';

  const rules = parseMarkdownRules(markdown, { source: 'diy', file: 'payment.md', weight: 2 });
  assert.equal(rules[0].allowUnknownExpansion, true);
  assert.deepEqual(rules[0].signalPaths, ['docs/**/*.rulebook']);
  assert.deepEqual(rules[0].signalContent, ['payment callback', 'idempotent']);
  assert.deepEqual(rules[0].evidencePatterns, ['pay-callback|payment callback|检测到支付回调变更']);
});
