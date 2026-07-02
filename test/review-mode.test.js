import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { makeTempProject } from './helpers/workspace.js';
import { loadReviewMode, normalizeReviewMode, readReviewModeConfig } from '../src/review/mode.js';

test('normalizeReviewMode defaults missing mode to normal', () => {
  assert.deepEqual(normalizeReviewMode(undefined), {
    mode: 'normal',
    source: 'missing',
    message: '未配置审核模式，使用正常拦截模式。',
  });
});

test('normalizeReviewMode accepts skip, log, and normal', () => {
  assert.equal(normalizeReviewMode('skip').mode, 'skip');
  assert.equal(normalizeReviewMode('log').mode, 'log');
  assert.equal(normalizeReviewMode('normal').mode, 'normal');
});

test('normalizeReviewMode rejects unsupported values with Chinese diagnostic', () => {
  assert.throws(() => normalizeReviewMode('off'), /审核模式无效/);
});

test('loadReviewMode reads workspace config', () => {
  const dir = makeTempProject('gpr-mode-');
  const configDir = path.join(dir, '.gitpushreview', 'config');
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(path.join(configDir, 'review-mode.json'), '{"mode":"log"}\n', 'utf8');

  assert.equal(loadReviewMode(dir).mode, 'log');
});

test('readReviewModeConfig defaults when config file is absent', () => {
  const dir = makeTempProject('gpr-mode-missing-');
  assert.equal(readReviewModeConfig(path.join(dir, '.gitpushreview')).mode, 'normal');
});
