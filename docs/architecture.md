# GitPushReview Architecture

GitPushReview is a Node.js ESM CLI that reviews staged Git changes before commit.
Its core design is deliberately layered:

- Git access reads staged data only.
- Static analysis routes files and extracts evidence.
- Markdown rules and BDR provide review context.
- The model is the final reviewer and scorer.
- Local decision logic converts model findings into an exit status.

The main invariant is that deterministic checks do not directly block commits.
They produce high-confidence evidence for the model to review.

## Top-Level Flow

```text
gitpushreview check --staged
  -> src/cli.js
  -> src/git.js
  -> src/review/runner.js
     -> load .gitpushreview agent, policy, rules, model config
     -> src/bdr/provider.js
     -> src/gates/deterministic.js
     -> src/rules/router.js
     -> src/evidence/rule-evidence.js
     -> src/review/prompt.js
     -> src/model/client.js
     -> src/review/result.js
     -> src/review/decision.js
  -> src/hook.js
```

`src/cli.js` is the public command module. `bin/gitpushreview.js` is only a thin
process wrapper.

## CLI And Workspace Modules

`src/cli.js` exposes `routeCommand()` and `main()`.

Supported commands:

- `init [--force] [--no-hook]`
- `check [--staged] [--json]`
- `explain <file|--staged> [--json]`
- `profile [--json]`
- `doctor`
- `bdr status`

`init` calls `src/workspace.js`, which creates the `.gitpushreview` workspace:

```text
.gitpushreview/
  agent/
    review-agent.md
    rules-index.md
    policy.md
  config/
    reviewmodel.json
    review-mode.json
  docs/
    default/
    project/
    diy/
  vendor/
    bdr/
```

If the target is a Git repository, `initWorkspace()` can install
`.git/hooks/pre-commit` with:

```sh
exec gitpushreview check --staged
```

Existing hooks are preserved unless `--force` is used. Permission failures while
installing the hook are non-fatal once the workspace has been created; the CLI
prints Chinese guidance for running `gitpushreview check --staged` manually.

`src/review/mode.js` reads `.gitpushreview/config/review-mode.json`:

- `normal`: run review and map the decision to the usual exit code.
- `skip`: exit before staged diff/model work, report the skipped state, and do
  not block.
- `log`: run review and emit output, but never block.

`src/git.js` owns all Git command execution. It uses:

- `git rev-parse --show-toplevel`
- `git diff --cached --unified=80 --no-ext-diff`
- `git diff --cached --name-status`
- `git show :<file>`

The staged blob behavior is important: review should reflect exactly what will
be committed, not unstaged working tree edits.

## Review Runner

`src/review/runner.js` is the orchestration module.

Inputs:

- `cwd`: Git root.
- `diff`: staged diff.
- `files`: changed staged files.
- `fileContents`: staged blob contents.
- optional `modelInvoker`: test seam for model calls.
- `env`: environment for model API key lookup.

Outputs:

```js
{
  mode,
  findings,
  rejectedFindings,
  decision,
  routes,
  candidateRuleIds,
  candidateSummary,
  ruleRouting,
  deterministicFindings
}
```

The runner loads:

- `.gitpushreview/agent/review-agent.md`
- `.gitpushreview/agent/policy.md`
- `.gitpushreview/agent/rules-index.md`
- `.gitpushreview/config/reviewmodel.json`

It then parses rules, loads BDR context, extracts deterministic evidence, routes
rules, extracts rule evidence, builds model messages, parses model JSON, and
computes a decision.

`src/review/findings.js` splits model output into accepted and rejected
findings. Accepted findings must reference a rule in the routed candidate set or
a deterministic evidence rule ID. Out-of-candidate findings are returned as
`rejectedFindings` with `rejectReason: "rule-not-in-candidate-set"` and never
affect score or block status. Accepted findings still apply the local
`hardBlock: false` guardrail and deterministic sorting.

## Model Interface

`src/model/client.js` calls an OpenAI-compatible chat completions endpoint:

```text
POST {baseUrl}/chat/completions
```

The API key is resolved from `config.apiKey` first, then from
`env[config.apiKeyEnv]`. The default environment variable is
`GITPUSHREVIEW_API_KEY`.

The client uses Node's built-in `fetch` and `AbortController`. When
`config.timeoutMs` is a positive number, the request is aborted after that
duration and reported as a Chinese timeout diagnostic instead of waiting
indefinitely for a slow upstream model.

The model response must be JSON, optionally inside a `json` fenced block. The top
level must contain a `findings` array. Each finding is expected to include:

