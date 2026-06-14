import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReviewMessages } from '../src/review/prompt.js';

test('buildReviewMessages requires Chinese user-facing finding fields', () => {
  const messages = buildReviewMessages({
    reviewAgent: 'review agent',
    policy: 'policy',
    bdrContext: { text: 'bdr' },
    rules: [],
    diff: '+const password = "x";',
    files: ['a.js'],
  });

  assert.match(messages[0].content, /所有面向用户的字段必须使用中文/);
  assert.match(messages[0].content, /title、evidence、suggestion/);
  assert.match(messages[0].content, /候选集由文件能力、公共兜底和 paths 共同决定/);
  assert.match(messages[0].content, /只有规则 hardBlock 为 true/);
});

test('buildReviewMessages includes deterministic routes and findings for AI context', () => {
  const messages = buildReviewMessages({
    reviewAgent: 'review agent',
    policy: 'policy',
    bdrContext: { text: 'bdr' },
    rules: [],
    diff: '+spring.kafka.admin.auto-create=true',
    files: ['src/main/resources/application-prod.yml'],
    routes: [{ file: 'src/main/resources/application-prod.yml', labels: ['config', 'mq', 'kafka'], dialectCandidates: [] }],
    deterministicFindings: [{ ruleId: 'DEFAULT-MQ-KAFKA-AUTO-CREATE-001', blocking: 'hard', file: 'src/main/resources/application-prod.yml', evidence: '生产环境配置中启用了 Kafka 自动创建 Topic。' }],
  });

  const userContent = messages[1].content;
  assert.match(userContent, /# Deterministic Gate Context/);
  assert.match(userContent, /mq, kafka/);
  assert.match(userContent, /DEFAULT-MQ-KAFKA-AUTO-CREATE-001/);
  assert.match(userContent, /生产环境配置中启用了 Kafka 自动创建 Topic/);
});

test('buildReviewMessages includes rule severity and path scope in markdown rules', () => {
  const messages = buildReviewMessages({
    reviewAgent: 'review agent',
    policy: 'policy',
    bdrContext: { text: 'bdr' },
    rules: [
      {
        id: 'DEFAULT-JAVA-SPR-005',
        title: 'Spring Boot Actuator 和管理端点不得默认暴露敏感能力',
        source: 'Default Rules',
        score: 90,
        severity: 'critical',
        weight: 1,
        hardBlock: false,
        paths: ['src/main/resources/**/*.yml', 'src/main/resources/**/*.properties'],
        body: '**规则说明**：生产配置不得无鉴权暴露敏感端点。',
      },
    ],
    diff: '+management.endpoints.web.exposure.include="*"',
    files: ['src/main/resources/application.yml'],
  });

  const userContent = messages[1].content;
  assert.match(userContent, /severity: critical/);
  assert.match(userContent, /paths:\n- src\/main\/resources\/\*\*\/\*\.yml\n- src\/main\/resources\/\*\*\/\*\.properties/);
});
