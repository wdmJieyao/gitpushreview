# CLI Contract: Review Determinism Controls

This contract describes user-visible command behavior for the feature.

Implementation reference: CLI behavior is covered by `test/cli-help.test.js`,
`test/cli-review-mode.test.js`, `test/cli.test.js`, `test/hook.test.js`, and
`test/doctor.test.js`.

## General Help

Command:

```text
gitpushreview --help
gitpushreview -h
gitpushreview
```

Required behavior:

- Output is Chinese.
- Every supported command is listed with a Chinese explanation.
- Commands listed:
  - `init`
  - `check`
  - `explain`
  - `profile`
  - `doctor`
  - `bdr status`
- Help includes how to reach command-specific help.

## Command-Specific Help

Supported forms:

```text
gitpushreview init --help
gitpushreview check --help
gitpushreview explain --help
gitpushreview profile --help
gitpushreview doctor --help
gitpushreview bdr status --help
```

Required behavior:

- Output is Chinese.
- Each option has a Chinese explanation.
- Commands with options include at least one Chinese example.
- Unknown or invalid command usage returns a Chinese message pointing to help.

## Init User-Mode Behavior

Command:

```text
gitpushreview init [--force] [--no-hook]
```

Required behavior:

- Repository-local initialization works without administrator privileges when
  the user can write to the repository.
- Existing hooks are preserved unless `--force` or an equivalent explicit
  replacement is requested.
- If hook installation fails because of permissions, the command provides
  Chinese guidance for a repository-local hook path or manual check path.
- The command does not require global package-location writes.

## Check Review Mode Behavior

Command:

```text
gitpushreview check [--staged] [--json]
```

Mode behavior:

- `normal`: run review and return blocking exit status according to accepted
  findings.
- `log`: run review, emit review output/logs, and exit without blocking.
- `skip`: do not start staged diff/model review, output a Chinese skip message,
  and exit without blocking.

JSON behavior:

- JSON output includes the effective review mode.
- In `log` mode, JSON includes accepted/rejected findings and a non-blocking
  effective outcome.
- In `skip` mode, JSON indicates the skipped state without model findings.

## Explain Diagnostics

Command:

```text
gitpushreview explain <file> [--json]
gitpushreview explain --staged [--json]
```

Required behavior:

- Output includes selected rules, excluded rules, and stable match/skip reasons.
- JSON output includes rejected out-of-candidate findings when available.
- Unknown-limited routing is visible.

## Doctor Diagnostics

Command:

```text
gitpushreview doctor
```

Required behavior:

- Output is Chinese.
- Output includes the effective review mode.
- Output includes bad-smell dependency status and version.
- Missing or invalid review mode is reported clearly.
