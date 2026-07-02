# Data Model: Review Determinism Controls

## Review Mode Setting

Represents the effective workspace review behavior.

Fields:

- `mode`: one of `skip`, `log`, `normal`.
- `source`: where the effective mode came from, such as missing default,
  workspace configuration, or command context.
- `message`: Chinese explanation shown when mode changes normal blocking
  behavior.

Validation rules:

- Missing mode resolves to `normal`.
- Unknown mode is invalid and must produce a Chinese diagnostic.
- `skip` must not start staged diff/model review.
- `log` must run review but cannot produce a blocking exit status.
- `normal` preserves existing blocking behavior.

State transitions:

```text
missing -> normal
normal -> skip
normal -> log
skip -> normal
log -> normal
```

## Installation Mode

Represents how initialization can proceed under user permissions.

Fields:

- `kind`: `normal` or `repository-local`.
- `hookStatus`: installed, preserved existing, skipped, or failed with guidance.
- `manualCheckAvailable`: boolean indicating whether the user can still run a
  manual check path.
- `guidance`: Chinese next-step text for permission-limited environments.

Validation rules:

- Existing hooks are preserved unless replacement is explicitly requested.
- Repository-local mode must not require global package writes or administrator
  privileges.
- Failure to install a hook must not make manual checking impossible.

## Command Help Entry

Represents help content for one command or command group.

Fields:

- `command`: command name.
- `purposeZh`: Chinese command purpose.
- `usage`: usage forms.
- `options`: option names with Chinese descriptions.
- `examples`: Chinese examples for commands with options.
- `invalidUsageHintZh`: Chinese recovery guidance.

Validation rules:

- Every supported command has a Chinese purpose.
- Every supported option has a Chinese explanation.
- Unknown commands point to help in Chinese.

## Bad-Smell Dependency Version

Represents the vendored bad-smell review context target.

Fields:

- `sourceName`: planned target package/context name, `openmole`.
- `targetVersion`: planned fixed version, `0.8.2`.
- `sourceRepository`: `https://github.com/agiledon/bdr.git`.
- `sourceRevision`: planned source revision observed during planning,
  `0acd889777f175c46efec2be20ae3ed538ccbb3e`.
- `installedPath`: generated workspace path for vendored content.

Validation rules:

- Fresh initialization reports the target version.
- Review context loading includes the updated vendored content.
- Release validation flags stale vendored content before packaging.

## Default Rule Applicability Decision

Represents why a rule was selected or excluded for a staged change.

Fields:

- `ruleId`
- `file`
- `matched`: boolean.
- `matchReason`: stable reason for selected rules.
- `skipReason`: stable reason for excluded rules.
- `capabilities`
- `paths`
- `signals`
- `expandedFromUnknown`: boolean.

Validation rules:

- Recognized files require path and capability match unless the rule is legacy
  path-only.
- Unknown-limited files receive common rules only unless explicit signal
  expansion is allowed and matched.
- Decisions are ordered deterministically.

## Review Candidate Set

Represents the complete rule boundary for one staged review.

Fields:

- `candidateRuleIds`: deterministic list of selected rule IDs.
- `decisions`: full list of applicability decisions.
- `routes`: file route contexts.
- `evidence`: static deterministic evidence available to the model.

Validation rules:

- Same staged input and config yields the same candidate rule IDs.
- Candidate rule IDs are the only rule IDs that can produce accepted findings.
- Candidate diagnostics are visible through explanation output.

## Accepted Finding

Represents a model finding that is allowed to affect reports and decisions.

Fields:

- `ruleId`
- `source`
- `severity`
- `score`
- `weightedScore`
- `blocking`
- `file`
- `line`
- `evidence`
- `suggestion`

Validation rules:

- `ruleId` must exist in the review candidate set.
- Soft-only rule guardrails still apply.
- Accepted findings are sorted deterministically.
- Decision calculation uses accepted findings only.

## Rejected Finding

Represents a model finding excluded from blocking because it references a rule
outside the candidate set.

Fields:

- Same user-facing fields as Accepted Finding where present.
- `rejectReason`: stable reason, such as `rule-not-in-candidate-set`.

Validation rules:

- Rejected findings never affect score, accepted finding IDs, or block status.
- Rejected findings remain visible in diagnostics or explanation output.
- Rejected findings are sorted deterministically.

## Review Result

Represents the complete output for one review run.

Fields:

- `mode`: effective review mode.
- `acceptedFindings`
- `rejectedFindings`
- `decision`
- `routes`
- `ruleRouting`
- `deterministicFindings`

Validation rules:

- `skip` mode has no accepted/rejected findings and no blocking decision.
- `log` mode may have findings but exits without blocking.
- `normal` mode uses accepted findings for the final decision.
