# Feature Specification: Review Determinism Controls

**Feature Branch**: `[001-review-determinism-controls]`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "1、新增开启关闭功能配置选项。2、优化交互逻辑，有的常见下用户是没有管理员权限的，要支持用户模式也能安装 3、完善help提示命令，所有命令解释都要以中文说明 4、更新项目依赖的 坏味道检测项目依赖版本 5、请着重分析现在项目所默认的规则，特别是项目所设计的匹配规则，目前实际体验发现当模型不够聪明的时候会存在同一份待提交的代码，每次触发的拦截规则不一致。"

## Clarifications

### Session 2026-07-02

- Q: For repeated reviews of identical staged input, what must remain deterministic? -> A: Candidate rule set, accepted finding rule IDs, and final pass/block status.
- Q: What must user-mode installation guarantee for permission-limited environments? -> A: Repository-local initialization plus a hook or manual check path that does not require global installation or administrator privileges.
- Q: How should findings outside the selected rule candidate set be handled? -> A: They must not affect blocking, and they must be visible as rejected diagnostic items.
- Q: What review control modes must configuration support? -> A: Three persistent modes: skip all checks, run checks without blocking and output logs, and normal blocking review.
- Q: How should the bad-smell detection dependency target version be selected? -> A: Use a maintainer-approved fixed target version and record that version during planning.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Stable Review Results For Same Change (Priority: P1)

As a developer using GitPushReview before committing code, I want the same staged change to produce the same applicable rule set and block outcome across repeated reviews, so that I can trust review results even when the review model is inconsistent.

**Why this priority**: The reported problem is that the same pending commit can trigger different blocking rules on different runs. This directly damages trust and makes the tool hard to adopt.

**Independent Test**: Can be fully tested by running review multiple times against an unchanged staged change and comparing the selected rule identifiers, accepted finding rule identifiers, and final blocking status.

**Acceptance Scenarios**:

1. **Given** an unchanged staged change and unchanged review configuration, **When** the user runs review five times, **Then** each run reports the same applicable rule identifiers, accepted finding rule identifiers, and final block status.
2. **Given** a file that matches only a narrow subset of default rules, **When** the review runs repeatedly, **Then** unrelated default rules do not appear intermittently in findings or blocking output.
3. **Given** static evidence for a matching rule, **When** the review result is produced, **Then** the evidence is associated only with the file and rule that matched it.

---

### User Story 2 - Control Review Mode (Priority: P1)

As a project maintainer or individual developer, I want a clear configuration option to choose how GitPushReview behaves, so that I can permanently skip review, run review in logging-only mode, or use normal blocking review without removing the tool or editing hook files manually.

**Why this priority**: Users need a predictable escape hatch for local work, emergency fixes, or phased rollout.

**Independent Test**: Can be tested by setting each review mode and verifying that review is skipped, logging-only, or blocking according to the configured mode.

**Acceptance Scenarios**:

1. **Given** normal blocking mode is configured, **When** a user runs a check, **Then** the normal staged-change review flow is used and failing review conditions may block.
2. **Given** skip-all-checks mode is configured, **When** a user runs a check, **Then** no review is performed and the output clearly states in Chinese that GitPushReview is currently skipped by configuration.
3. **Given** logging-only mode is configured, **When** a user runs a check, **Then** review is performed and review data is emitted as logs, but no finding blocks the operation.
4. **Given** the review mode setting is missing, **When** the user runs a check, **Then** normal blocking mode is used by default.

---

### User Story 3 - Install Without Administrator Permission (Priority: P2)

As a developer without administrator privileges on a workstation, I want GitPushReview initialization and hook installation to work in user mode, so that I can adopt the tool in locked-down corporate environments.

**Why this priority**: Common enterprise environments restrict global installs and admin-level writes; installation failure prevents any review value from being delivered.

**Independent Test**: Can be tested in an environment where the user can write to the repository but cannot write to system-level locations, verifying repository-local initialization plus either hook-based checks or a manual check path.

**Acceptance Scenarios**:

1. **Given** the user can write to the repository but lacks administrator permissions and cannot use global installation, **When** the user initializes GitPushReview, **Then** repository-local initialization completes without requiring elevated privileges.
2. **Given** automatic hook installation is not allowed in the environment, **When** initialization runs, **Then** the user receives clear Chinese guidance for a user-mode manual check path that still allows checks to run.
3. **Given** the tool cannot complete an installation step because of permission restrictions, **When** the error is shown, **Then** the message explains the user-mode alternative in Chinese.

