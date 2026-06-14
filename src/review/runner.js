import fs from 'node:fs';
import path from 'node:path';
import { loadBdrContext } from '../bdr/provider.js';
import { callReviewModel, resolveApiKey } from '../model/client.js';
import { parseRuleIndex, loadMarkdownRules } from '../rules/index.js';
import { decideReview } from './decision.js';
import { buildReviewMessages } from './prompt.js';
import { parseReviewJson } from './result.js';
import { runDeterministicGates } from '../gates/deterministic.js';
import { routeRulesForFiles } from '../rules/router.js';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parsePolicy(markdown) {
  const yaml = markdown.match(/```yaml\r?\n([\s\S]*?)\r?\n```/)?.[1] || '';
  const soft = yaml.match(/softBlockScore:\s*(\d+)/)?.[1] || '60';
  const hard = yaml.match(/hardBlockScore:\s*(\d+)/)?.[1] || '90';
  return { softBlockScore: Number(soft), hardBlockScore: Number(hard), raw: markdown };
}

function normalizeFindings(findings, rules) {
  const rulesById = new Map(rules.map((rule) => [rule.id, rule]));
  return findings.map((finding) => {
    const rule = rulesById.get(finding.ruleId);
    const blocking = rule && rule.hardBlock === false && finding.blocking === 'hard'
      ? 'soft'
      : finding.blocking;
    return {
      ...finding,
      blocking,
      weightedScore: finding.weightedScore ?? Number(finding.score || 0),
    };
  });
}

export async function runReview({ cwd, diff, files, fileContents = {}, modelInvoker, env }) {
  const workspaceRoot = path.join(cwd, '.gitpushreview');
  const reviewAgent = fs.readFileSync(path.join(workspaceRoot, 'agent', 'review-agent.md'), 'utf8');
  const policyText = fs.readFileSync(path.join(workspaceRoot, 'agent', 'policy.md'), 'utf8');
  const policy = parsePolicy(policyText);
  const indexText = fs.readFileSync(path.join(workspaceRoot, 'agent', 'rules-index.md'), 'utf8');
  const sources = parseRuleIndex(indexText);
  const markdownRules = sources
    .filter((source) => source.provider === 'markdown')
    .flatMap((source) => loadMarkdownRules({ workspaceRoot, source }));
  const bdrSource = sources.find((source) => source.provider === 'bdr');
  const bdrContext = bdrSource
    ? loadBdrContext(path.resolve(workspaceRoot, 'agent', bdrSource.path))
    : { text: '', skills: [] };
  const modelConfig = readJson(path.join(workspaceRoot, 'config', 'reviewmodel.json'));
  const gateResult = runDeterministicGates({ files, diff, fileContents });
  const routedRules = routeRulesForFiles({ rules: markdownRules, routes: gateResult.routes });
  const messages = buildReviewMessages({ reviewAgent, policy: policy.raw, bdrContext, rules: routedRules.rules, diff, files, deterministicFindings: gateResult.findings, routes: gateResult.routes, ruleRouting: routedRules.diagnostics });
  const invoke = modelInvoker || ((input) => callReviewModel({
    config: modelConfig,
    env,
    messages: input.messages,
  }));
  const hasDeterministicHard = gateResult.findings.some((finding) => finding.blocking === 'hard');
  const canCallModel = Boolean(modelInvoker || resolveApiKey({ config: modelConfig, env }));
  let parsed = { findings: [] };
  let aiAssist = { attempted: false, skipped: false, error: '' };

  if (!hasDeterministicHard || canCallModel) {
    try {
      aiAssist = { attempted: true, skipped: false, error: '' };
      const responseText = await invoke({ messages, modelConfig });
      parsed = parseReviewJson(responseText);
    } catch (error) {
      if (!hasDeterministicHard) throw error;
      aiAssist = { attempted: true, skipped: false, error: error?.message || String(error) };
    }
  } else {
    aiAssist = { attempted: false, skipped: true, error: '未配置 API Key，已使用静态确定性结果完成强拦截。' };
  }

  const findings = normalizeFindings([...gateResult.findings, ...parsed.findings], markdownRules);
  return { findings, decision: decideReview(findings, policy), routes: gateResult.routes, ruleRouting: routedRules.diagnostics, aiAssist };
}
