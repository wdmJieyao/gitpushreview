import test from 'node:test';
import assert from 'node:assert/strict';
import { routeCommand } from '../src/cli.js';

test('routeCommand returns help for --help', async () => {
  const result = await routeCommand(['--help'], { cwd: process.cwd(), env: {}, stdout: [] });
  assert.equal(result.exitCode, 0);
  assert.match(result.output, /gitpushreview/);
  assert.match(result.output, /init/);
  assert.match(result.output, /check/);
});
