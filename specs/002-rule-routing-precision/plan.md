# Implementation Plan: Rule Routing Precision

**Branch**: `master` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-rule-routing-precision/spec.md`

## Summary

Tighten GitPushReview's staged-change rule routing so the model receives a deterministic, explainable, and smaller candidate rule set. The implementation will preserve the staged-only review pipeline, add stricter capability semantics for database dialects, Java subdomains, Vue/frontend files, MQ evidence, and unknown files, then expose routing diagnostics in explain and review output while keeping candidate-set finding filtering authoritative.

## Technical Context

**Language/Version**: Node.js ESM, package engine `>=18`

**Primary Dependencies**: Node.js standard library only for runtime code; OpenAI-compatible HTTP model client behind injectable seams; vendored BDR/OpenMole context loaded from `vendor/bdr` and copied into `.gitpushreview`

**Storage**: Filesystem Git workspace, staged Git blobs/diffs, `.gitpushreview` config/rules/templates; no database

**Testing**: Node's built-in `node --test` via `npm test`

**Scenario Test Strategy**: Add focused route-unit tests for capability semantics, scenario runner tests with staged temp Git repositories, explain/report contract tests for JSON and Chinese text diagnostics, and determinism tests for repeated runs, file-order perturbation, duplicate rule IDs, static evidence, and shuffled model findings. All model calls use `modelInvoker` stubs and all network paths remain stubbed.

**Target Platform**: Cross-platform CLI used in Git repositories; Linux/macOS/Windows path normalization must remain supported by existing `normalizePath`

**Project Type**: Single-package CLI and Git pre-commit hook helper

**Performance Goals**: Rule routing remains local and linear in changed files times indexed rules for typical pre-commit changes; diagnostics must not require real model or network calls.

**Constraints**: Must review only staged diffs, staged file names, and staged blob contents for `check --staged` and `explain --staged`; `explain <file>` remains an explicit working-tree file diagnostic; user-facing human text must be Chinese; default rule template changes must keep `RULES_INDEX.files` and generated default files closed over the same corpus; vendored BDR content is out of scope.

**Scale/Scope**: Existing default Markdown rule corpus plus user-listed rules in `.gitpushreview/agent/rules-index.md`; representative staged changes across Java, MyBatis XML, SQL dialects, Vue, JS/TS, config, MQ, and unknown files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Staged-Change Review Integrity**: PASS. The feature operates inside `getStagedSnapshot`, `runDeterministicGates`, route contexts, explain staged data, and review runner inputs. Tests must assert staged blob content wins over unstaged working tree content.
- **II. Chinese CLI Contract**: PASS. Human explain/report/help diagnostics remain Chinese; JSON keys may stay English but human-readable values and summaries must be Chinese.
- **III. Comprehensive Scenario Testing**: PASS. Scenario coverage is explicitly required for primary flow, edge cases, mode variants, duplicate IDs, deterministic repeats, shuffled input, rejected findings, and no real model/network calls.
- **IV. Deterministic Rule Routing**: PASS. This is the core feature. Candidate rules are selected from path, capability, explicit common fallback, signal expansion, and deterministic diagnostics; out-of-candidate findings remain non-blocking.
- **V. Vendored Context Discipline**: PASS. This plan does not change `vendor/bdr` or approved OpenMole target content.

No constitution violations are accepted in this plan.

## Project Structure

### Documentation (this feature)

```text
specs/002-rule-routing-precision/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── review-output.md
│   ├── routing-diagnostics.md
│   └── rule-metadata.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── routes/
│   ├── capability-context.js
│   └── file-route-context.js
├── rules/
│   ├── markdown.js
│   ├── index.js
│   └── router.js
├── gates/
│   ├── deterministic.js
│   ├── mq.js
│   └── sql.js
├── evidence/
│   └── rule-evidence.js
├── review/
│   ├── runner.js
│   ├── findings.js
│   ├── prompt.js
│   └── decision.js
├── format/
│   └── report.js
├── explain.js
├── hook.js
└── templates.js

test/
├── capability-routing.test.js
├── file-route-context.test.js
├── mq-gate.test.js
├── rule-capability-filter.test.js
├── review-findings.test.js
├── rule-evidence.test.js
├── runner-capability-routing.test.js
├── runner-determinism.test.js
├── runner-rejected-findings.test.js
├── explain.test.js
├── report.test.js
├── default-rules.test.js
└── default-rule-demos.test.js
```

**Structure Decision**: Keep the existing single-package CLI structure. Implement capability detection in `src/routes`, rule metadata parsing/routing in `src/rules`, model-facing filtering in `src/review`, user diagnostics in `src/explain.js` and `src/format/report.js`, and generated default rule metadata in `src/templates.js`. Extend existing tests instead of adding a new framework.

## Phase 0 Research Summary

See [research.md](./research.md). Key decisions:

- Add explicit required-capability semantics while preserving legacy OR `capabilities`.
- Treat SQL dialects as concrete capabilities only when high-confidence dialect evidence is present.
- Split generic frontend from Vue-specific routing so plain JS/TS is not automatically Vue.
- Require stronger MQ vendor evidence before adding MQ capabilities.
- Promote routing diagnostics to a stable machine-readable contract.
- Keep `skip` short-circuiting before staged snapshot/model work, keep `log` non-blocking after full review, and keep `normal` decisions based only on accepted findings.

## Phase 1 Design Summary

See [data-model.md](./data-model.md) and [contracts/](./contracts/). The design introduces or formalizes:

- deterministic `FileCapabilityContext` evidence and route confidence fields;
- rule metadata fields for legacy `capabilities`, stricter `requiredCapabilities`, signal-only evidence, and unknown expansion;
- `CandidateRuleSet` ordering, duplicate-ID diagnostics, and accepted/rejected finding boundaries;
- explain/review output diagnostics for candidate IDs, source/capability counts, match/skip reasons, and rejected findings.
- explicit output placement: route summaries originate in `src/rules/router.js`, review JSON fields are returned by `src/review/runner.js`, human review summaries render in `src/format/report.js`, and explain payload/rendering lives in `src/explain.js`.

## Post-Design Constitution Check

- **Staged-Change Review Integrity**: PASS. Data model and quickstart require staged fixture validation and forbid reading unstaged content for check/explain staged paths.
- **Chinese CLI Contract**: PASS. Contracts require Chinese human output and allow English JSON field names only for machine-readable structure.
- **Comprehensive Scenario Testing**: PASS. Quickstart and tasks prerequisites cover route precision, diagnostics, mode semantics, determinism, and edge cases.
- **Deterministic Rule Routing**: PASS. Contracts define stable ordering, duplicate diagnostics, and candidate-set-only blocking.
- **Vendored Context Discipline**: PASS. No vendored content changes are planned.

## Complexity Tracking

No constitution violations or extra architectural complexity are required.
