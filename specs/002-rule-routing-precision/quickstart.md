# Quickstart: Rule Routing Precision Validation

## Prerequisites

- Node.js 18 or newer
- Git available on PATH
- No real model token is required for tests
- Vendored BDR content is out of scope for this feature. `vendor/bdr` should
  remain unchanged; if it changes, rerun BDR/provider/init/package validation
  deliberately and record the target version.

## Focused Validation

Run routing and rule tests first:

```bash
npm test -- test/rule-capability-filter.test.js
npm test -- test/capability-routing.test.js
npm test -- test/file-route-context.test.js
```

Expected outcome:

- ordinary Java service changes do not select database, MQ, Redis, Drools, or unrelated Java subdomain rules;
- generic MyBatis XML selects generic SQL/MyBatis rules only;
- explicit MySQL SQL selects MySQL rules but not Oracle/PostgreSQL/OceanBase rules;
- plain JS/TS does not receive Vue-specific rules unless Vue evidence is present;
- unknown-limited files only expand through explicit allowed signals.

## Review Pipeline Validation

Run staged review scenarios with model stubs:

```bash
npm test -- test/runner-capability-routing.test.js
npm test -- test/runner-determinism.test.js
npm test -- test/runner-rejected-findings.test.js
npm test -- test/review-findings.test.js
```

Expected outcome:

- `candidateRuleIds`, accepted findings, rejected findings, total score, and decision are stable across repeated runs;
- file-order perturbation does not change candidate set or final decision;
- model findings outside the candidate set are rejected and never block;
- shuffled model finding order produces stable accepted/rejected ordering.
- duplicate rule IDs are surfaced through deterministic diagnostics rather than silently changing rule metadata semantics.

## Explain And Report Validation

Run diagnostics tests:

```bash
npm test -- test/explain.test.js
npm test -- test/report.test.js
```

Expected outcome:

- explain JSON exposes `candidateRuleIds` and `candidateSummary`;
- human explain output is Chinese and shows candidate counts, source/capability summary, dominant match/skip reasons, and duplicate warnings when present;
- review report shows rejected finding summaries in Chinese without changing exit-code semantics.

## Default Rule Corpus Validation

Run default rule corpus tests after editing generated rules:

```bash
npm test -- test/default-rules.test.js
npm test -- test/default-rule-demos.test.js
```

Expected outcome:

- generated default rule files stay in sync with `rules-index.md`;
- default rule ordering and count expectations are deliberately updated only when rule corpus changes;
- new metadata uses `requiredCapabilities`, signals, and evidence patterns consistently.

## Full Validation

Run the full suite before reporting implementation complete:

```bash
npm test
```

If package contents or release files are touched, also run:

```bash
npm pack --dry-run
```

## Validation Record

- 2026-07-06: `npm test -- test/runner.test.js` passed after updating the
  soft-only Spring fixture to include explicit Spring evidence.
- 2026-07-06: `npm test` passed with 148/148 tests.
- 2026-07-06: `npm pack --dry-run` passed and listed package-visible
  `README.md`, `bin/`, `src/`, and `vendor/bdr` content.
- No follow-up validation gaps are currently recorded.
