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

test('runReview prefers apiKey from reviewmodel config over environment variable', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-runner-config-key-'));
  await initWorkspace({ cwd: dir, installHook: false });
  const modelPath = path.join(dir, '.gitpushreview', 'config', 'reviewmodel.json');
  const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  fs.writeFileSync(modelPath, `${JSON.stringify({ ...model, apiKey: 'config-key' }, null, 2)}\n`, 'utf8');

  let observedModelConfig = null;
  const result = await runReview({
    cwd: dir,
    diff: 'diff --git a/frontend/src/pages/Login.vue b/frontend/src/pages/Login.vue\n+<div v-html="notice"></div>\n',
    files: ['frontend/src/pages/Login.vue'],
    modelInvoker: async ({ modelConfig }) => {
      observedModelConfig = modelConfig;
      return '{"findings":[]}';
    },
    env: { GITPUSHREVIEW_API_KEY: 'env-key' },
  });

  assert.equal(observedModelConfig.apiKey, 'config-key');
  assert.equal(result.decision.status, 'PASS');
});

test('runReview sends deterministic SQL evidence to AI without deciding by itself', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-runner-deterministic-sql-'));
  await initWorkspace({ cwd: dir, installHook: false });
  let called = false;
  let prompt = '';

  const result = await runReview({
    cwd: dir,
    diff: "diff --git a/sql/test.sql b/sql/test.sql\nnew file mode 100644\n--- /dev/null\n+++ b/sql/test.sql\n@@ -0,0 +1 @@\n+insert into users (id, name, email) values (1, 'Alice');\n",
    files: ['sql/test.sql'],
    modelInvoker: async ({ messages }) => {
      called = true;
      prompt = messages[1].content;
      return '{"findings":[]}';
    },
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  });

  assert.equal(called, true);
  assert.match(prompt, /DEFAULT-SQL-INSERT-ARITY-001/);
  assert.equal(result.decision.status, 'PASS');
  assert.deepEqual(result.findings, []);
  assert.equal(result.deterministicFindings[0].ruleId, 'DEFAULT-SQL-INSERT-ARITY-001');
});

test('runReview uses staged file contents for static evidence context', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-runner-staged-blob-'));
  await initWorkspace({ cwd: dir, installHook: false });

  const result = await runReview({
    cwd: dir,
    diff: "diff --git a/sql/test.sql b/sql/test.sql\n@@ -0,0 +1 @@\n+insert into users(id, name) values (1, 'ok');\n",
    files: ['sql/test.sql'],
    fileContents: { 'sql/test.sql': 'insert into users(id, name) values (1);' },
    modelInvoker: async () => '{"findings":[]}',
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  });

  assert.equal(result.decision.status, 'PASS');
  assert.equal(result.deterministicFindings[0].ruleId, 'DEFAULT-SQL-INSERT-ARITY-001');
});

test('runReview still calls model when deterministic gates pass', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-runner-deterministic-pass-'));
  await initWorkspace({ cwd: dir, installHook: false });
  let called = false;

  const result = await runReview({
    cwd: dir,
    diff: "diff --git a/sql/good.sql b/sql/good.sql\nnew file mode 100644\n--- /dev/null\n+++ b/sql/good.sql\n@@ -0,0 +1 @@\n+insert into users (id, name) values (1, 'Alice');\n",
    files: ['sql/good.sql'],
    modelInvoker: async () => {
      called = true;
      return '{"findings":[]}';
    },
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  });

  assert.equal(called, true);
  assert.equal(result.decision.status, 'PASS');
});

test('runReview downgrades hard model findings when the matched rule is soft-only', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-runner-soft-only-'));
  await initWorkspace({ cwd: dir, installHook: false });
  const result = await runReview({
    cwd: dir,
    diff: 'diff --git a/src/main/java/App.java b/src/main/java/App.java\n+management.endpoints.web.exposure.include("*");\n',
    files: ['src/main/java/App.java'],
    fileContents: { 'src/main/java/App.java': 'class App { void expose(){ management.endpoints.web.exposure.include("*"); } }\n' },
    modelInvoker: async () =>
      '{"findings":[{"source":"default","ruleId":"DEFAULT-JAVA-SPR-005","score":85,"weightedScore":85,"blocking":"hard","title":"Actuator 暴露","severity":"critical"}]}',
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  });

  assert.equal(result.findings[0].blocking, 'soft');
  assert.equal(result.decision.status, 'SOFT_BLOCK');
});

test('runReview hard-blocks only when AI returns hard finding for static SQL evidence', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpr-runner-ai-hard-sql-'));
  await initWorkspace({ cwd: dir, installHook: false });

  const result = await runReview({
    cwd: dir,
    diff: "diff --git a/sql/test.sql b/sql/test.sql\nnew file mode 100644\n--- /dev/null\n+++ b/sql/test.sql\n@@ -0,0 +1 @@\n+insert into users (id, name, email) values (1, 'Alice');\n",
    files: ['sql/test.sql'],
    modelInvoker: async () => '{"findings":[{"source":"default","ruleId":"DEFAULT-SQL-INSERT-ARITY-001","score":95,"weightedScore":95,"blocking":"hard","title":"INSERT 列值数量不一致","severity":"critical","evidence":"AI 复审静态证据后确认 INSERT 写入列和值数量不一致。","suggestion":"补齐 values 或删除多余列后重新提交。"}]}',
    env: { GITPUSHREVIEW_API_KEY: 'test' },
  });

  assert.equal(result.decision.status, 'HARD_BLOCK');
  assert.equal(result.findings[0].source, 'default');
  assert.equal(result.deterministicFindings[0].source, 'deterministic');
});
