# 企业栈中文默认规则集实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `gitpushreview` 内置 default 规则重建为以 Java、Vue、MySQL、Oracle、Drools 为核心的中文企业栈规则集，并确保初始化后所有 default 规则文件都会被 `rules-index.md` 默认加载。

**Architecture:** 继续沿用现有 Markdown 规则提供者和 `src/templates.js` 内置模板机制，不引入新的运行时依赖。默认规则拆分为稳定的技术域文件，由 `RULES_INDEX` 的 `Default Rules.files` 显式加载；测试负责保证 `DEFAULT_DOCS` 与 `RULES_INDEX` 闭合集合、规则结构可解析、初始化后的真实 workspace 可加载全部默认规则。

**Tech Stack:** Node.js ESM、`node:test`、现有 Markdown/YAML 子集解析器、内置 BDR vendor、中文 Markdown 规则文档。

---

## 范围与原则

### 这次要改的文件

- Modify: `src/templates.js`
  - 重写 `RULES_INDEX` 的 `Default Rules.files`。
  - 重写 `DEFAULT_DOCS` 中的 default 文档。
  - 保留 `docs/project/*` 与 `docs/diy/*` 初始化入口。
- Modify: `test/init.test.js`
  - 断言初始化后企业栈 default 文件全部存在。
- Create: `test/default-rules.test.js`
  - 断言 default 文件和 rules-index 互相覆盖。
  - 断言每条规则能被 `parseMarkdownRules` 解析。
  - 断言每条规则包含中文五段结构、`paths`、合法 severity、合法 score、合法 hardBlock。
  - 断言初始化后的 workspace 可加载全部 default 规则。
- 不修改 `subfix-admin` 源码。
- demo 阶段只有在用户确认后，才覆盖 `subfix-admin/.gitpushreview` 生成内容，并使用 `--no-hook` 避免覆盖现有 Git hook。

### 默认文件清单

`src/templates.js` 必须生成以下 default 文件：

```text
docs/default/java.md
docs/default/vue.md
docs/default/mysql.md
docs/default/oracle.md
docs/default/drools.md
docs/default/security.md
docs/default/workflow.md
```

`RULES_INDEX` 的 `Default Rules.files` 必须按同样顺序引用：

```yaml
files:
  - ../docs/default/java.md
  - ../docs/default/vue.md
  - ../docs/default/mysql.md
  - ../docs/default/oracle.md
  - ../docs/default/drools.md
  - ../docs/default/security.md
  - ../docs/default/workflow.md
```

### 规则 Markdown 格式

每条规则必须使用以下格式。正文全部中文，保留英文术语时必须服务于技术表达。

````markdown
## DEFAULT-JAVA-SEC-001 禁止提交密钥、Token、私钥和数据库密码

```yaml
score: 95
severity: critical
hardBlock: true
paths:
  - "**/*.java"
  - "src/main/resources/**/*.{yml,yaml,properties}"
  - "pom.xml"
  - "build.gradle*"
```

**规则说明**：不得提交 API Key、Token、密码、私钥、真实 `.env` 值、数据库连接凭据或其他长期凭据。

**检查要点**：
- 检查新增或修改的配置、脚本、测试数据中是否出现真实凭据。
- 检查是否把本应通过环境变量或密钥管理服务注入的值写死到代码中。

**违规风险**：凭据泄露会导致账号接管、生产数据暴露、供应链入侵或云资源滥用。

**修复建议**：删除凭据，改为环境变量、配置中心或密钥管理服务，并立即轮换已经暴露的凭据。

**参考来源**：OWASP Secrets Management Cheat Sheet；CWE-798；GitHub Secret Scanning。
````

每条规则必须包含：

```text
规则说明
检查要点
违规风险
修复建议
参考来源
```

允许的 severity：

```text
low
medium
high
critical
```

默认 `hardBlock: true` 只允许用于高置信、直接造成严重后果的问题：

```text
凭据泄露
认证授权绕过
注入、RCE、不可信反序列化
敏感数据泄露
全表破坏性 DML/DDL 或不可逆数据损坏
事务一致性明确破坏
明显资源耗尽或启动/运行时崩溃
Drools 规则循环、事实状态失真或不可回滚副作用
```

