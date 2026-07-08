import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFileRouteContext } from '../src/routes/file-route-context.js';

test('FileRouteContext returns every matching route for a Java mapper file', () => {
  const context = buildFileRouteContext({
    file: 'src/main/java/com/acme/order/OrderMapper.java',
    content: '@Select("select * from orders where id = " + id)',
  });

  assert.equal(context.file, 'src/main/java/com/acme/order/OrderMapper.java');
  assert.ok(context.labels.includes('java'));
  assert.ok(context.labels.includes('java-inline-sql'));
  assert.ok(context.labels.includes('sql'));
  assert.ok(context.labels.includes('mybatis'));
});

test('FileRouteContext returns SQL and migration routes for ordinary sql files', () => {
  const context = buildFileRouteContext({
    file: 'db/migrations/V20260614__bad_insert.sql',
    content: 'insert into users(id, name) values (1);',
  });

  assert.ok(context.labels.includes('sql'));
  assert.ok(context.labels.includes('migration'));
  assert.ok(context.dialectCandidates.includes('generic'));
});

test('FileRouteContext detects MQ routes from Java listener files', () => {
  const context = buildFileRouteContext({
    file: 'src/main/java/com/acme/mq/PaymentListener.java',
    content: '@RabbitListener(queues = "pay") public void on(Message m) {}',
  });

  assert.ok(context.labels.includes('java'));
  assert.ok(context.labels.includes('mq'));
  assert.ok(context.labels.includes('rabbitmq'));
});

test('FileRouteContext normalizes Windows path separators', () => {
  const context = buildFileRouteContext({
    file: 'src\\main\\resources\\mapper\\OrderMapper.xml',
    content: '<select id="find">select * from orders</select>',
  });

  assert.equal(context.file, 'src/main/resources/mapper/OrderMapper.xml');
  assert.ok(context.labels.includes('sql'));
  assert.ok(context.labels.includes('mybatis'));
});


test('FileRouteContext keeps weak MQ words from adding MQ capability', () => {
  const context = buildFileRouteContext({
    file: 'src/main/resources/application.yml',
    content: 'exchange: external\nrouting-key: profile\nconsumer-group: analytics\n',
  });

  assert.ok(context.labels.includes('config'));
  assert.equal(context.capabilities.includes('middleware.mq'), false);
  assert.equal(context.labels.includes('mq'), false);
});
