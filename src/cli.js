import { initWorkspace } from './workspace.js';
import { getStagedSnapshot } from './git.js';
import { handleReviewResult } from './hook.js';
import { runReview } from './review/runner.js';
import { readBdrStatus, renderDoctor, runDoctor } from './doctor.js';
import { explainFile, explainHelp, explainStaged } from './explain.js';
import { inspectProjectProfile, renderProjectProfile } from './profile.js';

const HELP = `gitpushreview

用法：
  gitpushreview init [--force] [--no-hook]
  gitpushreview check [--staged] [--json]
  gitpushreview explain <file|--staged> [--json]
  gitpushreview profile [--json]
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
    return { exitCode: 0, output: `GitPushReview 已初始化：${result.root}\n` };
  }

  if (args[0] === 'check') {
    const snapshot = getStagedSnapshot(context.cwd);
    if (!snapshot.diff.trim()) {
      return { exitCode: 0, output: 'GitPushReview：没有检测到已暂存的变更\n' };
    }
    const result = await runReview({
      cwd: snapshot.root,
      diff: snapshot.diff,
      files: snapshot.files,
      fileContents: snapshot.fileContents,
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

  if (args[0] === 'explain') {
    if (args.length === 1 || (args.length === 2 && args.includes('--json'))) {
      return { exitCode: 0, output: explainHelp() };
    }
    const json = args.includes('--json');
    if (args.includes('--staged')) {
      return explainStaged({ cwd: context.cwd, json });
    }
    const file = args.find((arg) => arg !== 'explain' && arg !== '--json');
    return explainFile({ cwd: context.cwd, file, json });
  }

  if (args[0] === 'profile') {
    const report = inspectProjectProfile({ cwd: context.cwd });
    return { exitCode: 0, output: args.includes('--json') ? `${JSON.stringify(report, null, 2)}\n` : renderProjectProfile(report) };
  }

  if (args[0] === 'doctor') {
    const report = runDoctor({ cwd: context.cwd, env: context.env });
    return { exitCode: report.ok ? 0 : 1, output: renderDoctor(report) };
  }

  if (args[0] === 'bdr' && args[1] === 'status') {
    const status = readBdrStatus(context.cwd);
    return { exitCode: status.exists ? 0 : 1, output: status.text };
  }

  return { exitCode: 1, output: `未知命令：${args[0]}\n` };
}

export function formatCliError(error) {
  const message = error?.message || String(error);
  if (error?.code === 'ENOENT' || message.includes('no such file or directory')) {
    return `缺少必要文件，请确认已在项目根目录执行 gitpushreview init。原始错误：${message}`;
  }
  if (message.includes('Command failed: git')) {
    return `Git 命令执行失败，请确认当前目录是 Git 仓库且 Git 可用。原始错误：${message}`;
  }
  return `执行失败：${message}`;
}

export async function main(args, context) {
  try {
    const result = await routeCommand(args, context);
    if (result.output && context?.stdout?.write) {
      context.stdout.write(result.output);
    }
    return result.exitCode;
  } catch (error) {
    context?.stderr?.write?.(`${formatCliError(error)}\n`);
    return 1;
  }
}