命名、风格、可维护性、普通性能、索引建议、分页建议、测试补强等默认用 soft block，即 `hardBlock: false`。项目可以在 `docs/diy` 中提高权重或改为硬拦截。

跨技术栈规则和技术域规则必须避免重复输出同一类 finding：`DEFAULT-SEC-*` 只描述跨文件、跨技术底线；`DEFAULT-JAVA-SEC-*`、`DEFAULT-VUE-SEC-*`、`DEFAULT-MYSQL-SEC-*`、`DEFAULT-ORACLE-SEC-*` 描述该技术栈特有触发点、证据和修复方式。实现时正文不得把跨栈规则原句复制到技术域规则中。

## 默认规则内容

### `docs/default/java.md`

规则 ID 前缀：

```text
DEFAULT-JAVA-SEC-*
DEFAULT-JAVA-SPR-*
DEFAULT-JAVA-JVM-*
DEFAULT-JAVA-P3C-*
DEFAULT-JAVA-MAINT-*
```

必须包含 16 条：

- `DEFAULT-JAVA-SEC-001` 禁止提交密钥、Token、私钥和数据库密码，score 95，critical，hardBlock true。
- `DEFAULT-JAVA-SEC-002` 禁止拼接 SQL、JPQL、LDAP 或命令执行参数，score 95，critical，hardBlock true。
- `DEFAULT-JAVA-SEC-003` 禁止反序列化不可信输入或缺少过滤，score 90，critical，hardBlock true。
- `DEFAULT-JAVA-SEC-004` Web 入口必须保持认证和授权边界，score 95，critical，hardBlock true。
- `DEFAULT-JAVA-SPR-001` 禁止明确删除或绕过认证、授权、持久化、金额、权限、数据破坏相关关键校验，score 85，high，hardBlock true。
- `DEFAULT-JAVA-SPR-002` 禁止破坏事务一致性边界，score 90，critical，hardBlock true。
- `DEFAULT-JAVA-SPR-003` `@Transactional` 方法避免内部自调用导致事务失效，score 60，high，hardBlock false。
- `DEFAULT-JAVA-SPR-004` checked exception 与事务回滚策略必须明确，score 60，high，hardBlock false。
- `DEFAULT-JAVA-JVM-001` 禁止在请求路径或用户可触发路径新增无界线程、无界队列或无背压异步任务，score 85，high，hardBlock true。
- `DEFAULT-JAVA-JVM-002` IO、流、连接等资源必须确定性关闭，score 60，high，hardBlock false。
- `DEFAULT-JAVA-JVM-003` 阻塞调用必须设置超时和失败处理，score 60，high，hardBlock false。
- `DEFAULT-JAVA-P3C-001` 集合转 Map 必须处理重复 key，score 60，high，hardBlock false。
- `DEFAULT-JAVA-P3C-002` BigDecimal 禁止使用 double 构造，score 60，high，hardBlock false。
- `DEFAULT-JAVA-P3C-003` 覆写 equals 必须同时覆写 hashCode，score 55，high，hardBlock false。
- `DEFAULT-JAVA-P3C-004` SimpleDateFormat 不得作为共享静态实例，score 60，high，hardBlock false。
- `DEFAULT-JAVA-MAINT-001` 避免过大方法、过深嵌套和重复复杂逻辑，score 35，medium，hardBlock false。

Java 规则 `paths` 必须覆盖实际 Java/Spring 文件，例如 `**/*.java`、`**/*Controller.java`、`**/*Service.java`、`src/main/resources/**/*.{yml,yaml,properties}`，不得全部用 `**/*`。

参考来源必须覆盖：阿里巴巴 Java 开发手册/P3C、OWASP SQL Injection、OWASP Deserialization、OWASP Secrets Management、Oracle Serialization Filtering、Oracle try-with-resources、Spring Security、Spring Validation、Spring Transaction。

### `docs/default/vue.md`

规则 ID 前缀：

```text
DEFAULT-VUE-SEC-*
DEFAULT-VUE-CONTRACT-*
DEFAULT-VUE-PERF-*
DEFAULT-VUE-ASYNC-*
DEFAULT-VUE-TS-*
DEFAULT-VUE-COMPAT-*
```

必须包含 15 条：

