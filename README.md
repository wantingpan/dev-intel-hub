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

- 推送到 `main`：Netlify 自動建置並上線，**這是正式部署，每次扣 15 點**。
- 其他分支與 Pull Request：Netlify 產生預覽網址（不扣點），GitHub Actions 同時執行 CI 檢查。
- 建置前會自動執行資料檢查，資料有誤時建置失敗、不會上線。
- 資安標頭（CSP、防點擊劫持等）由 `netlify.toml` 以 HTTP 標頭提供；`public/_headers` 是同樣內容，供其他平台使用。

首次設定：登入 Netlify → 新增網站 → 從 GitHub 匯入現有專案 → 授權並選擇此 repo → 確認建置設定（會自動讀取 `netlify.toml`）→ 部署。

**部署額度**：Netlify 免費版每月 300 點、每次正式部署 15 點，也就是**每月約 20 次部署**，用完就不能再部署（沒有加買）。所以：

| 用途 | 每月次數 |
|---|---|
| 資料發佈（週一、三、五） | 約 12–14 次 |
| 功能分支合併 | 約 6–8 次 |

- 功能一定要先在分支測試，確認好再合併，**一個功能只合併一次**。
- 預覽部署與分支部署不扣點，但 `data` 分支不需要預覽，建議在 Netlify 的 Site configuration → Build & deploy → Branches and deploy contexts 把 Branch deploys 限制在需要的分支，避免多餘的建置（設定名稱可能略有出入）。
- 想調整發佈頻率，改 `.github/workflows/publish-data.yml` 的 cron。

若要改部署到 Cloudflare Pages（免費版每月 500 次建置，預覽部署不限數量），專案已備好 `public/_headers` 與 `.node-version`：連接 repo 後，Build command 填 `npm run build`、Build output directory 填 `dist`、環境變數 `NODE_VERSION` 填 `22`，並把預覽分支設成排除 `data`。要改回 GitHub Pages，建置時設定環境變數 `DEPLOY_TARGET=github-pages`，網址路徑會自動切換為 `/dev-intel-hub/`。

### 分支流程

- **功能與修改**：開分支 → 本機 `npm run build` 與 `npm run preview` 測試 → 推分支、開 Pull Request → CI 通過並確認預覽網址 → 合併到 `main`。一個功能只合併一次，只部署一次。
- **自動資料更新**：GitHub Actions 的同步與 Claude 排程只寫到 **`data` 分支**，不會觸發部署。`publish-data.yml` 每週一、三、五 17:30（台灣時間）把 `data` 合併到 `main`，合併後才部署。
- `data` 分支不存在時，同步流程會自動從 `main` 建立；`main` 有新內容時，同步前會先併進 `data`。

在 `data` 分支與 `main` 之間發生衝突時，同步或發佈流程會失敗並寄通知，需要手動解決。

### 資料格式

內容放在 `src/data/`：

- `news.json`：新聞。`title` 與 `summary` 各有 `zh-TW` 與 `en` 兩種語言；`originalTitle` 為來源網頁上的英文原文標題（原樣照抄，來源是中文或彙整頁時為 `null`）；`category` 為 `industry`、`ai`、`lang`、`cloud`、`security` 其中之一；`sourceType` 為 `official`、`media` 或 `secondary`；`corroboration` 列出其他確認來源（只列實際查到並附連結的來源）；`dispute` 記錄說法分歧（選填，至少兩方說法）。
- `cves.json`：漏洞。`severity` 為 `exploited`、`critical` 或 `high`；`cvss` 沒有分數時為 `null`。
- `events.json`：事件影響卡片。`status` 為 `ongoing`、`monitoring`、`patched` 或 `resolved`；`updates` 是後續追蹤時間軸，每筆都要附出處；`disputes` 記錄說法分歧；`postmortem` 為事後檢討報告連結（未發布時為 `null`）。市場資料需註明時間點（收盤或盤中）與來源；資安內容分為「已報導」與「常見模式」。
- `kev.json`：CISA 已遭利用漏洞清單，由 `.github/workflows/kev-sync.yml` 每小時自動同步，**請勿手動編輯**。本機可執行 `node scripts/fetch-kev.mjs` 立即更新。
- `ghsa.json`：GitHub 套件漏洞公告（重大與高風險，CC BY 4.0），由 `.github/workflows/feeds-sync.yml` 每天 08:00–17:00 每小時自動同步，**請勿手動編輯**。本機可執行 `node scripts/fetch-ghsa.mjs`。
- `eol.json`：常用語言、框架與平台的最新版本與支援到期日（endoflife.date，MIT 授權），同上排程自動同步，**請勿手動編輯**。本機可執行 `node scripts/fetch-eol.mjs`。
- `feed-sources.json`：技術動態的來源設定（19 個 RSS／Atom 來源、分類、每個來源顯示幾則），以及**關注主題與關鍵字**。想增減來源或關鍵字，改這個檔案即可，不用動程式。`mode` 為 `filter` 的來源（流量大，如 Hacker News）只顯示標題符合關注主題的文章；`all` 則顯示最新幾則。英文關鍵字以完整單字比對，`caseSensitive` 內的字（如 SAFe）會區分大小寫。
- `feeds.json`：技術動態的資料，由 `.github/workflows/feeds-rss.yml` 每天 08:00、12:00、17:00（含週末）自動同步，**請勿手動編輯**。只保存標題、連結與日期，不保存內文或摘要。本機可執行 `node scripts/fetch-feeds.mjs`。所有項目標示為「自動彙整，未經本站查證」。
- `meta.json`：查證日期，以及過期提示的門檻天數（`staleAfterDays`、`developingStaleAfterDays`、`kevStaleAfterDays`、`feedStaleAfterDays`）。

