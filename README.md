# 軟體人每日情報｜DevBrief Daily

為軟體工程師整理的每日重點：AI、程式語言與框架、雲端與 DevOps、資安漏洞，一頁掌握。支援繁體中文與 English。

A daily briefing for software engineers covering AI, languages and frameworks, cloud and DevOps, and security vulnerabilities in one page. Available in Traditional Chinese and English.

[English](#english) ｜ [繁體中文](#繁體中文)

---

## 繁體中文

### 功能

- **需要行動**：首頁最上方列出已遭利用或重大等級的漏洞，以及建議的升級版本。
- **新聞動態**：依「產業焦點、AI 與 LLM、語言與框架、雲端與 DevOps、資安」分類，可切換篩選。每則附日期、來源與原始連結。
- **資安修補清單**：漏洞編號、CVSS、狀態與建議動作。
- **事件影響**（`/zh-TW/impact/`）：從軟體人角度拆解技術事件，包含發生經過、對工作的影響、資安風險，以及美股與台股的實際反應。只呈現已報導的事實，不提供投資建議。
- **雙語介面**：`/zh-TW/` 與 `/en/`，首頁依瀏覽器語言自動導向。
- 支援手機與電腦瀏覽、深色與淺色模式。

### 本機開發

需要 Node.js 20.3.0 或 22 以上版本。

```bash
npm install
npm run dev
```

第一次執行 `npm install` 會產生 `package-lock.json`，**請把它一起提交到 repo**，部署流程會依照它安裝固定版本的套件。

修改資料檔後，可以先執行 `npm run check:data` 檢查格式與網址。

### 部署到 Netlify

網站透過 Netlify 直接連結這個 GitHub repo 部署，設定都在 `netlify.toml`：

- 推送到 `main`：Netlify 自動建置並上線。
- 發 Pull Request：Netlify 自動產生預覽網址，GitHub Actions 同時執行 CI 檢查。
- 建置前會自動執行資料檢查，資料有誤時建置失敗、不會上線。
- 資安標頭（CSP、防點擊劫持等）由 `netlify.toml` 以 HTTP 標頭提供。

首次設定：登入 Netlify → 新增網站 → 從 GitHub 匯入現有專案 → 授權並選擇此 repo → 確認建置設定（會自動讀取 `netlify.toml`）→ 部署。

若要改回 GitHub Pages，建置時設定環境變數 `DEPLOY_TARGET=github-pages`，網址路徑會自動切換為 `/dev-intel-hub/`。

### 資料格式

內容放在 `src/data/`：

- `news.json`：新聞。`title` 與 `summary` 各有 `zh-TW` 與 `en` 兩種語言；`category` 為 `industry`、`ai`、`lang`、`cloud`、`security` 其中之一；`sourceType` 為 `official`、`media` 或 `secondary`；`corroboration` 列出其他確認來源（只列實際查到並附連結的來源）；`dispute` 記錄說法分歧（選填，至少兩方說法）。
- `cves.json`：漏洞。`severity` 為 `exploited`、`critical` 或 `high`；`cvss` 沒有分數時為 `null`。
- `events.json`：事件影響卡片。`status` 為 `ongoing`、`monitoring`、`patched` 或 `resolved`；`updates` 是後續追蹤時間軸，每筆都要附出處；`disputes` 記錄說法分歧；`postmortem` 為事後檢討報告連結（未發布時為 `null`）。市場資料需註明時間點（收盤或盤中）與來源；資安內容分為「已報導」與「常見模式」。
- `kev.json`：CISA 已遭利用漏洞清單，由 `.github/workflows/kev-sync.yml` 每小時自動同步，**請勿手動編輯**。本機可執行 `node scripts/fetch-kev.mjs` 立即更新。
- `meta.json`：查證日期，以及過期提示的門檻天數（`staleAfterDays`、`developingStaleAfterDays`）。

介面文字放在 `src/i18n/ui.ts`。

### 內容更新

更新頻率、查證規則、資料範本與提交流程，請見 [docs/UPDATING.md](docs/UPDATING.md)。網站會在資料超過設定天數未查證時，自動顯示過期提示。

### 內容原則

- 每則消息都要有可查證的原始出處。
- 摘要以自己的文字改寫並附原始連結，不轉載全文。
- 來源說法互相矛盾時，並列各方說法並說明本站判斷依據；無法判斷時不收錄。
- 來源數量只計算實際查到並附上連結的來源，不虛報。
- 來自週報或彙整網站的項目，在摘要中註明。
- 事件影響頁：只在媒體明確報導時指出事件與股價的關聯，並列出其他可能影響股價的因素；不提供買賣建議或股價預測。

### 資安

防護措施與回報方式請見 [SECURITY.md](SECURITY.md)。建議在 GitHub 上完成以下設定：

1. 帳號開啟兩步驟驗證：頭像 → **Settings → Password and authentication**。
2. 保護 `main` 分支：repo **Settings → Rules → Rulesets**（或 **Branches**），禁止強制推送與刪除分支，並要求 CI 檢查通過才能合併。
3. 開啟安全通知：repo **Settings → Advanced Security**（部分帳號顯示為 **Code security**），啟用 Dependabot alerts 與 security updates。
4. 開啟私下回報：同一頁啟用 **Private vulnerability reporting**。

### 發展規劃

- [x] 第一階段：雙語靜態網站（目前版本，資料手動更新）
- [x] Netlify 自動部署與 GitHub Actions CI 檢查
- [x] 第二階段（第一步）：每小時自動同步 CISA 已遭利用漏洞清單
- [ ] 第二階段：以 GitHub Actions 排程，自動抓取更多公開資料來源（各來源須先確認使用條款）
- [ ] 第二階段：選用 AI 產生摘要與翻譯草稿，經人工審核後發布
- [ ] 第二階段：串接股價資料來源（須確認市場資料的轉載與展示授權）
- [ ] 第三階段：網站 RSS 輸出、電子報、讀者互動

### 關於 API 金鑰與費用（第二階段，尚未實作）

自動摘要與翻譯為**選用功能**。若要啟用，部署者需自行準備 AI 服務的 API 金鑰並承擔使用費用，金鑰存放在 repo 的 **Settings → Secrets and variables → Actions**，只在建置流程中使用，**絕不放進前端程式碼**。未設定金鑰時，網站仍可用手動更新的資料正常運作。

---

## English

### Features

- **Act on this**: exploited or critical vulnerabilities with the version to upgrade to, right at the top.
- **News**: filter by Industry, AI & LLMs, Languages & frameworks, Cloud & DevOps, and Security. Every item has a date, source and link to the original.
- **Patch list**: CVE, CVSS, status and what to do.
- **Event impact** (`/en/impact/`): a tech event through an engineer's eyes, covering what happened, the impact on your work, security risks, and how US and Taiwan stocks actually moved. Reported facts only; not investment advice.
- **Bilingual**: `/zh-TW/` and `/en/`; the root URL redirects based on browser language.
- Responsive, with light and dark modes.

### Local development

Requires Node.js 20.3.0, or 22 and later.

```bash
npm install
npm run dev
```

The first `npm install` creates `package-lock.json`. **Commit it**: the deploy workflow installs the exact versions it lists.

After editing data files, run `npm run check:data` to validate them.

### Deploy to Netlify

The site deploys through Netlify's direct link to this GitHub repo; settings live in `netlify.toml`:

- Push to `main`: Netlify builds and publishes automatically.
- Open a pull request: Netlify creates a preview URL while GitHub Actions runs CI checks.
- The data check runs before every build; bad data fails the build and never goes live.
- Security headers (CSP, anti-clickjacking and more) are sent as HTTP headers from `netlify.toml`.

First-time setup: sign in to Netlify → add a new site → import an existing project from GitHub → authorize and pick this repo → confirm the build settings (read from `netlify.toml`) → deploy.

To build for GitHub Pages instead, set `DEPLOY_TARGET=github-pages`; the base path switches to `/dev-intel-hub/` automatically.

### Data

Content lives in `src/data/`:

- `news.json`: stories. `title` and `summary` each have `zh-TW` and `en`; `category` is one of `industry`, `ai`, `lang`, `cloud`, `security`; `sourceType` is `official`, `media` or `secondary`; `corroboration` lists other confirming sources (only ones actually found and linked); `dispute` records conflicting reports (optional, at least two claims).
- `cves.json`: vulnerabilities. `severity` is `exploited`, `critical` or `high`; `cvss` is `null` when no score was given.
- `events.json`: event impact cards. `status` is `ongoing`, `monitoring`, `patched` or `resolved`; `updates` is a follow-up timeline, each entry sourced; `disputes` records conflicting reports; `postmortem` links the post-incident review (`null` until published). Market rows must state their timing (close or intraday) and source; security items are split into "reported" and "common pattern".
- `kev.json`: CISA's KEV catalog, synced hourly by `.github/workflows/kev-sync.yml`. **Don't edit by hand.** Run `node scripts/fetch-kev.mjs` locally to refresh it now.
- `meta.json`: the verification date and staleness thresholds (`staleAfterDays`, `developingStaleAfterDays`).

UI strings live in `src/i18n/ui.ts`.

### Updating content

See [docs/UPDATING.md](docs/UPDATING.md) for cadence, verification rules, data templates and the update workflow. The site shows a staleness notice once data goes unverified past the configured number of days.

### Content principles

- Every item needs a verifiable original source.
- Summaries are written in our own words and link to the original; full articles are never reproduced.
- Conflicting reports are shown side by side with the data we relied on; if we can't tell, we leave the item out.
- Source counts include only sources we actually found and linked.
- Items from weekly roundups or aggregators are marked as such.
- Event impact: an event is linked to a price move only when the media reports that link, alongside other factors that may have moved the price. No buy or sell advice, no price predictions.

### Security

See [SECURITY.md](SECURITY.md) for protections and how to report issues. Recommended GitHub settings:

1. Turn on two-factor authentication: avatar → **Settings → Password and authentication**.
2. Protect `main`: repo **Settings → Rules → Rulesets** (or **Branches**); block force pushes and deletion, and require the CI check to pass before merging.
3. Turn on security alerts: repo **Settings → Advanced Security** (shown as **Code security** on some accounts); enable Dependabot alerts and security updates.
4. Turn on private reporting: enable **Private vulnerability reporting** on the same page.

### Roadmap

- [x] Phase 1: bilingual static site (current; data updated by hand)
- [x] Netlify auto-deploys with GitHub Actions CI checks
- [x] Phase 2, step one: hourly sync of CISA's Known Exploited Vulnerabilities catalog
- [ ] Phase 2: scheduled GitHub Actions that pull from more public sources (each source's terms checked first)
- [ ] Phase 2: optional AI-drafted summaries and translations, published after human review
- [ ] Phase 2: connect a market data source (licensing for redisplay must be checked first)
- [ ] Phase 3: site RSS feed, newsletter, reader interaction

### API keys and costs (Phase 2, not yet built)

AI summaries and translations are **optional**. To enable them, whoever deploys the site supplies their own AI API key and pays for usage. The key is stored under **Settings → Secrets and variables → Actions**, used only during the build, and **never shipped to the browser**. Without a key, the site keeps working with hand-updated data.
