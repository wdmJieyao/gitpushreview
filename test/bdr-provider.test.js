import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadBdrContext } from '../src/bdr/provider.js';

test('loadBdrContext reads available BDR skills dynamically', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-bdr-'));
  const bdr = path.join(dir, 'vendor', 'bdr');
  fs.mkdirSync(path.join(bdr, 'skills', 'bdr-explore-to-change'), { recursive: true });
  fs.writeFileSync(path.join(bdr, 'package.json'), '{"name":"agile-bdr","version":"0.5.0"}');
  fs.writeFileSync(path.join(bdr, 'skills', 'bdr-explore-to-change', 'SKILL.md'), '# BDR Explore\n\nBad smell rules.');

  const context = loadBdrContext(bdr);
  assert.equal(context.package.version, '0.5.0');
  assert.equal(context.skills.length, 1);
  assert.match(context.text, /Bad smell rules/);
});

test('loadBdrContext reads OpenMole skills dynamically', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-openmole-'));
  const bdr = path.join(dir, 'vendor', 'bdr');
  fs.mkdirSync(path.join(bdr, 'skills', 'openmole-explore'), { recursive: true });
  fs.writeFileSync(path.join(bdr, 'package.json'), '{"name":"openmole","version":"0.8.2"}');
  fs.writeFileSync(path.join(bdr, 'skills', 'openmole-explore', 'SKILL.md'), '# OpenMole Explore\n\nBad smell context.');

  const context = loadBdrContext(bdr);
  assert.equal(context.package.name, 'openmole');
  assert.equal(context.package.version, '0.8.2');
  assert.deepEqual(context.skills.map((skill) => skill.name), ['openmole-explore']);
  assert.match(context.text, /Bad-smell package: openmole 0.8.2/);
});
