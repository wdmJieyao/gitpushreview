import fs from 'node:fs';
import path from 'node:path';
import { resolveApiKey } from './model/client.js';

export function runDoctor({ cwd, env }) {
  const workspace = path.join(cwd, '.gitpushreview');
  const modelPath = path.join(workspace, 'config', 'reviewmodel.json');
  let model = null;
  if (fs.existsSync(modelPath)) {
    model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  }

  const apiKey = model ? resolveApiKey({ config: model, env }) : '';
  const apiKeyDetail = model?.apiKey
    ? 'reviewmodel.json apiKey'
    : model?.apiKeyEnv || 'missing model config';
  const checks = [
    { name: 'node', ok: Number(process.versions.node.split('.')[0]) >= 18, detail: process.versions.node },
    { name: 'workspace', ok: fs.existsSync(workspace), detail: workspace },
    { name: 'modelConfig', ok: fs.existsSync(modelPath), detail: modelPath },
    { name: 'apiKey', ok: Boolean(apiKey), detail: apiKeyDetail },
    { name: 'bdr', ok: fs.existsSync(path.join(workspace, 'vendor', 'bdr')), detail: path.join(workspace, 'vendor', 'bdr') },
  ];

  return { ok: checks.every((check) => check.ok), checks };
}

export function renderDoctor(report) {
  return `${report.checks.map((check) => `${check.ok ? 'OK' : 'FAIL'} ${check.name}: ${check.detail}`).join('\n')}\n`;
}

export function readBdrStatus(cwd) {
  const packagePath = path.join(cwd, '.gitpushreview', 'vendor', 'bdr', 'package.json');
  if (!fs.existsSync(packagePath)) {
    return { exists: false, text: 'BDR is not vendored at .gitpushreview/vendor/bdr\n' };
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return {
    exists: true,
    text: `BDR package: ${pkg.name || 'unknown'} ${pkg.version || 'unknown'}\n`,
  };
}
