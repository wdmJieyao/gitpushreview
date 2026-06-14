import { normalizePath } from '../routes/capability-context.js';

function toArray(value) {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

function escapeRegex(text) {
  return String(text).replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

export function globToRegExp(glob) {
  const normalized = normalizePath(glob);
  let pattern = '';
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const next = normalized[i + 1];
    if (char === '*' && next === '*') {
      const after = normalized[i + 2];
      if (after === '/') {
        pattern += '(?:.*/)?';
        i += 2;
      } else {
        pattern += '.*';
        i += 1;
      }
    } else if (char === '*') {
      pattern += '[^/]*';
    } else if (char === '?') {
      pattern += '[^/]';
    } else {
      pattern += escapeRegex(char);
    }
  }
  return new RegExp(`^${pattern}$`, 'i');
}

export function matchesPath(file, patterns = []) {
  const normalized = normalizePath(file);
  const list = toArray(patterns);
  if (!list.length) return true;
  return list.some((pattern) => globToRegExp(pattern).test(normalized));
}

function normalizeCapability(value) {
  const text = String(value || '').trim();
  const aliases = {
    java: 'language.java',
    vue: 'frontend.vue',
    frontend: 'frontend.vue',
    python: 'language.python',
    config: 'common.config',
    xml: 'common.xml',
    sql: 'persistence.sql',
    mysql: 'persistence.sql.mysql',
    oracle: 'persistence.sql.oracle',
    postgresql: 'persistence.sql.postgresql',
    postgres: 'persistence.sql.postgresql',
    oceanbase: 'persistence.sql.oceanbase',
    mybatis: 'persistence.mybatis',
    redis: 'middleware.redis',
    mq: 'middleware.mq',
    kafka: 'middleware.mq.kafka',
    rabbitmq: 'middleware.mq.rabbitmq',
    drools: 'rules.drools',
    security: 'security.secrets',
    workflow: 'common.core',
    'common-core': 'common.core',
    'unknown-limited': 'common.unknown-limited',
  };
  return aliases[text] || text;
}

function isCommonRule(rule) {
  return rule.scope === 'common' || toArray(rule.capabilities).some((item) => {
    const capability = normalizeCapability(item);
    return capability === 'common.core' || capability === 'common.unknown-limited';
  });
}

function capabilityMatches(ruleCapabilities, contextCapabilities) {
  const wanted = toArray(ruleCapabilities).map(normalizeCapability);
  if (!wanted.length) return { ok: true, reason: 'legacy-path-only' };
  const actual = new Set(contextCapabilities.map(normalizeCapability));
  const matched = wanted.filter((item) => actual.has(item));
  return matched.length
    ? { ok: true, reason: `capability:${matched.join(',')}` }
    : { ok: false, reason: `capability-mismatch:${wanted.join(',')}` };
}

export function routeRulesForFiles({ rules = [], routes = [] }) {
  const routeList = Array.isArray(routes) ? routes : [routes].filter(Boolean);
  const decisions = [];
  const selected = [];
  const seen = new Set();

  for (const rule of rules) {
    const rulePaths = toArray(rule.paths);
    const ruleCapabilities = toArray(rule.capabilities);
    const routeMatches = [];
    const routeSkips = [];

    for (const route of routeList) {
      const pathOk = matchesPath(route.file, rulePaths);
      const capResult = capabilityMatches(ruleCapabilities, route.capabilities || []);
      const unknownBlocked = route.unknownLimited && !isCommonRule(rule);
      if (pathOk && capResult.ok && !unknownBlocked) {
        routeMatches.push({ file: route.file, reason: [rulePaths.length ? 'path' : 'no-path-scope', capResult.reason].join('+') });
      } else {
        const reasons = [];
        if (!pathOk) reasons.push('path-mismatch');
        if (!capResult.ok) reasons.push(capResult.reason);
        if (unknownBlocked) reasons.push('unknown-limited');
        routeSkips.push({ file: route.file, reason: reasons.join('+') || 'not-applicable' });
      }
    }

    const matched = routeMatches.length > 0;
    decisions.push({
      ruleId: rule.id,
      source: rule.source,
      matched,
      matchReason: matched ? routeMatches.map((item) => `${item.file}:${item.reason}`).join('; ') : '',
      skipReason: matched ? '' : routeSkips.map((item) => `${item.file}:${item.reason}`).join('; '),
      capabilities: ruleCapabilities,
      paths: rulePaths,
    });
    if (matched && !seen.has(rule.id)) {
      selected.push(rule);
      seen.add(rule.id);
    }
  }

  return {
    rules: selected,
    diagnostics: {
      totalRules: rules.length,
      selectedRules: selected.length,
      excludedRules: Math.max(0, rules.length - selected.length),
      decisions,
    },
  };
}
