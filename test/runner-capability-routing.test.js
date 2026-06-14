import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initWorkspace } from '../src/workspace.js';
import { runReview } from '../src/review/runner.js';
import { routeCommand } from '../src/cli.js';

function snapshotTree(root) {
  const rows = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else rows.push({ file: path.relative(root, full).replace(/\\/g, '/'), size: stat.size, mtimeMs: stat.mtimeMs, content: fs.readFileSync(full, 'utf8') });
    }
  }
  walk(root);
  return rows;
}

test('runReview sends only capability-routed rules to the model prompt', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-runner-routing-'));
  await initWorkspace({ cwd: dir, installHook: false });
  let prompt = '';

  await runReview({
    cwd: dir,
    diff: 'diff --git a/src/pages/Login.vue b/src/pages/Login.vue\n+<template><div>{{ title }}</div></template>\n',
    files: ['src/pages/Login.vue'],
    fileContents: { 'src/pages/Login.vue': '<template><div>{{ title }}</div></template>' },
    modelInvoker: async ({ messages }) => {
      prompt = messages[1].content;
      return '{"findings":[]}';
    },
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  });

  assert.match(prompt, /# Markdown Rules/);
  assert.match(prompt, /DEFAULT-VUE-/);
  assert.doesNotMatch(prompt, /DEFAULT-MYSQL-/);
  assert.doesNotMatch(prompt, /DEFAULT-ORACLE-/);
  assert.doesNotMatch(prompt, /DEFAULT-DROOLS-/);
  assert.doesNotMatch(prompt, /DEFAULT-RABBITMQ-/);
  assert.match(prompt, /selectedRules=/);
  assert.match(prompt, /excludedRules=/);
});

test('explain --json exposes capability routing and rule candidates', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-explain-capability-'));
  await initWorkspace({ cwd: dir, installHook: false });
  fs.mkdirSync(path.join(dir, 'src/main/resources/mapper'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src/main/resources/mapper/OrderMapper.xml'), '<select id="find">select * from orders</select>', 'utf8');

  const result = await routeCommand(['explain', '--json', 'src/main/resources/mapper/OrderMapper.xml'], { cwd: dir, env: {}, stdout: [] });
  const parsed = JSON.parse(result.output);

  assert.equal(result.exitCode, 0);
  assert.ok(parsed.routes.capabilities.includes('persistence.mybatis'));
  assert.ok(parsed.routes.capabilities.includes('persistence.sql'));
  assert.equal(parsed.routes.unknownLimited, false);
  assert.ok(parsed.ruleRouting.totalRules > parsed.ruleRouting.selectedRules);
  assert.ok(Array.isArray(parsed.ruleCandidates));
});

test('profile command is read-only and does not create project-profile config', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-profile-readonly-'));
  await initWorkspace({ cwd: dir, installHook: false });
  fs.writeFileSync(path.join(dir, 'package.json'), '{"dependencies":{"vue":"latest"}}', 'utf8');
  const workspace = path.join(dir, '.gitpushreview');
  const before = snapshotTree(workspace);

  const result = await routeCommand(['profile', '--json'], { cwd: dir, env: {}, stdout: [] });
  const after = snapshotTree(workspace);
  const parsed = JSON.parse(result.output);

  assert.equal(result.exitCode, 0);
  assert.equal(parsed.exists, false);
  assert.ok(parsed.suggestions.some((item) => item.capability === 'frontend.vue'));
  assert.equal(fs.existsSync(path.join(workspace, 'config', 'project-profile.json')), false);
  assert.deepEqual(after, before);
});


test('runReview does not route database or middleware rules into ordinary Java service files', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-runner-java-routing-'));
  await initWorkspace({ cwd: dir, installHook: false });
  let prompt = '';

  await runReview({
    cwd: dir,
    diff: 'diff --git a/src/main/java/com/acme/UserService.java b/src/main/java/com/acme/UserService.java\n+class UserService { void save() {} }\n',
    files: ['src/main/java/com/acme/UserService.java'],
    fileContents: { 'src/main/java/com/acme/UserService.java': 'class UserService { void save() {} }' },
    modelInvoker: async ({ messages }) => {
      prompt = messages[1].content;
      return '{"findings":[]}';
    },
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  });

  assert.match(prompt, /DEFAULT-JAVA-/);
  assert.doesNotMatch(prompt, /DEFAULT-MYSQL-/);
  assert.doesNotMatch(prompt, /DEFAULT-ORACLE-/);
  assert.doesNotMatch(prompt, /DEFAULT-DROOLS-/);
  assert.doesNotMatch(prompt, /DEFAULT-RABBITMQ-/);
  assert.doesNotMatch(prompt, /DEFAULT-REDIS-/);
});


test('runReview expands unknown files only through explicit rule signals and sends evidence to AI', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-runner-signal-routing-'));
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
  fs.writeFileSync(path.join(dir, '.gitpushreview/docs/diy/auth.md'), diyRule, 'utf8');
  let prompt = '';

  await runReview({
    cwd: dir,
    diff: 'diff --git a/docs/payment.rulebook b/docs/payment.rulebook\n+payment callback must be idempotent\n',
    files: ['docs/payment.rulebook'],
    fileContents: { 'docs/payment.rulebook': 'payment callback must be idempotent' },
    modelInvoker: async ({ messages }) => {
      prompt = messages[1].content;
      return '{"findings":[]}';
    },
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  });

  assert.match(prompt, /DIY-PAY-999/);
  assert.match(prompt, /signal-content/);
  assert.match(prompt, /检测到支付回调变更/);
});
