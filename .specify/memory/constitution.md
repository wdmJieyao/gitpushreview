<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template principle 1 -> I. Staged-Change Review Integrity
- Template principle 2 -> II. Chinese CLI Contract
- Template principle 3 -> III. Comprehensive Scenario Testing
- Template principle 4 -> IV. Deterministic Rule Routing
- Template principle 5 -> V. Vendored Context Discipline
Added sections:
- Project Constraints
- Development Workflow
Removed sections:
- Placeholder SECTION_2_NAME
- Placeholder SECTION_3_NAME
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- ✅ .specify/templates/commands/ (directory absent; no command templates to update)
- ✅ AGENTS.md
- ✅ README.md
Follow-up TODOs: none
-->

# GitPushReview Constitution

## Core Principles

### I. Staged-Change Review Integrity

GitPushReview MUST review only the content that will be committed: staged diffs,
staged file names, and staged blob contents. It MUST NOT base review outcomes on
unstaged working tree edits. Any feature that inspects repository files MUST make
the staged-vs-working-tree choice explicit and test it.

Rationale: pre-commit review is only trustworthy when it evaluates exactly the
submitted change.

### II. Chinese CLI Contract

Every user-facing command, option, error, diagnostic, prompt, and help path MUST
be understandable in Chinese. JSON field names and machine-readable enum values
MAY remain English, but human-readable values MUST be Chinese unless the value is
a literal technical identifier.

Rationale: the project targets Chinese-speaking users and the CLI must be usable
without reading source code.

### III. Comprehensive Scenario Testing

Every feature MUST include comprehensive scenario tests before it is considered
complete. Scenario tests MUST cover the primary user flow, at least one failure
or edge case, and any mode or permission variant introduced by the feature. For
review behavior, tests MUST use local stubs for model/network dependencies and
MUST include repeatability or regression cases when determinism is part of the
feature.

Rationale: this project gates commits; incomplete scenario coverage risks false
blocks, missed blocks, and user distrust.

### IV. Deterministic Rule Routing

Rules MUST be selected through explainable and deterministic routing. Candidate
rules MUST be derived from file paths, capabilities, explicit common fallback,
and documented signal expansion. Model findings outside the selected candidate
set MUST NOT affect blocking outcomes and MUST be diagnosable.

Rationale: stable rule selection is required so the same staged change does not
produce inconsistent blocking behavior.

### V. Vendored Context Discipline

Vendored review context, including BDR/OpenMole content, MUST be upgraded only to
a recorded fixed target version or revision. Initialization, provider loading,
status reporting, and package contents MUST be validated whenever vendored
context changes.

Rationale: review knowledge is part of product behavior and must be reproducible.

## Project Constraints

The project is a Node.js ESM CLI package. It MUST remain runnable with Node
versions allowed by `package.json`, use Git staged data for review input, and keep
OpenAI-compatible model calls behind testable seams. Tests MUST avoid real model
or network calls unless a human explicitly requests an external integration test.

Generated user workspaces live under `.gitpushreview/`. Existing user rules,
model configuration, and hooks MUST be preserved unless the user explicitly
requests replacement.

## Development Workflow

Implementation work MUST start from a specification or documented issue. Plans
MUST identify scenario coverage before implementation. Task lists MUST include
test tasks for every user story and identify the independent validation command
for each story.

Before a task is reported complete, the relevant focused tests MUST be run. When
a change touches shared review behavior, rule routing, workspace initialization,
or vendored content, the full `npm test` suite MUST be run. Release-impacting
changes MUST also validate package contents with `npm pack --dry-run`.

## Governance

This constitution supersedes conflicting repository guidance. Amendments require
an explicit update to this file, a semantic version change, and synchronization
of affected Spec Kit templates and agent guidance.

Versioning policy:

- MAJOR: removes or redefines a principle in a backward-incompatible way.
- MINOR: adds a principle or materially expands governance requirements.
- PATCH: clarifies wording without changing required behavior.

Compliance review is required during planning and before completion. If a plan
violates a principle, the plan MUST document the violation, why it is necessary,
and why a simpler compliant alternative was rejected.

**Version**: 1.0.0 | **Ratified**: 2026-07-02 | **Last Amended**: 2026-07-02
