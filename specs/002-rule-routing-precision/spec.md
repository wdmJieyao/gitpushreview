# Feature Specification: Rule Routing Precision

**Feature Branch**: `[002-rule-routing-precision]`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "基于多 agent 交叉审计结果，开启 Spec Kit 变更，优化代码检查器根据待提交 Git 文件过滤规则文件的逻辑，重点解决候选规则过宽、方言规则互串、Java 子域规则过粗、默认规则缺少精确信号、诊断信息不足，以及同一份 staged 代码在模型不稳定时触发不同拦截规则的问题。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 精准候选规则过滤 (Priority: P1)

作为使用 GitPushReview 的开发者，我希望同一份已暂存代码只进入与文件类型、技术能力和明确证据信号相关的候选规则，避免模型在大量不相关规则中随机选择不同拦截原因。

**Why this priority**: 这是解决“同一份待提交代码每次触发规则不一致”的核心路径。候选规则不收敛时，后续报告、提示词和模型约束都只能缓解症状。

**Independent Test**: 可以通过构造典型 Java、MyBatis XML、MySQL、Oracle、Vue、配置文件的 staged 变更，检查候选规则集合只包含相关规则，并重复执行确认候选集合稳定。

**Acceptance Scenarios**:

1. **Given** 一个普通 Java Service 文件只包含普通业务方法，**When** 用户解释或审核该 staged 变更，**Then** 候选规则不得包含 MySQL、Oracle、PostgreSQL、RabbitMQ、Redis、Drools 等无关技术规则。
2. **Given** 一个 MyBatis XML 文件包含通用 SQL 但没有明确数据库方言证据，**When** 用户解释或审核该 staged 变更，**Then** 候选规则不得同时扩展到所有数据库方言专属规则。
3. **Given** 一个明确 MySQL 迁移脚本，**When** 用户解释或审核该 staged 变更，**Then** MySQL 相关规则可以进入候选集，Oracle/PostgreSQL/OceanBase 专属规则不得因通用 SQL 能力进入候选集。
4. **Given** 一个 Vue 单文件组件，**When** 用户解释或审核该 staged 变更，**Then** 候选规则应集中在 Vue、前端安全和必要公共规则，不得进入 Java 或数据库专属规则。

**Required Scenario Coverage**: 覆盖主路径、跨方言误匹配、普通 Java 误扩展、前端文件误归类，以及重复运行的稳定性。

---

### User Story 2 - 可解释的规则诊断 (Priority: P2)

作为维护者，我希望在 `explain` 和审核输出中清楚看到候选规则为什么被选中、为什么被过滤，以及候选集是否过大，从而能定位规则元数据或文件能力识别问题。

**Why this priority**: 候选集即使收敛，仍需要可观测性来排查项目规则、DIY 规则和默认规则的误配置。

**Independent Test**: 可以运行 staged explain，验证输出包含候选规则摘要、分类统计、主要命中原因、主要过滤原因和 rejected finding 诊断。

**Acceptance Scenarios**:

1. **Given** 一个 staged 变更命中多类规则，**When** 用户运行 explain，**Then** 输出应显示候选规则总数、按来源和能力分类的摘要，以及前若干个关键命中原因。
2. **Given** 模型返回候选集外 finding，**When** 用户查看审核结果，**Then** 输出应明确该 finding 被拒绝、拒绝原因和对应 ruleId，不影响最终阻断状态。
3. **Given** 当前审核模式为 skip，**When** 用户运行 explain，**Then** 输出应说明 explain 仍然是诊断，实际 check 会按 skip 模式跳过审核。

**Required Scenario Coverage**: 覆盖普通文本输出、JSON 输出、skip/log/normal 模式差异、rejected finding 诊断。

---

### User Story 3 - 稳定性回归保护 (Priority: P3)

作为项目维护者，我希望规则路由和模型 finding 过滤有完整回归测试，保证未来添加规则或能力识别逻辑时，不会重新引入候选集膨胀和不稳定阻断。

**Why this priority**: 规则体系会持续扩展，缺少候选规模和稳定性测试会让问题反复出现。

**Independent Test**: 可以通过端到端 staged 仓库 fixture、多文件顺序扰动、重复 ruleId、乱序模型 findings 和静态证据 finding 场景验证稳定性。

**Acceptance Scenarios**:

1. **Given** 同一组 staged 变更，**When** 系统重复执行审核多次，**Then** 候选规则 ID、accepted findings、rejected findings、总分和最终状态保持一致。
2. **Given** 同一组文件以不同顺序进入审核流程，**When** 系统生成规则路由和提示上下文，**Then** 候选规则集合和最终决策保持一致。
3. **Given** 两条规则声明重复 ruleId，**When** 系统加载规则，**Then** 诊断必须明确重复 ID，避免一个模块使用第一条规则、另一个模块使用后一条规则造成不一致。
4. **Given** 模型以不同顺序返回同一批 findings，**When** 系统过滤并决策，**Then** accepted/rejected 排序、总分和阻断状态保持一致。

**Required Scenario Coverage**: 覆盖 primary flow、端到端 Git staged 输入、乱序输入、重复 ID、静态证据候选、模型返回乱序。

