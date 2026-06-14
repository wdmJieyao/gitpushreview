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
});
