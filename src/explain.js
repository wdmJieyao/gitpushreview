import fs from 'node:fs';
import path from 'node:path';
import { runDeterministicGates } from './gates/deterministic.js';
import { buildFileRouteContext } from './routes/file-route-context.js';
import { getGitRoot, getStagedSnapshot } from './git.js';
import { parseRuleIndex, loadMarkdownRules } from './rules/index.js';
import { routeRulesForFiles } from './rules/router.js';
import { runRuleEvidence } from './evidence/rule-evidence.js';
import { loadReviewMode } from './review/mode.js';

const HELP = `gitpushreview explain

用法：
  gitpushreview explain <file> [--json]
  gitpushreview explain --staged [--json]

说明：
  展示文件能力标签、规则路由、确定性检查和强拦截原因，用于诊断“为什么命中/为什么没命中规则”。
`;

function loadRulesForExplain(root) {
  const workspaceRoot = path.join(root, '.gitpushreview');
  const indexPath = path.join(workspaceRoot, 'agent', 'rules-index.md');
  if (!fs.existsSync(indexPath)) return [];
  const sources = parseRuleIndex(fs.readFileSync(indexPath, 'utf8'));
  return sources
    .filter((source) => source.provider === 'markdown')
    .flatMap((source) => loadMarkdownRules({ workspaceRoot, source }));
}

function buildRuleRouting(root, routes, fileContents = {}) {
  const rules = loadRulesForExplain(root);
  return routeRulesForFiles({ rules, routes, fileContents });
}

function buildRuleCandidates(rules) {
  return rules.map((rule) => ({
    id: rule.id,
    source: rule.source,
    capabilities: rule.capabilities || [],
    paths: rule.paths || [],
    signalPaths: rule.signalPaths || [],
    signalContent: rule.signalContent || [],
    evidencePatterns: rule.evidencePatterns || [],
    allowUnknownExpansion: Boolean(rule.allowUnknownExpansion),
  }));
}

function uniqueStable(items) {
  return [...new Set(items.filter(Boolean))];
}

function buildCandidateDiagnostics(routedRules, findings = []) {
  const staticFindingRuleIds = uniqueStable(findings.map((finding) => finding.ruleId));
  const candidateRuleIds = uniqueStable([
    ...(routedRules.diagnostics.candidateRuleIds || routedRules.rules.map((rule) => rule.id)),
    ...staticFindingRuleIds,
  ]);
  return {
    candidateRuleIds,
    candidateSummary: {
      ...routedRules.diagnostics.candidateSummary,
      candidateRuleIds,
      staticFindingRuleIds,
    },
  };
}

function renderFinding(finding) {
  const blocking = finding.blocking === 'hard' ? '强拦截' : finding.blocking === 'soft' ? '软拦截' : '证据线索';
  return [
    `  - [${blocking}] ${finding.ruleId} ${finding.title}`,
    finding.file ? `    位置：${finding.file}${finding.line ? `:${finding.line}` : ''}` : '',
    finding.evidence ? `    证据：${finding.evidence}` : '',
    finding.suggestion ? `    修复建议：${finding.suggestion}` : '',
  ].filter(Boolean).join('\n');
}

function summarizeCandidates(ruleRouting) {
  if (!ruleRouting) return ['候选规则：无'];
  const summary = ruleRouting.candidateSummary || {};
  const lines = [`候选规则：${ruleRouting.selectedRules}/${ruleRouting.totalRules}，已过滤：${ruleRouting.excludedRules}`];
  const sourceCounts = Object.entries(summary.bySource || {}).map(([key, value]) => `${key}=${value}`).join('，');
  const capabilityCounts = Object.entries(summary.byCapability || {}).map(([key, value]) => `${key}=${value}`).join('，');
  if (sourceCounts) lines.push(`来源统计：${sourceCounts}`);
  if (capabilityCounts) lines.push(`能力统计：${capabilityCounts}`);
  if (summary.topMatchReasons?.length) lines.push(`主要命中原因：${summary.topMatchReasons.join('；')}`);
  if (summary.topSkipReasons?.length) lines.push(`主要过滤原因：${summary.topSkipReasons.join('；')}`);
  if (summary.duplicates?.length) lines.push(`重复规则 ID：${summary.duplicates.map((item) => item.ruleId).join('，')}`);
  const matched = ruleRouting.decisions.filter((item) => item.matched).slice(0, 8);
  if (matched.length) {
    lines.push('命中候选示例：');
    for (const item of matched) lines.push(`  - ${item.ruleId}：${item.matchReason}`);
  }
  return lines;
}

