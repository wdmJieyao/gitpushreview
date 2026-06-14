import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { getStagedFileContents, getStagedSnapshot, parseChangedFiles } from '../src/git.js';

test('parseChangedFiles extracts paths from name-status output', () => {
  const files = parseChangedFiles('M\tbackend/app.py\nA\tfrontend/src/main.js\n');
  assert.deepEqual(files, ['backend/app.py', 'frontend/src/main.js']);
});

test('parseChangedFiles handles renamed staged files', () => {
  const files = parseChangedFiles('R100\tdb/old.sql\tdb/new.sql\n');
  assert.deepEqual(files, ['db/new.sql']);
});

test('parseChangedFiles normalizes Windows separators from name-status', () => {
  const files = parseChangedFiles('M\tsrc\\main\\resources\\mapper\\OrderMapper.xml\n');
  assert.deepEqual(files, ['src/main/resources/mapper/OrderMapper.xml']);
});

test('getStagedSnapshot reads staged blob contents, not working tree contents', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-staged-blob-'));
  execFileSync('git', ['init'], { cwd: dir, stdio: 'ignore' });
  fs.mkdirSync(path.join(dir, 'sql'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'sql/test.sql'), "insert into users(id, name) values (1);\n", 'utf8');
  execFileSync('git', ['add', 'sql/test.sql'], { cwd: dir, stdio: 'ignore' });
  fs.writeFileSync(path.join(dir, 'sql/test.sql'), "insert into users(id, name) values (1, 'ok');\n", 'utf8');

  const snapshot = getStagedSnapshot(dir);

  assert.equal(snapshot.fileContents['sql/test.sql'].trim(), 'insert into users(id, name) values (1);');
});

test('getStagedFileContents keeps deleted files out of file contents', () => {
  const contents = getStagedFileContents({
    cwd: process.cwd(),
    files: ['sql/deleted.sql'],
    showFile: () => {
      const error = new Error('missing');
      error.status = 128;
      throw error;
    },
  });

  assert.deepEqual(contents, {});
});
