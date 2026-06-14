# GitPushReview

GitPushReview 是一个跨 Windows、macOS、Linux 的 Git 提交前代码审核插件。它会在 `git commit` 前审核本次已暂存的代码变更，结合 BDR 坏味道检测器、内置默认规则、项目规则、DIY 高优先级规则和 OpenAI-compatible 大模型，判断本次提交是否可以放行。

它的目标不是替代人工 Code Review，而是在代码进入仓库前先拦住明显风险：

- 普通坏味道或中低风险问题：软拦截，开发者确认后仍可提交。
- 明显异常、高风险安全问题、资金问题、越权问题：强拦截，必须整改后才能提交。
- 项目自定义红线：可以通过 DIY 规则配置为强拦截。

## 快速开始

全局安装：

```bash
npm install -g https://github.com/wdmJieyao/gitpushreview.git
```

在需要接入的项目根目录初始化：

```bash
gitpushreview init
```

初始化会创建：

```text
.gitpushreview/
  agent/
    review-agent.md
    rules-index.md
    policy.md
  docs/
    RULES.md
    default/
      java.md
      vue.md
      python.md
      mysql.md
      oracle.md
      postgresql.md
      oceanbase.md
      redis.md
      rabbitmq.md
      drools.md
      security.md
      workflow.md
      sqlfluff.md
    project/
      README.md
      architecture.md
      api-contract.md
      data-model.md
    diy/
      README.md
      auth.md
      payment.md
      logging.md
  config/
    reviewmodel.json
  vendor/
    bdr/
```

如果当前目录是 Git 仓库，初始化会自动安装 `.git/hooks/pre-commit`，之后每次 `git commit` 都会自动触发审核。

手动审核本次已暂存变更：

```bash
gitpushreview check --staged
```

查看某个文件为什么会命中哪些规则和确定性检查：

```bash
gitpushreview explain sql/test.sql
gitpushreview explain --staged
```

检查安装和配置状态：

```bash
gitpushreview doctor
```

## 大模型配置

编辑 `.gitpushreview/config/reviewmodel.json`：

```json
{
  "provider": "openai-compatible",
  "baseUrl": "https://api.example.com/v1",
  "apiKey": "",
  "apiKeyEnv": "GITPUSHREVIEW_API_KEY",
  "model": "gpt-4.1",
  "timeoutMs": 60000
}
```

字段说明：

- `baseUrl`：OpenAI-compatible 接口地址，插件会请求 `${baseUrl}/chat/completions`。
- `apiKey`：直接写在配置文件中的密钥，优先级最高。
- `apiKeyEnv`：环境变量名。如果 `apiKey` 为空，会从该环境变量读取密钥。
- `model`：模型名称。
- `timeoutMs`：预留超时时间配置。

建议不要把真实密钥提交到仓库。`apiKey` 适合本机未提交配置；团队项目更推荐把 `apiKey` 留空，只设置环境变量或由公司密钥系统注入。

Windows 临时环境变量：

```bash
set GITPUSHREVIEW_API_KEY=...
```

Windows 永久用户环境变量：

```bash
setx GITPUSHREVIEW_API_KEY "..."
```

执行 `setx` 后需要打开新终端才会生效。

macOS/Linux：

```bash
export GITPUSHREVIEW_API_KEY=...
```

## 审核流程

一次提交会按这个顺序准备审核上下文：

1. 读取本次已暂存 diff 和 staged blob 内容。
2. 运行确定性 Gate：先用纯本地逻辑识别 SQL、Java 内嵌 SQL、Kafka/RabbitMQ 配置等高风险能力标签，并强拦截低误报的明显错误。
3. 读取 `.gitpushreview/vendor/bdr` 中的 BDR 坏味道上下文。
4. 读取 `.gitpushreview/docs/default` 默认规则。
5. 读取 `.gitpushreview/docs/project` 项目规则。
6. 读取 `.gitpushreview/docs/diy` DIY 高优先级规则。
7. 生成 Project Capability Routing 候选集：公共能力先识别，明确能力进入对应规则域，未知文件只进入受限公共兜底。
8. 只把候选规则、确定性 Gate 的路由和 finding 注入大模型上下文，调用大模型生成补充 findings。
9. 根据 finding 分数和拦截策略决定通过、软拦截或强拦截。

确定性 Gate 不依赖大模型，命中强拦截时不会调用模型。当前默认覆盖：

- 普通 `.sql`、`db/**`、`migrations/**` 中的 INSERT 列数和值数量不一致。
- SQL 引号、括号等明显结构错误。
- Java/MyBatis 注解或字符串中的内嵌 INSERT 列值数量不一致。
- RabbitMQ/Kafka 明文密码、Kafka 生产环境自动创建 Topic、RabbitMQ 无限重新入队和非持久化关键消息配置。


## Project Capability Routing

GitPushReview 不再只依赖文件路径判断规则是否适用。每个暂存文件会先生成能力画像，例如：

- `language.java`、`frontend.vue`、`language.python`
- `persistence.sql`、`persistence.mybatis`、`persistence.sql.mysql`、`persistence.sql.oracle`
- `middleware.mq`、`middleware.mq.kafka`、`middleware.mq.rabbitmq`、`middleware.redis`
- `rules.drools`、`common.config`、`common.core`

