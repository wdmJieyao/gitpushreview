import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initWorkspace } from '../src/workspace.js';

test('initWorkspace creates .gitpushreview structure', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-init-'));
  await initWorkspace({ cwd: dir, force: false, installHook: false });

  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'agent', 'rules-index.md')), true);
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'agent', 'policy.md')), true);
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'config', 'reviewmodel.json')), true);
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'config', 'review-mode.json')), true);
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'docs', 'RULES.md')), true);
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'docs', 'project', 'README.md')), true);
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'docs', 'diy', 'README.md')), true);
  for (const file of ['java.md', 'vue.md', 'mysql.md', 'oracle.md', 'drools.md', 'security.md', 'workflow.md']) {
    assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'docs', 'default', file)), true);
  }
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'docs', 'diy', 'auth.md')), true);
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'vendor', 'bdr', 'package.json')), true);
  const bdrPkg = JSON.parse(fs.readFileSync(path.join(dir, '.gitpushreview', 'vendor', 'bdr', 'package.json'), 'utf8'));
  assert.equal(bdrPkg.name, 'openmole');
  assert.equal(bdrPkg.version, '0.8.2');
});

test('initWorkspace preserves existing review mode config unless forced', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-init-mode-preserve-'));
  const configDir = path.join(dir, '.gitpushreview', 'config');
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(path.join(configDir, 'review-mode.json'), '{"mode":"skip"}\n', 'utf8');

  await initWorkspace({ cwd: dir, force: false, installHook: false });
  assert.equal(JSON.parse(fs.readFileSync(path.join(configDir, 'review-mode.json'), 'utf8')).mode, 'skip');

  await initWorkspace({ cwd: dir, force: true, installHook: false });
  assert.equal(JSON.parse(fs.readFileSync(path.join(configDir, 'review-mode.json'), 'utf8')).mode, 'normal');
});

test('initWorkspace reports hook permission failure without failing workspace initialization', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-init-hook-fail-'));
  const result = await initWorkspace({
    cwd: dir,
    installHook: true,
    hookInstaller: () => {
      throw Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' });
    },
  });

  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'agent', 'rules-index.md')), true);
  assert.equal(result.hook.installed, false);
  assert.equal(result.hook.reason, 'permission-denied');
  assert.equal(result.hook.manualCheckAvailable, true);
  assert.match(result.hook.guidance, /手动执行|gitpushreview check --staged/);
});
