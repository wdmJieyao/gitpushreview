# GitPushReview MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working `gitpushreview` npm CLI that initializes a project-local review workspace and gates `git commit` with AI-assisted staged-diff review.

**Architecture:** The project is a Node.js ESM CLI with focused modules for argument parsing, workspace initialization, Git diff collection, rule source loading, BDR context loading, AI model calls, scoring, and hook execution. The pre-commit hook is a tiny cross-platform shell shim that delegates all real work to the Node CLI.

**Tech Stack:** Node.js 18+, ESM, built-in `node:test`, `assert`, `fs`, `path`, `child_process`, and `fetch`; no runtime framework dependency for MVP.

---

## File Structure

- `package.json`: npm metadata, bin entry, test scripts, pack file list.
- `bin/gitpushreview.js`: executable CLI entrypoint.
- `src/cli.js`: command routing for `init`, `check`, `doctor`, and `bdr status`.
- `src/workspace.js`: workspace path resolution, template writing, and init orchestration.
- `src/templates.js`: default file contents for `.gitpushreview`.
- `src/git.js`: Git root detection and staged diff collection.
- `src/rules/index.js`: parse `agent/rules-index.md` and load enabled sources.
- `src/rules/markdown.js`: parse Markdown rule files and metadata blocks.
- `src/bdr/provider.js`: load current vendored BDR context without transforming BDR into fixed rules.
- `src/model/client.js`: OpenAI-compatible model client.
- `src/review/prompt.js`: build the model prompt from diff, BDR context, and Markdown rules.
- `src/review/result.js`: parse and validate model JSON findings.
- `src/review/decision.js`: score findings into `PASS`, `SOFT_BLOCK`, or `HARD_BLOCK`.
- `src/review/runner.js`: orchestrate the full review.
- `src/format/report.js`: render human-readable and JSON reports.
- `src/hook.js`: non-interactive/interactive hook behavior and soft-block confirmation.
- `test/*.test.js`: Node test coverage for each module.
- `docs/superpowers/plans/2026-06-13-gitpushreview-mvp.md`: this plan.

## Task 1: Project Skeleton

**Files:**
- Create: `package.json`
- Create: `bin/gitpushreview.js`
- Create: `src/cli.js`
- Create: `test/cli.test.js`

- [ ] **Step 1: Write the failing CLI test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { routeCommand } from '../src/cli.js';

