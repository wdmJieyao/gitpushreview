import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_DOCS } from '../src/templates.js';
import { parseMarkdownRules } from '../src/rules/markdown.js';

const demoSamples = [
  {
    name: 'Java controller removes authorization and validation checks',
    file: 'src/main/java/com/acme/user/UserController.java',
    snippet: `
      @PostMapping("/users/{id}/role")
      public void updateRole(@PathVariable Long id, @RequestBody RoleRequest request) {
        userService.updateRole(id, request.role());
      }
    `,
    expectedRules: ['DEFAULT-JAVA-SEC-004', 'DEFAULT-JAVA-SPR-001', 'DEFAULT-SEC-002'],
  },
  {
    name: 'MyBatis mapper builds SQL from user input',
    file: 'src/main/java/com/acme/user/UserMapper.java',
    snippet: `
      @Select("select * from user where name = '" + name + "'")
      List<User> search(String name);
    `,
    expectedRules: ['DEFAULT-MYSQL-SEC-001', 'DEFAULT-MYSQL-SEC-002'],
  },
  {
    name: 'Vue component renders API HTML directly',
    file: 'src/views/Profile.vue',
    snippet: `
      <template><section v-html="profile.bioHtml"></section></template>
    `,
    expectedRules: ['DEFAULT-VUE-SEC-002', 'DEFAULT-SEC-004'],
  },
  {
    name: 'Oracle package executes dynamic SQL',
    file: 'db/oracle/packages/user_admin.pkb',
    snippet: `
      execute immediate 'delete from users where name = ' || p_name;
    `,
    expectedRules: ['DEFAULT-ORACLE-SEC-001', 'DEFAULT-ORACLE-DML-001'],
  },
  {
    name: 'Drools rule mutates fact without update',
    file: 'rules/pricing/discount.drl',
    snippet: `
      rule "discount"
      when
        $order : Order()
      then
        $order.setDiscount(10);
      end
    `,
    expectedRules: ['DEFAULT-DROOLS-FACT-001', 'DEFAULT-DROOLS-FLOW-002'],
  },
  {
    name: 'Dockerfile contains a secret-looking environment variable',
    file: 'Dockerfile',
    snippet: 'ENV API_TOKEN=real-token-value',
    expectedRules: ['DEFAULT-SEC-001'],
  },
  {
    name: 'Database migration changes schema',
    file: 'migrations/V20260614__drop_legacy_user.sql',
    snippet: 'drop table legacy_user;',
    expectedRules: ['DEFAULT-MYSQL-DDL-001', 'DEFAULT-ORACLE-DDL-002', 'DEFAULT-WORKFLOW-005'],
  },
];

function allDefaultRules() {
  return Object.entries(DEFAULT_DOCS)
    .filter(([file]) => file.startsWith('docs/default/'))
    .flatMap(([file, markdown]) => parseMarkdownRules(markdown, { source: 'Default Rules', file, weight: 1 }));
}

function globToRegExp(glob) {
  const doubleStarSlash = '\0DOUBLE_STAR_SLASH\0';
  const doubleStar = '\0DOUBLE_STAR\0';
  const escaped = glob
    .replace(/\*\*\//g, doubleStarSlash)
    .replace(/\*\*/g, doubleStar)
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '[^/]*')
    .replaceAll(doubleStarSlash, '(?:.*/)?')
    .replaceAll(doubleStar, '.*');
  return new RegExp(`^${escaped}$`);
}

function pathMatches(glob, file) {
  return globToRegExp(glob.replaceAll('\\', '/')).test(file.replaceAll('\\', '/'));
}

test('demo enterprise-stack snippets are covered by default rule path scopes', () => {
  const rulesById = new Map(allDefaultRules().map((rule) => [rule.id, rule]));

  for (const sample of demoSamples) {
    assert.ok(sample.snippet.trim(), `${sample.name} should include a demo snippet`);
    for (const ruleId of sample.expectedRules) {
      const rule = rulesById.get(ruleId);
      assert.ok(rule, `${ruleId} should exist for demo: ${sample.name}`);
      assert.ok(
        rule.paths.some((glob) => pathMatches(glob, sample.file)),
        `${ruleId} should cover ${sample.file} for demo: ${sample.name}`,
      );
    }
  }
});