- `DEFAULT-VUE-SEC-001` 禁止把不可信内容作为 Vue 模板编译，score 95，critical，hardBlock true。
- `DEFAULT-VUE-SEC-002` 禁止未净化的用户或接口 HTML 进入 `v-html`、`innerHTML`，score 90，critical，hardBlock true。
- `DEFAULT-VUE-SEC-003` 动态 URL、CSS、事件属性必须经过白名单或净化，score 80，high，hardBlock false。
- `DEFAULT-VUE-SEC-004` 禁止前端持久化敏感 Token、密钥或会话秘密，score 95，critical，hardBlock true。
- `DEFAULT-VUE-SEC-005` 外链 `_blank` 必须配置 `rel="noopener noreferrer"`，score 45，medium，hardBlock false。
- `DEFAULT-VUE-CONTRACT-001` props 必须声明类型、必填项、默认值或 validator，score 55，medium，hardBlock false。
- `DEFAULT-VUE-CONTRACT-002` 禁止直接修改 props，score 65，high，hardBlock false。
- `DEFAULT-VUE-CONTRACT-003` Vue 3 组件事件必须通过 emits 声明，score 45，medium，hardBlock false。
- `DEFAULT-VUE-PERF-001` `v-for` 必须使用稳定且唯一的 key，score 60，high，hardBlock false。
- `DEFAULT-VUE-PERF-002` 避免在同一元素同时使用 `v-if` 和 `v-for`，score 45，medium，hardBlock false。
- `DEFAULT-VUE-PERF-003` computed 不得包含副作用或异步逻辑，score 60，high，hardBlock false。
- `DEFAULT-VUE-PERF-004` 避免深度 watch 大对象或在模板中执行高成本计算，score 45，medium，hardBlock false。
- `DEFAULT-VUE-ASYNC-001` 组件请求必须处理取消、过期响应和卸载后的状态写入，score 60，high，hardBlock false。
- `DEFAULT-VUE-ASYNC-002` fetch/axios 必须处理失败、loading 复位和用户可理解的错误状态，score 55，high，hardBlock false。
- `DEFAULT-VUE-TS-001` 避免新增 `any`、`@ts-ignore` 和不必要的非空断言，score 45，medium，hardBlock false。

Vue 规则 `paths` 必须覆盖 `**/*.vue`、`**/*.ts`、`**/*.tsx`、`**/*.js`、`**/*.jsx`，安全规则可覆盖 `src/**/*`，不得全部用 `**/*`。

参考来源必须覆盖：Vue Security Guide、Vue Performance Guide、Vue Style Guide、Vue Watchers、OWASP XSS、OWASP HTML5 Security、MDN Fetch/AbortController、TypeScript/TS-ESLint。

### `docs/default/mysql.md`

规则 ID 前缀：

```text
DEFAULT-MYSQL-SEC-*
DEFAULT-MYSQL-DML-*
DEFAULT-MYSQL-IDX-*
DEFAULT-MYSQL-PAGE-*
DEFAULT-MYSQL-TXN-*
DEFAULT-MYSQL-LOCK-*
DEFAULT-MYSQL-DDL-*
DEFAULT-MYSQL-MIG-*
DEFAULT-MYSQL-TYPE-*
```

必须包含 14 条：

- `DEFAULT-MYSQL-SEC-001` 禁止拼接用户输入生成 SQL，score 95，critical，hardBlock true。
- `DEFAULT-MYSQL-SEC-002` 动态表名、列名、排序字段必须使用白名单映射，score 90，critical，hardBlock true。
- `DEFAULT-MYSQL-DML-001` `UPDATE`、`DELETE` 必须有明确 `WHERE` 或受控批量条件，score 95，critical，hardBlock true。
- `DEFAULT-MYSQL-DML-002` 批量 DML 必须分批、可重试、可观测，score 70，high，hardBlock false。
- `DEFAULT-MYSQL-IDX-001` 高频查询谓词必须匹配合适索引，score 70，high，hardBlock false。
- `DEFAULT-MYSQL-IDX-002` `ORDER BY`、`GROUP BY` 应尽量与索引顺序兼容，score 60，high，hardBlock false。
- `DEFAULT-MYSQL-IDX-003` 禁止无选择性的重复或冗余索引，score 40，medium，hardBlock false。
- `DEFAULT-MYSQL-PAGE-001` 分页必须有确定性 `ORDER BY` 并包含唯一兜底列，score 65，high，hardBlock false。
- `DEFAULT-MYSQL-PAGE-002` 深分页应优先 keyset/seek pagination，score 50，medium，hardBlock false。
- `DEFAULT-MYSQL-TXN-001` 多表或多步骤写入必须在显式事务内，score 90，critical，hardBlock true。
- `DEFAULT-MYSQL-TXN-002` 捕获数据库异常后必须 rollback 或重新抛出，score 85，high，hardBlock true。
- `DEFAULT-MYSQL-LOCK-001` `SELECT ... FOR UPDATE` 必须命中索引且范围可控，score 75，high，hardBlock false。
- `DEFAULT-MYSQL-DDL-001` 禁止在业务事务中混入 DDL，score 85，high，hardBlock true。
- `DEFAULT-MYSQL-TYPE-001` 金额和精确数值禁止使用浮点类型，score 85，high，hardBlock true。

