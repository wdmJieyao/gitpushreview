import fs from 'node:fs';
import path from 'node:path';

export const REVIEW_MODES = new Set(['skip', 'log', 'normal']);

export function normalizeReviewMode(value) {
  if (value === undefined || value === null || value === '') {
    return { mode: 'normal', source: 'missing', message: '未配置审核模式，使用正常拦截模式。' };
  }

  const mode = String(value).trim().toLowerCase();
  if (!REVIEW_MODES.has(mode)) {
    throw new Error(`审核模式无效：${value}。支持的模式：skip、log、normal。`);
  }

  const messages = {
    skip: 'GitPushReview 当前已通过配置跳过检查，本次不会发起审核，也不会拦截提交。',
    log: 'GitPushReview 当前处于日志模式：会发起审核并输出结果，但不会拦截提交。',
    normal: 'GitPushReview 当前处于正常模式：会发起审核，不满足条件时会拦截。',
  };
  return { mode, source: 'config', message: messages[mode] };
}

export function readReviewModeConfig(workspaceRoot) {
  const candidates = [
    path.join(workspaceRoot, 'config', 'review-mode.json'),
    path.join(workspaceRoot, 'config', 'reviewmode.json'),
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return normalizeReviewMode(parsed.mode);
  }

  return normalizeReviewMode(undefined);
}

export function loadReviewMode(cwd) {
  return readReviewModeConfig(path.join(cwd, '.gitpushreview'));
}

export function renderReviewModeConfig() {
  return `${JSON.stringify({
    mode: 'normal',
    description: 'skip=永久跳过检查；log=只输出日志不拦截；normal=正常审核并按结果拦截',
  }, null, 2)}\n`;
}
