// @ts-check
import { defineConfig } from 'astro/config';

// 部署目標：預設為 Cloudflare Pages 或 Netlify（網站放在根目錄，安全標頭由 public/_headers 與 netlify.toml 提供）。
// 若要改回 GitHub Pages，建置時設定環境變數 DEPLOY_TARGET=github-pages。
// Deploy target: Cloudflare Pages or Netlify by default (site at the root; security headers come from public/_headers and netlify.toml).
// To build for GitHub Pages instead, set DEPLOY_TARGET=github-pages.
const isGitHubPages = process.env.DEPLOY_TARGET === 'github-pages';

export default defineConfig({
  // 網站正式網址：優先用自訂的 SITE_URL，其次是 Netlify 的 URL、Cloudflare Pages 的 CF_PAGES_URL（後者是該次部署的網址）
  // The site's main address: a custom SITE_URL first, then Netlify's URL, then Cloudflare Pages' CF_PAGES_URL (that one is the deployment's own address)
  site: isGitHubPages ? 'https://wantingpan.github.io' : (process.env.SITE_URL ?? process.env.URL ?? process.env.CF_PAGES_URL),
  base: isGitHubPages ? '/dev-intel-hub' : '/',
  build: {
    // 樣式一律輸出成獨立檔案，讓 CSP 可以使用 style-src 'self'
    // Always emit CSS as files so CSP can use style-src 'self'
    inlineStylesheets: 'never',
  },
  // 不顯示開發工具列（它會注入內嵌腳本）/ Disable the dev toolbar (it injects inline scripts)
  devToolbar: { enabled: false },
});
