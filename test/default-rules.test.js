import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DEFAULT_DOCS, RULES_INDEX } from '../src/templates.js';
import { initWorkspace } from '../src/workspace.js';
import { parseRuleIndex, loadMarkdownRules } from '../src/rules/index.js';
import { parseMarkdownRules } from '../src/rules/markdown.js';

const expectedDefaultFiles = [
  '../docs/default/java.md',
  '../docs/default/vue.md',
  '../docs/default/python.md',
  '../docs/default/mysql.md',
  '../docs/default/oracle.md',
  '../docs/default/drools.md',
  '../docs/default/security.md',
  '../docs/default/workflow.md',
];

const expectedRuleIds = {
  'docs/default/java.md': [
    'DEFAULT-JAVA-SEC-001',
    'DEFAULT-JAVA-SEC-002',
    'DEFAULT-JAVA-SEC-003',
    'DEFAULT-JAVA-SEC-004',
    'DEFAULT-JAVA-SEC-005',
    'DEFAULT-JAVA-SEC-006',
    'DEFAULT-JAVA-SEC-007',
    'DEFAULT-JAVA-SEC-008',
    'DEFAULT-JAVA-SPR-001',
    'DEFAULT-JAVA-SPR-002',
    'DEFAULT-JAVA-SPR-003',
    'DEFAULT-JAVA-SPR-004',
    'DEFAULT-JAVA-SPR-005',
    'DEFAULT-JAVA-SPR-006',
    'DEFAULT-JAVA-SPR-007',
    'DEFAULT-JAVA-SPR-008',
    'DEFAULT-JAVA-SPR-009',
    'DEFAULT-JAVA-SPR-010',
    'DEFAULT-JAVA-SPR-011',
    'DEFAULT-JAVA-SPR-012',
    'DEFAULT-JAVA-MYBATIS-001',
    'DEFAULT-JAVA-MYBATIS-002',
    'DEFAULT-JAVA-MYBATIS-003',
    'DEFAULT-JAVA-MYBATIS-004',
    'DEFAULT-JAVA-MYBATIS-005',
    'DEFAULT-JAVA-JVM-001',
    'DEFAULT-JAVA-JVM-002',
    'DEFAULT-JAVA-JVM-003',
    'DEFAULT-JAVA-LIB-001',
    'DEFAULT-JAVA-LIB-002',
    'DEFAULT-JAVA-LIB-006',
    'DEFAULT-JAVA-LIB-003',
    'DEFAULT-JAVA-LIB-004',
    'DEFAULT-JAVA-LIB-005',
    'DEFAULT-JAVA-LIB-007',
    'DEFAULT-JAVA-SPR-013',
    'DEFAULT-JAVA-JVM-004',
    'DEFAULT-JAVA-P3C-001',
    'DEFAULT-JAVA-P3C-002',
    'DEFAULT-JAVA-P3C-003',
    'DEFAULT-JAVA-P3C-004',
    'DEFAULT-JAVA-P3C-005',
    'DEFAULT-JAVA-P3C-006',
    'DEFAULT-JAVA-P3C-007',
    'DEFAULT-JAVA-P3C-008',
    'DEFAULT-JAVA-MAINT-001',
  ],
  'docs/default/vue.md': [
    'DEFAULT-VUE-SEC-001',
    'DEFAULT-VUE-SEC-002',
    'DEFAULT-VUE-SEC-003',
    'DEFAULT-VUE-SEC-004',
    'DEFAULT-VUE-SEC-005',
    'DEFAULT-VUE-SEC-006',
    'DEFAULT-VUE-SEC-007',
    'DEFAULT-VUE-SEC-008',
    'DEFAULT-VUE-SEC-009',
    'DEFAULT-VUE-CONTRACT-001',
    'DEFAULT-VUE-CONTRACT-002',
    'DEFAULT-VUE-CONTRACT-003',
    'DEFAULT-VUE-PERF-001',
    'DEFAULT-VUE-PERF-002',
    'DEFAULT-VUE-PERF-003',
    'DEFAULT-VUE-PERF-004',
    'DEFAULT-VUE-PERF-005',
    'DEFAULT-VUE-ASYNC-001',
    'DEFAULT-VUE-ASYNC-002',
    'DEFAULT-VUE-AUTH-001',
    'DEFAULT-VUE-TS-001',
  ],
  'docs/default/python.md': [
    'DEFAULT-PYTHON-SEC-001',
    'DEFAULT-PYTHON-SEC-002',
    'DEFAULT-PYTHON-SEC-003',
    'DEFAULT-PYTHON-SEC-004',
    'DEFAULT-PYTHON-SEC-005',
    'DEFAULT-PYTHON-SEC-006',
    'DEFAULT-PYTHON-SEC-007',
    'DEFAULT-PYTHON-SEC-008',
    'DEFAULT-PYTHON-DATA-001',
    'DEFAULT-PYTHON-TIME-001',
    'DEFAULT-PYTHON-IO-001',
    'DEFAULT-PYTHON-ASYNC-001',
    'DEFAULT-PYTHON-WEB-001',
    'DEFAULT-PYTHON-ARCHIVE-001',
    'DEFAULT-PYTHON-RESOURCE-001',
    'DEFAULT-PYTHON-MAINT-001',
  ],
  'docs/default/mysql.md': [
    'DEFAULT-MYSQL-SEC-001',
    'DEFAULT-MYSQL-SEC-002',
    'DEFAULT-MYSQL-SEC-003',
    'DEFAULT-MYSQL-DML-001',
    'DEFAULT-MYSQL-DML-002',
    'DEFAULT-MYSQL-IDX-001',
    'DEFAULT-MYSQL-IDX-002',
    'DEFAULT-MYSQL-IDX-003',
    'DEFAULT-MYSQL-PAGE-001',
    'DEFAULT-MYSQL-PAGE-002',
    'DEFAULT-MYSQL-TXN-001',
    'DEFAULT-MYSQL-TXN-002',
    'DEFAULT-MYSQL-LOCK-001',
    'DEFAULT-MYSQL-DDL-001',
    'DEFAULT-MYSQL-DDL-002',
    'DEFAULT-MYSQL-DDL-003',
    'DEFAULT-MYSQL-TYPE-001',
    'DEFAULT-MYSQL-TYPE-002',
    'DEFAULT-MYSQL-CONS-001',
    'DEFAULT-MYSQL-QUERY-001',
    'DEFAULT-MYSQL-QUERY-002',
    'DEFAULT-MYSQL-NULL-001',
    'DEFAULT-MYSQL-CHARSET-001',
    'DEFAULT-MYSQL-PRIV-001',
    'DEFAULT-MYSQL-CONS-002',
    'DEFAULT-MYSQL-DML-003',
    'DEFAULT-MYSQL-SEQ-001',
    'DEFAULT-MYSQL-QUERY-003',
    'DEFAULT-MYSQL-PLAN-001',
    'DEFAULT-MYSQL-REPL-001',
    'DEFAULT-MYSQL-BACKUP-001',
    'DEFAULT-MYSQL-PART-001',
    'DEFAULT-MYSQL-JSON-001',
  ],
  'docs/default/oracle.md': [
    'DEFAULT-ORACLE-SEC-001',
    'DEFAULT-ORACLE-SEC-002',
    'DEFAULT-ORACLE-DML-001',
    'DEFAULT-ORACLE-DML-002',
    'DEFAULT-ORACLE-IDX-001',
    'DEFAULT-ORACLE-PAGE-001',
    'DEFAULT-ORACLE-TXN-001',
    'DEFAULT-ORACLE-TXN-002',
    'DEFAULT-ORACLE-LOCK-001',
    'DEFAULT-ORACLE-DDL-001',
    'DEFAULT-ORACLE-DDL-002',
    'DEFAULT-ORACLE-DDL-003',
    'DEFAULT-ORACLE-TYPE-001',
    'DEFAULT-ORACLE-TYPE-002',
    'DEFAULT-ORACLE-COMPAT-001',
    'DEFAULT-ORACLE-CONS-001',
    'DEFAULT-ORACLE-SEQ-001',
    'DEFAULT-ORACLE-TXN-003',
    'DEFAULT-ORACLE-TRG-001',
    'DEFAULT-ORACLE-PRIV-001',
    'DEFAULT-ORACLE-SEC-003',
    'DEFAULT-ORACLE-CONS-002',
    'DEFAULT-ORACLE-MERGE-001',
    'DEFAULT-ORACLE-QUERY-001',
    'DEFAULT-ORACLE-RECOVER-001',
    'DEFAULT-ORACLE-PLAN-001',
    'DEFAULT-ORACLE-PART-001',
    'DEFAULT-ORACLE-BULK-001',
    'DEFAULT-ORACLE-DBLINK-001',
    'DEFAULT-ORACLE-RECOVER-002',
  ],
  'docs/default/drools.md': [
    'DEFAULT-DROOLS-DRL-001',
    'DEFAULT-DROOLS-FLOW-001',
    'DEFAULT-DROOLS-FLOW-002',
    'DEFAULT-DROOLS-FLOW-003',
    'DEFAULT-DROOLS-FACT-001',
    'DEFAULT-DROOLS-FACT-002',
    'DEFAULT-DROOLS-FACT-003',
    'DEFAULT-DROOLS-PERF-001',
    'DEFAULT-DROOLS-GLOBAL-001',
    'DEFAULT-DROOLS-IDEMP-001',
    'DEFAULT-DROOLS-TIME-001',
    'DEFAULT-DROOLS-NUM-001',
    'DEFAULT-DROOLS-RELEASE-001',
    'DEFAULT-DROOLS-SEC-001',
    'DEFAULT-DROOLS-MAINT-001',
    'DEFAULT-DROOLS-MAINT-002',
  ],
  'docs/default/security.md': [
    'DEFAULT-SEC-001',
    'DEFAULT-SEC-002',
    'DEFAULT-SEC-003',
    'DEFAULT-SEC-004',
    'DEFAULT-SEC-005',
    'DEFAULT-SEC-006',
    'DEFAULT-SEC-007',
    'DEFAULT-SEC-008',
    'DEFAULT-SEC-009',
    'DEFAULT-SEC-010',
    'DEFAULT-SEC-011',
    'DEFAULT-SEC-012',
    'DEFAULT-SEC-013',
  ],
  'docs/default/workflow.md': [
    'DEFAULT-WORKFLOW-001',
    'DEFAULT-WORKFLOW-002',
    'DEFAULT-WORKFLOW-003',
    'DEFAULT-WORKFLOW-004',
    'DEFAULT-WORKFLOW-005',
    'DEFAULT-WORKFLOW-006',
    'DEFAULT-WORKFLOW-007',
    'DEFAULT-WORKFLOW-008',
    'DEFAULT-WORKFLOW-009',
    'DEFAULT-WORKFLOW-010',
    'DEFAULT-WORKFLOW-011',
    'DEFAULT-WORKFLOW-012',
  ],
};

