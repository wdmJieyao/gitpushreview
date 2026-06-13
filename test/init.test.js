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
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'docs', 'default', 'code-review.md')), true);
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'docs', 'diy', 'auth.md')), true);
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'vendor', 'bdr', 'package.json')), true);
});
