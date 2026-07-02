<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/001-review-determinism-controls/plan.md
<!-- SPECKIT END -->

# Agent Guide

This repository is `gitpushreview`, an ESM Node.js CLI that reviews staged Git
changes before commit. It initializes a `.gitpushreview` workspace in the target
project, gathers staged diffs and staged blobs, routes changed files to relevant
Markdown rules, enriches the review with deterministic evidence and vendored BDR
context, then asks an OpenAI-compatible model for the final findings and block
decision.

Primary maintainer docs:

- `README.md`: user-facing install, configuration, rules, and workflow.
- `docs/architecture.md`: maintainer-facing module architecture and data flow.
- `docs/superpowers/plans/*`: historical implementation plans; treat them as
  context, not as the current source of truth.

## Commands

- Run all tests: `npm test`
- Run one test file: `npm test -- test/runner.test.js`
- Check package contents before release: `npm pack --dry-run`
- CLI entry point during development: `node bin/gitpushreview.js --help`

The test runner is Node's built-in `node --test`; there is no third-party test
framework. The package requires Node `>=18`.

## Module Map

- `bin/gitpushreview.js`: thin process entry point that passes argv, cwd, env,
  stdio, and stdin into `main()`.
- `src/cli.js`: command router. Prefer testing `routeCommand()` over spawning a
  real process.
- `src/workspace.js`: initializes `.gitpushreview`, writes templates, copies
  vendored OpenMole/BDR context, writes review mode defaults, and optionally
  installs `.git/hooks/pre-commit`.
- `src/git.js`: all Git command access. It reads staged diff, changed file names,
  and staged blob contents; review must not inspect unstaged working tree content.
- `src/review/runner.js`: review pipeline coordinator.
- `src/review/mode.js`: loads and validates `skip`, `log`, and `normal` review
  modes from `.gitpushreview/config/review-mode.json`.
- `src/review/findings.js`: splits model findings into accepted and rejected
  candidate-set bounded findings.
- `src/review/prompt.js`: model message construction and output contract.
- `src/review/result.js`: model JSON parsing.
- `src/review/decision.js`: final PASS/SOFT_BLOCK/HARD_BLOCK calculation from
  model findings.
- `src/model/client.js`: OpenAI-compatible `/chat/completions` client.
- `src/bdr/provider.js`: dynamic vendored BDR context loader.
- `src/rules/*`: rule index parsing, Markdown rule parsing, and rule routing.
- `src/routes/*`: file capability detection and route context generation.
- `src/gates/*`: deterministic SQL/MQ/Java-inline-SQL evidence extraction.
- `src/evidence/rule-evidence.js`: `evidencePatterns` extraction for routed
  rules.
- `src/format/report.js`: Chinese plain-text review report rendering.
- `src/doctor.js` and `src/profile.js`: read-only diagnostics.
- `src/templates.js`: all built-in `.gitpushreview` templates and default rules.

## Review Pipeline

`gitpushreview check --staged` follows this flow:

1. `src/git.js` resolves the Git root, staged diff, changed file list, and staged
   blob contents.
2. `src/review/runner.js` reads `.gitpushreview/agent/review-agent.md`,
   `policy.md`, `rules-index.md`, and `config/reviewmodel.json`.
3. `parseRuleIndex()` discovers enabled rule sources; Markdown sources load only
   files explicitly listed in `rules-index.md`.
4. `runDeterministicGates()` builds file route contexts and extracts SQL/MQ
   evidence.
5. `routeRulesForFiles()` filters Markdown rules by file routes.
6. `runRuleEvidence()` extracts rule-specific static evidence from
   `evidencePatterns`.
7. `buildReviewMessages()` sends policy, BDR context, routed rules, static
   evidence, changed files, and staged diff to the model.
8. `parseReviewJson()` parses model output, candidate-set finding filtering
   applies local guardrails, and `decideReview()` computes the final decision.
9. `src/hook.js` renders JSON or Chinese text and maps the decision to an exit
   code. Soft blocks fail in CI or non-TTY contexts; in an interactive TTY they
   can be confirmed with `yes`, `y`, `是`, `确认`, or `继续`.

Important invariant: deterministic gates and static evidence are context for the
model. They must not directly decide the final block status.

Review modes:

- `skip`: loaded before staged Git snapshot work; no review starts and no
  finding can block.
- `log`: review runs and outputs data, but hook/CLI exit remains non-blocking.
- `normal`: default mode; accepted findings drive the normal block decision.

Model findings whose `ruleId` is outside the routed candidate set and
deterministic evidence rule IDs are rejected into diagnostics. They must not
affect accepted finding IDs, score, or final block status.

## Rule System

Rules are discovered explicitly through `.gitpushreview/agent/rules-index.md`;
rule directories are not auto-scanned.

Each Markdown rule is a second-level heading plus a YAML metadata block:

````markdown
## DEFAULT-JAVA-SEC-001 Rule title

```yaml
score: 80
severity: high
hardBlock: true
paths:
  - "**/*.java"
capabilities:
  - language.java
evidencePatterns:
  - EVIDENCE-ID|regex|Chinese evidence message
```
````

The lightweight YAML parser supports only simple scalars and list items. Do not
introduce nested YAML structures unless you first change the parser and tests.

Rule routing uses two gates for recognized files:

- `paths` must match the changed file.
- `capabilities` must match the file route context.

Rules without `capabilities` are treated as legacy path-only rules. Unknown files
receive `common.unknown-limited`; they should only get common rules unless a
non-common rule sets `allowUnknownExpansion: true` and a `signalPaths` or
`signalContent` pattern matches.

`signalPaths` and `signalContent` do not replace normal `paths + capabilities`
matching for recognized files. They are evidence signals, and only become
candidate-expansion signals for unknown-limited files.

Default rules live in `src/templates.js`. Keep `RULES_INDEX.files` and
`DEFAULT_DOCS` closed over the same generated default files. Tests currently
assert the default rule corpus shape, including the expected total rule count and
rule ordering.

## Testing Conventions

Use `node:test` and `node:assert/strict`.

Every feature must include comprehensive scenario tests. Cover the primary user
flow, at least one failure or edge case, and any mode, permission, deterministic
review, or vendored-context variant introduced by the change.

Common fixture style:

- Create temporary projects with `fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-...'))`.
- Initialize workspace fixtures with `initWorkspace({ installHook: false })`.
- Use `modelInvoker` stubs for review pipeline tests. Do not call real models.
- Use `fetchImpl` stubs for `src/model/client.js`. Do not make real network calls.
- For Git behavior, initialize a temp repo and assert staged blobs, not working
  tree contents.

When changing a module, run the focused test file first, then `npm test`. For
changes that affect package contents or release behavior, also run
`npm pack --dry-run`.

## Release And Vendor Notes

The package publishes `bin/`, `src/`, `vendor/`, `templates/`, and `README.md`
according to `package.json`. There is currently no top-level `templates/`
directory; verify tarball contents before release.

`vendor/bdr` is copied into initialized user workspaces. The current approved
target is `openmole 0.8.2`. Treat it as vendored package content. Do not make
casual local edits inside `vendor/bdr`; upgrade or replace it deliberately and
rerun the relevant BDR/provider/init/package tests plus `npm pack --dry-run`.

## Worktree Discipline

The worktree may contain user or generated changes. Do not revert unrelated
changes. If you touch `src/templates.js`, expect broad test impact: initialization
fixtures, default rule corpus tests, README examples, and package contents can all
depend on it.
