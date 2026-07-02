# Tasks: Review Determinism Controls

**Input**: Design documents from `specs/001-review-determinism-controls/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Include scenario, regression, and contract tests because the specification and constitution require comprehensive scenario testing for deterministic review behavior, review modes, user-mode install, Chinese CLI contracts, and vendored context validation.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently after the foundational phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or depends only on completed earlier phases
- **[Story]**: User story label from `spec.md`
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared contracts and test fixture helpers before implementation.

- [X] T001 Add shared temporary workspace fixture helpers for initialized GitPushReview workspaces in `test/helpers/workspace.js`
- [X] T002 Add shared model response fixture helpers for accepted and rejected findings in `test/helpers/review-fixtures.js`
- [X] T003 [P] Add contract reference comments for CLI mode and review result expectations in `specs/001-review-determinism-controls/contracts/cli-contract.md`
- [X] T004 [P] Add contract reference comments for accepted/rejected finding expectations in `specs/001-review-determinism-controls/contracts/review-result-contract.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared primitives required by multiple stories.

**CRITICAL**: No user story implementation should start until this phase is complete.

- [X] T005 Create review mode loader and validator in `src/review/mode.js`
- [X] T006 Add review mode template defaults to generated workspace config in `src/templates.js`
- [X] T007 Wire review mode files into workspace initialization without overwriting user config unless forced in `src/workspace.js`
- [X] T008 Create accepted/rejected finding normalization helpers in `src/review/findings.js`
- [X] T009 Update review result rendering to tolerate `mode` and `rejectedFindings` fields in `src/format/report.js`
- [X] T010 [P] Add review mode unit tests in `test/review-mode.test.js`
- [X] T011 [P] Add accepted/rejected finding normalization unit tests in `test/review-findings.test.js`

**Checkpoint**: Review mode and finding normalization primitives are available for all user stories.

---

## Phase 3: User Story 1 - Stable Review Results For Same Change (Priority: P1) MVP

**Goal**: Repeated reviews of identical staged input produce identical candidate rule IDs, accepted finding rule IDs, and final pass/block status.

**Independent Test**: Run review 10 times with fixed staged input and fixed model stub, then compare selected rule IDs, accepted finding rule IDs, rejected finding diagnostics, and final decision status.

### Tests for User Story 1

- [X] T012 [P] [US1] Add repeatability regression test for stable candidate and accepted finding rule IDs in `test/runner-determinism.test.js`
- [X] T013 [P] [US1] Add rejected out-of-candidate finding regression test in `test/runner-rejected-findings.test.js`
- [X] T014 [P] [US1] Add stable rule routing order regression test in `test/rule-capability-filter.test.js`
- [X] T015 [P] [US1] Add unknown-limited and weak-classification routing regression tests in `test/rule-capability-filter.test.js`
- [X] T016 [P] [US1] Add 20-case default-rule match reason matrix tests in `test/default-rules.test.js`
- [X] T017 [P] [US1] Add explain JSON diagnostics test for rejected findings and routing reasons in `test/explain.test.js`

### Implementation for User Story 1

- [X] T018 [US1] Filter parsed model findings against routed candidate rules in `src/review/runner.js`
- [X] T019 [US1] Return deterministic `findings` and `rejectedFindings` arrays from `src/review/runner.js`
- [X] T020 [US1] Ensure final decision uses accepted findings only in `src/review/runner.js`
- [X] T021 [US1] Stabilize rule routing decision and selected rule ordering in `src/rules/router.js`
- [X] T022 [US1] Add explicit unknown-limited common fallback and signal expansion diagnostics in `src/rules/router.js`
- [X] T023 [US1] Include rejected finding diagnostics in explain payloads in `src/explain.js`
- [X] T024 [US1] Include rejected finding diagnostics in review prompt/debug context only when available in `src/review/prompt.js`
- [X] T025 [US1] Document accepted vs rejected finding behavior and deterministic routing boundaries in `docs/architecture.md`

**Checkpoint**: User Story 1 is independently complete when `npm test -- test/runner-determinism.test.js test/runner-rejected-findings.test.js test/rule-capability-filter.test.js test/default-rules.test.js test/explain.test.js` passes.

---

## Phase 4: User Story 2 - Control Review Mode (Priority: P1)

**Goal**: Users can choose `skip`, `log`, or `normal` review behavior through persistent workspace configuration.

**Independent Test**: Configure each mode in an initialized workspace and verify manual check, hook execution, and JSON output behavior for skip/log/normal modes.

### Tests for User Story 2

- [X] T026 [P] [US2] Add manual CLI check behavior tests for `skip`, `log`, and default `normal` modes in `test/cli-review-mode.test.js`
- [X] T027 [P] [US2] Add hook result tests proving `skip` mode exits without staged diff or model review in `test/hook.test.js`
- [X] T028 [P] [US2] Add hook result tests proving `log` mode exits without blocking when normal mode would block in `test/hook.test.js`
- [X] T029 [P] [US2] Add JSON output tests for `skip`, `log`, and `normal` effective mode payloads in `test/cli-review-mode.test.js`
- [X] T030 [P] [US2] Add doctor diagnostics tests for effective review mode in `test/doctor.test.js`
- [X] T031 [P] [US2] Add initialization test for generated review mode config in `test/init.test.js`