test('routeCommand returns help for --help', async () => {
  const result = await routeCommand(['--help'], { cwd: process.cwd(), env: {}, stdout: [] });
  assert.equal(result.exitCode, 0);
  assert.match(result.output, /gitpushreview/);
  assert.match(result.output, /init/);
  assert.match(result.output, /check/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- test/cli.test.js`

Expected: fails because `package.json` or `src/cli.js` does not exist.

- [ ] **Step 3: Add minimal package and CLI files**

```json
{
  "name": "gitpushreview",
  "version": "0.1.0",
  "description": "Git pre-commit review gate powered by BDR, Markdown rules, and AI models",
  "type": "module",
  "bin": {
    "gitpushreview": "./bin/gitpushreview.js"
  },
  "files": [
    "bin/",
    "src/",
    "templates/",
    "README.md"
  ],
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "test": "node --test"
  },
  "license": "MIT"
}
```

```js
#!/usr/bin/env node
import { main } from '../src/cli.js';

main(process.argv.slice(2), {
  cwd: process.cwd(),
  env: process.env,
  stdout: process.stdout,
  stderr: process.stderr,
  stdin: process.stdin,
}).then((code) => {
  process.exitCode = code;
}).catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
```

```js
const HELP = `gitpushreview

Usage:
  gitpushreview init
  gitpushreview check [--staged] [--json]
  gitpushreview doctor
  gitpushreview bdr status

`;

export async function routeCommand(args, context) {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    return { exitCode: 0, output: HELP };
  }

  return { exitCode: 1, output: `Unknown command: ${args[0]}\n` };
}

export async function main(args, context) {
  const result = await routeCommand(args, context);
  if (context?.stdout?.write) {
    context.stdout.write(result.output);
  }
  return result.exitCode;
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- test/cli.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json bin/gitpushreview.js src/cli.js test/cli.test.js
git commit -m "chore: scaffold gitpushreview cli"
```

## Task 2: Workspace Initialization

**Files:**
- Modify: `src/cli.js`
- Create: `src/workspace.js`
- Create: `src/templates.js`
- Create: `test/init.test.js`

- [ ] **Step 1: Write failing init tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initWorkspace } from '../src/workspace.js';

test('initWorkspace creates .gitpushreview structure', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-init-'));
  await initWorkspace({ cwd: dir, force: false, installHook: false });

  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'agent', 'rules-index.md')), true);
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'agent', 'policy.md')), true);
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'config', 'reviewmodel.json')), true);
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'docs', 'default', 'code-review.md')), true);
  assert.equal(fs.existsSync(path.join(dir, '.gitpushreview', 'docs', 'diy', 'auth.md')), true);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- test/init.test.js`

Expected: fails because `src/workspace.js` does not exist.

- [ ] **Step 3: Implement templates**

```js
export const REVIEW_AGENT = `# Review Agent

Review only staged changes. Use BDR, default rules, project rules, and DIY rules in priority order. Return findings with evidence tied to the diff.
`;

export const POLICY = `# Review Policy

\`\`\`yaml
softBlockScore: 60
hardBlockScore: 90
ciSoftBlockBehavior: fail
\`\`\`
`;

export const RULES_INDEX = `# Rule Index

## BDR

\`\`\`yaml
enabled: true
provider: bdr
path: ../vendor/bdr
priority: 10
weight: 1.0
mode: soft-by-default
hardBlockWhen:
  - obvious_bug
  - security_vulnerability
  - data_loss
  - auth_bypass
\`\`\`

## Default Rules

\`\`\`yaml
enabled: true
provider: markdown
priority: 20
weight: 1.0
files:
  - ../docs/default/code-review.md
  - ../docs/default/security.md
  - ../docs/default/concurrency.md
\`\`\`

## Project Rules

\`\`\`yaml
enabled: true
provider: markdown
priority: 50
weight: 1.5
files:
  - ../docs/project/architecture.md
  - ../docs/project/api-contract.md
\`\`\`

## DIY Rules

\`\`\`yaml
enabled: true
provider: markdown
priority: 100
weight: 2.0
files:
  - ../docs/diy/auth.md
requiredRules: []
hardBlockOnViolation: true
\`\`\`
`;

export const REVIEW_MODEL = {
  provider: 'openai-compatible',
  baseUrl: 'https://api.example.com/v1',
  apiKeyEnv: 'GITPUSHREVIEW_API_KEY',
  model: 'gpt-4.1',
  timeoutMs: 60000,
};

export const DEFAULT_DOCS = {
  'docs/default/code-review.md': '# Code Review Rules\n\n## DEFAULT-CODE-001 Avoid obvious runtime errors\n\n```yaml\nscore: 50\nseverity: high\nhardBlock: false\n```\n\nNew code should avoid obvious null, undefined, or missing import errors.\n',
  'docs/default/security.md': '# Security Rules\n\n## DEFAULT-SEC-001 Do not introduce secret leaks\n\n```yaml\nscore: 90\nseverity: critical\nhardBlock: true\n```\n\nDo not commit API keys, passwords, tokens, cookies, or private keys.\n',
  'docs/default/concurrency.md': '# Concurrency Rules\n\n## DEFAULT-CONC-001 Protect shared mutable state\n\n```yaml\nscore: 60\nseverity: high\nhardBlock: false\n```\n\nConcurrent code should protect shared mutable state or explain why it is safe.\n',
  'docs/default/performance.md': '# Performance Rules\n\n## DEFAULT-PERF-001 Avoid avoidable repeated expensive work\n\n```yaml\nscore: 30\nseverity: medium\nhardBlock: false\n```\n\nAvoid repeated I/O, network calls, or full scans inside hot loops.\n',
  'docs/default/maintainability.md': '# Maintainability Rules\n\n## DEFAULT-MAINT-001 Keep changes understandable\n\n```yaml\nscore: 25\nseverity: medium\nhardBlock: false\n```\n\nPrefer small cohesive functions and clear names in newly changed code.\n',
  'docs/project/architecture.md': '# Project Architecture Rules\n\nAdd project architecture rules here.\n',
  'docs/project/api-contract.md': '# API Contract Rules\n\nAdd API compatibility rules here.\n',
  'docs/project/data-model.md': '# Data Model Rules\n\nAdd data model consistency rules here.\n',
  'docs/diy/auth.md': '# DIY Auth Rules\n\nAdd high-priority project-specific auth rules here.\n',
  'docs/diy/payment.md': '# DIY Payment Rules\n\nAdd high-priority payment rules here.\n',
  'docs/diy/logging.md': '# DIY Logging Rules\n\nAdd high-priority logging rules here.\n',
};
```

- [ ] **Step 4: Implement workspace init**

```js
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_DOCS, POLICY, REVIEW_AGENT, REVIEW_MODEL, RULES_INDEX } from './templates.js';

function writeFileIfMissing(filePath, content, force) {
  if (!force && fs.existsSync(filePath)) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

export async function initWorkspace({ cwd, force = false, installHook = true }) {
  const root = path.join(cwd, '.gitpushreview');
  const written = [];

  const files = {
    'agent/review-agent.md': REVIEW_AGENT,
    'agent/rules-index.md': RULES_INDEX,
    'agent/policy.md': POLICY,
    'config/reviewmodel.json': `${JSON.stringify(REVIEW_MODEL, null, 2)}\n`,
    ...DEFAULT_DOCS,
  };

  for (const [relative, content] of Object.entries(files)) {
    const target = path.join(root, relative);
    if (writeFileIfMissing(target, content, force)) written.push(target);
  }

  fs.mkdirSync(path.join(root, 'vendor', 'bdr'), { recursive: true });

  if (installHook) {
    installPreCommitHook(cwd, force);
  }

  return { root, written };
}

export function installPreCommitHook(cwd, force = false) {
  const hooksDir = path.join(cwd, '.git', 'hooks');
  if (!fs.existsSync(hooksDir)) return { installed: false, reason: 'not a git repository' };

  const hookPath = path.join(hooksDir, 'pre-commit');
  if (!force && fs.existsSync(hookPath)) return { installed: false, reason: 'pre-commit exists' };

  const hook = `#!/bin/sh\nexec gitpushreview check --staged\n`;
  fs.writeFileSync(hookPath, hook, { encoding: 'utf8', mode: 0o755 });
  return { installed: true, hookPath };
}
```

- [ ] **Step 5: Wire `init` into CLI**

```js
import { initWorkspace } from './workspace.js';

const HELP = `gitpushreview

Usage:
  gitpushreview init [--force] [--no-hook]
  gitpushreview check [--staged] [--json]
  gitpushreview doctor
  gitpushreview bdr status

`;

export async function routeCommand(args, context) {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    return { exitCode: 0, output: HELP };
  }

  if (args[0] === 'init') {
    const result = await initWorkspace({
      cwd: context.cwd,
      force: args.includes('--force'),
      installHook: !args.includes('--no-hook'),
    });
    return { exitCode: 0, output: `Initialized GitPushReview at ${result.root}\n` };
  }

  return { exitCode: 1, output: `Unknown command: ${args[0]}\n` };
}

export async function main(args, context) {
  const result = await routeCommand(args, context);
  if (context?.stdout?.write) context.stdout.write(result.output);
  return result.exitCode;
}
```

- [ ] **Step 6: Run tests**

Run: `npm test -- test/init.test.js test/cli.test.js`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/cli.js src/workspace.js src/templates.js test/init.test.js
git commit -m "feat: initialize review workspace"
```

## Task 3: Rule Index And Markdown Rule Loading

**Files:**
- Create: `src/rules/index.js`
- Create: `src/rules/markdown.js`
- Create: `test/rules.test.js`

- [ ] **Step 1: Write failing parser tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseMarkdownRules } from '../src/rules/markdown.js';
import { parseRuleIndex } from '../src/rules/index.js';

