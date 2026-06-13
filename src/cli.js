import { initWorkspace } from './workspace.js';
import { getStagedSnapshot } from './git.js';
import { handleReviewResult } from './hook.js';
import { runReview } from './review/runner.js';
import { readBdrStatus, renderDoctor, runDoctor } from './doctor.js';

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

  if (args[0] === 'doctor') {
    const report = runDoctor({ cwd: context.cwd, env: context.env });
    return { exitCode: report.ok ? 0 : 1, output: renderDoctor(report) };
  }

  if (args[0] === 'bdr' && args[1] === 'status') {
    const status = readBdrStatus(context.cwd);
    return { exitCode: status.exists ? 0 : 1, output: status.text };
  }

  return { exitCode: 1, output: `Unknown command: ${args[0]}\n` };
}

export async function main(args, context) {
  const result = await routeCommand(args, context);
  if (result.output && context?.stdout?.write) {
    context.stdout.write(result.output);
  }
  return result.exitCode;
}
