import fs from 'node:fs';
import path from 'node:path';
import { resolveApiKey } from './model/client.js';

const CHECK_LABELS = {
  node: 'Node 版本',
  workspace: '工作目录',
  modelConfig: '大模型配置',
  apiKey: 'API 密钥',
  bdr: 'BDR 检测器',
};

export function runDoctor({ cwd, env }) {
  const workspace = path.join(cwd, '.gitpushreview');
  const modelPath = path.join(workspace, 'config', 'reviewmodel.json');
  let model = null;
  if (fs.existsSync(modelPath)) {
    model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  }

  const apiKey = model ? resolveApiKey({ config: model, env }) : '';
  const apiKeyDetail = model?.apiKey
    ? '配置文件中的 apiKey'
    : model?.apiKeyEnv || '缺少大模型配置';
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
  return `${report.checks.map((check) => `${check.ok ? '通过' : '失败'} ${CHECK_LABELS[check.name] || check.name}: ${check.detail}`).join('\n')}\n`;
}

export function readBdrStatus(cwd) {
  const packagePath = path.join(cwd, '.gitpushreview', 'vendor', 'bdr', 'package.json');
  if (!fs.existsSync(packagePath)) {
    return { exists: false, text: '未找到 BDR：.gitpushreview/vendor/bdr\n' };
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return {
    exists: true,
    text: `BDR 包：${pkg.name || '未知'} ${pkg.version || '未知'}\n`,
  };
}
