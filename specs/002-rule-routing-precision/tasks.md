# Tasks: Rule Routing Precision

**Input**: Design documents from `/specs/002-rule-routing-precision/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Scenario test tasks are required by the project constitution. Tests must use Node's built-in `node --test`, local Git fixtures, `modelInvoker` stubs, and no real model or network calls.

**Organization**: Tasks are grouped by user story so US1 can ship as MVP, while US2 and US3 remain independently testable increments.

## Phase 1: Setup (Shared Preparation)

**Purpose**: Confirm feature scope and prepare shared fixture vocabulary before changing routing behavior.

- [X] T001 [P] Add or update candidate routing fixture helper notes for staged content scenarios in `test/helpers/review-fixtures.js`
- [X] T002 [P] Add implementation notes for default rule family metadata near rule builders in `src/templates.js`
- [X] T003 [P] Add expected candidate summary payload notes in `specs/002-rule-routing-precision/contracts/routing-diagnostics.md`
- [X] T004 Confirm vendored BDR is unchanged and document the validation expectation in `specs/002-rule-routing-precision/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared metadata and summary primitives that all user stories depend on.

**Critical**: No user story implementation should begin until these tasks are complete.

- [X] T005 Add `requiredCapabilities` parsing support to Markdown rule metadata in `src/rules/markdown.js`
- [X] T006 Add route-summary and duplicate-rule diagnostic helper functions in `src/rules/router.js`
- [X] T007 Add deterministic candidate ID helper for routed Markdown rules and static findings in `src/review/runner.js`
- [X] T008 [P] Add shared candidate assertion helpers for tests in `test/helpers/review-fixtures.js`
- [X] T009 [P] Add baseline contract assertions for parsed `requiredCapabilities` in `test/rules.test.js`

**Checkpoint**: Rule metadata can express strict AND capability requirements, and routing can produce stable candidate summaries.

---

## Phase 3: User Story 1 - 精准候选规则过滤 (Priority: P1) MVP

**Goal**: Same staged input routes only to relevant candidate rules across Java, SQL dialect, Vue/frontend, MQ, and unknown-limited cases.

**Independent Test**: Run focused routing tests and verify candidate rule IDs exclude unrelated dialect, middleware, Java subdomain, and Vue-specific rules.

### Tests for User Story 1

- [X] T010 [P] [US1] Add required capability AND and legacy capability OR tests in `test/rule-capability-filter.test.js`
- [X] T011 [P] [US1] Add generic SQL versus concrete dialect capability tests in `test/capability-routing.test.js`
- [X] T012 [P] [US1] Add JS/TS not-default-Vue and Vue evidence tests in `test/file-route-context.test.js`
- [X] T013 [P] [US1] Add weak MQ token rejection and strong MQ evidence tests in `test/mq-gate.test.js`
- [X] T014 [P] [US1] Add staged runner candidate assertions for ordinary Java, MyBatis XML, MySQL SQL, Vue files, staged-blob-over-working-tree content, and staged deletion without blob content in `test/runner-capability-routing.test.js`
- [X] T015 [P] [US1] Add default rule corpus metadata assertions for dialect, Java subdomain, Vue, and MQ rules in `test/default-rules.test.js`

### Implementation for User Story 1

- [X] T016 [US1] Implement `requiredCapabilities` AND matching while preserving legacy `capabilities` OR matching in `src/rules/router.js`
- [X] T017 [US1] Emit concrete SQL dialect capabilities only for high-confidence dialect evidence in `src/routes/capability-context.js`
- [X] T018 [US1] Split plain JS/TS frontend capabilities from Vue-specific capability detection in `src/routes/capability-context.js`
- [X] T019 [US1] Tighten MQ capability detection so weak terms cannot independently add MQ capabilities in `src/routes/capability-context.js`
- [X] T020 [US1] Update deterministic MQ gate expectations to match stricter capability evidence in `src/gates/mq.js`
- [X] T021 [US1] Update default dialect, Java subdomain, Vue, and MQ rule metadata to use `requiredCapabilities` and precise signals in `src/templates.js`
- [X] T022 [US1] Preserve unknown-limited signal expansion semantics with required capability checks in `src/rules/router.js`
- [X] T023 [US1] Run US1 focused validation commands from `specs/002-rule-routing-precision/quickstart.md`

