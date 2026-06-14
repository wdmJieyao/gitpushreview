const SQL_FINDING_BASE = {
  source: 'deterministic',
  score: 95,
  weightedScore: 95,
  severity: 'critical',
  blocking: 'hard',
};

function lineOf(content, index) {
  return content.slice(0, Math.max(0, index)).split(/\r?\n/).length;
}

function splitTopLevel(input) {
  const parts = [];
  let current = '';
  let depth = 0;
  let quote = null;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const next = input[i + 1];
    if (quote) {
      current += ch;
      if (ch === quote) {
        if (next === quote) {
          current += next;
          i += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function syntaxFinding({ file, line, evidence }) {
  return {
    ...SQL_FINDING_BASE,
    ruleId: 'DEFAULT-SQL-SYNTAX-001',
    title: 'SQL 语句存在明显语法结构错误',
    file,
    line,
    evidence,
    suggestion: '请修复 SQL 的引号、括号或语句结构，确保目标数据库可以解析执行。',
  };
}

function validateBalance(content) {
  let depth = 0;
  let quote = null;
  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];
    const next = content[i + 1];
    if (quote) {
      if (ch === quote) {
        if (next === quote) i += 1;
        else quote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (depth < 0) return { ok: false, index: i, evidence: 'SQL 存在多余的右括号，括号结构不完整。' };
  }
  if (quote) return { ok: false, index: content.length, evidence: 'SQL 存在未闭合的字符串或标识符引号。' };
  if (depth !== 0) return { ok: false, index: content.length, evidence: 'SQL 存在未闭合的括号。' };
  return { ok: true };
}

function findMatchingParen(content, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < content.length; i += 1) {
    const ch = content[i];
    const next = content[i + 1];
    if (quote) {
      if (ch === quote) {
        if (next === quote) i += 1;
        else quote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findValuesTuples(content, valuesIndex) {
  const tuples = [];
  let i = valuesIndex;
  while (i < content.length) {
    const open = content.indexOf('(', i);
    if (open === -1) break;
    const close = findMatchingParen(content, open);
    if (close === -1) break;
    tuples.push({ start: open, text: content.slice(open + 1, close) });
    i = close + 1;
    while (/\s|,/.test(content[i] || '')) i += 1;
    if (content[i] !== '(') break;
  }
  return tuples;
}

export function runSqlGate({ file, content, route = {} }) {
  if (!route.labels?.includes('sql')) return [];
  const findings = [];
  const balance = validateBalance(content);
  if (!balance.ok) {
    findings.push(syntaxFinding({ file, line: lineOf(content, balance.index), evidence: balance.evidence }));
    return findings;
  }

  const insertPattern = /insert\s+into\s+[\w."`\[\]]+\s*\(/ig;
  let match;
  while ((match = insertPattern.exec(content))) {
    const columnsOpen = content.indexOf('(', match.index);
    const columnsClose = findMatchingParen(content, columnsOpen);
    if (columnsClose === -1) continue;
    const afterColumns = content.slice(columnsClose + 1);
    const valuesRelative = afterColumns.search(/\bvalues\b/i);
    if (valuesRelative === -1) continue;
    const valuesIndex = columnsClose + 1 + valuesRelative;
    const columns = splitTopLevel(content.slice(columnsOpen + 1, columnsClose));
    const tuples = findValuesTuples(content, valuesIndex);
    tuples.forEach((tuple, tupleIndex) => {
      const values = splitTopLevel(tuple.text);
      if (columns.length !== values.length) {
        findings.push({
          ...SQL_FINDING_BASE,
          ruleId: 'DEFAULT-SQL-INSERT-ARITY-001',
          title: 'INSERT 列数和值数量不一致',
          file,
          line: lineOf(content, tuple.start),
          evidence: `INSERT 声明 ${columns.length} 个列，但第 ${tupleIndex + 1} 组 VALUES 只有 ${values.length} 个值，列数和值数量不一致。`,
          suggestion: '请补齐缺失值、删除多余值，或调整 INSERT 列清单，保持列和值一一对应。',
        });
      }
    });
  }

  return findings;
}
