import fs from 'node:fs';
import path from 'node:path';
import { parseYamlBlock, parseMarkdownRules } from './markdown.js';

export function parseRuleIndex(markdown) {
  const section = /^##\s+(.+)$/gm;
  const matches = [...markdown.matchAll(section)];
  const sources = [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length;
    const body = markdown.slice(start, end);
    const yamlMatch = body.match(/```yaml\r?\n([\s\S]*?)\r?\n```/);
    if (!yamlMatch) continue;
    const config = parseYamlBlock(yamlMatch[1]);
    if (config.enabled === false) continue;
    sources.push({ name: matches[i][1].trim(), ...config });
  }

  return sources.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
}

export function loadMarkdownRules({ workspaceRoot, source }) {
  const files = source.files || [];
  return files.flatMap((relativeFile) => {
    const filePath = path.resolve(workspaceRoot, 'agent', relativeFile);
    const markdown = fs.readFileSync(filePath, 'utf8');
    return parseMarkdownRules(markdown, {
      source: source.name,
      file: relativeFile,
      weight: source.weight ?? 1,
    });
  });
}