规则可以在 Markdown 元数据中声明 `capabilities`：

```yaml
score: 80
severity: high
hardBlock: false
paths:
  - src/main/resources/**/*.yml
capabilities:
  - middleware.mq
  - middleware.mq.kafka
```

路由逻辑是：

1. 老规则没有 `capabilities` 时，仍按 `paths` 兼容运行。
2. 新规则同时配置 `paths` 和 `capabilities` 时，两者都要匹配才会进入候选集。
3. 公共规则使用 `common.core` 或 `scope: common`，只做跨技术栈高信号检查。
4. 无法识别能力的文件进入 `common.unknown-limited`，不会把 MySQL、Oracle、Drools、Redis、RabbitMQ 等专有规则全量扇出给模型。
5. `gitpushreview explain <file> --json` 会输出能力标签、候选规则和被过滤规则摘要，方便排查为什么某条规则命中或没有命中。

项目画像诊断：

```bash
gitpushreview profile
gitpushreview profile --json
```

当前 `profile` 是只读诊断命令，只输出根据 `pom.xml`、`package.json`、Python manifest、mapper 目录等推断出的建议能力。`check` 和 `profile` 都不会静默写入 `.gitpushreview/config/project-profile.json`。后续如果加入 AI 学习，也必须先展示建议和证据，由用户确认后再写入。

审核结果分为三种：

- `PASS`：通过，提交继续。
- `SOFT_BLOCK`：软拦截。会显示风险，交互式终端可输入 `确认`、`继续`、`是` 或 `yes` 继续提交。
- `HARD_BLOCK`：强拦截。必须整改后重新提交。

Git 自身仍支持：

```bash
git commit --no-verify
```

但 GitPushReview 不提供额外的强拦截绕过命令。

## 计分机制

GitPushReview 的拦截判断由两部分组成：单条规则是否强拦截，以及总分是否达到阈值。

每条命中的规则会形成一个 finding。模型返回或规则定义中会包含基础分：

```yaml
score: 80
```

规则来源有权重，配置在 `.gitpushreview/agent/rules-index.md`：

```yaml
weight: 2.0
```

最终单条 finding 的加权分计算方式是：

```text
weightedScore = score × weight
```

所有 finding 的加权分相加得到总分：

```text
totalScore = 所有 finding 的 weightedScore 之和
```

默认权重：

| 来源 | 默认权重 | 用途 |
| --- | ---: | --- |
| BDR | 1.0 | BDR 坏味道检测上下文 |
| Default Rules | 1.0 | 插件内置默认规则 |
| Project Rules | 1.5 | 项目通用规则 |
| DIY Rules | 2.0 | 项目最高优先级规则 |

默认阈值在 `.gitpushreview/agent/policy.md`：

```yaml
softBlockScore: 60
hardBlockScore: 90
ciSoftBlockBehavior: fail
```

判断逻辑：

1. 如果任何 finding 的 `blocking` 为 `hard`，直接强拦截。
2. 如果任何规则命中且该规则配置了 `hardBlock: true`，模型应返回 hard blocking，直接强拦截。
3. 如果 `totalScore >= hardBlockScore`，强拦截。
4. 如果 `totalScore >= softBlockScore`，软拦截。
5. 否则通过。

示例：

```text
DIY-AUTH-001 命中
score = 90
DIY Rules weight = 2.0
weightedScore = 90 × 2.0 = 180
```

结果：总分超过默认 `hardBlockScore: 90`，会强拦截。并且如果该规则设置了 `hardBlock: true`，即使阈值调高，也应强拦截。

再看一个普通默认规则：

```text
DEFAULT-VUE-PERF-001 命中
score = 35
Default Rules weight = 1.0
weightedScore = 35
```

结果：如果没有其他问题，总分低于默认 `softBlockScore: 60`，提交通过。

## 规则目录如何使用

规则文件不会自动扫描，必须在 `.gitpushreview/agent/rules-index.md` 中声明。

默认配置：

````markdown
## Default Rules

```yaml
enabled: true
provider: markdown
priority: 20
weight: 1.0
files:
  - ../docs/default/java.md
  - ../docs/default/vue.md
  - ../docs/default/python.md
  - ../docs/default/mysql.md
  - ../docs/default/oracle.md
  - ../docs/default/postgresql.md
  - ../docs/default/oceanbase.md
  - ../docs/default/redis.md
  - ../docs/default/rabbitmq.md
  - ../docs/default/drools.md
  - ../docs/default/security.md
  - ../docs/default/workflow.md
  - ../docs/default/sqlfluff.md
```

## Project Rules

```yaml
enabled: true
provider: markdown
priority: 50
weight: 1.5
files:
  - ../docs/project/architecture.md
  - ../docs/project/api-contract.md
```

## DIY Rules

```yaml
enabled: true
provider: markdown
priority: 100
weight: 2.0
files:
  - ../docs/diy/auth.md
requiredRules: []
hardBlockOnViolation: true
```
````

如果你新增了文件，例如：

