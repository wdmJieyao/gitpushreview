import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCapabilityContext } from '../src/routes/capability-context.js';

test('capability context detects multiple capabilities for Java MyBatis inline SQL', () => {
  const context = buildCapabilityContext({
    file: 'src/main/java/com/acme/order/OrderMapper.java',
    content: '@Select("select * from orders where id = " + id)',
  });

  assert.ok(context.capabilities.includes('language.java'));
  assert.ok(context.capabilities.includes('persistence.mybatis'));
  assert.ok(context.capabilities.includes('persistence.sql'));
  assert.ok(context.capabilities.includes('persistence.sql.inline-java'));
  assert.equal(context.unknownLimited, false);
});

test('capability context detects config Kafka without RabbitMQ capability', () => {
  const context = buildCapabilityContext({
    file: 'src/main/resources/application-prod.yml',
    content: 'spring.kafka.bootstrap-servers: localhost:9092\nspring.kafka.admin.auto-create: true',
  });

  assert.ok(context.capabilities.includes('common.config'));
  assert.ok(context.capabilities.includes('middleware.mq'));
  assert.ok(context.capabilities.includes('middleware.mq.kafka'));
  assert.equal(context.capabilities.includes('middleware.mq.rabbitmq'), false);
});

test('capability context detects Python Vue Redis Drools and unknown-limited fallback', () => {
  assert.ok(buildCapabilityContext({ file: 'scripts/job.py', content: 'print("ok")' }).capabilities.includes('language.python'));
  assert.ok(buildCapabilityContext({ file: 'src/pages/Login.vue', content: '<template />' }).capabilities.includes('frontend.vue'));
  assert.ok(buildCapabilityContext({ file: 'src/main/java/RedisCache.java', content: 'RedisTemplate<String,String> redisTemplate;' }).capabilities.includes('middleware.redis'));
  assert.ok(buildCapabilityContext({ file: 'rules/pricing.drl', content: 'rule "x" when then end' }).capabilities.includes('rules.drools'));

  const unknown = buildCapabilityContext({ file: 'README.md', content: 'plain notes' });
  assert.equal(unknown.unknownLimited, true);
  assert.ok(unknown.capabilities.includes('common.unknown-limited'));
  assert.ok(unknown.capabilities.includes('common.core'));
  assert.equal(unknown.capabilities.includes('persistence.sql'), false);
});
