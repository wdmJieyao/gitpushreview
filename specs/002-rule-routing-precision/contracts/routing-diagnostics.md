# Contract: Routing Diagnostics

Routing diagnostics are exposed by `gitpushreview explain --staged --json`, `gitpushreview explain <file> --json`, and review JSON output. `explain --staged` uses staged blobs; `explain <file>` is a working-tree file diagnostic and must say so in human output when that distinction matters.

## JSON Shape

```json
{
  "candidateRuleIds": ["DEFAULT-COMMON-001", "DEFAULT-JAVA-001"],
  "candidateSummary": {
    "totalRules": 120,
    "selectedRules": 8,
    "excludedRules": 112,
    "bySource": {
      "rules/java.md": 3
    },
    "byCapability": {
      "language.java": 4,
      "common.core": 4
    },
    "topMatchReasons": [
      "path+capability:language.java"
    ],
    "topSkipReasons": [
      "capability-mismatch:persistence.sql.mysql"
    ],
    "duplicates": [
      {
        "ruleId": "DEFAULT-JAVA-001",
        "sources": ["rules/a.md", "rules/b.md"]
      }
    ]
  },
  "ruleRouting": {
    "totalRules": 120,
    "selectedRules": 8,
    "excludedRules": 112,
    "decisions": []
  }
}
```

## Human Output

Human explain output must remain Chinese and include:

- candidate total, selected, and excluded counts;
- candidate IDs or a concise top-N sample;
- source/capability summary counts;
- dominant match and skip reasons;
- duplicate rule ID warning when present;
- skip/log/normal mode note when relevant.

## Stability Rules

- `candidateRuleIds` must be sorted or otherwise emitted in a deterministic documented order.
- Summary counts must not depend on file input order.
- Verbose `ruleRouting.decisions` may remain available, but tests should assert the stable summary fields.