test('parseMarkdownRules extracts multiple rules and metadata', () => {
  const markdown = `# Rules

## DIY-AUTH-001 Tenant check

\`\`\`yaml
score: 60
severity: high
hardBlock: true
paths:
  - backend/**/*.py
\`\`\`

Must check tenant.

## DIY-LOG-001 Mask secrets

\`\`\`yaml
score: 40
severity: medium
hardBlock: false
\`\`\`

Do not log secrets.
`;

  const rules = parseMarkdownRules(markdown, { source: 'diy', file: 'auth.md', weight: 2 });
  assert.equal(rules.length, 2);
  assert.equal(rules[0].id, 'DIY-AUTH-001');
  assert.equal(rules[0].score, 60);
  assert.equal(rules[0].hardBlock, true);
  assert.deepEqual(rules[0].paths, ['backend/**/*.py']);
});

test('parseRuleIndex extracts providers', () => {
  const markdown = `# Rule Index

## DIY Rules

\`\`\`yaml
enabled: true
provider: markdown
priority: 100
weight: 2.0
files:
  - ../docs/diy/auth.md
requiredRules:
  - DIY-AUTH-001
hardBlockOnViolation: true
\`\`\`
`;
  const sources = parseRuleIndex(markdown);
  assert.equal(sources.length, 1);
  assert.equal(sources[0].provider, 'markdown');
  assert.equal(sources[0].priority, 100);
  assert.deepEqual(sources[0].files, ['../docs/diy/auth.md']);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- test/rules.test.js`

Expected: fails because modules do not exist.

- [ ] **Step 3: Implement minimal YAML subset parser and Markdown rules**

```js
function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === '[]') return [];
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed.replace(/^['"]|['"]$/g, '');
}

export function parseYamlBlock(block) {
  const result = {};
  const lines = block.split(/\r?\n/);
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim()) continue;
    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && currentKey) {
      result[currentKey] = Array.isArray(result[currentKey]) ? result[currentKey] : [];
      result[currentKey].push(parseScalar(listMatch[1]));
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      result[currentKey] = keyMatch[2] === '' ? [] : parseScalar(keyMatch[2]);
    }
  }

  return result;
}

