import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { initWorkspace } from '../src/workspace.js';
import { routeCommand } from '../src/cli.js';

test('explain prints matching routes and deterministic gates for a file', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-explain-'));
  await initWorkspace({ cwd: dir, installHook: false });
  const file = path.join(dir, 'src/main/java/com/acme/order/OrderMapper.java');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, '@Insert("insert into users(id, name) values (#{id})")\n', 'utf8');

  const result = await routeCommand(['explain', 'src/main/java/com/acme/order/OrderMapper.java'], { cwd: dir, env: {}, stdout: [] });

  assert.equal(result.exitCode, 0);
  assert.match(result.output, /命中路由/);
  assert.match(result.output, /java-inline-sql/);
  assert.match(result.output, /sql/);
  assert.match(result.output, /确定性检查/);
  assert.match(result.output, /DEFAULT-SQL-INSERT-ARITY-001/);
  assert.match(result.output, /强拦截/);
  assert.match(result.output, /证据：/);
  assert.match(result.output, /修复建议：/);
  assert.doesNotMatch(result.output, /�|鍐|锛|fatal: not a git repository/);
});

test('explain rejects paths outside the repository root', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-explain-outside-'));
  await initWorkspace({ cwd: dir, installHook: false });
  const outside = path.join(os.tmpdir(), 'gpr-outside.sql');
  fs.writeFileSync(outside, 'insert into users(id, name) values (1);', 'utf8');

  const result = await routeCommand(['explain', outside], { cwd: dir, env: {}, stdout: [] });

  assert.equal(result.exitCode, 1);
  assert.match(result.output, /项目根目录之外/);
});

test('explain --json returns stable machine-readable details', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-explain-json-'));
  await initWorkspace({ cwd: dir, installHook: false });
  fs.mkdirSync(path.join(dir, 'sql'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'sql/test.sql'), "insert into users(id, name) values (1);\n", 'utf8');

  const result = await routeCommand(['explain', '--json', 'sql/test.sql'], { cwd: dir, env: {}, stdout: [] });
  const parsed = JSON.parse(result.output);

  assert.equal(result.exitCode, 0);
  assert.ok(parsed.routes.labels.includes('sql'));
  assert.equal(parsed.findings[0].ruleId, 'DEFAULT-SQL-INSERT-ARITY-001');
  assert.ok(Array.isArray(parsed.candidateRuleIds));
  assert.ok(parsed.candidateRuleIds.includes('DEFAULT-SQL-INSERT-ARITY-001'));
  assert.equal(typeof parsed.candidateSummary.selectedRules, 'number');
  assert.ok(parsed.candidateSummary.topMatchReasons.length > 0);
});


test('explain renders static evidence as non-blocking clue', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-explain-static-evidence-'));
  await initWorkspace({ cwd: dir, installHook: false });
  const diyRule = [
    '# Payment',
    '',
    '## DIY-PAY-999 支付回调必须幂等',
    '',
    '~~~yaml',
    'score: 90',
    'severity: critical',
    'hardBlock: true',
    'paths:',
    '  - docs/**/*.rulebook',
    'allowUnknownExpansion: true',
    'signalContent:',
    '  - payment callback',
    'evidencePatterns:',
    '  - pay-callback|payment callback|检测到支付回调变更',
    '~~~',
    '',
    '**规则说明**：支付回调必须幂等。',
  ].join('\n').replace(/~~~/g, '```');
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.gitpushreview/docs/diy/auth.md'), diyRule, 'utf8');
  fs.writeFileSync(path.join(dir, 'docs/payment.rulebook'), 'payment callback must be idempotent', 'utf8');

  const result = await routeCommand(['explain', 'docs/payment.rulebook'], { cwd: dir, env: {}, stdout: [] });

  assert.equal(result.exitCode, 0);
  assert.match(result.output, /证据线索/);
  assert.doesNotMatch(result.output, /软拦截.*DIY-PAY-999/);
});


test('explain human output summarizes candidate routing diagnostics in Chinese', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-explain-summary-'));
  await initWorkspace({ cwd: dir, installHook: false });
  fs.mkdirSync(path.join(dir, 'src/main/resources/mapper'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src/main/resources/mapper/OrderMapper.xml'), '<select id="find">select * from orders</select>', 'utf8');

  const result = await routeCommand(['explain', 'src/main/resources/mapper/OrderMapper.xml'], { cwd: dir, env: {}, stdout: [] });

  assert.equal(result.exitCode, 0);
  assert.match(result.output, /候选规则/);
  assert.match(result.output, /来源统计/);
  assert.match(result.output, /能力统计/);
  assert.match(result.output, /主要命中原因/);
  assert.match(result.output, /主要过滤原因/);
});


test('explain --staged runs as diagnostics and reports skip mode note', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-explain-skip-'));
  await initWorkspace({ cwd: dir, installHook: false });
  fs.writeFileSync(path.join(dir, '.gitpushreview', 'config', 'review-mode.json'), JSON.stringify({ mode: 'skip' }), 'utf8');
  execFileSync('git', ['init'], { cwd: dir, stdio: 'ignore' });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir, stdio: 'ignore' });
  execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: dir, stdio: 'ignore' });
  fs.mkdirSync(path.join(dir, 'src/main/java'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src/main/java/App.java'), 'class App {}\n', 'utf8');
  execFileSync('git', ['add', 'src/main/java/App.java'], { cwd: dir, stdio: 'ignore' });

  const result = await routeCommand(['explain', '--staged'], { cwd: dir, env: {}, stdout: [] });

  assert.equal(result.exitCode, 0);
  assert.match(result.output, /当前审核模式：跳过/);
  assert.match(result.output, /explain 仍会执行诊断/);
});
