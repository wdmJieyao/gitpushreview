import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runDoctor } from '../src/doctor.js';

test('runDoctor reports missing workspace', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-doctor-'));
  const report = runDoctor({ cwd: dir, env: {} });
  assert.equal(report.ok, false);
  assert.equal(report.checks.some((check) => check.name === 'workspace' && !check.ok), true);
});
