import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCliError, routeCommand } from '../src/cli.js';

test('routeCommand returns help for --help', async () => {
  const result = await routeCommand(['--help'], { cwd: process.cwd(), env: {}, stdout: [] });
  assert.equal(result.exitCode, 0);
  assert.match(result.output, /gitpushreview/);
  assert.match(result.output, /用法/);
  assert.match(result.output, /init/);
  assert.match(result.output, /check/);
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
