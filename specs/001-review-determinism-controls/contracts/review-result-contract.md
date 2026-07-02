# Review Result Contract

This contract describes the machine-readable review result shape expected from
the feature. It is intentionally format-oriented rather than tied to a specific
type system.

Implementation reference: review result behavior is covered by
`test/runner-determinism.test.js`, `test/runner-rejected-findings.test.js`,
`test/review-findings.test.js`, and `test/explain.test.js`.

## Top-Level Fields

```json
{
  "mode": "normal",
  "findings": [],
  "rejectedFindings": [],
  "decision": {
    "status": "PASS",
    "totalScore": 0
  },
  "routes": [],
  "ruleRouting": {},
  "deterministicFindings": []
}
```

## `mode`

Allowed values:

- `skip`
- `log`
- `normal`

Rules:

- Missing configuration resolves to `normal`.
- `skip` results must not include model-produced findings.
- `log` results may include findings but must not cause a blocking exit.

## `findings`

Accepted findings only.

Rules:

- Every `ruleId` must be present in the selected review candidate set.
- Findings are sorted deterministically.
- Decision calculation uses this array only.

## `rejectedFindings`

Model-produced findings excluded from blocking.

Required additional field:

- `rejectReason`

Allowed reject reasons:

- `rule-not-in-candidate-set`

Rules:

- Rejected findings never contribute to `totalScore`.
- Rejected findings never change `decision.status`.
- Rejected findings are exposed for diagnostics.

## `decision`

Rules:

- In `normal` mode, status is calculated from accepted findings.
- In `log` mode, status reported to users must not block even when accepted
  findings would normally block.
- In `skip` mode, status indicates no blocking review was run.

## `ruleRouting`

Required diagnostic content:

- `totalRules`
- `selectedRules`
- `excludedRules`
- per-rule decisions with stable `matchReason` or `skipReason`

Rules:

- Same staged input and config yields the same selected rule IDs.
- Unknown-limited filtering must be visible in skip reasons.
