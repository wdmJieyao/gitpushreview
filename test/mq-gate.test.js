import test from 'node:test';
import assert from 'node:assert/strict';
import { runMqGate } from '../src/gates/mq.js';
import { buildFileRouteContext } from '../src/routes/file-route-context.js';

function check(file, content) {
  const route = buildFileRouteContext({ file, content });
  return { route, findings: runMqGate({ file: route.file, content, route }) };
}

test('MQ gate hard-blocks infinite requeue nack', () => {
  const { findings } = check('src/main/java/com/acme/mq/PaymentListener.java', 'channel.basicNack(tag, false, true);');

  assert.equal(findings[0].ruleId, 'DEFAULT-MQ-RABBIT-REQUEUE-001');
  assert.equal(findings[0].blocking, 'hard');
  assert.match(findings[0].suggestion, /死信队列|重试次数|退避/);
});

test('MQ gate hard-blocks RabbitMQ plaintext password', () => {
  const { findings } = check('src/main/resources/application.yml', 'spring:\n  rabbitmq:\n    password: secret123');

  assert.equal(findings[0].ruleId, 'DEFAULT-MQ-SECRET-001');
  assert.equal(findings[0].blocking, 'hard');
  assert.match(findings[0].evidence, /明文/);
});

test('MQ gate hard-blocks Kafka prod auto topic creation', () => {
  const { findings } = check('src/main/resources/application-prod.yml', 'spring:\n  kafka:\n    admin:\n      auto-create: true');

  assert.equal(findings[0].ruleId, 'DEFAULT-MQ-KAFKA-AUTO-CREATE-001');
  assert.equal(findings[0].blocking, 'hard');
});

test('MQ gate hard-blocks Kafka SASL plaintext password', () => {
  const { findings } = check('src/main/resources/application-prod.yml', 'spring:\n  kafka:\n    properties:\n      sasl.jaas.config: org.apache.kafka.common.security.plain.PlainLoginModule required username="app" password="secret123";');

  assert.equal(findings[0].ruleId, 'DEFAULT-MQ-SECRET-001');
  assert.equal(findings[0].blocking, 'hard');
});

test('MQ gate accepts secret references for MQ passwords', () => {
  const { findings } = check('src/main/resources/application-prod.yml', 'spring:\n  rabbitmq:\n    password: $' + '{RABBITMQ_PASSWORD}');

  assert.equal(findings.some((finding) => finding.ruleId === 'DEFAULT-MQ-SECRET-001'), false);
});

test('MQ gate does not hard-block Kafka auto-create outside prod files', () => {
  const { findings } = check('src/main/resources/application-dev.yml', 'spring:\n  kafka:\n    admin:\n      auto-create: true');

  assert.equal(findings.some((finding) => finding.ruleId === 'DEFAULT-MQ-KAFKA-AUTO-CREATE-001'), false);
});

test('MQ gate hard-blocks non-durable RabbitMQ config', () => {
  const { findings } = check('src/main/resources/rabbitmq/application-rabbit.yaml', 'queue:\n  durable: false\ndeliveryMode: NON_PERSISTENT');

  assert.equal(findings[0].ruleId, 'DEFAULT-MQ-RABBIT-DURABLE-001');
  assert.equal(findings[0].blocking, 'hard');
});

test('MQ gate detects Java and YAML MQ signals through multi-hit routing', () => {
  const java = check('src/main/java/com/acme/mq/PaymentListener.java', '@RabbitListener(queues = "pay")');
  const yaml = check('src/main/resources/application.yml', 'spring:\n  kafka:\n    bootstrap-servers: kafka:9092');

  assert.ok(java.route.labels.includes('mq'));
  assert.ok(java.route.labels.includes('rabbitmq'));
  assert.ok(yaml.route.labels.includes('mq'));
  assert.ok(yaml.route.labels.includes('kafka'));
});
