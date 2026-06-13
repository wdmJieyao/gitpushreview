export async function callReviewModel({ config, apiKey, messages, fetchImpl = fetch }) {
  if (!apiKey) throw new Error(`Missing API key for ${config.apiKeyEnv}`);
  const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
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
