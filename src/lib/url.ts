/**
 * 只允許 https:// 開頭的網址，避免 javascript: 等危險協定被放進連結。
 * Only allow https:// URLs so dangerous schemes such as javascript: never reach a link.
 */
export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' ? u.href : undefined;
  } catch {
    return undefined;
  }
}
