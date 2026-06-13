import test from 'node:test';
import assert from 'node:assert/strict';
import { parseChangedFiles } from '../src/git.js';

test('parseChangedFiles extracts paths from name-status output', () => {
  const files = parseChangedFiles('M\tbackend/app.py\nA\tfrontend/src/main.js\n');
  assert.deepEqual(files, ['backend/app.py', 'frontend/src/main.js']);
});