技術動態頁（`/zh-TW/feeds/`）底部提供 OPML 檔（`/feeds.opml`），可一次匯入 Feedly、Inoreader、NetNewsWire 等 RSS 閱讀器。

### 自動更新排程

| 時間（台灣時間） | 執行者 | 更新內容 | 上線方式 |
|---|---|---|---|
| 每小時第 17 分 | GitHub Actions（`kev-sync.yml`） | `kev.json` | 有變動才推到 `data` 分支（不部署） |
| 每天 08:00–17:00 每小時整點 | GitHub Actions（`feeds-sync.yml`） | `ghsa.json`、`eol.json` | 同上 |
| 每天 08:00、12:00、17:00 | GitHub Actions（`feeds-rss.yml`） | `feeds.json` | 同上 |
| 週一到週五 09:10 | 本機 Claude 排程 | 新聞、漏洞、事件、`meta.json` | 依 UPDATING.md 查證，`check:data` 與 `build` 通過後推到 `data` 分支 |
| 週一到週五 13:00 | 本機 Claude 排程 | 只更新「處理中」「觀察中」的事件 | 同上 |
| 每週一、三、五 17:30 | GitHub Actions（`publish-data.yml`） | 把 `data` 合併到 `main` | **合併後才部署上線** |

- GitHub Actions 的排程可能延遲幾分鐘到半小時。
- 資料上線時間：最晚等下一次發佈（週一、三、五 17:30）。
- 本機 Claude 排程需要電腦與 Claude 桌面 App 開著；錯過的時段會在下次打開 App 時補跑。
- Claude 排程寫的內容**不經人工審核直接上線**。發現錯誤時，用 `git revert <commit>` 撤回該次提交即可。

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
- [x] 第二階段：GitHub 套件漏洞公告與 endoflife.date 版本資料，每天 08:00–17:00 每小時自動同步
- [x] 第二階段：本機 Claude 排程，平日 09:10 與 13:00 依查證規則更新新聞與事件
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

- Push to `main`: Netlify builds and publishes automatically. **This is a production deploy and costs 15 credits.**
- Other branches and pull requests: Netlify creates a preview URL (no credits) while GitHub Actions runs CI checks.
- The data check runs before every build; bad data fails the build and never goes live.
- Security headers (CSP, anti-clickjacking and more) are sent as HTTP headers from `netlify.toml`; `public/_headers` has the same content for other hosts.

First-time setup: sign in to Netlify → add a new site → import an existing project from GitHub → authorize and pick this repo → confirm the build settings (read from `netlify.toml`) → deploy.

**Deploy budget**: Netlify's free plan gives 300 credits a month at 15 per production deploy, so **about 20 deploys a month**, with no way to buy more once they run out. So:

| Use | Deploys per month |
|---|---|
| Publishing data (Mon, Wed, Fri) | about 12 to 14 |
| Merging feature branches | about 6 to 8 |

- Test every feature on a branch first and merge once it's ready: **one merge per feature**.
- Preview and branch deploys cost no credits, but the `data` branch doesn't need one. In Netlify's Site configuration → Build & deploy → Branches and deploy contexts, limit Branch deploys to the branches you want, to avoid pointless builds (labels may differ slightly).
- To change how often data is published, edit the cron in `.github/workflows/publish-data.yml`.

To deploy to Cloudflare Pages instead (the free plan has 500 builds a month and unlimited preview deployments), the repo already has `public/_headers` and `.node-version`: connect the repo, set the build command to `npm run build`, the output directory to `dist`, the `NODE_VERSION` variable to `22`, and exclude `data` from preview branches. To build for GitHub Pages, set `DEPLOY_TARGET=github-pages`; the base path switches to `/dev-intel-hub/` automatically.

### Branch workflow

- **Features and changes**: branch → test locally with `npm run build` and `npm run preview` → push the branch and open a pull request → CI passes and the preview URL checks out → merge into `main`. One deploy per feature.
- **Automatic data updates**: the GitHub Actions syncs and the Claude tasks write to the **`data` branch** only, which doesn't deploy. `publish-data.yml` merges `data` into `main` on Mondays, Wednesdays and Fridays at 17:30 Taiwan time, and that merge is what deploys.
- When the `data` branch doesn't exist, the syncs create it from `main`; when `main` has new commits, they're merged into `data` before each sync.

