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
