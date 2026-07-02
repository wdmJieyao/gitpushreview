# Implementation Plan: Review Determinism Controls

**Branch**: `[001-review-determinism-controls]` | **Date**: 2026-07-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-review-determinism-controls/spec.md`

## Summary

Add deterministic review controls for GitPushReview by introducing a workspace
review mode, hardening rule candidate filtering and accepted finding filtering,
expanding Chinese CLI help, supporting repository-local user-mode operation, and
updating the vendored bad-smell context to the maintainer-approved fixed target
`openmole@0.8.2` from `agiledon/bdr` main.

The technical approach keeps the current staged-diff review pipeline, adds a
small review-mode configuration module, filters model findings against the
deterministic candidate set, exposes rejected findings in diagnostics, and
extends existing Node test seams (`routeCommand`, `modelInvoker`, `fetchImpl`,
temporary workspaces) to cover mode behavior and repeatability.

## Technical Context

**Language/Version**: Node.js ESM, package requires Node `>=18`; local planning
environment is Node `v22.22.2`.

**Primary Dependencies**: Node standard library, OpenAI-compatible chat
completion endpoint, vendored bad-smell context. Current vendored package is
`agile-bdr@0.5.0`; approved fixed target for this plan is `openmole@0.8.2` from
`https://github.com/agiledon/bdr.git` main.

**Storage**: Project-local files under `.gitpushreview/`, especially generated
`config/` files, `agent/` rules, `docs/`, and `vendor/bdr`. No database.

**Testing**: `npm test` using Node's built-in `node --test` and
`node:assert/strict`. Use temp directories and Git temp repos for integration
coverage.

**Scenario Test Strategy**: Each user story has an independent scenario test
set before implementation:

- US1 deterministic review: repeated fixed staged input, stable candidate rule
  IDs, stable accepted finding rule IDs, stable block status, unknown/weak file
  routing, rejected out-of-candidate findings, and explain diagnostics.
- US2 review modes: `normal`, `skip`, and `log` behavior across manual check,
  hook execution, and machine-readable output, including skip avoiding staged
  diff/model work and log mode never blocking.
- US3 user-mode install: repository-local initialization, existing hook
  preservation, permission-failure fallback, and Chinese manual-check guidance.
- US4 Chinese CLI contract: top-level help, command-specific help, option
  descriptions, examples, invalid usage, and unknown-command recovery.
- US5 vendored context: fresh initialization, provider loading, status
  reporting, fixed `openmole@0.8.2` metadata, and package dry-run contents.

**Target Platform**: Developer workstations and CI environments that can run
Node and Git. Must support restricted workstations where the user can write to
the repository but lacks global install or administrator privileges.

**Project Type**: CLI package with generated repository-local workspace.

**Performance Goals**: Skip-all-checks mode must avoid staged diff/model work.
Logging-only and normal mode must not add more than one extra local config read
to the existing review path. Determinism tests run 10 repeated reviews on fixed
input.

**Constraints**: Review uses staged data only. Existing behavior remains normal
blocking review when no new review mode is configured. Existing hooks/config are
preserved unless users explicitly force replacement.

**Scale/Scope**: One CLI package, one workspace template set, 228 current default
rules, and the existing review/check/explain/doctor/profile command surface.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Current authority: `.specify/memory/constitution.md` version 1.0.0.

- **Staged-Change Review Integrity**: PASS. The design keeps the review input
  limited to staged diff, staged file names, and staged blobs. Skip mode exits
  before staged snapshot work; log and normal modes preserve the staged-only
  review path.
- **Chinese CLI Contract**: PASS. User-facing mode messages, installation
  fallback guidance, help output, invalid usage, unknown-command recovery, and
  status diagnostics are planned as Chinese text. JSON keys and enum values may
  remain stable English identifiers.
- **Comprehensive Scenario Testing**: PASS. The scenario strategy above covers
  each user story's primary flow, edge/failure cases, mode/permission variants,
  deterministic regression cases, and local model/network stubs.
- **Deterministic Rule Routing**: PASS. Candidate rules are derived from
  explainable routing, accepted findings are filtered against the selected
  candidate set, rejected out-of-candidate findings remain diagnosable, and
  repeated fixed staged input has repeatability tests.
- **Vendored Context Discipline**: PASS. The bad-smell context target is fixed
  as `openmole@0.8.2` from `agiledon/bdr` main, with initialization, provider,
  status, and package validation planned.

**Initial Gate Result**: PASS. No constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-review-determinism-controls/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cli-contract.md
│   └── review-result-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
bin/
└── gitpushreview.js

src/
├── cli.js
├── workspace.js
├── hook.js
├── doctor.js
├── explain.js
├── templates.js
├── review/
│   ├── runner.js
│   ├── decision.js
│   ├── prompt.js
│   └── result.js
├── rules/
│   ├── router.js
│   ├── index.js
│   └── markdown.js
├── routes/
│   └── capability-context.js
├── gates/
│   └── deterministic.js
├── evidence/
│   └── rule-evidence.js
└── bdr/
    └── provider.js

test/
├── cli.test.js
├── init.test.js
├── doctor.test.js
├── explain.test.js
├── runner.test.js
├── runner-capability-routing.test.js
├── rule-capability-filter.test.js
├── default-rules.test.js
├── bdr-provider.test.js
└── package.test.js

vendor/
└── bdr/
```

**Structure Decision**: Keep the single-package CLI structure. Add focused
helpers inside existing ownership areas instead of creating a new package:
review-mode loading near workspace/config concerns, accepted/rejected finding
normalization inside the review runner path, and user-facing mode/help behavior
in CLI/hook/doctor/explain.

## Complexity Tracking

No constitution violations require justification.

## Phase 0 Research Summary

See [research.md](research.md).

Key decisions:

- Use a three-value persistent review mode: `skip`, `log`, `normal`.
- Keep default behavior as `normal`.
- Filter model findings against the deterministic review candidate set before
  decision calculation.
- Preserve rejected out-of-candidate findings as diagnostics.
- Treat `openmole@0.8.2` from `agiledon/bdr` main as the fixed upgrade target.

## Phase 1 Design Summary

See:

- [data-model.md](data-model.md)
- [contracts/cli-contract.md](contracts/cli-contract.md)
- [contracts/review-result-contract.md](contracts/review-result-contract.md)
- [quickstart.md](quickstart.md)

### Post-Design Constitution Check

**Result**: PASS.

The design keeps staged-only review, preserves current default behavior, uses
existing `routeCommand`, `modelInvoker`, `fetchImpl`, temp workspace, and temp
Git repository seams, and explicitly records the vendored dependency target and
validation path. Scenario coverage is identified before implementation for all
five user stories, including deterministic rule routing, Chinese CLI behavior,
permission-limited installation, review modes, and vendored context validation.
No unresolved clarification markers remain.
