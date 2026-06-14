import { renderReport } from './format/report.js';

const SOFT_BLOCK_CONFIRMATIONS = new Set(['yes', 'y', '是', '确认', '继续']);

export async function handleReviewResult(result, { stdin, stdout, json = false, ci = false }) {
  if (json) {
    stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    stdout.write(renderReport(result));
  }

  if (result.decision.status === 'PASS') return 0;
  if (result.decision.status === 'HARD_BLOCK') return 1;
  if (ci || !stdin.isTTY) return 1;

  stdout.write('\n检测到软拦截风险，仍要继续提交吗？输入“确认”或“yes”继续：');
  const answer = await new Promise((resolve) => {
    stdin.once('data', (chunk) => resolve(String(chunk).trim().toLowerCase()));
  });
  return SOFT_BLOCK_CONFIRMATIONS.has(answer) ? 0 : 1;
}
