export function resolveApiKey({ config, env = process.env }) {
  return config.apiKey || (config.apiKeyEnv ? env[config.apiKeyEnv] : '');
}

export async function callReviewModel({ config, apiKey, env = process.env, messages, fetchImpl = fetch }) {
  const resolvedApiKey = apiKey || resolveApiKey({ config, env });
  if (!resolvedApiKey) throw new Error(`Missing API key. Set apiKey in reviewmodel.json or configure ${config.apiKeyEnv}`);
  const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${resolvedApiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0,
    }),
  });

  if (!response.ok) {
    throw new Error(`Model request failed: ${response.status} ${await response.text()}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content || '';
}