### Edge Cases

- 暂存 blob 与工作区文件内容不同：审核和 `explain --staged` 必须以 staged 内容为准；`explain <file>` 是显式的工作区文件诊断。
- 删除文件没有 staged blob：系统必须使用 diff 中可得信息进行诊断，不得读取未暂存工作区内容。
- 未知文件类型只有普通文本：默认只允许公共规则，除非明确规则信号允许扩展。
- 文件同时包含多个技术信号：必须按高置信能力和规则要求过滤，不得仅因通用能力把所有子域规则加入候选。
- JavaScript/TypeScript 文件不属于 Vue 项目：不得默认作为 Vue 规则候选，除非有前端/Vue 证据。
- 配置文件包含 `exchange`、`routing-key` 等通用词：不得单词命中就扩展到 MQ 规则，除非同时存在明确 MQ 证据。
- 方言不明确的 SQL：只进入通用 SQL 规则，不进入具体数据库方言规则。
- 候选集为空或极小：审核仍应给出可理解诊断，不得崩溃。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST prevent database dialect-specific rules from entering the candidate set solely because a file has generic SQL capability.
- **FR-002**: System MUST distinguish generic SQL capability from concrete database dialect evidence when selecting candidate rules.
- **FR-003**: System MUST support rules that require multiple capabilities or explicit required capabilities before they can enter the candidate set.
- **FR-004**: System MUST keep ordinary Java files from receiving Java subdomain rules unless the file has the matching subdomain evidence or capability.
- **FR-005**: System MUST keep Vue-specific rules scoped to Vue or clearly frontend-relevant files, and MUST avoid treating every JavaScript or TypeScript file as Vue-specific by default.
- **FR-006**: System MUST use stricter evidence for MQ capability detection so generic terms do not independently route files into MQ rules.
- **FR-007**: System MUST preserve the existing unknown-limited safety model: unknown files only receive common rules unless an explicitly allowed signal expansion matches.
- **FR-008**: System MUST keep model findings outside the selected candidate set from affecting accepted findings, total score, or blocking decision.
- **FR-009**: System MUST expose candidate rule IDs and candidate summary diagnostics in machine-readable review or explain output.
- **FR-010**: System MUST show rejected model findings with ruleId and rejectReason in diagnostics, at least in JSON output and with a concise human-readable summary.
- **FR-011**: System MUST provide human-readable explain output that summarizes why the candidate set is large, including source/category counts and dominant match or skip reasons.
- **FR-012**: System MUST keep rule routing deterministic for repeated runs over identical staged input.
- **FR-013**: System MUST keep routing stable when the same file set is processed in different input order.
- **FR-014**: System MUST detect duplicate rule IDs or provide deterministic diagnostics that prevent duplicate IDs from silently changing rule metadata semantics.
- **FR-015**: System MUST include comprehensive scenario tests for primary flows, failure or edge cases, and determinism, without using real model or network calls.

### Key Entities *(include if feature involves data)*

- **Staged Change**: The exact file names, diff, and staged blob contents that will be committed.
- **File Capability Context**: The normalized file path, labels, capabilities, dialect candidates, evidence, confidence, and unknown-limited status used to route rules.
- **Rule Metadata**: The rule ID, source, path scope, capability requirements, signal fields, evidence patterns, severity, score, and hard-block behavior.
- **Candidate Rule Set**: The deterministic set of rules selected for the staged change and sent to the model.
- **Rejected Finding**: A model finding whose ruleId is not part of the candidate rule set or accepted deterministic evidence set.
- **Routing Diagnostics**: Machine-readable and human-readable data explaining selected rules, excluded rules, match reasons, skip reasons, and summary counts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For representative generic MyBatis XML input, candidate rules no longer include multiple mutually exclusive database dialect families unless the file contains explicit evidence for those dialects.
- **SC-002**: For representative ordinary Java service input, candidate rules exclude unrelated database, middleware, Drools, and unrelated Java subdomain rule families.
- **SC-003**: Repeating review over identical staged input at least 10 times produces identical candidate rule IDs, accepted finding IDs, rejected finding IDs, total score, and final status.
- **SC-004**: Processing the same staged file set in different input order produces the same candidate rule ID set and final decision.
- **SC-005**: Explain JSON contains direct candidate rule IDs and summary diagnostics without requiring consumers to parse free-form reason strings.
- **SC-006**: Human-readable explain output allows a maintainer to identify the top reasons for candidate expansion within one command invocation.
- **SC-007**: All new behavior is covered by scenario tests that run locally with no real model or network calls.

## Assumptions

- Existing review modes (`skip`, `log`, `normal`) remain in scope and must keep their current blocking semantics.
- Existing rule files and initialized workspaces may contain legacy `capabilities`; migration must preserve backward compatibility or provide deterministic fallback behavior.
- The first implementation slice should prioritize candidate-set correctness and diagnostics over changing model prompt wording.
- Default rules remain generated from project templates; any rule metadata changes must keep generated rule files and rules-index closure consistent.
- This feature does not change vendored OpenMole/BDR content.
