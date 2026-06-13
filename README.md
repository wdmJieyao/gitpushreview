# GitPushReview

GitPushReview is a cross-platform Git pre-commit review gate powered by BDR, Markdown rules, and an OpenAI-compatible model API.

It reviews only staged changes by default. Normal code smells can soft-block a commit and ask the developer to confirm. Obvious abnormal risks and required project rules hard-block the commit until fixed.

## Install

```bash
npm install -g gitpushreview
```

For local development:

```bash
npm link
```

## Initialize A Project

```bash
gitpushreview init
```

This creates:

```text
.gitpushreview/
  agent/
    review-agent.md
    rules-index.md
    policy.md
  docs/
    default/
    project/
    diy/
  config/
    reviewmodel.json
  vendor/
    bdr/
```

It also installs a `.git/hooks/pre-commit` hook when the current directory is a Git repository.

## BDR Integration

BDR is treated as an external rule and methodology source. GitPushReview does not copy BDR into fixed local rule documents. The review provider reads the current vendored BDR files from:

```text
.gitpushreview/vendor/bdr
```

To upgrade BDR, replace that directory with a newer copy of `https://github.com/agiledon/bdr.git`. Future versions may add an assisted `gitpushreview bdr upgrade` command.

Check BDR status:

```bash
gitpushreview bdr status
```

## Rule Index

Rules are enabled by `.gitpushreview/agent/rules-index.md`, not by scanning every Markdown file.

````markdown
## DIY Rules

```yaml
enabled: true
provider: markdown
priority: 100
weight: 2.0
files:
  - ../docs/diy/auth.md
requiredRules: []
hardBlockOnViolation: true
```
````

BDR, default, project, and DIY rules can each have different priorities and weights. DIY rules are intended for the highest-priority project-specific gates.

## Markdown Rules

A Markdown file can hold many rules. Each rule starts with a stable heading ID and can include YAML metadata.

````markdown
## DIY-AUTH-001 Tenant boundary must be checked

```yaml
score: 60
severity: high
hardBlock: true
paths:
  - backend/**/*.py
```

Any API that reads or writes tenant-owned resources must verify tenant isolation.
````

## Model Configuration

Edit `.gitpushreview/config/reviewmodel.json`:

```json
{
  "provider": "openai-compatible",
  "baseUrl": "https://api.example.com/v1",
  "apiKeyEnv": "GITPUSHREVIEW_API_KEY",
  "model": "gpt-4.1",
  "timeoutMs": 60000
}
```

Set the API key in your environment:

```bash
set GITPUSHREVIEW_API_KEY=...
```

On macOS/Linux:

```bash
export GITPUSHREVIEW_API_KEY=...
```

## Review

Run manually:

```bash
gitpushreview check --staged
```

The Git hook runs the same check before commit.

Decisions:

- `PASS`: commit proceeds.
- `SOFT_BLOCK`: risk is shown; interactive users can type `yes` to continue.
- `HARD_BLOCK`: commit is blocked until fixed.

Git still supports its native escape hatch:

```bash
git commit --no-verify
```

GitPushReview does not provide a convenience bypass for hard blocks.

## Diagnostics

```bash
gitpushreview doctor
```

Checks Node version, workspace files, model config, API key environment variable, and BDR directory.

## Development

```bash
npm test
npm pack --dry-run
```
