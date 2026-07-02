import test from 'node:test';
import assert from 'node:assert/strict';
import { routeCommand } from '../src/cli.js';

const context = { cwd: process.cwd(), env: {}, stdout: { write: () => {} }, stdin: { isTTY: false } };

test('general help explains every supported command in Chinese', async () => {
  const result = await routeCommand(['--help'], context);

  for (const command of ['init', 'check', 'explain', 'profile', 'doctor', 'bdr status']) {
    assert.match(result.output, new RegExp(command.replace(' ', '\\s+')));
  }
  assert.match(result.output, /初始化/);
  assert.match(result.output, /审核已暂存/);
  assert.match(result.output, /诊断/);
});

test('command-specific help explains options and Chinese examples', async () => {
  const commands = [
    ['init', '--help'],
    ['check', '--help'],
    ['profile', '--help'],
    ['doctor', '--help'],
    ['bdr', 'status', '--help'],
  ];

  for (const args of commands) {
    const result = await routeCommand(args, context);
    assert.equal(result.exitCode, 0);
    assert.match(result.output, /用法/);
    assert.match(result.output, /说明|选项/);
    assert.match(result.output, /示例|无需选项/);
  }
});

test('invalid usage points to Chinese help path', async () => {
  const result = await routeCommand(['check', '--bad-option'], context);

  assert.equal(result.exitCode, 1);
  assert.match(result.output, /参数无效/);
  assert.match(result.output, /gitpushreview check --help/);
});
