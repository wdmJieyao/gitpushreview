import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('package exposes gitpushreview bin and required files', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(pkg.bin.gitpushreview, './bin/gitpushreview.js');
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.engines.node, '>=18');
});

test('bin fallback error output is Chinese', () => {
  const bin = fs.readFileSync('bin/gitpushreview.js', 'utf8');
  assert.match(bin, /执行失败/);
});