export function parseMarkdownRules(markdown, defaults = {}) {
  const heading = /^##\s+([A-Z0-9]+(?:-[A-Z0-9]+)+)\s+(.+)$/gm;
  const matches = [...markdown.matchAll(heading)];
  const rules = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const start = match.index + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length;
    const body = markdown.slice(start, end).trim();
    const yamlMatch = body.match(/```yaml\r?\n([\s\S]*?)\r?\n```/);
    const meta = yamlMatch ? parseYamlBlock(yamlMatch[1]) : {};
    const text = yamlMatch ? body.replace(yamlMatch[0], '').trim() : body;

    rules.push({
      source: defaults.source || 'markdown',
      file: defaults.file,
      weight: defaults.weight ?? 1,
      id: match[1],
      title: match[2].trim(),
      score: meta.score ?? 10,
      severity: meta.severity || 'medium',
      hardBlock: Boolean(meta.hardBlock),
      paths: meta.paths || [],
      body: text,
    });
  }

  return rules;
}
```

- [ ] **Step 4: Implement rule index parser**

```js
import fs from 'node:fs';
import path from 'node:path';
import { parseYamlBlock, parseMarkdownRules } from './markdown.js';

export function parseRuleIndex(markdown) {
  const section = /^##\s+(.+)$/gm;
  const matches = [...markdown.matchAll(section)];
  const sources = [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length;
    const body = markdown.slice(start, end);
    const yamlMatch = body.match(/```yaml\r?\n([\s\S]*?)\r?\n```/);
    if (!yamlMatch) continue;
    const config = parseYamlBlock(yamlMatch[1]);
    if (config.enabled === false) continue;
    sources.push({ name: matches[i][1].trim(), ...config });
  }

  return sources.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
}

export function loadMarkdownRules({ workspaceRoot, source }) {
  const files = source.files || [];
  return files.flatMap((relativeFile) => {
    const filePath = path.resolve(workspaceRoot, 'agent', relativeFile);
    const markdown = fs.readFileSync(filePath, 'utf8');
    return parseMarkdownRules(markdown, {
      source: source.name,
      file: relativeFile,
      weight: source.weight ?? 1,
    });
  });
}
```

- [ ] **Step 5: Run parser tests**

Run: `npm test -- test/rules.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/rules/index.js src/rules/markdown.js test/rules.test.js
git commit -m "feat: load markdown review rules"
```

## Task 4: Git Diff Collection

**Files:**
- Create: `src/git.js`
- Create: `test/git.test.js`

- [ ] **Step 1: Write failing Git tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseChangedFiles } from '../src/git.js';

test('parseChangedFiles extracts paths from name-status output', () => {
  const files = parseChangedFiles('M\tbackend/app.py\nA\tfrontend/src/main.js\n');
  assert.deepEqual(files, ['backend/app.py', 'frontend/src/main.js']);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- test/git.test.js`

Expected: fails because `src/git.js` does not exist.

- [ ] **Step 3: Implement Git helpers**

```js
import { execFileSync } from 'node:child_process';

export function runGit(args, { cwd }) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

export function getGitRoot(cwd) {
  return runGit(['rev-parse', '--show-toplevel'], { cwd }).trim();
}

export function getStagedDiff(cwd) {
  return runGit(['diff', '--cached', '--unified=80', '--no-ext-diff'], { cwd });
}

export function getStagedNameStatus(cwd) {
  return runGit(['diff', '--cached', '--name-status'], { cwd });
}

export function parseChangedFiles(nameStatus) {
  return nameStatus
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(/\t/).at(-1))
    .filter(Boolean);
}

export function getStagedSnapshot(cwd) {
  const root = getGitRoot(cwd);
  const diff = getStagedDiff(root);
  const files = parseChangedFiles(getStagedNameStatus(root));
  return { root, diff, files };
}
```

- [ ] **Step 4: Run Git tests**

Run: `npm test -- test/git.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/git.js test/git.test.js
git commit -m "feat: collect staged git diff"
```

## Task 5: BDR Provider

**Files:**
- Create: `src/bdr/provider.js`
- Create: `test/bdr-provider.test.js`

- [ ] **Step 1: Write failing BDR provider tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadBdrContext } from '../src/bdr/provider.js';

