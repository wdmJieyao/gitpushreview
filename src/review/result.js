export function parseReviewJson(text) {
  const fenced = text.match(/```json\r?\n([\s\S]*?)\r?\n```/);
  const raw = fenced ? fenced[1] : text;
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.findings)) {
    throw new Error('模型响应必须包含 findings 数组');
  }
  return parsed;
}