MySQL 规则 `paths` 必须覆盖 `**/*.sql`、`migrations/**`、`db/**`、`schema/**`、`**/*Mapper*.xml`、`**/*Mapper*.java`、`**/*Repository*.java`、`**/*DAO*.java`、`**/*Dao*.java`、`**/*Repository*`、`**/*DAO*`，不得全部用 `**/*`。

参考来源必须覆盖：OWASP SQL Injection Cheat Sheet、CWE-89、MySQL prepared statements、MySQL InnoDB transactions、MySQL locks、MySQL index/order/limit 文档、MySQL fixed-point types、阿里巴巴 Java 开发手册数据库规约。

### `docs/default/oracle.md`

规则 ID 前缀：

```text
DEFAULT-ORACLE-SEC-*
DEFAULT-ORACLE-DML-*
DEFAULT-ORACLE-IDX-*
DEFAULT-ORACLE-PAGE-*
DEFAULT-ORACLE-TXN-*
DEFAULT-ORACLE-LOCK-*
DEFAULT-ORACLE-DDL-*
DEFAULT-ORACLE-MIG-*
DEFAULT-ORACLE-TYPE-*
DEFAULT-ORACLE-COMPAT-*
```

必须包含 13 条：

- `DEFAULT-ORACLE-SEC-001` 动态 SQL 必须使用绑定变量或严格白名单，score 95，critical，hardBlock true。
- `DEFAULT-ORACLE-SEC-002` 动态对象名必须使用白名单，`DBMS_ASSERT` 只能作为辅助校验，score 85，high，hardBlock true。
- `DEFAULT-ORACLE-DML-001` `UPDATE`、`DELETE`、`MERGE` 必须有明确条件和影响范围说明，score 95，critical，hardBlock true。
- `DEFAULT-ORACLE-DML-002` 大批量 DML 必须分批、可恢复并控制 undo/redo 压力，score 70，high，hardBlock false。
- `DEFAULT-ORACLE-IDX-001` 高频谓词、函数条件和排序必须评估普通索引或函数索引，score 70，high，hardBlock false。
- `DEFAULT-ORACLE-PAGE-001` `OFFSET/FETCH` 或 `ROWNUM` 分页必须有确定性排序，score 65，high，hardBlock false。
- `DEFAULT-ORACLE-TXN-001` 多步骤写入必须用明确事务边界，score 90，critical，hardBlock true。
- `DEFAULT-ORACLE-TXN-002` 捕获异常后必须 rollback、raise 或记录补偿路径，score 85，high，hardBlock true。
- `DEFAULT-ORACLE-LOCK-001` 行锁和 `SELECT FOR UPDATE` 必须控制范围和等待策略，score 70，high，hardBlock false。
- `DEFAULT-ORACLE-DDL-001` 业务事务中禁止混入 DDL，score 90，critical，hardBlock true。
- `DEFAULT-ORACLE-DDL-002` `DROP`、`TRUNCATE`、`RENAME` 必须有审批式迁移说明和回滚策略，score 95，critical，hardBlock true。
- `DEFAULT-ORACLE-TYPE-001` 金额、数量和精确小数必须使用合适的 `NUMBER(p,s)`，score 85，high，hardBlock true。
- `DEFAULT-ORACLE-COMPAT-001` 共享 SQL 禁止混用 Oracle 与 MySQL 方言特性，score 65，high，hardBlock false。

