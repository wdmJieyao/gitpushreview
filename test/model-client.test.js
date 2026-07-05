import test from 'node:test';
import assert from 'node:assert/strict';
import { callReviewModel, resolveApiKey } from '../src/model/client.js';

test('resolveApiKey prefers apiKey from config over apiKeyEnv', () => {
  const apiKey = resolveApiKey({
    config: { apiKey: 'config-key', apiKeyEnv: 'GITPUSHREVIEW_API_KEY' },
    env: { GITPUSHREVIEW_API_KEY: 'env-key' },
  });

  assert.equal(apiKey, 'config-key');
});

test('callReviewModel uses apiKey from config', async () => {
  let request = null;
  const content = await callReviewModel({
    config: {
      baseUrl: 'https://model.example/v1',
      apiKey: 'config-key',
      apiKeyEnv: 'GITPUSHREVIEW_API_KEY',
      model: 'demo-model',
    },
    messages: [{ role: 'user', content: 'review' }],
    fetchImpl: async (url, init) => {
      request = { url, init };
      return {
        ok: true,
        async json() {
          return { choices: [{ message: { content: '{"findings":[]}' } }] };
        },
      };
    },
  });

  assert.equal(request.url, 'https://model.example/v1/chat/completions');
  assert.equal(request.init.headers.authorization, 'Bearer config-key');
  assert.equal(content, '{"findings":[]}');
});

test('callReviewModel throws Chinese error when apiKey is missing', async () => {
  await assert.rejects(
    () => callReviewModel({
      config: {
        baseUrl: 'https://model.example/v1',
        apiKeyEnv: 'GITPUSHREVIEW_API_KEY',
        model: 'demo-model',
      },
      messages: [],
      env: {},
      fetchImpl: async () => ({ ok: true, async json() { return { choices: [{ message: { content: '' } }] }; } }),
    }),
    /缺少 API 密钥/,
  );
});

test('callReviewModel throws Chinese error when request fails', async () => {
  await assert.rejects(
    () => callReviewModel({
      config: {
        baseUrl: 'https://model.example/v1',
        apiKey: 'config-key',
        model: 'demo-model',
      },
      messages: [],
      fetchImpl: async () => ({
        ok: false,
        status: 500,
        async text() { return 'boom'; },
      }),
    }),
    /模型请求失败/,
  );
});

test('callReviewModel aborts request and throws Chinese error when timeoutMs elapses', async () => {
  let signal = null;

  await assert.rejects(
    () => callReviewModel({
      config: {
        baseUrl: 'https://model.example/v1',
        apiKey: 'config-key',
        model: 'demo-model',
        timeoutMs: 5,
      },
      messages: [],
      fetchImpl: async (url, init) => {
        signal = init.signal;
        assert.ok(signal);

        return new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => {
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
          }, { once: true });
        });
      },
    }),
    /模型请求超时：5ms/,
  );

  assert.equal(signal.aborted, true);
});
