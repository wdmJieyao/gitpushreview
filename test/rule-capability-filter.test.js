import test from 'node:test';
import assert from 'node:assert/strict';
import { routeRulesForFiles } from '../src/rules/router.js';
import { buildCapabilityContext } from '../src/routes/capability-context.js';

const rules = [
  { id: 'JAVA', paths: ['**/*.java'], capabilities: ['language.java'] },
  { id: 'MYSQL', paths: ['**/*.java', '**/*.sql'], capabilities: ['persistence.sql.mysql'] },
  { id: 'RABBIT', paths: ['**/*.java', '**/*.yml'], capabilities: ['middleware.mq.rabbitmq'] },
  { id: 'COMMON', paths: [], capabilities: ['common.core'], scope: 'common' },
  { id: 'LEGACY', paths: ['**/*.vue'] },
];

test('routeRulesForFiles filters by both paths and capabilities', () => {
  const service = buildCapabilityContext({ file: 'src/main/java/UserService.java', content: 'class UserService {}' });
  const routed = routeRulesForFiles({ rules, routes: [service] });
  const ids = routed.rules.map((rule) => rule.id);

  assert.ok(ids.includes('JAVA'));
  assert.ok(ids.includes('COMMON'));
  assert.equal(ids.includes('MYSQL'), false);
  assert.equal(ids.includes('RABBIT'), false);
  assert.equal(ids.includes('LEGACY'), false);
  assert.equal(routed.diagnostics.excludedRules, 3);
});

test('routeRulesForFiles keeps unknown-limited files inside common rules only', () => {
  const unknown = buildCapabilityContext({ file: 'README.md', content: 'plain notes' });
  const routed = routeRulesForFiles({ rules, routes: [unknown] });
  const ids = routed.rules.map((rule) => rule.id);

  assert.deepEqual(ids, ['COMMON']);
  assert.match(routed.diagnostics.decisions.find((item) => item.ruleId === 'MYSQL').skipReason, /unknown-limited|capability-mismatch/);
});

test('routeRulesForFiles allows legacy path-only rules when path matches', () => {
  const vue = buildCapabilityContext({ file: 'src/pages/Login.vue', content: '<template />' });
  const routed = routeRulesForFiles({ rules, routes: [vue] });
  const ids = routed.rules.map((rule) => rule.id);

  assert.ok(ids.includes('LEGACY'));
  assert.ok(ids.includes('COMMON'));
});


test('routeRulesForFiles blocks unknown-limited files from broad legacy rules', () => {
  const unknown = buildCapabilityContext({ file: 'README.md', content: 'plain notes' });
  const routed = routeRulesForFiles({
    rules: [
      { id: 'BROAD-LEGACY', paths: ['**/*'] },
      { id: 'COMMON-SCOPE', paths: ['**/*'], scope: 'common' },
      { id: 'COMMON-CAPABILITY', paths: ['**/*'], capabilities: ['common.core'] },
    ],
    routes: [unknown],
  });
  const ids = routed.rules.map((rule) => rule.id);

  assert.equal(ids.includes('BROAD-LEGACY'), false);
  assert.ok(ids.includes('COMMON-SCOPE'));
  assert.ok(ids.includes('COMMON-CAPABILITY'));
  assert.match(routed.diagnostics.decisions.find((item) => item.ruleId === 'BROAD-LEGACY').skipReason, /unknown-limited/);
});