Oracle 规则 `paths` 必须覆盖 `**/*.sql`、`migrations/**`、`db/**`、`schema/**`、`**/*Mapper*.xml`、`**/*Mapper*.java`、`**/*Repository*.java`、`**/*DAO*.java`、`**/*Dao*.java`、`**/*Repository*`、`**/*DAO*`、`**/*.pks`、`**/*.pkb`。

参考来源必须覆盖：Oracle SQL Injection/PLSQL、Oracle bind variables、Oracle COMMIT/ROLLBACK、Oracle DDL implicit commit、Oracle data concurrency、Oracle `SELECT` row limiting、Oracle data types、Oracle `CREATE INDEX`。

### `docs/default/drools.md`

规则 ID 前缀：

```text
DEFAULT-DROOLS-DRL-*
DEFAULT-DROOLS-FLOW-*
DEFAULT-DROOLS-FACT-*
DEFAULT-DROOLS-PERF-*
DEFAULT-DROOLS-MAINT-*
```

必须包含 10 条：

- `DEFAULT-DROOLS-DRL-001` DRL 规则名必须在同一 package 内唯一，明确重复并会覆盖或破坏执行结果时才硬拦，score 70，high，hardBlock true。
- `DEFAULT-DROOLS-FLOW-001` 禁止无理由使用高 `salience` 或大范围 salience 梯度，score 35，medium，hardBlock false。
- `DEFAULT-DROOLS-FLOW-002` 自修改规则必须显式处理循环触发，score 75，high，hardBlock true。
- `DEFAULT-DROOLS-FLOW-003` 审慎使用 `lock-on-active`，避免与 `from` 组合误伤规则执行，score 50，high，hardBlock false。
- `DEFAULT-DROOLS-FACT-001` fact 修改必须通过 `modify` 或 `update` 通知工作内存，score 80，critical，hardBlock true。
- `DEFAULT-DROOLS-FACT-002` `insert`、`retract`、`delete` 必须限制副作用范围，score 75，high，hardBlock true。
- `DEFAULT-DROOLS-FACT-003` RHS consequence 不应承载外部不可回滚副作用，score 80，critical，hardBlock true。
- `DEFAULT-DROOLS-PERF-001` 复杂条件应避免不可索引和高成本匹配，score 45，medium，hardBlock false。
- `DEFAULT-DROOLS-MAINT-001` 禁止通过隐式执行顺序表达业务依赖，score 50，high，hardBlock false。
- `DEFAULT-DROOLS-MAINT-002` DRL 资产必须按业务域分包并配套规则测试，score 40，medium，hardBlock false。

Drools 规则 `paths` 必须覆盖 `**/*.drl`、`**/rules/**/*.drl`、`**/drools/**/*.drl`、`**/*Rule*.java`、`**/*Rules*.java`、`**/*Rule*.kt`、`**/*Rules*.kt`。

参考来源必须覆盖：Drools DRL Language Reference、Drools rule attributes、Drools `no-loop`、`lock-on-active`、`salience`、Drools `insert/modify/update/delete`、Drools `from/eval`、KIE rule assets/testing。

### `docs/default/security.md`

该文件放跨技术栈安全底线，不能和 Java/Vue/数据库文件完全重复。必须包含 8 条：

- `DEFAULT-SEC-001` 禁止任何技术栈提交密钥、Token、私钥和真实 `.env`，score 100，critical，hardBlock true。
- `DEFAULT-SEC-002` 用户私有资源必须鉴权并校验归属，score 100，critical，hardBlock true。
- `DEFAULT-SEC-003` 文件上传必须限制类型、大小、存储位置和执行权限，score 95，critical，hardBlock true。
- `DEFAULT-SEC-004` 敏感数据展示、日志、导出和前端状态必须脱敏，score 95，critical，hardBlock true。
- `DEFAULT-SEC-005` 外部 URL、文件路径和重定向目标必须白名单校验，score 90，critical，hardBlock true。
- `DEFAULT-SEC-006` 状态变更接口必须防 CSRF 或使用等价保护，score 75，high，hardBlock false。
- `DEFAULT-SEC-007` 不可信模板、表达式、脚本和规则输入不得直接执行，score 95，critical，hardBlock true。
- `DEFAULT-SEC-008` 权限、风控、计费和数据变更路径不得降级审计日志，score 80，high，hardBlock false。

