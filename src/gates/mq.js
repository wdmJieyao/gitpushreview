const BASE = {
  source: 'deterministic',
  score: 95,
  weightedScore: 95,
  severity: 'critical',
  blocking: 'hard',
};

function finding(ruleId, title, file, evidence, suggestion) {
  return { ...BASE, ruleId, title, file, line: 1, evidence, suggestion };
}

function hasEnvReference(value) {
  return /\$\{|secretKeyRef|vault:|secretsmanager|process\.env|System\.getenv/i.test(value);
}

export function runMqGate({ file, content, route = {} }) {
  if (!route.labels?.includes('mq')) return [];
  const findings = [];

  const passwordLine = content.match(/(?:password|sasl\.jaas\.config)\s*[:=]\s*([^\r\n]+)/i);
  if (passwordLine && !hasEnvReference(passwordLine[1])) {
    findings.push(finding(
      'DEFAULT-MQ-SECRET-001',
      'MQ 配置中存在明文凭据',
      file,
      '检测到 Kafka/RabbitMQ 密码或 SASL JAAS 配置使用明文值。',
      '请改为环境变量、Secret、Vault 或公司统一密钥管理配置，禁止提交明文凭据。',
    ));
  }

  if (route.labels.includes('kafka') && /(application|bootstrap)-prod|prod/i.test(file) && /(auto-create\s*:\s*true|allow\.auto\.create\.topics\s*[:=]\s*true|auto\.create\.topics\.enable\s*[:=]\s*true)/i.test(content)) {
    findings.push(finding(
      'DEFAULT-MQ-KAFKA-AUTO-CREATE-001',
      '生产 Kafka 配置不允许自动创建 Topic',
      file,
      '生产环境配置中启用了 Kafka 自动创建 Topic。',
      '请关闭生产自动建 Topic，并通过受控变更流程预先创建 Topic、分区、副本和权限。',
    ));
  }

  if (route.labels.includes('rabbitmq') && /basicNack\s*\([^)]*,\s*false\s*,\s*true\s*\)/i.test(content)) {
    findings.push(finding(
      'DEFAULT-MQ-RABBIT-REQUEUE-001',
      'RabbitMQ 消费失败不允许无限重新入队',
      file,
      '检测到 basicNack(..., false, true)，失败消息会反复重新入队。',
      '请设置最大重试次数、退避策略和死信队列，避免消息反复消费拖垮服务。',
    ));
  }

  if (route.labels.includes('rabbitmq') && /(durable\s*:\s*false|deliveryMode\s*[:=]\s*NON_PERSISTENT|publisher-confirm-type\s*:\s*none)/i.test(content)) {
    findings.push(finding(
      'DEFAULT-MQ-RABBIT-DURABLE-001',
      'RabbitMQ 关键消息配置缺少持久化保障',
      file,
      '检测到非持久化队列、非持久化投递或关闭 publisher confirm 的配置。',
      '请开启队列和消息持久化，并启用 publisher confirm/return，关键业务消息必须具备可靠投递保障。',
    ));
  }

  return findings;
}
