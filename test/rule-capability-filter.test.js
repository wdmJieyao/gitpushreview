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


test('routeRulesForFiles expands unknown-limited only when rule signal matches and allows expansion', () => {
  const unknown = buildCapabilityContext({ file: 'docs/payment.rulebook', content: 'payment callback must be idempotent' });
  const routed = routeRulesForFiles({
    rules: [
      { id: 'PAYMENT-NO-SIGNAL', paths: ['**/*'], signalContent: ['payment'], allowUnknownExpansion: false },
      { id: 'PAYMENT-SIGNAL', paths: ['**/*'], signalContent: ['payment callback'], allowUnknownExpansion: true },
      { id: 'ORDER-SIGNAL', paths: ['**/*'], signalContent: ['order callback'], allowUnknownExpansion: true },
    ],
    routes: [unknown],
    fileContents: { 'docs/payment.rulebook': 'payment callback must be idempotent' },
  });
  const ids = routed.rules.map((rule) => rule.id);

  assert.equal(ids.includes('PAYMENT-NO-SIGNAL'), false);
  assert.ok(ids.includes('PAYMENT-SIGNAL'));
  assert.equal(ids.includes('ORDER-SIGNAL'), false);
  assert.match(routed.diagnostics.decisions.find((item) => item.ruleId === 'PAYMENT-SIGNAL').matchReason, /signal-content/);
});


test('routeRulesForFiles keeps signals as evidence-only for recognized non-matching files', () => {
  const java = buildCapabilityContext({ file: 'src/main/java/UserService.java', content: 'payment callback must be idempotent' });
  const routed = routeRulesForFiles({
    rules: [
      { id: 'PAYMENT-SQL', paths: ['**/*.sql'], capabilities: ['persistence.sql'], signalContent: ['payment callback'], allowUnknownExpansion: true },
    ],
    routes: [java],
    fileContents: { 'src/main/java/UserService.java': 'payment callback must be idempotent' },
  });

  assert.deepEqual(routed.rules.map((rule) => rule.id), []);
  assert.match(routed.diagnostics.decisions[0].skipReason, /signal-is-evidence-only/);
});


test('routeRulesForFiles requires every required capability when present', () => {
  const genericSql = buildCapabilityContext({
    file: 'src/main/resources/mapper/OrderMapper.xml',
    content: '<select id="find">select * from orders</select>',
  });
  const mysqlSql = buildCapabilityContext({
    file: 'db/mysql/V1__orders.sql',
    content: 'create table orders(id bigint auto_increment primary key) engine=InnoDB;',
  });
  const routedGeneric = routeRulesForFiles({
    rules: [
      { id: 'GENERIC-SQL', paths: ['**/*.xml', '**/*.sql'], capabilities: ['persistence.sql'] },
      { id: 'MYSQL-STRICT', paths: ['**/*.xml', '**/*.sql'], capabilities: ['persistence.sql'], requiredCapabilities: ['persistence.sql.mysql'] },
      { id: 'LEGACY-OR', paths: ['**/*.xml', '**/*.sql'], capabilities: ['persistence.sql.mysql', 'persistence.sql'] },
    ],
    routes: [genericSql],
    fileContents: { [genericSql.file]: '<select id="find">select * from orders</select>' },
  });
  const routedMysql = routeRulesForFiles({
    rules: [
      { id: 'MYSQL-STRICT', paths: ['**/*.xml', '**/*.sql'], capabilities: ['persistence.sql'], requiredCapabilities: ['persistence.sql.mysql'] },
    ],
    routes: [mysqlSql],
    fileContents: { [mysqlSql.file]: 'create table orders(id bigint auto_increment primary key) engine=InnoDB;' },
  });

  assert.deepEqual(routedGeneric.rules.map((rule) => rule.id), ['GENERIC-SQL', 'LEGACY-OR']);
  assert.match(routedGeneric.diagnostics.decisions.find((item) => item.ruleId === 'MYSQL-STRICT').skipReason, /required-capability-mismatch:persistence\.sql\.mysql/);
  assert.deepEqual(routedMysql.rules.map((rule) => rule.id), ['MYSQL-STRICT']);
});


test('routeRulesForFiles reports duplicate rule ids deterministically', () => {
  const route = buildCapabilityContext({ file: 'src/main/java/App.java', content: 'class App {}' });
  const routed = routeRulesForFiles({
    rules: [
      { id: 'DUP-RULE', source: 'a', file: 'rules/a.md', paths: ['**/*.java'], capabilities: ['language.java'] },
      { id: 'DUP-RULE', source: 'b', file: 'rules/b.md', paths: ['**/*.java'], capabilities: ['language.java'] },
    ],
    routes: [route],
  });

  assert.deepEqual(routed.rules.map((rule) => rule.id), ['DUP-RULE']);
  assert.deepEqual(routed.diagnostics.duplicates, [{ ruleId: 'DUP-RULE', sources: ['rules/a.md', 'rules/b.md'] }]);
  assert.deepEqual(routed.diagnostics.candidateRuleIds, ['DUP-RULE']);
});