跨栈安全规则 `paths` 可以覆盖多技术文件，但要列出具体模式：`**/*.java`、`**/*.vue`、`**/*.ts`、`**/*.tsx`、`**/*.js`、`**/*.jsx`、`**/*.html`、`**/*.sql`、`**/*.drl`、`src/main/resources/**/*.{yml,yaml,properties}`、`**/*.json`、`**/*.conf`、`**/*.sh`、`Dockerfile`、`docker-compose*.yml`、`.env*`，不得使用单一 `**/*`。

参考来源必须覆盖：OWASP Top 10、OWASP API Security、OWASP File Upload、OWASP Logging、OWASP CSRF、CWE Top 25、GitHub Secret Scanning。

### `docs/default/workflow.md`

该文件放提交、测试、兼容性和工程协作规则。必须包含 8 条：

- `DEFAULT-WORKFLOW-001` 行为变更必须有对应测试或明确无法测试原因，score 70，high，hardBlock false。
- `DEFAULT-WORKFLOW-002` 缺陷修复必须补充回归测试或复现说明，score 75，high，hardBlock false。
- `DEFAULT-WORKFLOW-003` 权限、资金、库存、规则引擎和数据迁移路径必须覆盖成功、失败、空值和异常分支，score 85，high，hardBlock false。
- `DEFAULT-WORKFLOW-004` 公共 API 字段删除、重命名或语义变化且无兼容策略时必须硬拦，score 90，critical，hardBlock true。
- `DEFAULT-WORKFLOW-005` 数据库 schema 变更缺少迁移、回滚、旧数据和灰度策略时必须硬拦，score 90，critical，hardBlock true。
- `DEFAULT-WORKFLOW-006` 配置项变更必须保留默认值、迁移说明或失败提示，score 75，high，hardBlock false。
- `DEFAULT-WORKFLOW-007` 依赖新增必须说明用途并同步锁文件，score 65，medium，hardBlock false。
- `DEFAULT-WORKFLOW-008` 提交前不得遗留调试代码、跳过测试和临时断言，score 70，high，hardBlock false。

workflow 规则 `paths` 可以覆盖多技术文件，但必须列出具体模式：`**/*.java`、`**/*.vue`、`**/*.ts`、`**/*.js`、`**/*.sql`、`**/*.drl`、`package.json`、`package-lock.json`、`pom.xml`、`build.gradle*`、`migrations/**`、`src/test/**`、`test/**`。

参考来源必须覆盖：GitHub Pull Request Review、Conventional Commits、SemVer、Vue Testing、JUnit/Spring Test、数据库迁移最佳实践、阿里巴巴 Java 开发手册。

## Task 1: 新增失败测试

**Files:**
- Create: `test/default-rules.test.js`

- [ ] **Step 1: 写入默认规则闭合测试**

测试必须定义：

```js
const expectedDefaultFiles = [
  '../docs/default/java.md',
  '../docs/default/vue.md',
  '../docs/default/mysql.md',
  '../docs/default/oracle.md',
  '../docs/default/drools.md',
  '../docs/default/security.md',
  '../docs/default/workflow.md',
];
```

并验证：

```js
const defaultSource = parseRuleIndex(RULES_INDEX).find((source) => source.name === 'Default Rules');
assert.deepEqual(defaultSource.files, expectedDefaultFiles);

const defaultKeys = Object.keys(DEFAULT_DOCS).filter((key) => key.startsWith('docs/default/')).sort();
const expectedKeys = expectedDefaultFiles.map((file) => file.replace('../', '')).sort();
assert.deepEqual(defaultKeys, expectedKeys);
```

- [ ] **Step 2: 写入结构解析测试**

测试必须遍历 `DEFAULT_DOCS` 中所有 default markdown，并先断言文件包含中文：

```js
assert.match(markdown, /[\u4e00-\u9fa5]/);
assert.match(markdown, /规则说明/);
assert.match(markdown, /检查要点/);
assert.match(markdown, /违规风险/);
assert.match(markdown, /修复建议/);
assert.match(markdown, /参考来源/);
```

每条解析出的规则必须满足：