export function renderExplain({ routes, findings, ruleRouting }) {
  const routeList = Array.isArray(routes) ? routes : [routes];
  const lines = ['GitPushReview 路由诊断'];
  if (ruleRouting?.modeNote) lines.push(ruleRouting.modeNote, '');
  if (routeList.length === 0) {
    lines.push('文件：无', '命中路由：无', '', '确定性检查：', '  没有检测到可解释的文件');
    return `${lines.join('\n')}\n`;
  }
  for (const route of routeList) {
    lines.push(
      `文件：${route.file}`,
      `命中路由：${route.labels.join(', ') || '无'}`,
      `能力标签：${(route.capabilities || []).join(', ') || '无'}`,
      `方言候选：${route.dialectCandidates.join(', ') || '无'}`,
      `兜底模式：${route.unknownLimited ? 'unknown-limited' : '无'}`,
      '',
    );
  }
  lines.push(...summarizeCandidates(ruleRouting), '');
  lines.push('确定性检查：');
  if (!findings.length) lines.push('  未发现强拦截问题');
  else lines.push(...findings.map(renderFinding));
  return `${lines.join('\n')}\n`;
}

export function explainFile({ cwd, file, json = false }) {
  let root;
  try {
    root = getGitRoot(cwd);
  } catch {
    root = cwd;
  }
  const abs = path.resolve(root, file);
  const relative = path.relative(root, abs);
  if (path.isAbsolute(relative) || relative.startsWith('..')) {
    return { exitCode: 1, output: `文件位于项目根目录之外，已拒绝读取：${file}\n` };
  }
  if (!fs.existsSync(abs)) {
    return { exitCode: 1, output: `文件不存在或无法读取：${file}\n` };
  }
  const content = fs.readFileSync(abs, 'utf8');
  const route = buildFileRouteContext({ file, content });
  const result = runDeterministicGates({ files: [route.file], fileContents: { [route.file]: content } });
  const routedRules = buildRuleRouting(root, [route], { [route.file]: content });
  const ruleEvidence = runRuleEvidence({ rules: routedRules.rules, routes: [route], fileContents: { [route.file]: content }, ruleRouting: routedRules.diagnostics });
  const findings = [...result.findings, ...ruleEvidence];
  const mode = loadReviewMode(root);
  if (mode.mode === 'skip') {
    routedRules.diagnostics.modeNote = '当前审核模式：跳过；explain 仍会执行诊断，实际 check 会跳过检查。';
  }
  const candidateDiagnostics = buildCandidateDiagnostics(routedRules, findings);
  const payload = {
    routes: route,
    findings,
    ruleCandidates: buildRuleCandidates(routedRules.rules),
    ...candidateDiagnostics,
    ruleRouting: routedRules.diagnostics,
  };
  return { exitCode: 0, output: json ? `${JSON.stringify(payload, null, 2)}\n` : renderExplain(payload) };
}

export function explainStaged({ cwd, json = false }) {
  const snapshot = getStagedSnapshot(cwd);
  const result = runDeterministicGates({ files: snapshot.files, diff: snapshot.diff, fileContents: snapshot.fileContents });
  const routedRules = buildRuleRouting(snapshot.root, result.routes, snapshot.fileContents);
  const ruleEvidence = runRuleEvidence({ rules: routedRules.rules, routes: result.routes, fileContents: snapshot.fileContents, ruleRouting: routedRules.diagnostics });
  const findings = [...result.findings, ...ruleEvidence];
  const mode = loadReviewMode(snapshot.root);
  if (mode.mode === 'skip') {
    routedRules.diagnostics.modeNote = '当前审核模式：跳过；explain 仍会执行诊断，实际 check 会跳过检查。';
  }
  const candidateDiagnostics = buildCandidateDiagnostics(routedRules, findings);
  const payload = {
    routes: result.routes,
    findings,
    ruleCandidates: buildRuleCandidates(routedRules.rules),
    ...candidateDiagnostics,
    ruleRouting: routedRules.diagnostics,
  };
  return { exitCode: 0, output: json ? `${JSON.stringify(payload, null, 2)}\n` : renderExplain(payload) };
}

export function explainHelp() {
  return HELP;
}
