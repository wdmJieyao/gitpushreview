export function resolveApiKey({ config, env = process.env }) {
  return config.apiKey || (config.apiKeyEnv ? env[config.apiKeyEnv] : '');
}

export async function callReviewModel({ config, apiKey, env = process.env, messages, fetchImpl = fetch }) {
  const resolvedApiKey = apiKey || resolveApiKey({ config, env });
  if (!resolvedApiKey) throw new Error(`缺少 API 密钥。请在 reviewmodel.json 中配置 apiKey，或配置环境变量 ${config.apiKeyEnv}`);
  const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const timeoutMs = Number(config.timeoutMs) > 0 ? Number(config.timeoutMs) : 0;
  const controller = timeoutMs ? new AbortController() : null;
  const timeout = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;
  let response;

  try {
    response = await fetchImpl(url, {
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
      ...(controller ? { signal: controller.signal } : {}),
    });
  } catch (error) {
    if (controller?.signal.aborted || error?.name === 'AbortError') {
      throw new Error(`模型请求超时：${timeoutMs}ms`);
    }
    throw error;
  } finally {
    if (timeout) clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`模型请求失败：${response.status} ${await response.text()}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content || '';
}
