import { buildFileRouteContext } from '../routes/file-route-context.js';
import { extractJavaInlineSql } from './java-inline-sql.js';
import { runMqGate } from './mq.js';
import { runSqlGate } from './sql.js';

function parseAddedContent(diff, file) {
  if (!diff) return '';
  const normalizedFile = file.replace(/\\/g, '/');
  const sections = diff.split(/^diff --git /m).filter(Boolean);
  const section = sections.find((part) => part.includes(` b/${normalizedFile}`) || part.includes(` a/${normalizedFile}`));
  if (!section) return '';
  return section
    .split(/\r?\n/)
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
    .map((line) => line.slice(1))
    .join('\n');
}

function dedupe(findings) {
  const seen = new Set();
  return findings.filter((finding) => {
    const key = `${finding.ruleId}|${finding.file}|${finding.line || ''}|${finding.evidence || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function runDeterministicGates({ files, diff = '', fileContents = {} }) {
  const routes = [];
  const findings = [];
  for (const rawFile of files || []) {
    const file = rawFile.replace(/\\/g, '/');
    const content = fileContents[file] ?? parseAddedContent(diff, file);
    const route = buildFileRouteContext({ file, content });
    routes.push(route);

    if (route.labels.includes('java-inline-sql')) {
      for (const snippet of extractJavaInlineSql(content)) {
        const inlineRoute = buildFileRouteContext({ file: route.file, content: snippet.sql });
        const inlineFindings = runSqlGate({ file: route.file, content: snippet.sql, route: inlineRoute })
          .map((finding) => ({
            ...finding,
            line: snippet.line,
            evidence: `${finding.evidence} 内嵌 SQL：${snippet.sql}`,
            routeLabel: 'java-inline-sql',
          }));
        findings.push(...inlineFindings);
      }
    } else {
      findings.push(...runSqlGate({ file: route.file, content, route }));
    }

    findings.push(...runMqGate({ file: route.file, content, route }));
  }
  return { routes, findings: dedupe(findings) };
}