### Implementation for User Story 2

- [X] T032 [US2] Load effective review mode before staged snapshot work in `src/cli.js`
- [X] T033 [US2] Implement `skip` mode early exit without staged diff or model review in `src/cli.js`
- [X] T034 [US2] Pass review mode into review result handling in `src/cli.js`
- [X] T035 [US2] Implement logging-only non-blocking behavior in `src/hook.js`
- [X] T036 [US2] Implement skip-mode non-blocking hook behavior in `src/hook.js`
- [X] T037 [US2] Add mode field to JSON review output in `src/hook.js`
- [X] T038 [US2] Add effective review mode check to doctor diagnostics in `src/doctor.js`
- [X] T039 [US2] Add Chinese mode messages to human-readable output in `src/format/report.js`
- [X] T040 [US2] Document review mode configuration and behavior in `README.md`

**Checkpoint**: User Story 2 is independently complete when `npm test -- test/cli-review-mode.test.js test/hook.test.js test/doctor.test.js test/init.test.js` passes and existing normal-mode review behavior remains unchanged.

---

## Phase 5: User Story 3 - Install Without Administrator Permission (Priority: P2)

**Goal**: Repository-local initialization and manual/hook check paths work without administrator privileges or global package writes.

**Independent Test**: Initialize a temporary Git repository with simulated hook-install restrictions and verify repository-local files exist, existing hooks are preserved, and Chinese guidance explains manual checking.

### Tests for User Story 3

- [X] T041 [P] [US3] Add test for preserving existing hooks and reporting guidance in `test/init.test.js`
- [X] T042 [P] [US3] Add test for non-fatal permission failure when workspace initialization succeeds in `test/init.test.js`
- [X] T043 [P] [US3] Add CLI init output test for user-mode manual check guidance in `test/cli.test.js`
- [X] T044 [P] [US3] Add package/bin test for repository-local command guidance in `test/package.test.js`

### Implementation for User Story 3

- [X] T045 [US3] Extend init result with hook status and user-mode guidance in `src/workspace.js`
- [X] T046 [US3] Report hook preservation and manual check path in Chinese from `src/cli.js`
- [X] T047 [US3] Make hook installation permission failures non-fatal when workspace initialization succeeds in `src/workspace.js`
- [X] T048 [US3] Add repository-local/manual check guidance to README quick start in `README.md`

**Checkpoint**: User Story 3 is independently complete when `npm test -- test/init.test.js test/cli.test.js test/package.test.js` passes and init works in temp repos with existing or unwritable hook scenarios.

---

## Phase 6: User Story 4 - Understand Every Command In Chinese Help (Priority: P2)

**Goal**: All general, command-specific, option, example, invalid-usage, and unknown-command help is Chinese.

**Independent Test**: Request help for every supported command and verify Chinese purpose, options, examples, and recovery guidance.

### Tests for User Story 4

- [X] T049 [P] [US4] Add general help contract tests for every supported command in `test/cli-help.test.js`
- [X] T050 [P] [US4] Add command-specific help contract tests for options and examples in `test/cli-help.test.js`
- [X] T051 [P] [US4] Add invalid usage and unknown command recovery tests in `test/cli.test.js`

### Implementation for User Story 4

- [X] T052 [US4] Replace top-level help with full Chinese command explanations in `src/cli.js`
- [X] T053 [US4] Add command-specific help routing for `init`, `check`, `profile`, `doctor`, and `bdr status` in `src/cli.js`
- [X] T054 [US4] Expand explain help with option examples and diagnostics explanation in `src/explain.js`
- [X] T055 [US4] Ensure all invalid usage messages point to Chinese help paths in `src/cli.js`
- [X] T056 [US4] Update README common commands section to match CLI help wording in `README.md`

**Checkpoint**: User Story 4 is independently complete when `npm test -- test/cli-help.test.js test/cli.test.js` passes and every supported help path has Chinese descriptions.

---

## Phase 7: User Story 5 - Use Approved Bad-Smell Review Context (Priority: P3)

**Goal**: Fresh workspaces include the approved fixed target bad-smell context `openmole@0.8.2` and diagnostics report it.

**Independent Test**: Initialize a fresh workspace, run BDR status/doctor, and verify the approved fixed target version is reported and loaded into review context.

### Tests for User Story 5

- [X] T057 [P] [US5] Update BDR provider tests for `openmole@0.8.2` package metadata in `test/bdr-provider.test.js`
- [X] T058 [P] [US5] Update init workspace tests for vendored bad-smell target version in `test/init.test.js`
- [X] T059 [P] [US5] Add BDR status CLI test for approved fixed target version in `test/cli.test.js`
- [X] T060 [P] [US5] Add package dry-run expectation for updated vendor content in `test/package.test.js`

### Implementation for User Story 5

