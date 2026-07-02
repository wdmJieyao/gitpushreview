import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCliError, routeCommand } from '../src/cli.js';
import { makeInitializedWorkspace } from './helpers/workspace.js';

test('routeCommand returns help for --help', async () => {
  const result = await routeCommand(['--help'], { cwd: process.cwd(), env: {}, stdout: [] });
  assert.equal(result.exitCode, 0);
  assert.match(result.output, /gitpushreview/);
  assert.match(result.output, /用法/);
  assert.match(result.output, /init/);
  assert.match(result.output, /check/);
  assert.match(result.output, /explain/);
});

test('routeCommand returns explain help in Chinese', async () => {
  const result = await routeCommand(['explain'], { cwd: process.cwd(), env: {}, stdout: [] });

  assert.equal(result.exitCode, 0);
  assert.match(result.output, /用法/);
  assert.match(result.output, /gitpushreview explain/);
  assert.match(result.output, /规则|能力|路由|确定性/);
});

test('routeCommand reports unknown command in Chinese', async () => {
  const result = await routeCommand(['unknown'], { cwd: process.cwd(), env: {}, stdout: [] });

  assert.equal(result.exitCode, 1);
  assert.match(result.output, /未知命令：unknown/);
});

test('formatCliError translates common runtime errors', () => {
  assert.match(formatCliError(Object.assign(new Error('ENOENT: no such file or directory'), { code: 'ENOENT' })), /缺少必要文件/);
  assert.match(formatCliError(new Error('Command failed: git rev-parse --show-toplevel')), /Git 命令执行失败/);
  assert.match(formatCliError(new Error('boom')), /执行失败：boom/);
});

test('routeCommand reports OpenMole bad-smell status in Chinese', async () => {
  const { dir } = await makeInitializedWorkspace({ prefix: 'gpr-cli-bdr-status-' });
  const result = await routeCommand(['bdr', 'status'], { cwd: dir, env: {}, stdout: { write: () => {} }, stdin: { isTTY: false } });

  assert.equal(result.exitCode, 0);
  assert.match(result.output, /坏味道检测包：openmole 0\.8\.2/);
});
