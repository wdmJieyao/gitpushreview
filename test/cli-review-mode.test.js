import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { makeInitializedWorkspace, stageFile, initGitRepo } from './helpers/workspace.js';
import { routeCommand } from '../src/cli.js';

function stdoutCapture() {
  const chunks = [];
  return { chunks, write: (chunk) => chunks.push(chunk) };
}

function writeMode(dir, mode) {
  fs.writeFileSync(path.join(dir, '.gitpushreview', 'config', 'review-mode.json'), `${JSON.stringify({ mode }, null, 2)}\n`, 'utf8');
}

test('check skip mode exits before staged diff or model review', async () => {
  const { dir } = await makeInitializedWorkspace({ prefix: 'gpr-cli-skip-' });
  writeMode(dir, 'skip');
  let called = false;
  const stdout = stdoutCapture();

  const result = await routeCommand(['check', '--staged'], {
    cwd: dir,
    env: {},
    stdout,
    stdin: { isTTY: false },
    modelInvoker: async () => {
      called = true;
      return '{"findings":[]}';
    },
  });

  assert.equal(result.exitCode, 0);
  assert.equal(called, false);
  assert.match(stdout.chunks.join(''), /跳过检查/);
});

test('check skip mode JSON output includes effective mode without findings', async () => {
  const { dir } = await makeInitializedWorkspace({ prefix: 'gpr-cli-skip-json-' });
  writeMode(dir, 'skip');
  const stdout = stdoutCapture();

  const result = await routeCommand(['check', '--staged', '--json'], {
    cwd: dir,
    env: {},
    stdout,
    stdin: { isTTY: false },
  });
  const parsed = JSON.parse(stdout.chunks.join(''));

  assert.equal(result.exitCode, 0);
  assert.equal(parsed.mode, 'skip');
  assert.deepEqual(parsed.findings, []);
  assert.deepEqual(parsed.rejectedFindings, []);
});

test('check log mode runs review but exits without blocking', async () => {
  const { dir } = await makeInitializedWorkspace({ prefix: 'gpr-cli-log-', git: true });
  writeMode(dir, 'log');
  stageFile(dir, 'src/main/java/App.java', 'class App {}\n');
  let called = false;
  const stdout = stdoutCapture();

  const result = await routeCommand(['check', '--staged', '--json'], {
    cwd: dir,
    env: { GITPUSHREVIEW_API_KEY: 'test' },
    stdout,
    stdin: { isTTY: false },
    modelInvoker: async () => {
      called = true;
      return '{"findings":[{"source":"default","ruleId":"DEFAULT-JAVA-SEC-001","score":95,"weightedScore":95,"blocking":"hard","title":"x","severity":"critical"}]}';
    },
  });
  const parsed = JSON.parse(stdout.chunks.join(''));

  assert.equal(called, true);
  assert.equal(result.exitCode, 0);
  assert.equal(parsed.mode, 'log');
  assert.equal(parsed.decision.status, 'HARD_BLOCK');
});

test('check missing mode defaults to normal blocking behavior', async () => {
  const { dir } = await makeInitializedWorkspace({ prefix: 'gpr-cli-normal-', git: true });
  stageFile(dir, 'src/main/java/App.java', 'class App {}\n');
  const stdout = stdoutCapture();

  const result = await routeCommand(['check', '--staged', '--json'], {
    cwd: dir,
    env: { GITPUSHREVIEW_API_KEY: 'test' },
    stdout,
    stdin: { isTTY: false },
    modelInvoker: async () => '{"findings":[{"source":"default","ruleId":"DEFAULT-JAVA-SEC-001","score":95,"weightedScore":95,"blocking":"hard","title":"x","severity":"critical"}]}',
  });

  assert.equal(result.exitCode, 1);
});
