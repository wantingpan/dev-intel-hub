// @ts-check
import { defineConfig } from 'astro/config';

// 部署目標：預設為 Netlify（網站放在根目錄）。
// 若要改回 GitHub Pages，建置時設定環境變數 DEPLOY_TARGET=github-pages。
// Deploy target: Netlify by default (site at the root).
// To build for GitHub Pages instead, set DEPLOY_TARGET=github-pages.
const isGitHubPages = process.env.DEPLOY_TARGET === 'github-pages';

export default defineConfig({
  // Netlify 建置時會提供 URL 環境變數（網站正式網址）
  // Netlify provides the URL environment variable (the site's main address) during builds
  site: isGitHubPages ? 'https://wantingpan.github.io' : process.env.URL,
  base: isGitHubPages ? '/dev-intel-hub' : '/',
  build: {
    // 樣式一律輸出成獨立檔案，讓 CSP 可以使用 style-src 'self'
    // Always emit CSS as files so CSP can use style-src 'self'
    inlineStylesheets: 'never',
  },
  // 不顯示開發工具列（它會注入內嵌腳本）/ Disable the dev toolbar (it injects inline scripts)
  devToolbar: { enabled: false },
});
