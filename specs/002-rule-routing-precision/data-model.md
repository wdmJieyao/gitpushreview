# Data Model: Rule Routing Precision

## StagedChange

Represents the exact commit input under review.

**Fields**:

- `root`: Git root used to resolve `.gitpushreview`
- `files`: normalized staged file paths
- `diff`: staged diff text
- `fileContents`: map of staged file path to staged blob content
- `deletedFiles`: normalized paths without staged blob content, when available from Git metadata

**Validation Rules**:

- Must be built from staged Git data only.
- Must not read unstaged working tree content for `check --staged` or `explain --staged`.
- File ordering must be normalized before candidate summaries are emitted.

## FileCapabilityContext

Represents route facts for one staged file.

**Fields**:

- `file`: normalized path
- `extension`: normalized extension
- `labels`: user-readable route labels
- `capabilities`: normalized capability IDs
- `dialectCandidates`: `generic`, `mysql`, `oracle`, `postgresql`, `oceanbase`, or empty
- `evidence`: compact evidence strings for compatibility
- `evidenceDetails`: structured evidence with type, value, confidence, and source
- `routes`: capability route records with capability, confidence, match kind, and evidence
- `unknownLimited`: whether no stable file capability was detected

**Validation Rules**:

- `common.core` remains an explicit common fallback and must not imply domain-specific rules by itself.
- Unknown files keep `common.unknown-limited` and only expand through explicit rule opt-in and matching signals.
- Concrete database dialect capabilities require concrete dialect evidence.
- Plain JS/TS files must not receive `frontend.vue` unless Vue evidence exists.

## RuleMetadata

Represents one Markdown rule loaded from an explicitly indexed source.

**Fields**:

- `id`, `title`, `source`, `file`
- `paths`: glob path scope
- `capabilities`: legacy OR capability list
- `requiredCapabilities`: strict AND capability list
- `signalPaths`, `signalContent`: evidence and unknown-expansion signals
- `allowUnknownExpansion`: whether signals can expand unknown-limited files
- `evidencePatterns`: static evidence extraction patterns
- `severity`, `score`, `hardBlock`, `scope`, `body`

**Validation Rules**:

- `id` must be stable and duplicate IDs must be reported deterministically.
- `requiredCapabilities` must all be present when specified.
- Legacy `capabilities` remain OR semantics for backward compatibility.
- `signalPaths` and `signalContent` do not replace normal `paths + capabilities + requiredCapabilities` matching for recognized files.

## CandidateRuleSet

Represents the deterministic rules sent to the model plus deterministic evidence rule IDs accepted as local candidates.

**Fields**:

- `candidateRuleIds`: stable ordered rule IDs
- `rules`: selected Markdown rule metadata
- `staticFindingRuleIds`: deterministic evidence rule IDs
- `summary`: total, selected, excluded, source counts, capability counts, and dominant match/skip reasons
- `diagnostics`: per-rule decisions, duplicate ID diagnostics, and route match details

**Validation Rules**:

- Same staged input must produce the same candidate IDs across repeated runs.
- File-order perturbation must not change the candidate ID set or final decision.
- Duplicate rule IDs must be visible in diagnostics and handled with deterministic ordering.

## RejectedFinding

Represents a model finding that cannot affect blocking because it is outside the candidate set.

**Fields**:

- `ruleId`
- `title`
- `file`
- `line`
- `score`
- `weightedScore`
- `blocking`
- `rejectReason`

**Validation Rules**:

- Rejected findings must not affect accepted findings, total score, or final decision.
- Sorting must be stable by rule ID, file, line, and title.
- Diagnostics must include at least rule ID and reject reason.

## RoutingDiagnostics

Represents machine-readable and human-readable explanations of routing.

**Fields**:

- `candidateRuleIds`
- `summary`
- `decisions`
- `matchesByRule`
- `duplicates`
- `rejectedFindings`
- `modeNote`

**Validation Rules**:

- JSON diagnostics must expose direct fields, not require parsing Chinese text.
- Human diagnostics must remain concise and Chinese.
- Skip/log/normal mode notes must not change mode behavior.