const sections = ['规则说明', '检查要点', '违规风险', '修复建议', '参考来源'];
const allowedSeverities = ['low', 'medium', 'high', 'critical'];

function defaultSourceFrom(indexMarkdown = RULES_INDEX) {
  return parseRuleIndex(indexMarkdown).find((source) => source.name === 'Default Rules');
}

function rulesForDefaultDoc(key) {
  return parseMarkdownRules(DEFAULT_DOCS[key], {
    source: 'Default Rules',
    file: `../${key}`,
    weight: 1,
  });
}

test('rules-index loads every built-in default rule file', () => {
  const defaultSource = defaultSourceFrom();
  assert.ok(defaultSource, 'Default Rules source should exist');
  assert.deepEqual(defaultSource.files, expectedDefaultFiles);
});

test('default docs and rules-index are a closed set', () => {
  const defaultKeys = Object.keys(DEFAULT_DOCS).filter((key) => key.startsWith('docs/default/')).sort();
  const expectedKeys = expectedDefaultFiles.map((file) => file.replace('../', '')).sort();
  assert.deepEqual(defaultKeys, expectedKeys);
});

test('every default rule is Chinese, structured, scoped, and parseable', () => {
  const allRuleIds = [];

  for (const [key, ids] of Object.entries(expectedRuleIds)) {
    const markdown = DEFAULT_DOCS[key];
    assert.ok(markdown, `${key} should exist in DEFAULT_DOCS`);
    assert.match(markdown, /[\u4e00-\u9fa5]/, `${key} should contain Chinese text`);

    const rules = rulesForDefaultDoc(key);
    const actualIds = rules.map((rule) => rule.id);
    assert.deepEqual(actualIds, ids, `${key} should contain the expected rules in order`);

    for (const rule of rules) {
      allRuleIds.push(rule.id);
      assert.equal(typeof rule.score, 'number', `${rule.id} should have numeric score`);
      assert.ok(rule.score > 0 && rule.score <= 100, `${rule.id} score should be between 1 and 100`);
      assert.ok(allowedSeverities.includes(rule.severity), `${rule.id} should have valid severity`);
      assert.equal(typeof rule.hardBlock, 'boolean', `${rule.id} should have boolean hardBlock`);
      assert.ok(Array.isArray(rule.paths), `${rule.id} should have paths array`);
      assert.ok(rule.paths.length > 0, `${rule.id} should have at least one path`);
      assert.notDeepEqual(rule.paths, ['**/*'], `${rule.id} should not use only a global catch-all path`);
      assert.ok(!rule.paths.includes('**/*'), `${rule.id} should not include a global catch-all path`);
      assert.match(rule.body, /规则说明/);

      for (const section of sections) {
        assert.match(rule.body, new RegExp(`\\*\\*${section}\\*\\*：`), `${rule.id} should include ${section}`);
      }
    }
  }

  assert.equal(allRuleIds.length, 187);
  assert.equal(new Set(allRuleIds).size, allRuleIds.length, 'default rule ids should be unique');
});

