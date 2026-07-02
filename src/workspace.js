import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_DOCS, POLICY, REVIEW_AGENT, REVIEW_MODEL, RULES_INDEX } from './templates.js';
import { renderReviewModeConfig } from './review/mode.js';

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function writeFileIfMissing(filePath, content, force) {
  if (!force && fs.existsSync(filePath)) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

export async function initWorkspace({ cwd, force = false, installHook = true, hookInstaller = installPreCommitHook }) {
  const root = path.join(cwd, '.gitpushreview');
  const written = [];

  const files = {
    'agent/review-agent.md': REVIEW_AGENT,
    'agent/rules-index.md': RULES_INDEX,
    'agent/policy.md': POLICY,
    'config/reviewmodel.json': `${JSON.stringify(REVIEW_MODEL, null, 2)}\n`,
    'config/review-mode.json': renderReviewModeConfig(),
    ...DEFAULT_DOCS,
  };

  for (const [relative, content] of Object.entries(files)) {
    const target = path.join(root, relative);
    if (writeFileIfMissing(target, content, force)) written.push(target);
  }

  copyVendoredBdr(path.join(root, 'vendor', 'bdr'), force);

  let hook = { installed: false, reason: 'skipped' };
  if (installHook) {
    hook = installHookSafely({ cwd, force, hookInstaller });
  }

  return { root, written, hook };
}

function installHookSafely({ cwd, force, hookInstaller }) {
  try {
    return hookInstaller(cwd, force);
  } catch (error) {
    const permissionDenied = error?.code === 'EACCES' || error?.code === 'EPERM' || /permission denied|access denied/i.test(error?.message || '');
    if (!permissionDenied) throw error;
    return {
      installed: false,
      reason: 'permission-denied',
      error: error.message,
      manualCheckAvailable: true,
      guidance: '无法写入 Git hook。工作区已初始化，可以手动执行 gitpushreview check --staged，或在有权限时将仓库本地 hook 指向该命令。',
    };
  }
}

function copyDirectory(source, target, force) {
  if (!fs.existsSync(source)) {
    fs.mkdirSync(target, { recursive: true });
    return false;
  }

  if (fs.existsSync(target) && !force) return false;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, {
    recursive: true,
    force: true,
    errorOnExist: false,
    filter: (entry) => !entry.split(path.sep).includes('.git'),
  });
  return true;
}

function copyVendoredBdr(target, force) {
  const source = path.join(PACKAGE_ROOT, 'vendor', 'bdr');
  return copyDirectory(source, target, force);
}

export function installPreCommitHook(cwd, force = false) {
  const hooksDir = path.join(cwd, '.git', 'hooks');
  if (!fs.existsSync(hooksDir)) return { installed: false, reason: 'not a git repository' };

  const hookPath = path.join(hooksDir, 'pre-commit');
  if (!force && fs.existsSync(hookPath)) {
    return {
      installed: false,
      reason: 'pre-commit exists',
      manualCheckAvailable: true,
      guidance: '检测到已有 pre-commit hook，已保留。可以手动执行 gitpushreview check --staged，或使用 --force 明确替换。',
    };
  }

  const hook = '#!/bin/sh\nexec gitpushreview check --staged\n';
  fs.writeFileSync(hookPath, hook, { encoding: 'utf8', mode: 0o755 });
  return { installed: true, hookPath, manualCheckAvailable: true };
}