---

### User Story 4 - Understand Every Command In Chinese Help (Priority: P2)

As a Chinese-speaking user, I want every command and option in help output to be explained in Chinese, so that I can operate the tool without reading source code or English-only command descriptions.

**Why this priority**: Help output is the first recovery path when users are blocked, especially during installation and configuration.

**Independent Test**: Can be tested by requesting general help and command-specific help and checking that command names, options, expected effects, and examples are explained in Chinese.

**Acceptance Scenarios**:

1. **Given** the user requests general help, **When** help is displayed, **Then** every listed command has a Chinese explanation.
2. **Given** the user requests help for a supported command, **When** command help is displayed, **Then** all options and examples are explained in Chinese.
3. **Given** the user enters an unknown command, **When** the error is displayed, **Then** the message is in Chinese and points the user to help.

---

### User Story 5 - Use Approved Bad-Smell Review Context (Priority: P3)

As a maintainer, I want the bundled bad-smell detection dependency to be updated to an approved fixed target version, so that GitPushReview benefits from approved review knowledge without relying on a moving latest-version definition.

**Why this priority**: The bad-smell context is part of the review quality surface, but updating it is lower priority than deterministic results and installability.

**Independent Test**: Can be tested by initializing a fresh workspace and verifying that the bundled bad-smell context reports the approved fixed target version recorded during planning and is included in review context.

**Acceptance Scenarios**:

1. **Given** a fresh initialization, **When** the user checks bad-smell dependency status, **Then** the reported version matches the approved fixed target version recorded for this release.
2. **Given** a review runs after initialization, **When** review context is assembled, **Then** the updated bad-smell guidance is available to the review.
3. **Given** the dependency cannot be refreshed, **When** maintainers prepare the release, **Then** the release notes or validation output clearly identify the stale dependency before users adopt it.

### Edge Cases

- The review mode setting is missing, malformed, or uses an unsupported value.
- Skip-all-checks mode is active while running in a commit hook, interactive check, and machine-readable output mode.
- Logging-only mode receives findings that would normally block in normal mode.
- A user can write to the repository but cannot write to global package locations or protected hook paths.
- The repository already has an existing hook or existing GitPushReview workspace.
- The same staged change includes multiple file types that match shared common rules.
- Unknown or low-confidence files should not cause broad default rule fan-out.
- The model returns findings for rules that were not selected as applicable candidates.
- The model returns findings for rules that were not selected as applicable candidates; these findings must be rejected for blocking while remaining visible for diagnostics.
- The bad-smell dependency version is unavailable or cannot be verified during release preparation.
- The approved fixed target bad-smell dependency version has not been recorded before implementation planning starts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a persistent configuration setting that controls review behavior for the current workspace.
- **FR-002**: The system MUST support three review modes: skip all checks, run checks without blocking while outputting review logs, and normal blocking review.
- **FR-003**: The system MUST treat review mode as normal blocking review when the setting is absent.
- **FR-004**: The system MUST clearly report in Chinese when skip-all-checks mode or logging-only mode changes normal blocking behavior.
- **FR-020**: In skip-all-checks mode, the system MUST avoid starting review checks and MUST avoid producing blocking review results.
- **FR-021**: In logging-only mode, the system MUST run review checks, output review data as logs, and MUST NOT block based on review findings.
- **FR-022**: The system MUST expose the current review mode through a user-facing status or diagnostic path.
- **FR-005**: Users MUST be able to initialize and use GitPushReview in a repository-scoped user mode without requiring global installation or administrator privileges.
- **FR-006**: The system MUST provide Chinese guidance when permission restrictions prevent an installation step and MUST describe a repository-local hook path or manual check path that remains available without administrator privileges.
- **FR-007**: The system MUST preserve existing user-owned hooks or configuration unless the user explicitly requests replacement.
- **FR-008**: General help output MUST include Chinese explanations for every supported command.
- **FR-009**: Command-specific help output MUST include Chinese explanations for every supported option and at least one Chinese usage example where the command has options.
- **FR-010**: Unknown-command and invalid-usage messages MUST be Chinese and MUST direct users to the relevant help path.
- **FR-011**: The bundled bad-smell detection dependency MUST be updated to the maintainer-approved fixed target version recorded during planning.
- **FR-012**: A fresh workspace initialization MUST include the updated bad-smell dependency content.
- **FR-013**: The system MUST make default rule applicability, accepted finding rule identifiers, and final pass/block status deterministic for unchanged staged input and unchanged configuration.
- **FR-014**: The system MUST ensure that each model-visible default rule is selected through an explainable match between changed files and rule applicability criteria.
- **FR-015**: The system MUST prevent unrelated default rules from appearing in review context solely because a file is unknown or only weakly classified.
- **FR-016**: The system MUST reject findings that refer to rules outside the selected applicable rule set for the current staged change, and such rejected findings MUST NOT affect accepted finding rule identifiers or final pass/block status.
- **FR-019**: The system MUST expose rejected out-of-candidate findings through diagnostic or explanation output so users can understand when model output was excluded from blocking.
- **FR-017**: The system MUST provide a user-visible explanation path that shows which rules matched, which rules were excluded, and why.
- **FR-018**: The system MUST include regression coverage proving that repeated reviews of identical staged input produce stable selected rules, stable accepted finding rule identifiers, and stable block status.

