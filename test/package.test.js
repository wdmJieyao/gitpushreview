import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('package exposes gitpushreview bin and required files', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(pkg.bin.gitpushreview, './bin/gitpushreview.js');
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.engines.node, '>=18');
});
