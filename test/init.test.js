import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { execFile, execFileSync } from 'node:child_process';
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
  const rulesGuide = fs.readFileSync(path.join(dir, '.gitpushreview', 'docs', 'RULES.md'), 'utf8');
  assert.match(rulesGuide, /快速新增一个业务模块规则/);
  assert.match(rulesGuide, /PROJECT-ORDER-001 订单取消必须校验状态流转/);
  assert.match(rulesGuide, /paths 负责判断属于哪个模块/);
  assert.match(rulesGuide, /rules-index\.md 负责加载哪些规则文件/);
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

test('installed pre-commit hook works without relying on user npm bin in PATH', async (t) => {
  if (process.platform === 'win32') {
    t.skip('pre-commit shell hook execution is unix-oriented in this test');
    return;
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-init-hook-path-'));
  execFileSync('git', ['init'], { cwd: dir, stdio: 'ignore' });

  const result = await initWorkspace({ cwd: dir, installHook: true });
  assert.equal(result.hook.installed, true);

  const hookPath = result.hook.hookPath;
  const hookText = fs.readFileSync(hookPath, 'utf8');
  assert.match(hookText, new RegExp(process.execPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(hookText, /bin\/gitpushreview\.js/);
  assert.doesNotMatch(hookText, /exec gitpushreview check --staged/);

  const minimalPath = ['/usr/bin', '/bin']
    .filter((entry) => fs.existsSync(entry))
    .join(path.delimiter);

  const output = execFileSync(hookPath, {
    cwd: dir,
    env: { ...process.env, PATH: minimalPath },
    encoding: 'utf8',
  });

  assert.match(output, /没有检测到已暂存的变更/);
});

test('installed pre-commit hook respects core.hooksPath', async (t) => {
  if (process.platform === 'win32') {
    t.skip('pre-commit shell hook execution is unix-oriented in this test');
    return;
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-init-hookspath-'));
  execFileSync('git', ['init'], { cwd: dir, stdio: 'ignore' });
  execFileSync('git', ['config', 'core.hooksPath', '.custom-hooks'], { cwd: dir, stdio: 'ignore' });

  const result = await initWorkspace({ cwd: dir, installHook: true });
  const expectedHookPath = path.join(dir, '.custom-hooks', 'pre-commit');

  assert.equal(result.hook.installed, true);
  assert.equal(result.hook.hookPath, expectedHookPath);
  assert.equal(fs.existsSync(expectedHookPath), true);
  assert.equal(fs.existsSync(path.join(dir, '.git', 'hooks', 'pre-commit')), false);
});

test('initWorkspace force makes an existing pre-commit hook executable', async (t) => {
  if (process.platform === 'win32') {
    t.skip('POSIX executable bit assertion is not meaningful on Windows');
    return;
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-init-hook-chmod-'));
  execFileSync('git', ['init'], { cwd: dir, stdio: 'ignore' });
  const hookPath = path.join(dir, '.git', 'hooks', 'pre-commit');
  fs.writeFileSync(hookPath, '#!/bin/sh\nexit 0\n', { encoding: 'utf8', mode: 0o644 });
  fs.chmodSync(hookPath, 0o644);

  const result = await initWorkspace({ cwd: dir, force: true, installHook: true });
  const mode = fs.statSync(result.hook.hookPath).mode;

  assert.equal(result.hook.installed, true);
  assert.equal(mode & 0o111, 0o111);
});

test('installed pre-commit hook sends apiKeyEnv from inherited process env', async (t) => {
  if (process.platform === 'win32') {
    t.skip('pre-commit shell hook execution is unix-oriented in this test');
    return;
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-init-hook-apikey-'));
  execFileSync('git', ['init'], { cwd: dir, stdio: 'ignore' });

  const result = await initWorkspace({ cwd: dir, installHook: true });
  assert.equal(result.hook.installed, true);

  const modelPath = path.join(dir, '.gitpushreview', 'config', 'reviewmodel.json');
  const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  let authorization = '';
  const server = http.createServer((req, res) => {
    authorization = req.headers.authorization || '';
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ choices: [{ message: { content: '{"findings":[]}' } }] }));
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const address = server.address();
    fs.writeFileSync(modelPath, `${JSON.stringify({
      ...model,
      baseUrl: `http://127.0.0.1:${address.port}/v1`,
      apiKey: '',
      apiKeyEnv: 'GITPUSHREVIEW_API_KEY',
      model: 'demo-model',
      timeoutMs: 5000,
    }, null, 2)}\n`, 'utf8');

    const filePath = path.join(dir, 'src', 'demo.js');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, 'console.log("demo");\n', 'utf8');
    execFileSync('git', ['add', 'src/demo.js'], { cwd: dir, stdio: 'ignore' });

    const hookPath = result.hook.hookPath;
    const minimalPath = ['/usr/bin', '/bin']
      .filter((entry) => fs.existsSync(entry))
      .join(path.delimiter);

    await new Promise((resolve, reject) => {
      execFile(hookPath, {
        cwd: dir,
        env: {
          PATH: minimalPath,
          GITPUSHREVIEW_API_KEY: 'env-key',
        },
        encoding: 'utf8',
      }, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    assert.equal(authorization, 'Bearer env-key');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