### Key Entities *(include if feature involves data)*

- **Review Mode Setting**: Workspace-level state indicating whether GitPushReview skips all checks, runs checks in logging-only mode, or runs normal blocking review, with normal blocking review as the default when unspecified.
- **Installation Mode**: The user-visible initialization path, including normal repository setup and user-mode fallback behavior when administrator-level writes are unavailable.
- **Command Help Entry**: The user-facing description for a command, its options, usage examples, and invalid-usage guidance.
- **Bad-Smell Dependency Version**: The maintainer-approved fixed target version of the bad-smell detection context included in initialized workspaces.
- **Default Rule Applicability Decision**: The deterministic record of why a rule was selected or excluded for a staged change.
- **Review Candidate Set**: The complete set of rules that the review may use for findings for a specific staged change.
- **Rejected Finding**: A model-produced finding that references a rule outside the current review candidate set and is therefore excluded from blocking while remaining available for diagnostics.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For a fixed staged change and fixed configuration, 10 consecutive review runs produce identical selected rule identifiers, identical accepted finding rule identifiers, and identical final block status.
- **SC-002**: In a representative sample of at least 20 default-rule routing cases, 100% of selected rules include a documented match reason visible through the explanation path.
- **SC-003**: Unknown or weakly classified files do not expand into unrelated domain-specific default rules in 100% of tested unknown-file scenarios.
- **SC-003a**: In 100% of tested cases where model output references a rule outside the review candidate set, the out-of-candidate finding does not affect the final block status and is visible in diagnostics.
- **SC-004**: A user without administrator privileges and without global installation access can complete repository-scoped initialization and run either hook-based checks or a manual check in under 5 minutes using documented Chinese guidance.
- **SC-005**: 100% of supported commands and options in help output include Chinese descriptions.
- **SC-006**: Skip-all-checks mode avoids starting review checks and exits without blocking in 100% of hook, manual, and machine-readable output scenarios.
- **SC-006a**: Logging-only mode runs review checks, emits review logs, and exits without blocking in 100% of scenarios where normal mode would block.
- **SC-007**: A fresh initialized workspace reports the maintainer-approved fixed target bad-smell dependency version before release.
- **SC-008**: User support questions about inconsistent rule triggering and permission-limited installation are reduced by at least 50% after release, measured against the previous release cycle.

## Assumptions

- The review mode setting is workspace-scoped by default, because GitPushReview already initializes project-local configuration.
- Normal blocking review remains the default mode to preserve current behavior for existing users.
- User-mode installation means repository-scoped setup that does not require writes to protected system locations or global package locations.
- Existing hooks and configuration should be preserved unless the user explicitly opts into replacement.
- The approved fixed target bad-smell dependency version will be selected by maintainers and recorded during planning.
- Deterministic review means stable rule selection, stable accepted finding rule identifiers, and stable final block status for identical staged input and configuration; natural-language wording may still vary.
- Default rule improvements should focus first on applicability, routing, and candidate constraints, because these directly reduce inconsistent blocking when the review model is weak.