```js
for (const section of ['规则说明', '检查要点', '违规风险', '修复建议', '参考来源']) {
  assert.match(rule.body, new RegExp(section), `${rule.id} should include ${section}`);
}
assert.equal(typeof rule.score, 'number');
assert.ok(rule.score > 0 && rule.score <= 100);
assert.ok(['low', 'medium', 'high', 'critical'].includes(rule.severity));
assert.equal(typeof rule.hardBlock, 'boolean');
assert.ok(Array.isArray(rule.paths));
assert.ok(rule.paths.length > 0);
assert.notDeepEqual(rule.paths, ['**/*']);
```

- [ ] **Step 3: 写入预期规则 ID 测试**

测试必须用 `expectedRuleIds` 固定每个文件的规则 ID 清单，严格等于本计划列出的 84 条规则：

```text
java 16
vue 15
mysql 14
oracle 13
drools 10
security 8
workflow 8
total 84
```

每个文件必须使用严格相等断言，避免额外规则、重复规则或规则放错文件：

```js
assert.deepEqual(actualIds, expectedRuleIds[key]);
```

同时断言全局规则 ID 唯一：

```js
assert.equal(new Set(allRuleIds).size, allRuleIds.length);
assert.equal(allRuleIds.length, 84);
```

- [ ] **Step 4: 写入初始化后端到端加载测试**

测试必须创建临时目录，执行：

```js
await initWorkspace({ cwd: dir, force: false, installHook: false });
```

再读取 `.gitpushreview/agent/rules-index.md`，通过 `loadMarkdownRules({ workspaceRoot, source })` 加载 `Default Rules`，断言规则总数为 84。

- [ ] **Step 5: 运行测试确认失败**

Run:

```bash
npm.cmd test -- test/default-rules.test.js
```

Expected: FAIL。当前模板只有 3 个 default 文件被 rules-index 加载，且默认文档不是企业栈中文规则集。

## Task 2: 重写模板规则

**Files:**
- Modify: `src/templates.js`

- [ ] **Step 1: 更新 `RULES_INDEX`**

把 `Default Rules.files` 改为 7 个企业栈 default 文件。保留 BDR、Project Rules、DIY Rules 的优先级和权重结构。

- [ ] **Step 2: 重写 `DEFAULT_DOCS` 的 default 文档**

删除旧的泛化 default 文档：

```text
docs/default/code-review.md
docs/default/concurrency.md
docs/default/performance.md
docs/default/maintainability.md
```

新增并写入 7 个企业栈中文 default 文档：

```text
docs/default/java.md
docs/default/vue.md
docs/default/mysql.md
docs/default/oracle.md
docs/default/drools.md
docs/default/security.md
docs/default/workflow.md
```

每条规则必须按本计划的 ID、标题、score、severity、hardBlock、paths 和中文五段结构编写。

- [ ] **Step 3: 保留 project/diy 初始化模板**

保留并可轻微中文化：

```text
docs/project/architecture.md
docs/project/api-contract.md
docs/project/data-model.md
docs/diy/auth.md
docs/diy/payment.md
docs/diy/logging.md
```

不得把 project/diy 文件加入 default 闭合测试。

- [ ] **Step 4: 运行默认规则测试**

Run:

```bash
npm.cmd test -- test/default-rules.test.js
```

Expected: PASS。

## Task 3: 更新初始化测试

**Files:**
- Modify: `test/init.test.js`

- [ ] **Step 1: 补充 default 文件存在性断言**

在现有初始化测试中断言以下文件存在：

```js
for (const file of ['java.md', 'vue.md', 'mysql.md', 'oracle.md', 'drools.md', 'security.md', 'workflow.md']) {
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'docs', 'default', file)), true);
}
```

继续保留 `docs/diy/auth.md`、`config/reviewmodel.json`、`vendor/bdr/package.json` 等初始化断言。

- [ ] **Step 2: 运行针对性测试**

Run:

```bash
npm.cmd test -- test/default-rules.test.js test/init.test.js test/rules.test.js test/runner.test.js
```

Expected: PASS。

## Task 4: 全量验证与打包验证

**Files:**
- No file changes.

- [ ] **Step 1: 运行全量测试**

Run:

```bash
npm.cmd test
```

Expected: all tests pass。

- [ ] **Step 2: 运行 npm 打包预检**