- [X] T061 [US5] Replace vendored bad-smell content with `openmole@0.8.2` source in `vendor/bdr/package.json`
- [X] T062 [US5] Update BDR context loader to support renamed OpenMole skill/package metadata while preserving existing BDR path compatibility in `src/bdr/provider.js`
- [X] T063 [US5] Update BDR status wording to report package name and version generically in `src/doctor.js`
- [X] T064 [US5] Update initialization copy expectations for the new vendored content in `src/workspace.js`
- [X] T065 [US5] Document the approved fixed target and source revision in `README.md`

**Checkpoint**: User Story 5 is independently complete when `npm test -- test/bdr-provider.test.js test/init.test.js test/cli.test.js test/package.test.js` passes and `npm pack --dry-run` includes the updated vendored content.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate the full feature and remove drift across documentation, tests, and package output.

- [X] T066 [P] Run quickstart validation scenarios and record any deviations in `specs/001-review-determinism-controls/quickstart.md`
- [X] T067 [P] Update architecture notes for review modes, rejected findings, unknown-limited routing, and OpenMole vendor compatibility in `docs/architecture.md`
- [X] T068 [P] Update agent guidance for review mode config and deterministic finding boundaries in `AGENTS.md`
- [X] T069 Run full test suite with `npm test` and record validation status in `specs/001-review-determinism-controls/quickstart.md`
- [X] T070 Run package contents validation with `npm pack --dry-run` and record validation status in `specs/001-review-determinism-controls/quickstart.md`
- [X] T071 Review README, CLI help, and generated workspace docs for consistent Chinese terminology in `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **US1 Stable Review Results (Phase 3)**: Depends on Foundational.
- **US2 Review Mode (Phase 4)**: Depends on Foundational; can run in parallel with US1 after shared primitives exist, but MVP should validate US1 first.
- **US3 User-Mode Install (Phase 5)**: Depends on Foundational.
- **US4 Chinese Help (Phase 6)**: Depends on Foundational; can run in parallel with US3 because it mainly touches CLI help/tests.
- **US5 Bad-Smell Context (Phase 7)**: Depends on Foundational and should be isolated from review-mode work because it changes vendor content.
- **Polish (Phase 8)**: Depends on all selected user stories.

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational; MVP scope.
- **US2 (P1)**: Can start after Foundational; independent from US1's model finding filter except shared mode/report result shape.
- **US3 (P2)**: Can start after Foundational; independent from US1/US2 after workspace config helpers exist.
- **US4 (P2)**: Can start after Foundational; independent from review runner internals.
- **US5 (P3)**: Can start after Foundational; independent from CLI help but touches vendor/package/init tests.

### Parallel Opportunities

- T003-T004 can run in parallel after T001-T002 are understood.
- T010-T011 can run in parallel after T005-T009 interfaces are drafted.
- US1 tests T012-T017 can run in parallel before US1 implementation.
- US2 tests T026-T031 can run in parallel before US2 implementation.
- US3 tests T041-T044 can run in parallel before US3 implementation.
- US4 tests T049-T051 can run in parallel before US4 implementation.
- US5 tests T057-T060 can run in parallel before US5 implementation.
- Polish documentation tasks T066-T068 can run in parallel after the implemented stories are stable.

---

## Parallel Example: User Story 1

```bash
Task: "Add repeatability regression test for stable candidate and accepted finding rule IDs in test/runner-determinism.test.js"
Task: "Add unknown-limited and weak-classification routing regression tests in test/rule-capability-filter.test.js"
Task: "Add 20-case default-rule match reason matrix tests in test/default-rules.test.js"
Task: "Add explain JSON diagnostics test for rejected findings and routing reasons in test/explain.test.js"
```

## Parallel Example: User Story 2

```bash
Task: "Add manual CLI check behavior tests for skip, log, and default normal modes in test/cli-review-mode.test.js"
Task: "Add hook result tests proving skip mode exits without staged diff or model review in test/hook.test.js"
Task: "Add hook result tests proving log mode exits without blocking when normal mode would block in test/hook.test.js"
Task: "Add JSON output tests for skip, log, and normal effective mode payloads in test/cli-review-mode.test.js"
```

## Parallel Example: User Story 4

```bash
Task: "Add general help contract tests for every supported command in test/cli-help.test.js"
Task: "Add command-specific help contract tests for options and examples in test/cli-help.test.js"
Task: "Add invalid usage and unknown command recovery tests in test/cli.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup tasks.
2. Complete Phase 2 foundational helpers.
3. Complete Phase 3 US1 stable review candidate and accepted finding behavior.
4. Stop and validate US1 independently with runner/routing/default-rules/explain tests.

### Incremental Delivery

1. Deliver US1 to fix inconsistent rule-triggering behavior.
2. Deliver US2 to add review modes without changing deterministic filtering.
3. Deliver US3 and US4 to improve installation and help UX.
4. Deliver US5 to update the vendored bad-smell context.
5. Complete polish validations.

### Notes

- Tasks marked [P] must not edit the same file in parallel.
- Tests listed in each story should be written before implementation for that story.
- Keep existing normal-mode behavior as the compatibility baseline.
- Do not use real model or network calls in tests; use `modelInvoker`, `fetchImpl`, and local fixtures.
