# GitPushReview

GitPushReview 是一个 Git 提交前代码审核插件。它会在 `git commit` 前读取本次已暂存的变更，结合 BDR、默认规则、项目规则、DIY 规则和 OpenAI-compatible 大模型进行复审、打分，并根据分数决定是否放行。

核心原则：

- AI 是最终复审和打分者。
- 静态层只做路由、证据提取和上下文增强，不直接决定提交是否通过。
- BDR 可以独立升级，默认规则和项目规则用 Markdown 维护。
- 规则命中后按分数和权重计算风险，达到阈值后软拦截或强拦截。

## 快速开始

全局安装：

```bash
npm install -g https://github.com/wdmJieyao/gitpushreview.git
```

在项目根目录初始化：

```bash
gitpushreview init
```

初始化后会创建：

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

如果当前目录是 Git 仓库，`init` 会安装 `.git/hooks/pre-commit`，以后 `git commit` 会自动触发审核。

手动审核已暂存变更：

```bash
gitpushreview check --staged
```

查看某个文件为什么走这些规则：

```bash
gitpushreview explain src/main/resources/application-prod.yml --json
gitpushreview explain --staged
```

检查安装状态：

```bash
gitpushreview doctor
```

## 模型配置

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

- `baseUrl`：OpenAI-compatible 接口地址，插件请求 `/chat/completions`。
- `apiKey`：本机直接配置的密钥，优先级最高，不建议提交到仓库。
- `apiKeyEnv`：当 `apiKey` 为空时，从该环境变量读取密钥。
- `model`：模型名称。
- `timeoutMs`：模型请求超时时间配置。

Windows 永久用户环境变量：

```bash
setx GITPUSHREVIEW_API_KEY "..."
```

macOS/Linux：

```bash
export GITPUSHREVIEW_API_KEY=...
```

## 系统流程图

```text
开发者 git commit
      |
      v
读取 staged diff 和 staged blob
      |
      v
静态能力识别
  - 文件类型: java/vue/python/sql/yml/drl...
  - 内容信号: MyBatis/Kafka/RabbitMQ/Redis/Drools/SQL token...
      |
      v
Project Capability Routing
  - 生成 capabilities
  - 根据 paths + capabilities 过滤规则
  - unknown 文件只进入 common.unknown-limited 公共兜底
      |
      v
静态证据提取
  - SQL 列值数量不一致
  - Java 内嵌 SQL
  - MQ 高风险配置
  - 这些只作为证据线索，不直接裁决
      |
      v
组装 AI 复审上下文
  - BDR 上下文
  - default/project/diy 候选规则
  - 静态路由和静态证据
  - staged diff
      |
      v
AI 复审并返回 findings
  - ruleId / title / severity
  - score / weightedScore
  - blocking: none | soft | hard
  - evidence / suggestion
      |
      v
计分和拦截
  - PASS: 允许提交
  - SOFT_BLOCK: 用户确认后可继续
  - HARD_BLOCK: 必须整改
```

## 静态路由做什么

静态层不是最终裁判。它只决定“哪些规则应该交给 AI 看”，避免把所有规则都塞给模型。

例子：

- 普通 `UserService.java`：进入 `language.java`、`common.core`。
- `OrderMapper.xml`：进入 `common.xml`、`persistence.mybatis`、`persistence.sql`。
- Kafka 生产配置：进入 `common.config`、`middleware.mq`、`middleware.mq.kafka`。
- 无法识别的文件：进入 `common.unknown-limited`，不会扇出 MySQL、Oracle、Drools、Redis、RabbitMQ 等专有规则。

规则可以声明能力域，也可以声明路由信号和静态证据模式：

```yaml
paths:
  - src/main/resources/**/*.yml
capabilities:
  - middleware.mq
  - middleware.mq.kafka
signalContent:
  - spring\.kafka
  - KafkaTemplate
evidencePatterns:
  - kafka-auto-create|auto-create\s*:\s*true|检测到 Kafka 自动创建 Topic 配置
```