If `data` and `main` conflict, the sync or publish run fails and GitHub sends a notification; resolve it by hand.

### Data

Content lives in `src/data/`:

- `news.json`: stories. `title` and `summary` each have `zh-TW` and `en`; `category` is one of `industry`, `ai`, `lang`, `cloud`, `security`; `sourceType` is `official`, `media` or `secondary`; `corroboration` lists other confirming sources (only ones actually found and linked); `dispute` records conflicting reports (optional, at least two claims).
- `cves.json`: vulnerabilities. `severity` is `exploited`, `critical` or `high`; `cvss` is `null` when no score was given.
- `events.json`: event impact cards. `status` is `ongoing`, `monitoring`, `patched` or `resolved`; `updates` is a follow-up timeline, each entry sourced; `disputes` records conflicting reports; `postmortem` links the post-incident review (`null` until published). Market rows must state their timing (close or intraday) and source; security items are split into "reported" and "common pattern".
- `kev.json`: CISA's KEV catalog, synced hourly by `.github/workflows/kev-sync.yml`. **Don't edit by hand.** Run `node scripts/fetch-kev.mjs` locally to refresh it now.
- `ghsa.json`: critical and high GitHub package advisories (CC BY 4.0), synced hourly 08:00–17:00 Taiwan time by `.github/workflows/feeds-sync.yml`. **Don't edit by hand.** Run `node scripts/fetch-ghsa.mjs` locally.
- `eol.json`: latest versions and end-of-support dates for common languages, frameworks and platforms (endoflife.date, MIT licensed), synced on the same schedule. **Don't edit by hand.** Run `node scripts/fetch-eol.mjs` locally.
- `feed-sources.json`: configuration for the dev feeds page (19 RSS/Atom sources, groups, items per source) and **your topics and keywords**. Edit this file to add or remove sources or keywords; no code changes needed. Sources with `mode: "filter"` (high-volume ones such as Hacker News) show only items whose titles match your topics; `all` shows the latest few. English keywords match whole words, and those under `caseSensitive` (such as SAFe) are case-sensitive.
- `feeds.json`: the dev feeds data, synced at 08:00, 12:00 and 17:00 Taiwan time every day (weekends included) by `.github/workflows/feeds-rss.yml`. **Don't edit by hand.** Run `node scripts/fetch-feeds.mjs` locally. It stores titles, links and dates only, never bodies or summaries, and every item is labeled "auto-collected, not verified by this site".
- `meta.json`: the verification date and staleness thresholds (`staleAfterDays`, `developingStaleAfterDays`, `kevStaleAfterDays`, `feedStaleAfterDays`).

The dev feeds page (`/en/feeds/`) offers an OPML file (`/feeds.opml`) for importing every source into Feedly, Inoreader, NetNewsWire or any RSS reader.

### Scheduled updates

| When (Taiwan time) | Runs on | Updates | How it goes live |
|---|---|---|---|
| Minute 17 of every hour | GitHub Actions (`kev-sync.yml`) | `kev.json` | Pushed to the `data` branch only when changed (no deploy) |
| Every hour on the hour, 08:00–17:00 | GitHub Actions (`feeds-sync.yml`) | `ghsa.json`, `eol.json` | Same |
| Every day 08:00, 12:00, 17:00 | GitHub Actions (`feeds-rss.yml`) | `feeds.json` | Same |
| Weekdays 09:10 | Local Claude scheduled task | News, CVEs, events, `meta.json` | Verified per UPDATING.md; pushed to `data` after `check:data` and `build` pass |
| Weekdays 13:00 | Local Claude scheduled task | Ongoing and monitoring events only | Same |
| Mon, Wed, Fri 17:30 | GitHub Actions (`publish-data.yml`) | Merges `data` into `main` | **Goes live when deployed after the merge** |

- GitHub Actions may start scheduled runs a few minutes to half an hour late.
- Data goes live at the next publish (Monday, Wednesday or Friday at 17:30) at the latest.
- The local Claude task needs the computer and the Claude desktop app running; missed runs happen the next time the app opens.
- Content from the Claude task **goes live without human review**. To undo a bad update, `git revert <commit>`.

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
- [x] Phase 2: GitHub package advisories and endoflife.date versions, synced hourly 08:00–17:00 Taiwan time
- [x] Phase 2: local Claude scheduled task updates news and events on weekdays at 09:10 and 13:00, following the verification rules
- [ ] Phase 2: scheduled GitHub Actions that pull from more public sources (each source's terms checked first)
- [ ] Phase 2: optional AI-drafted summaries and translations, published after human review
- [ ] Phase 2: connect a market data source (licensing for redisplay must be checked first)
- [ ] Phase 3: site RSS feed, newsletter, reader interaction

### API keys and costs (Phase 2, not yet built)

AI summaries and translations are **optional**. To enable them, whoever deploys the site supplies their own AI API key and pays for usage. The key is stored under **Settings → Secrets and variables → Actions**, used only during the build, and **never shipped to the browser**. Without a key, the site keeps working with hand-updated data.
