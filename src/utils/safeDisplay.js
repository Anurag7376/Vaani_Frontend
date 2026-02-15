/**
 * Safe display value for JSX. Never render objects directly.
 * - Primitives returned as string.
 * - Objects with `name` (e.g. { id, name }) return name only.
 */
export function safeStr(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object' && val !== null && 'name' in val) return val.name ?? '';
  return '';
}

/**
 * Safe date string for display.
 */
export function safeDate(val) {
  if (val == null) return '—';
  const d = typeof val === 'object' && val !== null && 'date' in val ? val.date : val;
  try {
    const date = new Date(d);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { dateStyle: 'medium' });
  } catch {
    return '—';
  }
}

/**
 * Safe URL string (handles object with href/url).
 */
export function safeUrl(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) return val.href ?? val.url ?? '';
  return '';
}
