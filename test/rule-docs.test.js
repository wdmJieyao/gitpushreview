import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_DOCS } from '../src/templates.js';
import { parseMarkdownRules } from '../src/rules/markdown.js';

test('rule authoring docs explain format and scoring in Chinese', () => {
  const guide = DEFAULT_DOCS['docs/RULES.md'];

  assert.match(guide, /规则编写格式/);
  assert.match(guide, /score/);
  assert.match(guide, /weightedScore = score × weight/);
  assert.match(guide, /hardBlock: true/);
  assert.match(guide, /规则说明/);
  assert.match(guide, /修复建议/);
});

test('project and diy README files explain their intended priority', () => {
  assert.match(DEFAULT_DOCS['docs/project/README.md'], /项目规则/);
  assert.match(DEFAULT_DOCS['docs/project/README.md'], /weight: 1.5/);
  assert.match(DEFAULT_DOCS['docs/diy/README.md'], /DIY 规则/);
  assert.match(DEFAULT_DOCS['docs/diy/README.md'], /weight: 2.0/);
  assert.match(DEFAULT_DOCS['docs/diy/README.md'], /最高优先级/);
});

test('project and diy example docs contain parseable rules', () => {
  const projectRules = parseMarkdownRules(DEFAULT_DOCS['docs/project/architecture.md'], {
    source: 'Project Rules',
    file: '../docs/project/architecture.md',
    weight: 1.5,
  });
  const diyRules = parseMarkdownRules(DEFAULT_DOCS['docs/diy/auth.md'], {
    source: 'DIY Rules',
    file: '../docs/diy/auth.md',
    weight: 2,
  });

  assert.equal(projectRules[0].id, 'PROJECT-ARCH-001');
  assert.equal(projectRules[0].score, 60);
  assert.equal(projectRules[0].hardBlock, false);
  assert.equal(diyRules[0].id, 'DIY-AUTH-001');
  assert.equal(diyRules[0].score, 90);
  assert.equal(diyRules[0].hardBlock, true);
  assert.ok(diyRules[0].body.includes('修复建议'));
});
