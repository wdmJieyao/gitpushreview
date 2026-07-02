import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('package exposes gitpushreview bin and required files', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(pkg.bin.gitpushreview, './bin/gitpushreview.js');
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.engines.node, '>=18');
});

test('vendored bad-smell context is approved OpenMole target', () => {
  const pkg = JSON.parse(fs.readFileSync('vendor/bdr/package.json', 'utf8'));

  assert.equal(pkg.name, 'openmole');
  assert.equal(pkg.version, '0.8.2');
});

test('bin fallback error output is Chinese', () => {
  const bin = fs.readFileSync('bin/gitpushreview.js', 'utf8');
  assert.match(bin, /执行失败/);
});

test('README explains usage and scoring model', () => {
  const readme = fs.readFileSync('README.md', 'utf8');

  assert.match(readme, /快速开始/);
  assert.match(readme, /计分机制/);
  assert.match(readme, /weightedScore = score × weight/);
  assert.match(readme, /softBlockScore/);
  assert.match(readme, /hardBlockScore/);
  assert.match(readme, /hardBlock: true/);
});

test('README documents every built-in default rule file', () => {
  const readme = fs.readFileSync('README.md', 'utf8');
  const defaultFiles = [
    'java.md',
    'vue.md',
    'python.md',
    'mysql.md',
    'oracle.md',
    'postgresql.md',
    'oceanbase.md',
    'redis.md',
    'rabbitmq.md',
    'drools.md',
    'security.md',
    'workflow.md',
    'sqlfluff.md',
  ];

  for (const file of defaultFiles) {
    assert.match(readme, new RegExp(file.replace('.', '\\.') ));
  }
});
