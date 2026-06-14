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