test('default path scopes include enterprise stack entry points', () => {
  const javaRules = rulesForDefaultDoc('docs/default/java.md');
  const vueRules = rulesForDefaultDoc('docs/default/vue.md');
  const pythonRules = rulesForDefaultDoc('docs/default/python.md');
  const mysqlRules = rulesForDefaultDoc('docs/default/mysql.md');
  const oracleRules = rulesForDefaultDoc('docs/default/oracle.md');
  const droolsRules = rulesForDefaultDoc('docs/default/drools.md');
  const securityRules = rulesForDefaultDoc('docs/default/security.md');

  assert.ok(javaRules.some((rule) => rule.paths.includes('**/*.java')));
  assert.ok(vueRules.some((rule) => rule.paths.includes('**/*.vue')));
  assert.ok(vueRules.some((rule) => rule.paths.includes('**/*.tsx')));
  assert.ok(pythonRules.some((rule) => rule.paths.includes('**/*.py')));
  assert.ok(pythonRules.some((rule) => rule.paths.includes('**/*.pyw')));
  assert.ok(mysqlRules.some((rule) => rule.paths.includes('**/*Mapper*.java')));
  assert.ok(mysqlRules.some((rule) => rule.paths.includes('**/*Mapper*.xml')));
  assert.ok(oracleRules.some((rule) => rule.paths.includes('**/*.pkb')));
  assert.ok(oracleRules.some((rule) => rule.paths.includes('**/*Mapper*.java')));
  assert.ok(droolsRules.some((rule) => rule.paths.includes('**/*.drl')));
  assert.ok(securityRules.some((rule) => rule.paths.includes('Dockerfile')));
  assert.ok(securityRules.some((rule) => rule.paths.includes('**/*.jsx')));
});

