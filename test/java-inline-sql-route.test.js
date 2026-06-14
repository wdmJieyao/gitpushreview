import test from 'node:test';
import assert from 'node:assert/strict';
import { extractJavaInlineSql } from '../src/gates/java-inline-sql.js';
import { runDeterministicGates } from '../src/gates/deterministic.js';

test('extractJavaInlineSql extracts MyBatis annotation SQL', () => {
  const snippets = extractJavaInlineSql('@Select("select * from users where id = #{id}")\nUser find(Long id);');

  assert.equal(snippets.length, 1);
  assert.equal(snippets[0].kind, 'annotation');
  assert.equal(snippets[0].line, 1);
  assert.match(snippets[0].sql, /select \* from users/);
});

test('extractJavaInlineSql extracts concatenated string SQL conservatively', () => {
  const snippets = extractJavaInlineSql('String sql = "insert into users(id, name) " +\n             "values (?, ?, ?)";');

  assert.equal(snippets.length, 1);
  assert.equal(snippets[0].line, 1);
  assert.match(snippets[0].sql, /insert into users\(id, name\) values \(\?, \?, \?\)/i);
});

test('extractJavaInlineSql does not treat arbitrary log strings as SQL', () => {
  const snippets = extractJavaInlineSql('log.info("insert order success");');

  assert.equal(snippets.length, 0);
});

test('Java inline SQL route feeds SQL gate and preserves original Java location', () => {
  const findings = runDeterministicGates({
    files: ['src/main/java/com/acme/UserMapper.java'],
    fileContents: {
      'src/main/java/com/acme/UserMapper.java': '@Insert("insert into users(id, name) values (#{id})")\nint save(User user);',
    },
  }).findings;

  assert.equal(findings.length, 1);
  assert.equal(findings[0].source, 'deterministic');
  assert.equal(findings[0].ruleId, 'DEFAULT-SQL-INSERT-ARITY-001');
  assert.equal(findings[0].file, 'src/main/java/com/acme/UserMapper.java');
  assert.equal(findings[0].line, 1);
  assert.equal(findings[0].blocking, 'hard');
  assert.equal(findings[0].routeLabel, 'java-inline-sql');
  assert.match(findings[0].evidence, /内嵌 SQL/);
  assert.match(findings[0].evidence, /insert into users/);
  assert.doesNotMatch(findings[0].evidence, /�|鍐|锛|\{snippet\.sql\}/);
});
