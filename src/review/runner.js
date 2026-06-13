import fs from 'node:fs';
import path from 'node:path';
import { loadBdrContext } from '../bdr/provider.js';
import { callReviewModel } from '../model/client.js';
import { parseRuleIndex, loadMarkdownRules } from '../rules/index.js';
import { decideReview } from './decision.js';
import { buildReviewMessages } from './prompt.js';
import { parseReviewJson } from './result.js';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parsePolicy(markdown) {
  const yaml = markdown.match(/```yaml\r?\n([\s\S]*?)\r?\n```/)?.[1] || '';
  const soft = yaml.match(/softBlockScore:\s*(\d+)/)?.[1] || '60';
  const hard = yaml.match(/hardBlockScore:\s*(\d+)/)?.[1] || '90';
  return { softBlockScore: Number(soft), hardBlockScore: Number(hard), raw: markdown };
}

export async function runReview({ cwd, diff, files, modelInvoker, env }) {
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
  const messages = buildReviewMessages({ reviewAgent, policy: policy.raw, bdrContext, rules: markdownRules, diff, files });
  const invoke = modelInvoker || ((input) => callReviewModel({
    config: modelConfig,
    apiKey: env[modelConfig.apiKeyEnv],
    messages: input.messages,
  }));
  const text = await invoke({ messages, modelConfig });
  const parsed = parseReviewJson(text);
  const findings = parsed.findings.map((finding) => ({
    ...finding,
    weightedScore: finding.weightedScore ?? Number(finding.score || 0),
  }));
  return { findings, decision: decideReview(findings, policy) };
}
