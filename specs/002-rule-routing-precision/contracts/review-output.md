# Contract: Review Output

Review output must preserve existing decisions while exposing candidate diagnostics.

## JSON Additions

```json
{
  "findings": [],
  "rejectedFindings": [
    {
      "ruleId": "DEFAULT-SQL-MYSQL-001",
      "rejectReason": "rule-not-in-candidate-set",
      "weightedScore": 80
    }
  ],
  "decision": {
    "status": "PASS",
    "totalScore": 0
  },
  "candidateRuleIds": ["DEFAULT-COMMON-001"],
  "candidateSummary": {
    "selectedRules": 1,
    "excludedRules": 119,
    "duplicates": []
  },
  "ruleRouting": {}
}
```

## Human Text

Chinese report output must continue to show:

- `审核结果`
- `总分`
- mode message for `skip` or `log`
- accepted findings

It must also show a concise rejected finding summary when present:

```text
已拒绝候选集外模型问题：1
  - DEFAULT-SQL-MYSQL-001：rule-not-in-candidate-set
```

## Mode Semantics

- `skip`: check does not start review and exits non-blocking. Explain remains an explicit diagnostic command.
- `log`: review runs and emits diagnostics but exits non-blocking.
- `normal`: accepted findings drive PASS/SOFT_BLOCK/HARD_BLOCK as before.

Rejected findings must not change exit code in any mode.
