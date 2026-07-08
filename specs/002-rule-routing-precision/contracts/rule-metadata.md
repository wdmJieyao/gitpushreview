# Contract: Rule Metadata

Markdown rules remain second-level headings with a YAML metadata block. This feature formalizes the routing fields below.

````markdown
## DEFAULT-SQL-MYSQL-001 Rule title

```yaml
score: 80
severity: high
hardBlock: true
paths:
  - "**/*.sql"
capabilities:
  - persistence.sql
requiredCapabilities:
  - persistence.sql.mysql
signalPaths:
  - "**/mysql/**"
signalContent:
  - "\\bAUTO_INCREMENT\\b"
evidencePatterns:
  - DEFAULT-SQL-MYSQL-001|AUTO_INCREMENT|检测到 MySQL 自增字段
```
````

## Fields

- `paths`: OR path glob scope. Empty means no path restriction.
- `capabilities`: legacy OR capability gate. Empty means legacy path-only compatibility.
- `requiredCapabilities`: strict AND capability gate. Every listed capability must exist on at least one matching file route.
- `signalPaths`: path evidence. For recognized files, this is diagnostic evidence; for unknown-limited files, it may expand candidates only when `allowUnknownExpansion: true`.
- `signalContent`: content evidence with the same expansion limits as `signalPaths`.
- `allowUnknownExpansion`: explicit opt-in for unknown-limited candidate expansion.
- `evidencePatterns`: static evidence extraction entries in `RULE-ID|regex|Chinese message` format.

## Compatibility

- Existing rules without `requiredCapabilities` keep current behavior.
- The lightweight YAML parser may continue to support simple scalars and list items only.
- Default rule metadata should prefer `requiredCapabilities` for dialect, MQ vendor, Vue-specific, and Java subdomain rules.
- `requiredCapabilities` must be added to the Markdown parser before default rules rely on it.

## Validation

- Duplicate rule IDs must be reported in routing diagnostics.
- Dialect-specific rules must not rely on generic `persistence.sql` alone.
- Vue-specific rules must require `frontend.vue` or an equivalent explicit Vue capability.
- MQ vendor rules must require vendor-specific capability when applicable.