- `source`
- `ruleId`
- `title`
- `severity`
- `score`
- `weightedScore`
- `blocking`
- `file`
- `line`
- `evidence`
- `suggestion`

Field names and enum values are English. User-facing values such as title,
evidence, and suggestion should be Chinese.

## Decision Module

`src/review/decision.js` computes:

- `HARD_BLOCK` when any model finding has `blocking: "hard"`.
- `HARD_BLOCK` when total weighted score reaches `hardBlockScore`.
- `SOFT_BLOCK` when total weighted score reaches `softBlockScore`.
- `PASS` otherwise.

`src/hook.js` maps this decision to process behavior:

- `SKIPPED` or mode `skip`: exit `0`.
- mode `log`: render output and exit `0` even when the decision would block.
- `PASS`: exit `0`.
- `HARD_BLOCK`: exit `1`.
- `SOFT_BLOCK`: interactive confirmation can exit `0`; CI or non-TTY exits `1`.

## Rule Discovery And Parsing

Rule discovery starts from `.gitpushreview/agent/rules-index.md`.

`src/rules/index.js` parses each `##` section with a YAML block. Disabled sources
are skipped, and enabled sources are sorted by `priority`.

Markdown rule loading is explicit. A provider only loads files listed in the
source's `files` array. Directories are not scanned.

`src/rules/markdown.js` parses a deliberately small YAML subset:

- booleans
- numbers
- strings
- simple lists

It does not support nested maps.

Each rule is parsed from:

````markdown
## RULE-ID Title

```yaml
score: 90
severity: critical
hardBlock: true
paths:
  - "**/*.java"
capabilities:
  - language.java
requiredCapabilities:
  - backend.spring
```

Rule body...
````

The parsed rule fields include:

- `id`
- `title`
- `score`
- `severity`
- `hardBlock`
- `paths`
- `capabilities`
- `requiredCapabilities`
- `signalPaths`
- `signalContent`
- `evidencePatterns`
- `allowUnknownExpansion`
- `scope`
- `body`

## Capability Routing

`src/routes/capability-context.js` classifies each changed file using path,
extension, content signals, and optional project profile data.

Common capabilities include:

- `language.java`
- `frontend.javascript`
- `frontend.typescript`
- `frontend.vue`
- `language.python`
- `common.config`
- `common.xml`
- `persistence.sql`
- `persistence.sql.mysql`
- `persistence.sql.oracle`
- `persistence.sql.postgresql`
- `persistence.sql.oceanbase`
- `persistence.mybatis`
- `persistence.sql.inline-java`
- `middleware.mq`
- `middleware.mq.kafka`
- `middleware.mq.rabbitmq`
- `middleware.redis`
- `rules.drools`
- `security.secrets`
- `workflow.supply-chain`
- `common.core`
- `common.unknown-limited`

Every route gets `common.core`. Files with no stable capability signal get
`common.unknown-limited` and `unknownLimited: true`.

`src/rules/router.js` filters rules against routes:

- Recognized files normally require path match, legacy capability match, and all
  required capabilities.
- `capabilities` keeps legacy OR semantics: any listed capability can satisfy
  that gate.
- `requiredCapabilities` uses strict AND semantics: every listed capability must
  exist on a matching route.
- Rules without `capabilities` and `requiredCapabilities` are legacy path-only
  rules.
- Common rules can apply to unknown-limited files.
- Non-common rules need `allowUnknownExpansion: true` plus a matching
  `signalPaths` or `signalContent` pattern before they can expand into
  unknown-limited files.
- `signalPaths` and `signalContent` are evidence signals for recognized files;
  they do not replace normal path/capability matching.

The router returns selected rules plus diagnostics, including selected count,
excluded count, candidate rule IDs, source/capability summaries, dominant
match/skip reasons, duplicate rule ID diagnostics, per-rule matches, and skip
reasons. These diagnostics are sent to the model prompt and are useful for
`explain`.

## Deterministic Evidence

`src/gates/deterministic.js` coordinates deterministic evidence extraction.

For each changed file it:

1. Builds a route context.
2. Uses staged blob content when available, otherwise added diff lines.
3. Runs SQL checks.
4. Extracts Java inline SQL and runs SQL checks on snippets.
5. Runs MQ checks.
6. Deduplicates findings by rule, file, line, and evidence.

SQL checks live in `src/gates/sql.js`. They conservatively detect structural
issues such as unmatched quotes/parentheses and INSERT column/value mismatches.

