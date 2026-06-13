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
