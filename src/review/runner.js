import fs from 'node:fs';
import path from 'node:path';
import { loadBdrContext } from '../bdr/provider.js';
import { callReviewModel } from '../model/client.js';
import { parseRuleIndex, loadMarkdownRules } from '../rules/index.js';
import { decideReview } from './decision.js';
import { buildReviewMessages } from './prompt.js';
import { parseReviewJson } from './result.js';
import { splitFindingsByCandidateSet } from './findings.js';
import { runDeterministicGates } from '../gates/deterministic.js';
import { routeRulesForFiles } from '../rules/router.js';
import { runRuleEvidence } from '../evidence/rule-evidence.js';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parsePolicy(markdown) {
  const yaml = markdown.match(/```yaml\r?\n([\s\S]*?)\r?\n```/)?.[1] || '';
  const soft = yaml.match(/softBlockScore:\s*(\d+)/)?.[1] || '60';
  const hard = yaml.match(/hardBlockScore:\s*(\d+)/)?.[1] || '90';
  return { softBlockScore: Number(soft), hardBlockScore: Number(hard), raw: markdown };
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
  const routedRules = routeRulesForFiles({ rules: markdownRules, routes: gateResult.routes, fileContents });
  const staticEvidence = runRuleEvidence({ rules: routedRules.rules, routes: gateResult.routes, fileContents, ruleRouting: routedRules.diagnostics });
  const staticFindings = [...gateResult.findings, ...staticEvidence];
  const candidateRules = [
    ...routedRules.rules,
    ...staticFindings.map((finding) => ({ id: finding.ruleId })),
  ];
  const messages = buildReviewMessages({ reviewAgent, policy: policy.raw, bdrContext, rules: routedRules.rules, diff, files, deterministicFindings: staticFindings, routes: gateResult.routes, ruleRouting: routedRules.diagnostics });
  const invoke = modelInvoker || ((input) => callReviewModel({
    config: modelConfig,
    env,
    messages: input.messages,
  }));
  const responseText = await invoke({ messages, modelConfig });
  const parsed = parseReviewJson(responseText);
  const { accepted: findings, rejected: rejectedFindings } = splitFindingsByCandidateSet(parsed.findings, candidateRules, markdownRules);
  return {
    findings,
    rejectedFindings,
    decision: decideReview(findings, policy),
    routes: gateResult.routes,
    ruleRouting: routedRules.diagnostics,
    deterministicFindings: staticFindings,
  };
}