Run:

```bash
npm.cmd pack --dry-run
```

Expected: dry-run exits 0，tarball 包含 `bin/`、`src/`、`vendor/`、`package.json`、`README.md`。

## Task 5: 在 `subfix-admin` 做 demo 验证

**Files:**
- 不修改 `subfix-admin` 源码。
- 只有用户确认后才覆盖 `C:\Users\luke\Desktop\dev-project\subfix-admin\.gitpushreview` 生成内容。

- [ ] **Step 1: 明确覆盖范围并征得用户确认**

确认文案必须说明：

```text
这会覆盖 subfix-admin/.gitpushreview 下的 agent、config、docs 和 vendor/bdr 生成内容。
这会先清理 subfix-admin/.gitpushreview/docs/default 下旧的内置 default 规则文件，避免旧 code-review.md、concurrency.md 等残留文件造成误判。
不会修改 subfix-admin 源码。
使用 --no-hook，因此不会覆盖现有 Git hook。
```

- [ ] **Step 2: 清理旧 default 生成文件**

Working directory:

```text
C:\Users\luke\Desktop\dev-project\subfix-admin
```

Command:

```bash
Remove-Item -LiteralPath .gitpushreview\docs\default -Recurse -Force
```

Expected: 只删除 `.gitpushreview/docs/default` 目录；不删除 `docs/project`、`docs/diy`、源码或 hook。

- [ ] **Step 3: 用本地插件入口重新初始化**

Working directory:

```text
C:\Users\luke\Desktop\dev-project\subfix-admin
```

Command:

```bash
node C:\Users\luke\Desktop\dev-project\gitpushreview\bin\gitpushreview.js init --force --no-hook
```

- [ ] **Step 4: 检查 default 文件和 rules-index**

Run:

```bash
Get-ChildItem .gitpushreview\docs\default
Get-Content .gitpushreview\agent\rules-index.md
```

Expected: 7 个企业栈 default Markdown 文件存在，`Default Rules.files` 列出同样 7 个文件。

- [ ] **Step 5: 严格验证 default 目录文件集合**

Run:

```bash
$expected = @('drools.md','java.md','mysql.md','oracle.md','security.md','vue.md','workflow.md')
$actual = Get-ChildItem .gitpushreview\docs\default -File | Select-Object -ExpandProperty Name | Sort-Object
Compare-Object $expected $actual
```

Expected: no output。任何旧 default 文件残留或新文件缺失都必须修正后再继续。

- [ ] **Step 6: 解析初始化后的 default 规则**

在 `gitpushreview` 仓库运行：

```bash
node --input-type=module -e "import fs from 'node:fs'; import path from 'node:path'; import { parseRuleIndex, loadMarkdownRules } from './src/rules/index.js'; const workspaceRoot = path.resolve('C:/Users/luke/Desktop/dev-project/subfix-admin/.gitpushreview'); const index = fs.readFileSync(path.join(workspaceRoot, 'agent', 'rules-index.md'), 'utf8'); const source = parseRuleIndex(index).find((item) => item.name === 'Default Rules'); if (!source) throw new Error('missing default rules source'); const rules = loadMarkdownRules({ workspaceRoot, source }); console.log(rules.length); if (rules.length !== 84) throw new Error('expected 84 default rules, got ' + rules.length);"
```

Expected: print `84` and exit 0。

## Self-Review

- 覆盖了用户新要求：默认规则以 Java、Vue、Oracle、MySQL、Drools 为核心。
- 覆盖了用户原要求：所有默认规则使用中文 Markdown 编写。
- 覆盖了已发现 bug：default 文档存在但 `RULES_INDEX` 未加载。
- 覆盖了反向 bug：`RULES_INDEX` 引用不存在文件，或 `DEFAULT_DOCS` 出现未引用 default 文件。
- 默认强拦截保持保守，只用于凭据、鉴权、注入、RCE、敏感泄露、数据破坏、事务一致性、明显资源耗尽、Drools 循环/事实失真/不可回滚副作用。
- BDR 仍作为独立 provider 被保留，default 规则不会从 BDR skills/rules 派生，因此后续升级 BDR 时不需要重新开发 default 规则。
- demo 验证不会修改 `subfix-admin` 源码，并默认不覆盖 hook。
