import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { renderDoctor, runDoctor } from '../src/doctor.js';
import { initWorkspace } from '../src/workspace.js';

test('runDoctor reports missing workspace', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-doctor-'));
  const report = runDoctor({ cwd: dir, env: {} });
  assert.equal(report.ok, false);
  assert.equal(report.checks.some((check) => check.name === 'workspace' && !check.ok), true);
});

test('runDoctor accepts apiKey from reviewmodel config', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-doctor-config-key-'));
  await initWorkspace({ cwd: dir, installHook: false });
  const modelPath = path.join(dir, '.gitpushreview', 'config', 'reviewmodel.json');
  const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  fs.writeFileSync(modelPath, `${JSON.stringify({ ...model, apiKey: 'config-key' }, null, 2)}\n`, 'utf8');

  const report = runDoctor({ cwd: dir, env: {} });
  const apiKeyCheck = report.checks.find((check) => check.name === 'apiKey');

  assert.equal(apiKeyCheck.ok, true);
  assert.equal(apiKeyCheck.detail, '配置文件中的 apiKey');
});

test('runDoctor accepts apiKey from process environment', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-doctor-env-key-'));
  await initWorkspace({ cwd: dir, installHook: false });

  const report = runDoctor({ cwd: dir, env: { GITPUSHREVIEW_API_KEY: 'env-key' } });
  const apiKeyCheck = report.checks.find((check) => check.name === 'apiKey');

  assert.equal(apiKeyCheck.ok, true);
  assert.equal(apiKeyCheck.detail, 'GITPUSHREVIEW_API_KEY');
});

test('runDoctor reports effective review mode', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-doctor-mode-'));
  await initWorkspace({ cwd: dir, installHook: false });
  fs.writeFileSync(path.join(dir, '.gitpushreview', 'config', 'review-mode.json'), '{"mode":"log"}\n', 'utf8');

  const report = runDoctor({ cwd: dir, env: {} });
  const modeCheck = report.checks.find((check) => check.name === 'reviewMode');

  assert.equal(modeCheck.ok, true);
  assert.match(modeCheck.detail, /log/);
});

test('renderDoctor uses Chinese labels', () => {
  const text = renderDoctor({
    checks: [
      { ok: true, name: 'node', detail: '20.0.0' },
      { ok: true, name: 'reviewMode', detail: 'normal' },
      { ok: false, name: 'workspace', detail: 'missing' },
    ],
  });

  assert.match(text, /通过 Node 版本: 20.0.0/);
  assert.match(text, /通过 审核模式: normal/);
  assert.match(text, /失败 工作目录: missing/);
});
