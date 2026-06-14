function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === '[]') return [];
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed.replace(/^['"]|['"]$/g, '');
}

export function parseYamlBlock(block) {
  const result = {};
  const lines = block.split(/\r?\n/);
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim()) continue;
    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && currentKey) {
      result[currentKey] = Array.isArray(result[currentKey]) ? result[currentKey] : [];
      result[currentKey].push(parseScalar(listMatch[1]));
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      result[currentKey] = keyMatch[2] === '' ? [] : parseScalar(keyMatch[2]);
    }
  }

  return result;
}

export function parseMarkdownRules(markdown, defaults = {}) {
  const heading = /^##\s+([A-Z0-9]+(?:-[A-Z0-9]+)+)\s+(.+)$/gm;
  const matches = [...markdown.matchAll(heading)];
  const rules = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const start = match.index + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length;
    const body = markdown.slice(start, end).trim();
    const yamlMatch = body.match(/```yaml\r?\n([\s\S]*?)\r?\n```/);
    const meta = yamlMatch ? parseYamlBlock(yamlMatch[1]) : {};
    const text = yamlMatch ? body.replace(yamlMatch[0], '').trim() : body;

    rules.push({
      source: defaults.source || 'markdown',
      file: defaults.file,
      weight: defaults.weight ?? 1,
      id: match[1],
      title: match[2].trim(),
      score: meta.score ?? 10,
      severity: meta.severity || 'medium',
      hardBlock: Boolean(meta.hardBlock),
      paths: meta.paths || [],
      capabilities: meta.capabilities || [],
      signalPaths: meta.signalPaths || [],
      signalContent: meta.signalContent || [],
      evidencePatterns: meta.evidencePatterns || [],
      allowUnknownExpansion: Boolean(meta.allowUnknownExpansion),
      scope: meta.scope || '',
      body: text,
    });
  }

  return rules;
}