普通已识别文件仍必须满足 `paths + capabilities` 才会进入 AI 候选规则上下文，`signalPaths` 和 `signalContent` 只作为补充证据，不会绕过基础适用范围。没有 `capabilities` 的旧规则仍按 `paths` 兼容运行。识别不到能力的 unknown-limited 文件默认只允许公共规则进入；如果某条规则显式设置 `allowUnknownExpansion: true`，并且 `signalPaths` 或 `signalContent` 命中，才允许作为低置信扩展候选进入 AI 复审。`evidencePatterns` 只提取静态证据线索，不直接决定 blocking。

## 规则目录

规则文件不会自动扫描，必须写入 `.gitpushreview/agent/rules-index.md`。

默认规则来源：

- `docs/default/*.md`：插件内置默认规则，覆盖 Java、Vue、Python、MySQL、Oracle、PostgreSQL、OceanBase、Redis、RabbitMQ、Drools、安全、流程、SQLFluff。
- `docs/project/*.md`：项目级规则，例如架构分层、API 契约、数据模型。
- `docs/diy/*.md`：最高优先级规则，例如鉴权、资金、审计、生产红线。
- `vendor/bdr`：BDR 坏味道检测器上下文。

新增规则文件后，需要把路径加入 `rules-index.md`：

```yaml
files:
  - ../docs/diy/auth.md
  - ../docs/diy/export.md
```

## 规则格式

一条规则就是一个 Markdown 二级标题和一段 YAML 元数据：

```markdown
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

**规则说明**：所有租户数据读取和修改必须校验租户边界。

**检查要点**：
- 是否只通过 id 查询私有资源。
- 是否缺少 tenantId、orgId 或等价隔离字段。

**违规风险**：可能造成水平越权或跨租户数据泄露。

**修复建议**：从可信上下文获取租户身份，在服务端强制校验资源归属。
```

完整写法见初始化后的 `.gitpushreview/docs/RULES.md`。

## 计分机制

AI 返回的每个 finding 都有基础分：

```yaml
score: 80
```

规则来源有权重，配置在 `.gitpushreview/agent/rules-index.md`：

```yaml
weight: 2.0
```

单条 finding 加权分：

```text
weightedScore = score × weight
```

总分：

```text
totalScore = 所有 finding 的 weightedScore 之和
```

默认权重：

| 来源 | 默认权重 |
| --- | ---: |
| BDR | 1.0 |
| Default Rules | 1.0 |
| Project Rules | 1.5 |
| DIY Rules | 2.0 |

默认阈值在 `.gitpushreview/agent/policy.md`：

```yaml
softBlockScore: 60
hardBlockScore: 90
ciSoftBlockBehavior: fail
```

判断逻辑：

1. AI 返回 `blocking: hard`，强拦截。
2. AI 命中 `hardBlock: true` 的规则，应该返回 hard。
3. `totalScore >= hardBlockScore`，强拦截。
4. `totalScore >= softBlockScore`，软拦截。
5. 其它情况通过。

软拦截时，交互式终端可以输入 `确认`、`继续`、`是` 或 `yes` 继续提交。

## BDR 升级

BDR 位于：

```text
.gitpushreview/vendor/bdr
```

查看状态：

```bash
gitpushreview bdr status
```

升级时，可以用新版 `https://github.com/agiledon/bdr.git` 内容覆盖该目录。GitPushReview 不把 BDR 规则硬编码进 default Markdown，因此 BDR 可以独立升级。

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
- `check --staged`：审核已暂存变更。
- `explain`：查看能力标签、候选规则、静态证据和路由原因。
- `profile`：只读诊断项目技术画像建议，不会写配置。
- `doctor`：检查 Node、工作目录、模型配置、API Key、BDR 目录。

## 已有项目重新初始化

如果你之前已经初始化过，想拿到新版默认规则和 `capabilities` 元数据，可以执行：

```bash
gitpushreview init --force
```

注意：`--force` 会覆盖 `.gitpushreview/agent`、`.gitpushreview/docs`、`.gitpushreview/config/reviewmodel.json`。执行前请备份自己改过的 project/diy 规则和模型配置。

## 本地开发

```bash
npm test
npm pack --dry-run
```