```text
.gitpushreview/docs/diy/export.md
```

需要把它加入：

```yaml
files:
  - ../docs/diy/auth.md
  - ../docs/diy/export.md
```

## 规则编写格式

详细说明见初始化后的：

```text
.gitpushreview/docs/RULES.md
```

一条规则的基本格式：

````markdown
## DIY-AUTH-001 禁止绕过租户边界读取或修改数据

```yaml
score: 90
severity: critical
hardBlock: true
paths:
  - backend/**/*.java
  - frontend/**/*.vue
capabilities:
  - language.java
  - frontend.vue
```

**规则说明**：
所有涉及用户、订单、合同、资金等租户数据的读取和修改，都必须显式校验租户边界。

**检查要点**：
- 是否只通过 id 直接查询私有资源。
- 查询条件、缓存 key、导出任务是否缺少 tenantId。
- 是否绕过统一鉴权组件或数据权限组件。

**违规风险**：
可能造成水平越权、跨租户数据泄露或客户数据污染。

**修复建议**：
从可信上下文获取当前租户，在服务端强制校验资源归属，并补充越权失败测试。
````

正文中的“规则说明、检查要点、违规风险、修复建议、示例”会作为 AI 审核上下文。也就是说，用户维护的是规则原则和建议模板；提交时 AI 会结合真实 diff 生成本次提交的具体证据和修复建议。

## BDR 集成与升级

BDR 被当作外部坏味道检测上下文处理，目录位于：

```text
.gitpushreview/vendor/bdr
```

查看 BDR 状态：

```bash
gitpushreview bdr status
```

升级 BDR 时，可以用新版 `https://github.com/agiledon/bdr.git` 内容覆盖 `.gitpushreview/vendor/bdr`。GitPushReview 不会把 BDR 规则硬编码进 default Markdown，因此后续升级 BDR 时不需要重写插件规则。

## 下一步计划：严格规则包

当前内置 `default` 规则保持高信号、低误报，主要覆盖提交前最值得拦截的安全、数据一致性、事务、中间件和工程流程风险。后续有必要继续建设更细的严格规则包，但建议作为可选能力启用，而不是全部默认强推。

计划方向：

- `default/strict-java`：补充 Java、Spring Boot、Spring Cloud、MyBatis、P3C、SonarJava、Error Prone、NullAway、SpotBugs 等更细规则。
- `default/strict-db`：补充 MySQL、Oracle、PostgreSQL、OceanBase 的索引、执行计划、迁移、锁、分区、权限和恢复规则。
- `default/strict-frontend`：补充 Vue、TypeScript、ESLint、Semgrep、构建产物、组件测试和前端安全规则。
- `default/strict-middleware`：补充 Redis、RabbitMQ、Seata、Drools 等中间件和规则引擎的生产治理规则。
- `default/strict-security`：补充 OWASP ASVS、API Security、供应链、密钥治理、审计和安全扫描规则。

启用方式建议仍然沿用 `.gitpushreview/agent/rules-index.md`：项目可以按需把某个严格规则文件加入 `Default Rules.files` 或 `Project Rules.files`，并通过 `weight`、`hardBlock` 和阈值控制拦截强度。

这样做的好处是：默认安装不会因为规则过细而产生大量误报，公司项目又可以逐步打开更严格的规则包，把团队规范沉淀成可配置、可审计、可升级的规则库。
## 常用命令

```bash
gitpushreview init
gitpushreview init --force
gitpushreview init --no-hook
gitpushreview check --staged
gitpushreview check --staged --json
gitpushreview explain <file>
gitpushreview explain --staged
gitpushreview profile
gitpushreview profile --json
gitpushreview doctor
gitpushreview bdr status
```

说明：

- `init`：初始化 `.gitpushreview` 并安装 pre-commit hook。
- `init --force`：覆盖已存在的初始化文件，谨慎使用。
- `init --no-hook`：只生成配置和规则文件，不安装 Git hook。
- `check --staged`：审核本次已暂存变更。
- `check --staged --json`：输出原始 JSON 结果，方便 CI 或脚本集成。
- `explain <file>`：解释单个文件的能力标签、确定性检查和强拦截原因。
- `explain --staged`：解释本次已暂存文件的路由、候选规则和确定性检查结果。
- `profile`：只读诊断项目技术画像建议，不会写配置。
- `doctor`：检查 Node、工作目录、模型配置、API Key、BDR 目录。

## 重新初始化已有项目

如果你之前已经在业务项目执行过 `gitpushreview init`，想拿到新版默认规则和 `capabilities` 元数据，可以在业务项目根目录执行：

```bash
gitpushreview init --force
```

注意：`--force` 会覆盖 `.gitpushreview/agent`、`.gitpushreview/docs`、`.gitpushreview/config/reviewmodel.json` 等初始化文件。执行前请先备份你手工改过的 project/diy 规则和模型配置。更稳妥的做法是先把 `.gitpushreview/docs/project`、`.gitpushreview/docs/diy` 和 `.gitpushreview/config/reviewmodel.json` 复制到临时位置，重新初始化后再合并。

## 本地开发

```bash
npm test
npm pack --dry-run
```