MQ checks live in `src/gates/mq.js`. They look for high-confidence messaging
risks such as plaintext credentials, production Kafka auto-create topic settings,
RabbitMQ infinite requeue, non-persistent messages, and disabled confirms.

Java inline SQL extraction lives in `src/gates/java-inline-sql.js`. It attempts
to keep the original Java file and line number while passing extracted SQL
snippets through SQL checks.

Deterministic findings typically look severe:

```js
{
  source: "deterministic",
  severity: "critical",
  score: 95,
  weightedScore: 95,
  blocking: "hard"
}
```

Those values are evidence strength for the model, not final local blocking.

## Rule Evidence

`src/evidence/rule-evidence.js` extracts `evidencePatterns` only for rules that
were actually routed to a file.

Supported pattern formats:

- `regex`
- `evidenceId|regex|Chinese evidence message`

Invalid regexes are skipped. Static evidence findings have:

```js
{
  source: "static-evidence",
  score: 0,
  weightedScore: 0,
  blocking: "none"
}
```

They are prompt context only.

## BDR Integration

`src/bdr/provider.js` dynamically reads vendored BDR from
`.gitpushreview/vendor/bdr` after initialization.

It loads:

- `package.json`
- `skills/bdr-*/SKILL.md`
- selected optional template files

This keeps BDR upgradable as vendored content. Avoid baking specific BDR skill
lists into GitPushReview code.

## Templates And Default Rules

`src/templates.js` is large because it owns the generated workspace content:

- review agent prompt
- policy template
- rules index template
- model config template
- default/project/DIY rule docs
- default rule corpus

Default rule files are generated into `DEFAULT_DOCS`. The default rules index
must reference the same files. Tests assert that this generated corpus remains
closed and well formed.

When adding or changing default rules:

- Keep rule text Chinese.
- Keep the expected rule body sections.
- Use precise `paths`; broad `**/*` defaults are rejected by tests.
- Keep `score` in `1..100`.
- Use valid severity values.
- Make `hardBlock` explicitly boolean.
- Add or verify `capabilities`.
- Prefer `requiredCapabilities` for concrete SQL dialects, MQ vendors,
  Vue-specific rules, and Java subdomain rules.
- Update tests if the expected count or ordering changes.

## Diagnostics

`src/doctor.js` checks local readiness:

- Node version.
- `.gitpushreview` workspace presence.
- model config presence and API key resolution.
- vendored BDR presence.

`src/profile.js` is a read-only project profiler. It can suggest capabilities
from manifests and directories, but it must not create or mutate
`project-profile.json`.

`src/explain.js` explains route and rule decisions for a file or staged changes.
It exposes `candidateRuleIds`, `candidateSummary`, and verbose `ruleRouting`.
`explain --staged` must use staged blobs. `explain <file>` is an explicit
working-tree diagnostic for one file. Human output should remain Chinese and
should summarize candidate counts, source/capability counts, top match and skip
reasons, duplicate IDs, and review-mode notes.

## Tests

The suite uses Node's built-in test runner:

```sh
npm test
npm test -- test/runner.test.js
```

Common test seams:

- `routeCommand()` avoids process spawning.
- `modelInvoker` stubs model review in runner tests.
- `fetchImpl` stubs HTTP in model client tests.
- `AbortController` timeout behavior is verified at the model client boundary.
- temporary directories model initialized workspaces.
- temporary Git repositories validate staged snapshot behavior.

Important regression areas:

- deterministic evidence must not directly decide blocking.
- routed prompts must not include unrelated database/middleware rules.
- unknown-limited files must not fan out into all rules.
- repeated staged input and file-order perturbation must keep candidate IDs,
  accepted/rejected findings, score, and decision stable.
- out-of-candidate model findings must stay in `rejectedFindings` and must not
  affect blocking.
- default rule corpus, rule count, and index/docs closure must stay consistent.
- Java inline SQL findings must keep original Java file and line context.
- `profile` must remain read-only.

## Package And Release

`package.json` declares:

- package name: `gitpushreview`
- bin: `gitpushreview -> ./bin/gitpushreview.js`
- type: `module`
- engine: Node `>=18`
- runtime APIs: Node standard library, built-in `fetch`, and `AbortController`
- test script: `node --test`

Before release or install-distribution changes, run:

```sh
npm test
npm pack --dry-run
```

The npm `files` list currently includes `templates/`, although templates are
implemented in `src/templates.js`. Use `npm pack --dry-run` to verify the actual
tarball contents.
