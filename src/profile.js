import fs from 'node:fs';
import path from 'node:path';

function exists(root, relative) {
  return fs.existsSync(path.join(root, relative));
}

function readMaybeJson(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

export function inspectProjectProfile({ cwd }) {
  const workspaceRoot = path.join(cwd, '.gitpushreview');
  const configPath = path.join(workspaceRoot, 'config', 'project-profile.json');
  const suggestions = [];
  if (exists(cwd, 'pom.xml')) suggestions.push({ capability: 'language.java', evidence: 'pom.xml' });
  if (exists(cwd, 'package.json')) suggestions.push({ capability: 'frontend.vue', evidence: 'package.json' });
  if (exists(cwd, 'pyproject.toml') || exists(cwd, 'requirements.txt')) suggestions.push({ capability: 'language.python', evidence: 'python manifest' });
  if (exists(cwd, 'src/main/resources/mapper') || exists(cwd, 'src/main/resources/mappers')) suggestions.push({ capability: 'persistence.mybatis', evidence: 'mapper directory' });
  const profile = readMaybeJson(configPath);
  return {
    profilePath: configPath,
    exists: Boolean(profile),
    profile,
    suggestions,
    writable: false,
    note: 'profile 当前为只读诊断；check/profile 不会静默写入配置。',
  };
}

export function renderProjectProfile(report) {
  const lines = ['GitPushReview 项目画像诊断', `配置文件：${report.profilePath}`, `已确认画像：${report.exists ? '存在' : '不存在'}`, '建议能力：'];
  if (!report.suggestions.length) lines.push('  暂未识别到稳定项目能力');
  else for (const item of report.suggestions) lines.push(`  - ${item.capability}（证据：${item.evidence}）`);
  lines.push('', report.note);
  return `${lines.join('\n')}\n`;
}
