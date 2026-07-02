import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { handleReviewResult } from '../src/hook.js';

test('handleReviewResult prompts in Chinese and accepts Chinese confirmation for soft block', async () => {
  const stdin = new EventEmitter();
  stdin.isTTY = true;
  const chunks = [];
  const stdout = { write: (chunk) => chunks.push(chunk) };

  const exitPromise = handleReviewResult({
    decision: { status: 'SOFT_BLOCK', totalScore: 70 },
    findings: [],
  }, { stdin, stdout });

  stdin.emit('data', '确认\n');
  const exitCode = await exitPromise;

  assert.equal(exitCode, 0);
  assert.match(chunks.join(''), /软拦截/);
  assert.match(chunks.join(''), /仍要继续提交/);
});

test('handleReviewResult exits zero for log mode even when decision blocks', async () => {
  const stdin = new EventEmitter();
  stdin.isTTY = false;
  const chunks = [];
  const stdout = { write: (chunk) => chunks.push(chunk) };

  const exitCode = await handleReviewResult({
    mode: 'log',
    decision: { status: 'HARD_BLOCK', totalScore: 95 },
    findings: [],
    rejectedFindings: [],
  }, { stdin, stdout });

  assert.equal(exitCode, 0);
  assert.match(chunks.join(''), /日志模式/);
});

test('handleReviewResult exits zero for skip mode without prompting', async () => {
  const stdin = new EventEmitter();
  stdin.isTTY = true;
  const stdout = { write: () => {} };

  const exitCode = await handleReviewResult({
    mode: 'skip',
    decision: { status: 'SKIPPED', totalScore: 0 },
    findings: [],
    rejectedFindings: [],
  }, { stdin, stdout });

  assert.equal(exitCode, 0);
});
