import test from 'node:test';
import assert from 'node:assert/strict';
import { parseReviewJson } from '../src/review/result.js';

test('parseReviewJson extracts findings array', () => {
  const parsed = parseReviewJson('{"findings":[{"ruleId":"A","score":10,"blocking":"none"}]}');
  assert.equal(parsed.findings.length, 1);
  assert.equal(parsed.findings[0].ruleId, 'A');
});

test('parseReviewJson extracts fenced json', () => {
  const parsed = parseReviewJson('```json\n{"findings":[]}\n```');
  assert.deepEqual(parsed.findings, []);
});

test('parseReviewJson throws Chinese error when findings are missing', () => {
  assert.throws(() => parseReviewJson('{"summary":"ok"}'), /模型响应必须包含 findings 数组/);
});
