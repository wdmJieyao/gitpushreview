export function parseReviewJson(text) {
  const fenced = text.match(/```json\r?\n([\s\S]*?)\r?\n```/);
  const raw = fenced ? fenced[1] : text;
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.findings)) {
    throw new Error('Review response must contain findings array');
  }
  return parsed;
}