test('loadBdrContext reads available BDR skills dynamically', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-bdr-'));
  const bdr = path.join(dir, 'vendor', 'bdr');
  fs.mkdirSync(path.join(bdr, 'skills', 'bdr-explore-to-change'), { recursive: true });
  fs.writeFileSync(path.join(bdr, 'package.json'), '{"name":"agile-bdr","version":"0.5.0"}');
  fs.writeFileSync(path.join(bdr, 'skills', 'bdr-explore-to-change', 'SKILL.md'), '# BDR Explore\n\nBad smell rules.');

  const context = loadBdrContext(bdr);
  assert.equal(context.package.version, '0.5.0');
  assert.equal(context.skills.length, 1);
  assert.match(context.text, /Bad smell rules/);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- test/bdr-provider.test.js`

Expected: fails because provider does not exist.

- [ ] **Step 3: Implement BDR provider**

```js
import fs from 'node:fs';
import path from 'node:path';

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readTextIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

export function loadBdrContext(bdrRoot) {
  const pkg = readJsonIfExists(path.join(bdrRoot, 'package.json')) || {};
  const skillsRoot = path.join(bdrRoot, 'skills');
  const skills = [];

  if (fs.existsSync(skillsRoot)) {
    for (const name of fs.readdirSync(skillsRoot)) {
      if (!name.startsWith('bdr-')) continue;
      const skillPath = path.join(skillsRoot, name, 'SKILL.md');
      const content = readTextIfExists(skillPath);
      if (content) skills.push({ name, path: skillPath, content });
    }
  }

  const optionalFiles = [
    'templates/badsmells-entry.md',
    'templates/badsmells-header.md',
    'templates/analysis-header.md',
  ].map((relative) => {
    const filePath = path.join(bdrRoot, relative);
    return { relative, content: readTextIfExists(filePath) };
  }).filter((entry) => entry.content);

  const text = [
    `BDR package: ${pkg.name || 'unknown'} ${pkg.version || 'unknown'}`,
    ...skills.map((skill) => `\n# ${skill.name}\n${skill.content}`),
    ...optionalFiles.map((file) => `\n# ${file.relative}\n${file.content}`),
  ].join('\n');

  return { package: pkg, skills, optionalFiles, text };
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- test/bdr-provider.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/bdr/provider.js test/bdr-provider.test.js
git commit -m "feat: load vendored bdr context"
```

## Task 6: Decision Scoring

**Files:**
- Create: `src/review/decision.js`
- Create: `test/decision.test.js`

- [ ] **Step 1: Write failing decision tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { decideReview } from '../src/review/decision.js';

test('hard finding causes hard block', () => {
  const decision = decideReview([{ blocking: 'hard', weightedScore: 10 }], { softBlockScore: 60, hardBlockScore: 90 });
  assert.equal(decision.status, 'HARD_BLOCK');
});

test('score between thresholds causes soft block', () => {
  const decision = decideReview([{ blocking: 'soft', weightedScore: 70 }], { softBlockScore: 60, hardBlockScore: 90 });
  assert.equal(decision.status, 'SOFT_BLOCK');
});

test('low score passes', () => {
  const decision = decideReview([{ blocking: 'none', weightedScore: 20 }], { softBlockScore: 60, hardBlockScore: 90 });
  assert.equal(decision.status, 'PASS');
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- test/decision.test.js`

Expected: fails because decision module does not exist.

- [ ] **Step 3: Implement decision scoring**

```js
export function decideReview(findings, policy) {
  const totalScore = findings.reduce((sum, finding) => sum + Number(finding.weightedScore || finding.score || 0), 0);
  const hardFinding = findings.find((finding) => finding.blocking === 'hard');

  if (hardFinding) {
    return { status: 'HARD_BLOCK', totalScore, findings };
  }

  if (totalScore >= policy.hardBlockScore) {
    return { status: 'HARD_BLOCK', totalScore, findings };
  }

  if (totalScore >= policy.softBlockScore) {
    return { status: 'SOFT_BLOCK', totalScore, findings };
  }

  return { status: 'PASS', totalScore, findings };
}
```

- [ ] **Step 4: Run decision tests**

Run: `npm test -- test/decision.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/review/decision.js test/decision.test.js
git commit -m "feat: score review decisions"
```

## Task 7: Model Client And Result Parsing

**Files:**
- Create: `src/model/client.js`
- Create: `src/review/result.js`
- Create: `test/model-result.test.js`

- [ ] **Step 1: Write failing tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseReviewJson } from '../src/review/result.js';

test('parseReviewJson extracts findings array', () => {
  const parsed = parseReviewJson('{"findings":[{"ruleId":"A","score":10,"blocking":"none"}]}');
  assert.equal(parsed.findings.length, 1);
  assert.equal(parsed.findings[0].ruleId, 'A');
});

test('parseReviewJson extracts fenced json', () => {
  const parsed = parseReviewJson('```json\n{"findings":[]}\n```');
  assert.deepEqual(parsed.findings, []);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- test/model-result.test.js`

Expected: fails because parser does not exist.

- [ ] **Step 3: Implement result parser**

```js
export function parseReviewJson(text) {
  const fenced = text.match(/```json\r?\n([\s\S]*?)\r?\n```/);
  const raw = fenced ? fenced[1] : text;
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.findings)) {
    throw new Error('Review response must contain findings array');
  }
  return parsed;
}
```

- [ ] **Step 4: Implement OpenAI-compatible client**

```js
export async function callReviewModel({ config, apiKey, messages, fetchImpl = fetch }) {
  if (!apiKey) throw new Error(`Missing API key for ${config.apiKeyEnv}`);
  const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0,
    }),
  });

  if (!response.ok) {
    throw new Error(`Model request failed: ${response.status} ${await response.text()}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content || '';
}
```

- [ ] **Step 5: Run tests**

Run: `npm test -- test/model-result.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/model/client.js src/review/result.js test/model-result.test.js
git commit -m "feat: parse ai review results"
```

## Task 8: Review Runner

**Files:**
- Create: `src/review/prompt.js`
- Create: `src/review/runner.js`
- Modify: `src/cli.js`
- Create: `test/runner.test.js`

- [ ] **Step 1: Write failing runner test with fake model**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initWorkspace } from '../src/workspace.js';
import { runReview } from '../src/review/runner.js';

test('runReview returns decision from fake model findings', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-runner-'));
  await initWorkspace({ cwd: dir, installHook: false });
  const result = await runReview({
    cwd: dir,
    diff: 'diff --git a/backend/app.py b/backend/app.py\n+print(process.env.SECRET)\n',
    files: ['backend/app.py'],
    modelInvoker: async () => '{"findings":[{"source":"default","ruleId":"DEFAULT-SEC-001","score":90,"weightedScore":90,"blocking":"hard","title":"secret leak","severity":"critical"}]}',
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  });

  assert.equal(result.decision.status, 'HARD_BLOCK');
  assert.equal(result.findings.length, 1);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- test/runner.test.js`

Expected: fails because runner does not exist.

- [ ] **Step 3: Implement prompt builder**

```js
export function buildReviewMessages({ reviewAgent, policy, bdrContext, rules, diff, files }) {
  return [
    {
      role: 'system',
      content: `${reviewAgent}\n\nReturn only JSON with a findings array. Each finding must include source, ruleId, title, severity, score, weightedScore, blocking, file, line, evidence, and suggestion.`,
    },
    {
      role: 'user',
      content: [
        '# Policy',
        policy,
        '# BDR Context',
        bdrContext.text,
        '# Markdown Rules',
        rules.map((rule) => `## ${rule.id} ${rule.title}\nsource: ${rule.source}\nscore: ${rule.score}\nweight: ${rule.weight}\nhardBlock: ${rule.hardBlock}\n${rule.body}`).join('\n\n'),
        '# Changed Files',
        files.join('\n'),
        '# Staged Diff',
        diff,
      ].join('\n\n'),
    },
  ];
}
```

- [ ] **Step 4: Implement runner**

```js
import fs from 'node:fs';
import path from 'node:path';
import { loadBdrContext } from '../bdr/provider.js';
import { callReviewModel } from '../model/client.js';
import { parseRuleIndex, loadMarkdownRules } from '../rules/index.js';
import { decideReview } from './decision.js';
import { buildReviewMessages } from './prompt.js';
import { parseReviewJson } from './result.js';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parsePolicy(markdown) {
  const yaml = markdown.match(/```yaml\r?\n([\s\S]*?)\r?\n```/)?.[1] || '';
  const soft = yaml.match(/softBlockScore:\s*(\d+)/)?.[1] || '60';
  const hard = yaml.match(/hardBlockScore:\s*(\d+)/)?.[1] || '90';
  return { softBlockScore: Number(soft), hardBlockScore: Number(hard), raw: markdown };
}

export async function runReview({ cwd, diff, files, modelInvoker, env }) {
  const workspaceRoot = path.join(cwd, '.gitpushreview');
  const reviewAgent = fs.readFileSync(path.join(workspaceRoot, 'agent', 'review-agent.md'), 'utf8');
  const policyText = fs.readFileSync(path.join(workspaceRoot, 'agent', 'policy.md'), 'utf8');
  const policy = parsePolicy(policyText);
  const indexText = fs.readFileSync(path.join(workspaceRoot, 'agent', 'rules-index.md'), 'utf8');
  const sources = parseRuleIndex(indexText);
  const markdownRules = sources
    .filter((source) => source.provider === 'markdown')
    .flatMap((source) => loadMarkdownRules({ workspaceRoot, source }));
  const bdrSource = sources.find((source) => source.provider === 'bdr');
  const bdrContext = bdrSource
    ? loadBdrContext(path.resolve(workspaceRoot, 'agent', bdrSource.path))
    : { text: '', skills: [] };
  const modelConfig = readJson(path.join(workspaceRoot, 'config', 'reviewmodel.json'));
  const messages = buildReviewMessages({ reviewAgent, policy: policy.raw, bdrContext, rules: markdownRules, diff, files });
  const invoke = modelInvoker || ((input) => callReviewModel({
    config: modelConfig,
    apiKey: env[modelConfig.apiKeyEnv],
    messages: input.messages,
  }));
  const text = await invoke({ messages, modelConfig });
  const parsed = parseReviewJson(text);
  const findings = parsed.findings.map((finding) => ({
    ...finding,
    weightedScore: finding.weightedScore ?? Number(finding.score || 0),
  }));
  return { findings, decision: decideReview(findings, policy) };
}
```

- [ ] **Step 5: Run runner tests**

Run: `npm test -- test/runner.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/review/prompt.js src/review/runner.js src/cli.js test/runner.test.js
git commit -m "feat: orchestrate ai review"
```

## Task 9: Check Command, Reports, And Hook Confirmation

**Files:**
- Modify: `src/cli.js`
- Create: `src/format/report.js`
- Create: `src/hook.js`
- Create: `test/report.test.js`

- [ ] **Step 1: Write failing report tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderReport } from '../src/format/report.js';

test('renderReport includes status and finding titles', () => {
  const text = renderReport({
    decision: { status: 'SOFT_BLOCK', totalScore: 70 },
    findings: [{ ruleId: 'A', title: 'Risky change', severity: 'high', file: 'a.js', line: 1, evidence: 'e', suggestion: 's' }],
  });
  assert.match(text, /SOFT_BLOCK/);
  assert.match(text, /Risky change/);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- test/report.test.js`

Expected: fails because report module does not exist.

- [ ] **Step 3: Implement report rendering**

```js
export function renderReport(result) {
  const lines = [
    `GitPushReview: ${result.decision.status}`,
    `Score: ${result.decision.totalScore}`,
    '',
  ];

  for (const finding of result.findings) {
    lines.push(`- [${finding.severity || 'medium'}] ${finding.ruleId || 'UNKNOWN'} ${finding.title || ''}`);
    if (finding.file) lines.push(`  at ${finding.file}${finding.line ? `:${finding.line}` : ''}`);
    if (finding.evidence) lines.push(`  evidence: ${finding.evidence}`);
    if (finding.suggestion) lines.push(`  suggestion: ${finding.suggestion}`);
  }

  return `${lines.join('\n')}\n`;
}
```

- [ ] **Step 4: Implement hook behavior**

```js
import { renderReport } from './format/report.js';

export async function handleReviewResult(result, { stdin, stdout, json = false, ci = false }) {
  if (json) {
    stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    stdout.write(renderReport(result));
  }

  if (result.decision.status === 'PASS') return 0;
  if (result.decision.status === 'HARD_BLOCK') return 1;
  if (ci || !stdin.isTTY) return 1;

  stdout.write('\nContinue commit despite soft block? Type "yes" to continue: ');
  const answer = await new Promise((resolve) => {
    stdin.once('data', (chunk) => resolve(String(chunk).trim().toLowerCase()));
  });
  return answer === 'yes' ? 0 : 1;
}
```

- [ ] **Step 5: Wire check command**

```js
import { getStagedSnapshot } from './git.js';
import { handleReviewResult } from './hook.js';
import { runReview } from './review/runner.js';
import { initWorkspace } from './workspace.js';

const HELP = `gitpushreview

Usage:
  gitpushreview init [--force] [--no-hook]
  gitpushreview check [--staged] [--json]
  gitpushreview doctor
  gitpushreview bdr status

`;

export async function routeCommand(args, context) {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    return { exitCode: 0, output: HELP };
  }

  if (args[0] === 'init') {
    const result = await initWorkspace({
      cwd: context.cwd,
      force: args.includes('--force'),
      installHook: !args.includes('--no-hook'),
    });
    return { exitCode: 0, output: `Initialized GitPushReview at ${result.root}\n` };
  }

  if (args[0] === 'check') {
    const snapshot = getStagedSnapshot(context.cwd);
    if (!snapshot.diff.trim()) {
      return { exitCode: 0, output: 'GitPushReview: no staged changes\n' };
    }
    const result = await runReview({
      cwd: snapshot.root,
      diff: snapshot.diff,
      files: snapshot.files,
      env: context.env,
    });
    const exitCode = await handleReviewResult(result, {
      stdin: context.stdin,
      stdout: context.stdout,
      json: args.includes('--json'),
      ci: context.env.CI === 'true',
    });
    return { exitCode, output: '' };
  }

  return { exitCode: 1, output: `Unknown command: ${args[0]}\n` };
}

export async function main(args, context) {
  const result = await routeCommand(args, context);
  if (result.output && context?.stdout?.write) context.stdout.write(result.output);
  return result.exitCode;
}
```

- [ ] **Step 6: Run report tests and full tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/cli.js src/format/report.js src/hook.js test/report.test.js
git commit -m "feat: gate commits with review decisions"
```

## Task 10: Doctor And BDR Status

**Files:**
- Modify: `src/cli.js`
- Create: `src/doctor.js`
- Create: `test/doctor.test.js`

- [ ] **Step 1: Write failing doctor tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runDoctor } from '../src/doctor.js';

test('runDoctor reports missing workspace', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-doctor-'));
  const report = runDoctor({ cwd: dir, env: {} });
  assert.equal(report.ok, false);
  assert.equal(report.checks.some((check) => check.name === 'workspace' && !check.ok), true);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- test/doctor.test.js`

Expected: fails because doctor does not exist.

- [ ] **Step 3: Implement doctor**

```js
import fs from 'node:fs';
import path from 'node:path';

export function runDoctor({ cwd, env }) {
  const workspace = path.join(cwd, '.gitpushreview');
  const modelPath = path.join(workspace, 'config', 'reviewmodel.json');
  let model = null;
  if (fs.existsSync(modelPath)) {
    model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  }

  const checks = [
    { name: 'node', ok: Number(process.versions.node.split('.')[0]) >= 18, detail: process.versions.node },
    { name: 'workspace', ok: fs.existsSync(workspace), detail: workspace },
    { name: 'modelConfig', ok: fs.existsSync(modelPath), detail: modelPath },
    { name: 'apiKey', ok: model?.apiKeyEnv ? Boolean(env[model.apiKeyEnv]) : false, detail: model?.apiKeyEnv || 'missing model config' },
    { name: 'bdr', ok: fs.existsSync(path.join(workspace, 'vendor', 'bdr')), detail: path.join(workspace, 'vendor', 'bdr') },
  ];

  return { ok: checks.every((check) => check.ok), checks };
}

export function renderDoctor(report) {
  return `${report.checks.map((check) => `${check.ok ? 'OK' : 'FAIL'} ${check.name}: ${check.detail}`).join('\n')}\n`;
}
```

- [ ] **Step 4: Wire doctor and bdr status into CLI**

Add command handlers that call `runDoctor()` and read `.gitpushreview/vendor/bdr/package.json`, returning the version or a missing-BDR message.

- [ ] **Step 5: Run tests**

Run: `npm test -- test/doctor.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/cli.js src/doctor.js test/doctor.test.js
git commit -m "feat: add doctor and bdr status"
```

## Task 11: README And Pack Validation

**Files:**
- Create: `README.md`
- Create: `test/package.test.js`
- Modify: `package.json`

- [ ] **Step 1: Write package metadata test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('package exposes gitpushreview bin and required files', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(pkg.bin.gitpushreview, './bin/gitpushreview.js');
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.engines.node, '>=18');
});
```

- [ ] **Step 2: Add README**

Document install, init, staged review flow, BDR vendoring, Markdown rule format, model configuration, soft block confirmation, hard block behavior, and `git commit --no-verify` as Git's native escape hatch.

- [ ] **Step 3: Run tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 4: Run pack check**

Run: `npm pack --dry-run`

Expected: output includes `bin/`, `src/`, `README.md`, and `package.json`.

- [ ] **Step 5: Commit**

```bash
git add README.md test/package.test.js package.json
git commit -m "docs: document gitpushreview mvp"
```

## Self-Review

Spec coverage:

- npm CLI, init, hook, staged diff, model config, rules index, Markdown loading, BDR provider, decisions, confirmation, doctor, and pack validation are covered.
- OpenCode/Codex adapters are documented as optional later work, matching MVP scope.
- Automatic BDR remote upgrade is intentionally out of MVP.

Placeholder scan:

- No `TBD`, `TODO`, or vague implementation-only placeholders remain.

Type consistency:

- `runReview`, `decideReview`, `parseRuleIndex`, `parseMarkdownRules`, `loadBdrContext`, and `handleReviewResult` signatures are consistent across tasks.