**Checkpoint**: US1 is complete when candidate sets are precise for representative staged Java, MyBatis XML, MySQL SQL, Vue, JS/TS, config, MQ, and unknown files.

---

## Phase 4: User Story 2 - 可解释的规则诊断 (Priority: P2)

**Goal**: Maintainers can see why rules were selected or filtered in explain and review output, including rejected model findings.

**Independent Test**: Run explain/report tests and verify JSON plus Chinese text include candidate IDs, summaries, dominant reasons, mode notes, and rejected finding details.

### Tests for User Story 2

- [X] T024 [P] [US2] Add explain JSON contract tests for `candidateRuleIds` and `candidateSummary` in `test/explain.test.js`
- [X] T025 [P] [US2] Add Chinese human explain summary tests for source counts, capability counts, match reasons, and skip reasons in `test/explain.test.js`
- [X] T026 [P] [US2] Add review report rejected finding detail tests in `test/report.test.js`
- [X] T027 [P] [US2] Add review JSON candidate summary tests in `test/runner-rejected-findings.test.js`
- [X] T028 [P] [US2] Add skip/log/normal diagnostic mode coverage, including skip-mode `explain --staged` behavior, in `test/cli-review-mode.test.js` and `test/explain.test.js`

### Implementation for User Story 2

- [X] T029 [US2] Return top-level `candidateRuleIds` and `candidateSummary` from review runner results in `src/review/runner.js`
- [X] T030 [US2] Add source, capability, top match reason, top skip reason, and duplicate summaries to routing diagnostics in `src/rules/router.js`
- [X] T031 [US2] Add `candidateRuleIds`, `candidateSummary`, and mode notes to explain JSON payloads in `src/explain.js`
- [X] T032 [US2] Render Chinese candidate summaries and top routing reasons in human explain output in `src/explain.js`
- [X] T033 [US2] Render rejected model finding rule IDs and reject reasons in Chinese review reports in `src/format/report.js`
- [X] T034 [US2] Preserve hook exit-code semantics while passing diagnostic fields through JSON output in `src/hook.js`
- [X] T035 [US2] Run US2 focused validation commands from `specs/002-rule-routing-precision/quickstart.md`

**Checkpoint**: US2 is complete when diagnostics are usable without parsing free-form reason strings and rejected findings are visible but non-blocking.

---

## Phase 5: User Story 3 - 稳定性回归保护 (Priority: P3)

**Goal**: Future rule or capability changes cannot reintroduce nondeterministic candidate sets, duplicate-ID ambiguity, or shuffled finding instability.

**Independent Test**: Run determinism tests that repeat the same staged review, perturb file order, use duplicate IDs, and shuffle model findings.

### Tests for User Story 3

- [X] T036 [P] [US3] Add 10-run identical staged input determinism assertions in `test/runner-determinism.test.js`
- [X] T037 [P] [US3] Add file-order perturbation candidate set assertions in `test/runner-determinism.test.js`
- [X] T038 [P] [US3] Add duplicate rule ID diagnostic assertions in `test/rule-capability-filter.test.js`
- [X] T039 [P] [US3] Add shuffled model finding ordering assertions in `test/review-findings.test.js`
- [X] T040 [P] [US3] Add static evidence candidate stability assertions in `test/rule-evidence.test.js`

### Implementation for User Story 3

