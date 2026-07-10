import { execFileSync } from 'node:child_process';

const FALLBACK_API_KEY_ENVS = new Set(['GITPUSHREVIEW_API_KEY']);
const USER_ENV_TIMEOUT_MS = 1500;

function readWindowsEnvironmentScope(name, scope, execFileSyncImpl = execFileSync) {
  const escapedName = name.replace(/'/g, "''");

  try {
    return execFileSyncImpl('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `[Environment]::GetEnvironmentVariable('${escapedName}', '${scope}')`,
    ], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: USER_ENV_TIMEOUT_MS,
      maxBuffer: 8192,
    }).trim();
  } catch {
    return '';
  }
}

function readUserEnvironmentVariable(name, { platform = process.platform, execFileSyncImpl = execFileSync } = {}) {
  if (!FALLBACK_API_KEY_ENVS.has(name)) return '';
  if (platform !== 'win32') return '';
  return readWindowsEnvironmentScope(name, 'User', execFileSyncImpl)
    || readWindowsEnvironmentScope(name, 'Machine', execFileSyncImpl);
}

export function resolveApiKey({ config, env = process.env, userEnvReader = readUserEnvironmentVariable }) {
  const directValue = config.apiKey || (config.apiKeyEnv ? env[config.apiKeyEnv] : '');
  if (directValue) return directValue;
  if (!FALLBACK_API_KEY_ENVS.has(config.apiKeyEnv)) return '';
  return userEnvReader(config.apiKeyEnv);
}

export async function callReviewModel({ config, apiKey, env = process.env, messages, fetchImpl = fetch, userEnvReader }) {
  const resolvedApiKey = apiKey || resolveApiKey({ config, env, userEnvReader });
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
