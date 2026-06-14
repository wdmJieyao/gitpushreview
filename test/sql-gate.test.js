import test from 'node:test';
import assert from 'node:assert/strict';
import { runSqlGate } from '../src/gates/sql.js';
import { buildFileRouteContext } from '../src/routes/file-route-context.js';

function check(file, content) {
  const route = buildFileRouteContext({ file, content });
  return runSqlGate({ file: route.file, content, route });
}

test('SQL gate hard-blocks ordinary sql INSERT with fewer values than columns', () => {
  const findings = check('db/migrations/V20260614__bad_insert.sql', "insert into users (id, name, email) values (1, 'Alice');");

  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, 'DEFAULT-SQL-INSERT-ARITY-001');
  assert.equal(findings[0].blocking, 'hard');
  assert.equal(findings[0].severity, 'critical');
  assert.equal(findings[0].file, 'db/migrations/V20260614__bad_insert.sql');
  assert.equal(findings[0].line, 1);
  assert.match(findings[0].evidence, /3 个列.*2 个值|列数.*值数量/);
  assert.match(findings[0].suggestion, /补齐|删除|保持一致/);
});

test('SQL gate hard-blocks ordinary sql INSERT with more values than columns', () => {
  const findings = check('sql/test.sql', "insert into users (id, name) values (1, 'Alice', 'extra');");

  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, 'DEFAULT-SQL-INSERT-ARITY-001');
  assert.equal(findings[0].blocking, 'hard');
  assert.match(findings[0].evidence, /2 个列.*3 个值|列数.*值数量/);
});

test('SQL gate accepts matching INSERT arity', () => {
  const findings = check('sql/good.sql', "insert into users (id, name, email) values (1, 'Alice', 'a@example.com');");

  assert.equal(findings.some((finding) => finding.ruleId === 'DEFAULT-SQL-INSERT-ARITY-001'), false);
});

test('SQL gate handles multiple VALUES tuples', () => {
  const findings = check('sql/multi.sql', "insert into users (id, name) values (1, 'A'), (2, 'B', 'extra');");

  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, 'DEFAULT-SQL-INSERT-ARITY-001');
  assert.match(findings[0].evidence, /第 2 组 VALUES/);
});

test('SQL gate handles parentheses inside strings and functions', () => {
  const findings = check('sql/functions.sql', "insert into audit_log (id, message, created_at) values (1, 'hello (world)', now());");

  assert.equal(findings.length, 0);
});

test('SQL gate hard-blocks unclosed strings', () => {
  const findings = check('sql/bad-string.sql', "insert into users (id, name) values (1, 'Alice);");

  assert.equal(findings[0].ruleId, 'DEFAULT-SQL-SYNTAX-001');
  assert.equal(findings[0].blocking, 'hard');
  assert.match(findings[0].evidence, /未闭合/);
});

test('SQL gate hard-blocks unclosed left parenthesis', () => {
  const findings = check('sql/bad-left-paren.sql', "insert into users (id, name values (1, 'Alice');");

  assert.equal(findings[0].ruleId, 'DEFAULT-SQL-SYNTAX-001');
  assert.equal(findings[0].blocking, 'hard');
  assert.match(findings[0].evidence, /括号/);
});

test('SQL gate hard-blocks extra right parenthesis', () => {
  const findings = check('sql/bad-right-paren.sql', "insert into users (id, name)) values (1, 'Alice');");

  assert.equal(findings[0].ruleId, 'DEFAULT-SQL-SYNTAX-001');
  assert.equal(findings[0].blocking, 'hard');
  assert.match(findings[0].evidence, /括号/);
});