- [X] T041 [US3] Sort candidate rule IDs, route decisions, duplicate diagnostics, and summary arrays deterministically in `src/rules/router.js`
- [X] T042 [US3] Stabilize accepted and rejected finding ordering for shuffled model output in `src/review/findings.js`
- [X] T043 [US3] Include deterministic static evidence rule IDs in candidate summaries without changing blocking semantics in `src/review/runner.js`
- [X] T044 [US3] Ensure prompt rule ordering follows stable candidate ordering in `src/review/prompt.js`
- [X] T045 [US3] Run US3 focused validation commands from `specs/002-rule-routing-precision/quickstart.md`

**Checkpoint**: US3 is complete when repeated and order-perturbed reviews produce identical candidate IDs, accepted/rejected finding IDs, score, and final status.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation updates, and release-safety checks.

- [X] T046 [P] Update user-facing rule metadata and explain examples in `README.md`
- [X] T047 [P] Update maintainer routing architecture notes in `docs/architecture.md`
- [X] T048 [P] Add or update default rule demo cases for the refined corpus in `test/default-rule-demos.test.js`
- [X] T049 Run full local validation with `npm test` and record any follow-up in `specs/002-rule-routing-precision/quickstart.md`
- [X] T050 Run `npm pack --dry-run` and verify package contents if `src/templates.js`, `README.md`, or package-visible files changed in `package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks every user story.
- **Phase 3 US1**: Depends on Phase 2 and is the MVP scope.
- **Phase 4 US2**: Depends on Phase 2; can start after summary primitives exist, but benefits from US1 candidate precision.
- **Phase 5 US3**: Depends on Phase 2; can run alongside US1/US2 after candidate summary primitives exist.
- **Phase 6 Polish**: Depends on the selected user stories being complete.

### User Story Dependencies

- **US1 精准候选规则过滤**: MVP, no dependency on US2 or US3.
- **US2 可解释的规则诊断**: Uses candidate summaries from foundational work and should not alter US1 routing behavior.
- **US3 稳定性回归保护**: Uses candidate summaries and finding filtering, and should not alter user-facing mode semantics.

### Within Each User Story

- Scenario tests must be written first and fail before implementation.
- Parser and routing semantics must land before default rule metadata relies on them.
- Explain/report rendering must consume stable diagnostic fields rather than recomputing routing behavior.
- Determinism tasks must assert repeated runs and order perturbation after stable ordering is implemented.

## Parallel Execution Examples

### User Story 1

```text
Task: "T010 Add required capability tests in test/rule-capability-filter.test.js"
Task: "T011 Add SQL dialect capability tests in test/capability-routing.test.js"
Task: "T012 Add Vue/JS/TS capability tests in test/file-route-context.test.js"
Task: "T013 Add MQ evidence tests in test/mq-gate.test.js"
```

### User Story 2

```text
Task: "T024 Add explain JSON tests in test/explain.test.js"
Task: "T026 Add review report rejected finding tests in test/report.test.js"
Task: "T027 Add review JSON candidate summary tests in test/runner-rejected-findings.test.js"
```

### User Story 3

```text
Task: "T036 Add repeated-run determinism tests in test/runner-determinism.test.js"
Task: "T039 Add shuffled finding ordering tests in test/review-findings.test.js"
Task: "T040 Add static evidence candidate stability tests in test/rule-evidence.test.js"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 only.
3. Validate with the US1 commands in [quickstart.md](./quickstart.md).
4. Stop and inspect candidate IDs for representative staged Java, SQL, Vue, MQ, and unknown files.

### Incremental Delivery

1. Ship US1 to reduce unstable candidate sets.
2. Add US2 so maintainers can diagnose candidate selection and rejected findings.
3. Add US3 so future rule changes are protected by deterministic regression tests.
4. Finish with README, architecture docs, full `npm test`, and package dry run when release-visible files changed.

### Validation Commands

```bash
npm test -- test/rule-capability-filter.test.js
npm test -- test/capability-routing.test.js
npm test -- test/file-route-context.test.js
npm test -- test/runner-capability-routing.test.js
npm test -- test/explain.test.js
npm test -- test/runner-determinism.test.js
npm test
```
