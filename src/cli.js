import { initWorkspace } from './workspace.js';
import { getStagedSnapshot } from './git.js';
import { handleReviewResult } from './hook.js';
import { runReview } from './review/runner.js';
import { readBdrStatus, renderDoctor, runDoctor } from './doctor.js';
import { explainFile, explainHelp, explainStaged } from './explain.js';
import { inspectProjectProfile, renderProjectProfile } from './profile.js';
import { loadReviewMode } from './review/mode.js';

const HELP = `gitpushreview

用法：
  gitpushreview init [--force] [--no-hook]
  gitpushreview check [--staged] [--json]
  gitpushreview explain <file|--staged> [--json]
  gitpushreview profile [--json]
  gitpushreview doctor
  gitpushreview bdr status

命令说明：
  init        初始化 .gitpushreview 工作区，可安装仓库本地 pre-commit hook。
  check       审核已暂存的 Git 变更，支持正常、跳过、日志三种模式。
  explain     解释文件或暂存变更的规则路由、候选规则和诊断信息。
  profile     查看项目技术栈画像，用于理解规则匹配输入。
  doctor      检查工作区、模型配置、审核模式和 BDR 状态。
  bdr status  查看已安装的坏味道检测上下文版本。

查看命令帮助：gitpushreview <命令> --help
`;

const COMMAND_HELP = {
  init: `gitpushreview init

用法：
  gitpushreview init [--force] [--no-hook]

说明：
  初始化当前仓库的 .gitpushreview 工作区，生成默认规则、模型配置、审核模式配置和 BDR 上下文。

选项：
  --force    明确覆盖已有 GitPushReview 模板文件和 pre-commit hook。
  --no-hook  只初始化工作区，不安装 pre-commit hook。

示例：
  gitpushreview init --no-hook
`,
  check: `gitpushreview check

用法：
  gitpushreview check --staged [--json]

说明：
  审核已暂存的 Git 变更。审核模式由 .gitpushreview/config/review-mode.json 控制。

选项：
  --staged  审核已暂存内容。
  --json    输出机器可读 JSON。

示例：
  gitpushreview check --staged --json
`,
  profile: `gitpushreview profile

用法：
  gitpushreview profile [--json]

说明：
  输出项目技术栈画像，帮助理解规则路由和能力标签。

选项：
  --json  输出机器可读 JSON。

示例：
  gitpushreview profile --json
`,
  doctor: `gitpushreview doctor

用法：
  gitpushreview doctor

说明：
  检查 Node 版本、工作区、模型配置、API 密钥、审核模式和 BDR 状态。

选项：
  无需选项。

示例：
  gitpushreview doctor
`,
  'bdr status': `gitpushreview bdr status

用法：
  gitpushreview bdr status

说明：
  显示当前工作区中的坏味道检测上下文包名和版本。

选项：
  无需选项。

示例：
  gitpushreview bdr status
`,
};

function hasUnsupportedOptions(args, supported) {
  return args.some((arg) => arg.startsWith('-') && !supported.has(arg));
}

export async function routeCommand(args, context) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    return { exitCode: 0, output: HELP };
  }

  if (args[0] === 'init') {
    if (args.includes('--help') || args.includes('-h')) return { exitCode: 0, output: COMMAND_HELP.init };
    if (hasUnsupportedOptions(args.slice(1), new Set(['--force', '--no-hook']))) {
      return { exitCode: 1, output: '参数无效。请运行 gitpushreview init --help 查看中文帮助。\n' };
    }
    const result = await initWorkspace({
      cwd: context.cwd,
      force: args.includes('--force'),
      installHook: !args.includes('--no-hook'),
    });
    const hookText = result.hook.installed
      ? `已安装 pre-commit hook：${result.hook.hookPath}\n`
      : result.hook.guidance
        ? `${result.hook.guidance}\n`
        : '';
    return { exitCode: 0, output: `GitPushReview 已初始化：${result.root}\n${hookText}` };
  }

  if (args[0] === 'check') {
    if (args.includes('--help') || args.includes('-h')) return { exitCode: 0, output: COMMAND_HELP.check };
    if (hasUnsupportedOptions(args.slice(1), new Set(['--staged', '--json']))) {
      return { exitCode: 1, output: '参数无效。请运行 gitpushreview check --help 查看中文帮助。\n' };
    }
    const mode = loadReviewMode(context.cwd);
    if (mode.mode === 'skip') {
      const result = {
        mode: mode.mode,
        modeMessage: mode.message,
        findings: [],
        rejectedFindings: [],
        decision: { status: 'SKIPPED', totalScore: 0 },
        routes: [],
        ruleRouting: { totalRules: 0, selectedRules: 0, excludedRules: 0, decisions: [] },
        deterministicFindings: [],
      };
      const exitCode = await handleReviewResult(result, {
        stdin: context.stdin,
        stdout: context.stdout,
        json: args.includes('--json'),
        ci: context.env.CI === 'true',
      });
      return { exitCode, output: '' };
    }
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
      modelInvoker: context.modelInvoker,
    });
    result.mode = mode.mode;
    result.modeMessage = mode.message;
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
    if (args.includes('--help') || args.includes('-h')) return { exitCode: 0, output: COMMAND_HELP.profile };
    if (hasUnsupportedOptions(args.slice(1), new Set(['--json']))) {
      return { exitCode: 1, output: '参数无效。请运行 gitpushreview profile --help 查看中文帮助。\n' };
    }
    const report = inspectProjectProfile({ cwd: context.cwd });
    return { exitCode: 0, output: args.includes('--json') ? `${JSON.stringify(report, null, 2)}\n` : renderProjectProfile(report) };
  }

  if (args[0] === 'doctor') {
    if (args.includes('--help') || args.includes('-h')) return { exitCode: 0, output: COMMAND_HELP.doctor };
    if (hasUnsupportedOptions(args.slice(1), new Set())) {
      return { exitCode: 1, output: '参数无效。请运行 gitpushreview doctor --help 查看中文帮助。\n' };
    }
    const report = runDoctor({ cwd: context.cwd, env: context.env });
    return { exitCode: report.ok ? 0 : 1, output: renderDoctor(report) };
  }

  if (args[0] === 'bdr' && args[1] === 'status') {
    if (args.includes('--help') || args.includes('-h')) return { exitCode: 0, output: COMMAND_HELP['bdr status'] };
    if (hasUnsupportedOptions(args.slice(2), new Set())) {
      return { exitCode: 1, output: '参数无效。请运行 gitpushreview bdr status --help 查看中文帮助。\n' };
    }
    const status = readBdrStatus(context.cwd);
    return { exitCode: status.exists ? 0 : 1, output: status.text };
  }

  return { exitCode: 1, output: `未知命令：${args[0]}。请运行 gitpushreview --help 查看中文帮助。\n` };
}

export function formatCliError(error) {
  const message = error?.message || String(error);
  if (error?.code === 'ENOENT' || message.includes('no such file or directory')) {
    return `缺少必要文件，请确认已在项目根目录执行 gitpushreview init。原始错误：${message}`;
  }
  if (message.includes('Command failed: git')) {
    return `Git 命令执行失败，请确认当前目录是 Git 仓库且 Git 可用。原始错误：${message}`;
  }
  if (message.includes('审核模式无效')) return message;
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