test('java default path scopes cover common Spring and MyBatis project layouts', () => {
  const javaRules = rulesForDefaultDoc('docs/default/java.md');
  const rulesById = new Map(javaRules.map((rule) => [rule.id, rule]));

  const mybatisInjection = rulesById.get('DEFAULT-JAVA-MYBATIS-001');
  assert.ok(mybatisInjection.paths.includes('src/main/resources/**/mapper/**/*.xml'));
  assert.ok(mybatisInjection.paths.includes('src/main/resources/**/mybatis/**/*.xml'));
  assert.ok(mybatisInjection.paths.includes('**/*Dao*.xml'));
  assert.ok(mybatisInjection.paths.includes('**/*DAO*.xml'));

  const actuator = rulesById.get('DEFAULT-JAVA-SPR-005');
  assert.equal(actuator.hardBlock, false);
  assert.ok(actuator.score < 90);

  const csrf = rulesById.get('DEFAULT-JAVA-SPR-011');
  assert.equal(csrf.hardBlock, false);

  const datasourceBinding = rulesById.get('DEFAULT-JAVA-MYBATIS-005');
  assert.equal(datasourceBinding.hardBlock, false);

  const polymorphic = rulesById.get('DEFAULT-JAVA-LIB-002');
  assert.equal(polymorphic.hardBlock, true);
  assert.match(polymorphic.title, /多态|autoType|反序列化/);

  const parserLimits = rulesById.get('DEFAULT-JAVA-LIB-006');
  assert.equal(parserLimits.hardBlock, false);
  assert.match(parserLimits.title, /输入大小|深度|未知字段/);

  assert.equal(rulesById.get('DEFAULT-JAVA-LIB-007').hardBlock, true);
  assert.equal(rulesById.get('DEFAULT-JAVA-SPR-013').hardBlock, true);
  assert.equal(rulesById.get('DEFAULT-JAVA-JVM-004').hardBlock, true);
});

