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
      mysql.md
      oracle.md
      drools.md
      security.md
      workflow.md
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
  "apiKey": "sk-...",
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

如果不希望把密钥写进项目目录，可以只设置环境变量。

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

1. 读取本次已暂存 diff。
2. 读取 `.gitpushreview/vendor/bdr` 中的 BDR 坏味道上下文。
3. 读取 `.gitpushreview/docs/default` 默认规则。
4. 读取 `.gitpushreview/docs/project` 项目规则。
5. 读取 `.gitpushreview/docs/diy` DIY 高优先级规则。
6. 调用大模型生成 findings。
7. 根据 finding 分数和拦截策略决定通过、软拦截或强拦截。

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
  - ../docs/default/mysql.md
  - ../docs/default/oracle.md
  - ../docs/default/drools.md
  - ../docs/default/security.md
  - ../docs/default/workflow.md
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

## 常用命令

```bash
gitpushreview init
gitpushreview init --force
gitpushreview init --no-hook
gitpushreview check --staged
gitpushreview check --staged --json
gitpushreview doctor
gitpushreview bdr status
```

说明：

- `init`：初始化 `.gitpushreview` 并安装 pre-commit hook。
- `init --force`：覆盖已存在的初始化文件，谨慎使用。
- `init --no-hook`：只生成配置和规则文件，不安装 Git hook。
- `check --staged`：审核本次已暂存变更。
- `check --staged --json`：输出原始 JSON 结果，方便 CI 或脚本集成。
- `doctor`：检查 Node、工作目录、模型配置、API Key、BDR 目录。

## 本地开发

```bash
npm test
npm pack --dry-run
```
