import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { initWorkspace } from '../../src/workspace.js';

export function makeTempProject(prefix = 'gpr-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function initGitRepo(dir) {
  execFileSync('git', ['init'], { cwd: dir, stdio: 'ignore' });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir, stdio: 'ignore' });
  execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: dir, stdio: 'ignore' });
}

export function stageFile(dir, file, content) {
  const target = path.join(dir, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
  execFileSync('git', ['add', file], { cwd: dir, stdio: 'ignore' });
}

export async function makeInitializedWorkspace({ prefix = 'gpr-workspace-', git = false, installHook = false } = {}) {
  const dir = makeTempProject(prefix);
  if (git) initGitRepo(dir);
  const initResult = await initWorkspace({ cwd: dir, installHook });
  return { dir, initResult };
}
