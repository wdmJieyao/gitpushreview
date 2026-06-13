import test from 'node:test';
import assert from 'node:assert/strict';
import { decideReview } from '../src/review/decision.js';

test('hard finding causes hard block', () => {
  const decision = decideReview([{ blocking: 'hard', weightedScore: 10 }], { softBlockScore: 60, hardBlockScore: 90 });
  assert.equal(decision.status, 'HARD_BLOCK');
});

test('score between thresholds causes soft block', () => {
  const decision = decideReview([{ blocking: 'soft', weightedScore: 70 }], { softBlockScore: 60, hardBlockScore: 90 });
  assert.equal(decision.status, 'SOFT_BLOCK');
});

test('low score passes', () => {
  const decision = decideReview([{ blocking: 'none', weightedScore: 20 }], { softBlockScore: 60, hardBlockScore: 90 });
  assert.equal(decision.status, 'PASS');
});
