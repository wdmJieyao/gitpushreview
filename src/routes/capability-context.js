export function normalizePath(file) {
  return String(file || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function uniq(items) {
  return [...new Set(items.filter(Boolean))];
}

function addEvidence(list, type, value, confidence = 0.8, source = 'content') {
  if (!value) return;
  list.push({ type, value, confidence, source });
}

function routeFor(capability, confidence, matchKind, evidence) {
  return { capability, confidence, matchKind, evidence: uniq(evidence) };
}

function pathExtension(lower) {
  const match = lower.match(/(\.[a-z0-9]+)$/);
  return match ? match[1] : '';
}

function detectDialect(lower, contentLower, routes, evidence) {
  const combined = `${lower}\n${contentLower}`;
  const dialects = [];
  if (/mysql|auto_increment|engine\s*=|limit\s+\d+/i.test(combined)) {
    dialects.push('mysql');
    routes.push(routeFor('persistence.sql.mysql', 0.82, 'inferred', ['mysql-token']));
    addEvidence(evidence, 'dialect', 'mysql-token', 0.82);
  }
  if (/postgres|postgresql|jsonb|on\s+conflict|serial\b/i.test(combined)) {
    dialects.push('postgresql');
    routes.push(routeFor('persistence.sql.postgresql', 0.82, 'inferred', ['postgresql-token']));
    addEvidence(evidence, 'dialect', 'postgresql-token', 0.82);
  }
  if (/oracle|varchar2|connect\s+by|sequence|\.pkb$|\.pks$/i.test(combined)) {
    dialects.push('oracle');
    routes.push(routeFor('persistence.sql.oracle', 0.82, 'inferred', ['oracle-token']));
    addEvidence(evidence, 'dialect', 'oracle-token', 0.82);
  }
  if (/oceanbase/i.test(combined)) {
    dialects.push('oceanbase');
    routes.push(routeFor('persistence.sql.oceanbase', 0.82, 'inferred', ['oceanbase-token']));
    addEvidence(evidence, 'dialect', 'oceanbase-token', 0.82);
  }
  return uniq(dialects);
}

export function buildCapabilityContext({ file, content = '', projectProfile = {} }) {
  const normalized = normalizePath(file);
  const lower = normalized.toLowerCase();
  const text = String(content || '');
  const contentLower = text.toLowerCase();
  const evidence = [];
  const routes = [];
  const capabilities = [];
  const labels = [];

  const addCapability = (capability, label, confidence, matchKind, reasons) => {
    capabilities.push(capability);
    if (label) labels.push(label);
    routes.push(routeFor(capability, confidence, matchKind, reasons));
    for (const reason of reasons) addEvidence(evidence, 'capability', `${capability}:${reason}`, confidence);
  };

  if (/\.java$/.test(lower)) addCapability('language.java', 'java', 0.95, 'exact', ['extension:.java']);
  if (/\.vue$/.test(lower)) addCapability('frontend.vue', 'vue', 0.95, 'exact', ['extension:.vue']);
  if (/\.(ts|tsx)$/.test(lower)) addCapability('frontend.typescript', 'frontend-ts', 0.78, 'exact', [`extension:${pathExtension(lower)}`]);
  if (/\.(js|jsx)$/.test(lower)) addCapability('frontend.javascript', 'frontend-js', 0.76, 'exact', [`extension:${pathExtension(lower)}`]);
  const hasVueSignal = !lower.endsWith('.vue') && (
    /\bfrom\s+['"]vue['"]|\bimport\s+Vue\b|\bcreateApp\s*\(|\bdefineComponent\s*\(/.test(text)
    || /(^|\/)(vue\.config|vite\.config|nuxt\.config)\.[cm]?[jt]s$/.test(lower)
  );
  if (hasVueSignal) addCapability('frontend.vue', 'vue', 0.86, 'inferred', ['vue-signal']);
  if (/\.(py|pyw)$/.test(lower)) addCapability('language.python', 'python', 0.95, 'exact', [`extension:${pathExtension(lower)}`]);
  if (/\.(ya?ml|properties|json|env|conf|toml)$/.test(lower) || /(^|\/)\.env/.test(lower)) addCapability('common.config', 'config', 0.9, 'exact', ['config-extension']);
  if (/\.xml$/.test(lower)) addCapability('common.xml', 'xml', 0.85, 'exact', ['extension:.xml']);
  if (/\.drl$/.test(lower) || /(^|\/)(rules|drools)\//.test(lower) || /\b(KieSession|KieContainer|Drools|RuleRuntime)\b/.test(text)) addCapability('rules.drools', 'drools', 0.88, 'inferred', ['drools-signal']);

  const hasSqlPath = /\.sql$/.test(lower) || /(^|\/)(db|database|schema|migrations?|ddl|dml)\//.test(lower);
  const hasSqlContent = /\b(select|insert|update|delete|merge|create\s+table|alter\s+table|drop\s+table|truncate)\b/i.test(text);
  if (hasSqlPath || hasSqlContent) addCapability('persistence.sql', 'sql', hasSqlPath ? 0.95 : 0.76, hasSqlPath ? 'exact' : 'inferred', [hasSqlPath ? 'sql-path-or-extension' : 'sql-token']);
  if (/migrations?|schema|database|db|ddl|dml/.test(lower)) addCapability('workflow.db-migration', 'migration', 0.82, 'inferred', ['migration-path']);

  const hasMybatis = /mapper/.test(lower) || /@(Select|Insert|Update|Delete)\s*\(/.test(text) || /<(select|insert|update|delete)\b/i.test(text);
  if (hasMybatis) addCapability('persistence.mybatis', 'mybatis', 0.86, 'inferred', ['mybatis-signal']);
  if (/\.java$/.test(lower) && (/@(Select|Insert|Update|Delete|Query)\s*\(/.test(text) || /\b(JdbcTemplate|createNativeQuery|prepareStatement)\b/.test(text) || /"\s*(select|insert|update|delete)\b/i.test(text))) {
    addCapability('persistence.sql.inline-java', 'java-inline-sql', 0.86, 'inferred', ['java-inline-sql']);
    if (!capabilities.includes('persistence.sql')) addCapability('persistence.sql', 'sql', 0.78, 'inferred', ['java-inline-sql']);
  }

  const mqCombined = `${lower}\n${text}`;
  const hasMq = /(@RabbitListener|@KafkaListener|RabbitTemplate|KafkaTemplate|spring\.rabbitmq|spring\.kafka|bootstrap-servers|bootstrap\.servers|basicNack|basicAck|sasl\.jaas\.config|\brabbitmq\s*:|\bkafka\s*:|allow\.auto\.create\.topics|auto\.create\.topics\.enable)/i.test(text) || /\b(mq|kafka|rabbit|rabbitmq|rocketmq|pulsar)\b/i.test(lower);
  if (hasMq) addCapability('middleware.mq', 'mq', 0.82, 'inferred', ['mq-signal']);
  if (/rabbitmq|@RabbitListener|RabbitTemplate|spring\.rabbitmq|basicNack|basicAck|\brabbitmq\s*:/i.test(mqCombined)) addCapability('middleware.mq.rabbitmq', 'rabbitmq', 0.9, 'inferred', ['rabbitmq-signal']);
  if (/kafka|@KafkaListener|KafkaTemplate|spring\.kafka|bootstrap-servers|bootstrap\.servers|allow\.auto\.create\.topics|sasl\.jaas\.config|\bkafka\s*:/i.test(mqCombined)) addCapability('middleware.mq.kafka', 'kafka', 0.9, 'inferred', ['kafka-signal']);

  if (/redis|RedisTemplate|StringRedisTemplate|LettuceConnectionFactory|jedis|redisson/i.test(`${lower}\n${text}`)) addCapability('middleware.redis', 'redis', 0.87, 'inferred', ['redis-signal']);
  if (/spring-boot|@SpringBootApplication|org\.springframework|spring\./i.test(`${lower}\n${text}`)) addCapability('backend.spring', 'spring', 0.78, 'inferred', ['spring-signal']);
  if (/pom\.xml$|build\.gradle|package\.json$|requirements.*\.txt$|pyproject\.toml$|poetry\.lock$|yarn\.lock$|pnpm-lock\.yaml$|package-lock\.json$/i.test(lower)) addCapability('workflow.supply-chain', 'supply-chain', 0.88, 'exact', ['manifest-or-lockfile']);
  if (/password|passwd|secret|token|private[_-]?key|access[_-]?key|sasl\.jaas\.config|AKIA[0-9A-Z]{16}/i.test(text)) addCapability('security.secrets', 'security', 0.8, 'inferred', ['secret-like-token']);

  const dialects = detectDialect(lower, contentLower, routes, evidence);
  for (const dialect of dialects) {
    const capability = `persistence.sql.${dialect}`;
    if (!capabilities.includes(capability)) {
      capabilities.push(capability);
      labels.push(dialect);
    }
  }
  const dialectCandidates = dialects.length ? dialects : (capabilities.includes('persistence.sql') ? ['generic'] : []);
  if (capabilities.includes('persistence.sql') && dialectCandidates.includes('generic')) {
    routes.push(routeFor('persistence.sql.generic', 0.55, 'fallback', ['unknown-sql-dialect']));
    addEvidence(evidence, 'dialect', 'generic-sql-fallback', 0.55);
  }

  for (const profileCapability of projectProfile?.confirmedCapabilities || []) {
    if (!capabilities.includes(profileCapability)) {
      capabilities.push(profileCapability);
      routes.push(routeFor(profileCapability, 0.45, 'profile', ['confirmed-project-profile']));
      addEvidence(evidence, 'profile', profileCapability, 0.45, 'profile');
    }
  }

  const uniqueCapabilities = uniq(capabilities);
  const uniqueLabels = uniq(labels);
  const isUnknown = uniqueCapabilities.length === 0;
  if (isUnknown) {
    routes.push(routeFor('common.unknown-limited', 0.35, 'fallback', ['no-stable-capability-signal']));
    uniqueCapabilities.push('common.unknown-limited');
    uniqueLabels.push('unknown-limited');
  }
  if (!uniqueCapabilities.includes('common.core')) uniqueCapabilities.push('common.core');
  if (!uniqueLabels.includes('common-core')) uniqueLabels.push('common-core');

  return {
    file: normalized,
    extension: pathExtension(lower),
    labels: uniqueLabels,
    capabilities: uniqueCapabilities,
    dialectCandidates,
    evidence: evidence.map((item) => `${item.type}:${item.value}`),
    evidenceDetails: evidence,
    routes,
    unknownLimited: isUnknown,
  };
}

export function buildFileRouteContext(input) {
  return buildCapabilityContext(input);
}
