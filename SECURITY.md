# 安全政策｜Security Policy

## 回報資安問題｜Reporting a vulnerability

如果你發現這個網站或 repo 有資安問題，請**不要**開公開的 Issue。請使用 GitHub 的私下回報功能：repo 頁面的 **Security → Report a vulnerability**。

If you find a security issue in this site or repo, please **don't** open a public issue. Use GitHub's private reporting instead: **Security → Report a vulnerability** on the repo page.

## 本專案的防護措施｜What this project does

- 純靜態網站，沒有伺服器、資料庫或登入功能。 / Static site with no server, database or sign-in.
- 部署於 Netlify，以 HTTP 標頭提供內容安全政策（CSP）、防點擊劫持、MIME 類型保護、權限政策與 HSTS。 / Hosted on Netlify with HTTP headers for CSP, anti-clickjacking, MIME sniffing protection, Permissions-Policy and HSTS.
- 所有外部連結只接受 `https://` 網址，建置前自動檢查資料檔。 / External links accept `https://` only, and data files are checked before every build.
- 依 `package-lock.json` 安裝固定版本套件，並由 Dependabot 追蹤更新。 / Dependencies install from `package-lock.json` and are tracked by Dependabot.
- 每次推送與 Pull Request 都由 GitHub Actions 執行資料檢查與建置。 / GitHub Actions runs the data check and build on every push and pull request.
- 字型放在網站本身，不向第三方傳送訪客資料。 / Fonts are self-hosted; no visitor data goes to third parties.
- API 金鑰只能放在 GitHub Secrets，絕不放進前端程式碼。 / API keys live only in GitHub Secrets, never in front-end code.

## 已知限制｜Known limitations

若改用 GitHub Pages 部署（`DEPLOY_TARGET=github-pages`），由於無法自訂 HTTP 標頭，CSP 會改用 `<meta>` 版本，`frame-ancestors` 等只能用標頭設定的防護將無法啟用。

When building for GitHub Pages (`DEPLOY_TARGET=github-pages`), custom HTTP headers aren't available, so the CSP falls back to `<meta>` and header-only protections such as `frame-ancestors` don't apply.
