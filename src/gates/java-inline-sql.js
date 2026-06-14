function sqlLooksReal(sql) {
  return /\b(select\s+.+\s+from|insert\s+into|update\s+.+\s+set|delete\s+from)\b/i.test(sql);
}

function lineOf(content, index) {
  return content.slice(0, Math.max(0, index)).split(/\r?\n/).length;
}

function decodeJavaString(value) {
  return value.replace(/\\"/g, '"').replace(/\\n/g, ' ').replace(/\\t/g, ' ');
}

export function extractJavaInlineSql(content) {
  const snippets = [];
  const annotationPattern = /@(Select|Insert|Update|Delete|Query)\s*\(\s*"((?:\\.|[^"\\])*)"/g;
  let match;
  while ((match = annotationPattern.exec(content))) {
    const sql = decodeJavaString(match[2]).trim();
    if (sqlLooksReal(sql)) {
      snippets.push({ kind: 'annotation', sql, line: lineOf(content, match.index) });
    }
  }

  const assignmentPattern = /=\s*((?:"(?:\\.|[^"\\])*"\s*\+\s*)+"(?:\\.|[^"\\])*"|"(?:\\.|[^"\\])*")\s*;/g;
  while ((match = assignmentPattern.exec(content))) {
    const pieces = [...match[1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((piece) => decodeJavaString(piece[1]));
    const sql = pieces.join(' ').replace(/\s+/g, ' ').trim();
    if (sqlLooksReal(sql)) {
      snippets.push({ kind: 'string', sql, line: lineOf(content, match.index) });
    }
  }

  return snippets;
}