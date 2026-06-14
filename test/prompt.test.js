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
  assert.match(messages[0].content, /只对匹配规则 paths 的文件应用该规则/);
  assert.match(messages[0].content, /只有规则 hardBlock 为 true/);
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
