/**
 * 內容安全政策（CSP）的 <meta> 備用版本，只在部署到 GitHub Pages 時使用。
 * 部署到 Netlify 時，CSP 改由 netlify.toml 以 HTTP 標頭提供（包含 frame-ancestors）。
 *
 * <meta> fallback for the Content Security Policy, used only for GitHub Pages builds.
 * On Netlify, the CSP is sent as an HTTP header from netlify.toml (including frame-ancestors).
 */
export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  'upgrade-insecure-requests',
].join('; ');

/** 是否輸出 <meta> 版 CSP / Whether to emit the <meta> CSP */
export const useMetaCsp = import.meta.env.PROD && process.env.DEPLOY_TARGET === 'github-pages';
