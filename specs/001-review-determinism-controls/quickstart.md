# Quickstart: Review Determinism Controls

This guide describes validation scenarios for the feature. It assumes the
implementation phase has completed.

## Prerequisites

- Node `>=18`
- Git available on PATH
- Repository dependencies installed if needed by the implementation

## Baseline Validation

Run:

```sh
npm test
```

Expected outcome:

- All existing tests pass.
- New feature tests pass for review modes, deterministic accepted findings,
  rejected findings, Chinese help, user-mode init, and vendored bad-smell status.

Validation status: passed on 2026-07-02 with `npm test` (129 tests passed).

## Review Mode: Normal

Scenario:

1. Initialize a temporary repository.
2. Configure review mode as `normal` or leave it unset.
3. Stage a change that produces a blocking accepted finding using a model stub.
4. Run `gitpushreview check --staged`.

Expected outcome:

- Review runs.
- Accepted findings are reported.
- Blocking exit behavior matches the accepted findings.
- Effective mode is visible in JSON output or diagnostics.

## Review Mode: Logging Only

Scenario:

1. Configure review mode as `log`.
2. Stage the same blocking change as the normal-mode scenario.
3. Run `gitpushreview check --staged --json`.

Expected outcome:

- Review runs.
- Review findings/log data are emitted.
- Exit behavior is non-blocking.
- Output clearly indicates logging-only behavior in Chinese for human-readable
  output.

## Review Mode: Skip All Checks

Scenario:

1. Configure review mode as `skip`.
2. Stage any change.
3. Run `gitpushreview check --staged`.

Expected outcome:

- No model review starts.
- No blocking result is produced.
- Output clearly states in Chinese that review is skipped by configuration.

## Deterministic Candidate And Accepted Finding Stability

Scenario:

1. Create a fixed staged change that matches a known default-rule subset.
2. Use a deterministic model stub.
3. Run review 10 times with the same staged input and config.
4. Compare selected rule IDs, accepted finding rule IDs, and final status.

Expected outcome:

- All 10 runs produce identical selected rule IDs.
- All 10 runs produce identical accepted finding rule IDs.
- All 10 runs produce identical final pass/block status.

## Rejected Out-Of-Candidate Findings

Scenario:

1. Create a staged change with a narrow candidate rule set.
2. Use a model stub that returns one in-candidate finding and one
   out-of-candidate finding.
3. Run review with JSON output and run explain diagnostics.

Expected outcome:

- The in-candidate finding is accepted.
- The out-of-candidate finding appears in rejected diagnostics.
- The rejected finding does not affect score or final block status.

## Chinese Help

Run:

```sh
node bin/gitpushreview.js --help
node bin/gitpushreview.js init --help
node bin/gitpushreview.js check --help
node bin/gitpushreview.js explain --help
node bin/gitpushreview.js profile --help
node bin/gitpushreview.js doctor --help
node bin/gitpushreview.js bdr status --help
```

Expected outcome:

- All command and option descriptions are Chinese.
- Commands with options include Chinese examples.
- Unknown command output is Chinese and points to help.

## User-Mode Initialization

Scenario:

1. Use a temporary Git repository where global package locations are not used.
2. Run repository-local initialization.
3. Simulate hook-install failure or existing hook preservation.
4. Run the documented manual check path.

Expected outcome:

- Initialization completes without administrator privileges.
- Existing hooks are preserved unless explicit replacement is requested.
- Permission failures include Chinese user-mode guidance.
- Manual check path remains usable.

## Bad-Smell Dependency Status

Run:

```sh
node bin/gitpushreview.js init --no-hook
node bin/gitpushreview.js bdr status
```

Expected outcome:

- Fresh workspace reports the approved fixed target bad-smell context:
  `openmole 0.8.2`.
- Review context loading includes the updated vendored content.

## Package Validation

Run:

```sh
npm pack --dry-run
```

Expected outcome:

- Package includes updated vendored bad-smell content.
- Package still includes CLI entry, source files, README, and required vendor
  files.

Validation status: passed on 2026-07-02 with `npm pack --dry-run`; tarball includes `vendor/bdr/package.json`, OpenMole skills, commands, templates, CLI entry, source files, and README.
