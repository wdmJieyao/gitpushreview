import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initWorkspace } from '../src/workspace.js';
import { runReview } from '../src/review/runner.js';

test('runReview returns decision from fake model findings', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-runner-'));
  await initWorkspace({ cwd: dir, installHook: false });
  const result = await runReview({
    cwd: dir,
    diff: 'diff --git a/backend/app.py b/backend/app.py\n+print(process.env.SECRET)\n',
    files: ['backend/app.py'],
    modelInvoker: async () => '{"findings":[{"source":"default","ruleId":"DEFAULT-SEC-001","score":90,"weightedScore":90,"blocking":"hard","title":"secret leak","severity":"critical"}]}',
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  });

  assert.equal(result.decision.status, 'HARD_BLOCK');
  assert.equal(result.findings.length, 1);
});