test('database runtime rules keep high-confidence hard blocks separate from review-only risks', () => {
  const mysqlRules = new Map(rulesForDefaultDoc('docs/default/mysql.md').map((rule) => [rule.id, rule]));
  const oracleRules = new Map(rulesForDefaultDoc('docs/default/oracle.md').map((rule) => [rule.id, rule]));
  const droolsRules = new Map(rulesForDefaultDoc('docs/default/drools.md').map((rule) => [rule.id, rule]));

  assert.equal(mysqlRules.get('DEFAULT-MYSQL-BACKUP-001').hardBlock, true);
  assert.equal(mysqlRules.get('DEFAULT-MYSQL-PLAN-001').hardBlock, false);
  assert.equal(mysqlRules.get('DEFAULT-MYSQL-REPL-001').hardBlock, false);

  assert.equal(oracleRules.get('DEFAULT-ORACLE-DBLINK-001').hardBlock, false);
  assert.equal(oracleRules.get('DEFAULT-ORACLE-PART-001').hardBlock, true);
  assert.equal(oracleRules.get('DEFAULT-ORACLE-RECOVER-002').hardBlock, true);

  assert.equal(droolsRules.get('DEFAULT-DROOLS-SEC-001').hardBlock, true);
  assert.equal(droolsRules.get('DEFAULT-DROOLS-TIME-001').hardBlock, false);
});

test('thin-stack additions keep hard blocks limited to high-confidence severe risks', () => {
  const vueRules = new Map(rulesForDefaultDoc('docs/default/vue.md').map((rule) => [rule.id, rule]));
  const pythonRules = new Map(rulesForDefaultDoc('docs/default/python.md').map((rule) => [rule.id, rule]));
  const securityRules = new Map(rulesForDefaultDoc('docs/default/security.md').map((rule) => [rule.id, rule]));
  const workflowRules = new Map(rulesForDefaultDoc('docs/default/workflow.md').map((rule) => [rule.id, rule]));

  assert.equal(vueRules.get('DEFAULT-VUE-SEC-008').hardBlock, false);
  assert.equal(vueRules.get('DEFAULT-VUE-SEC-009').hardBlock, false);
  assert.equal(vueRules.get('DEFAULT-VUE-AUTH-001').hardBlock, false);

  assert.equal(pythonRules.get('DEFAULT-PYTHON-SEC-006').hardBlock, true);
  assert.equal(pythonRules.get('DEFAULT-PYTHON-SEC-007').hardBlock, true);
  assert.equal(pythonRules.get('DEFAULT-PYTHON-SEC-008').hardBlock, true);
  assert.equal(pythonRules.get('DEFAULT-PYTHON-WEB-001').hardBlock, true);
  assert.equal(pythonRules.get('DEFAULT-PYTHON-ARCHIVE-001').hardBlock, true);
  assert.equal(pythonRules.get('DEFAULT-PYTHON-RESOURCE-001').hardBlock, false);

  assert.equal(securityRules.get('DEFAULT-SEC-009').hardBlock, true);
  assert.equal(securityRules.get('DEFAULT-SEC-010').hardBlock, true);
  assert.equal(securityRules.get('DEFAULT-SEC-011').hardBlock, false);
  assert.equal(securityRules.get('DEFAULT-SEC-012').hardBlock, false);
  assert.equal(securityRules.get('DEFAULT-SEC-013').hardBlock, true);

  assert.equal(workflowRules.get('DEFAULT-WORKFLOW-009').hardBlock, false);
  assert.equal(workflowRules.get('DEFAULT-WORKFLOW-010').hardBlock, false);
  assert.equal(workflowRules.get('DEFAULT-WORKFLOW-011').hardBlock, false);
  assert.equal(workflowRules.get('DEFAULT-WORKFLOW-012').hardBlock, true);
});

test('initialized workspace can load all default rules end-to-end', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-default-rules-'));
  await initWorkspace({ cwd: dir, force: false, installHook: false });
  const workspaceRoot = path.join(dir, '.gitpushreview');
  const index = fs.readFileSync(path.join(workspaceRoot, 'agent', 'rules-index.md'), 'utf8');
  const source = defaultSourceFrom(index);
  assert.ok(source, 'initialized workspace should include Default Rules source');

  const rules = loadMarkdownRules({ workspaceRoot, source });
  assert.equal(rules.length, 187);
});
