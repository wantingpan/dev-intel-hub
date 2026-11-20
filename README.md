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

### 本機使用（免排程、免部署、日常 0 Token）

需要 Node.js 20.3.0 或 22 以上版本。第一次使用先安裝套件：

```bash
npm install
```

平常想看最新情報時，任選一種方式：

- **最省力**：直接雙擊專案根目錄的 `start-hub.cmd`（會自動抓取免 Token 公開資料並打開瀏覽器）。
- **指令一鍵更新並開啟**：
  ```bash
  npm start
  ```
- **分開執行**：
  ```bash
  npm run fetch       # 只抓取所有免 Token 公開資料（KEV / GHSA / EOL / 19 個 RSS）並驗證
  npm run dev         # 直接啟動本機站台（不重新抓取）
  npm run check:data  # 驗證資料格式與網址
  ```

本專案已移除 GitHub Actions 排程與站台部署設定，所有更新都在 `main` 分支本機隨需進行，不消耗自動排程的 AI Token。

### 資料格式

內容放在 `src/data/`：

- `news.json`：新聞。`title` 與 `summary` 各有 `zh-TW` 與 `en` 兩種語言；`originalTitle` 為來源網頁上的英文原文標題（原樣照抄，來源是中文或彙整頁時為 `null`）；`category` 為 `industry`、`ai`、`lang`、`cloud`、`security` 其中之一；`sourceType` 為 `official`、`media` 或 `secondary`；`corroboration` 列出其他確認來源（只列實際查到並附連結的來源）；`dispute` 記錄說法分歧（選填，至少兩方說法）。
- `cves.json`：漏洞。`severity` 為 `exploited`、`critical` 或 `high`；`cvss` 沒有分數時為 `null`。
- `events.json`：事件影響卡片。`status` 為 `ongoing`、`monitoring`、`patched` 或 `resolved`；`updates` 是後續追蹤時間軸，每筆都要附出處；`disputes` 記錄說法分歧；`postmortem` 為事後檢討報告連結（未發布時為 `null`）。市場資料需註明時間點（收盤或盤中）與來源；資安內容分為「已報導」與「常見模式」。
- `kev.json`：CISA 已遭利用漏洞清單，**免 AI Token**，由 `npm run fetch`（或 `node scripts/fetch-kev.mjs`）本機隨需更新。
- `ghsa.json`：GitHub 套件漏洞公告（重大與高風險，CC BY 4.0），**免 AI Token**，由 `npm run fetch`（或 `node scripts/fetch-ghsa.mjs`）本機隨需更新。
- `eol.json`：常用語言、框架與平台的最新版本與支援到期日（endoflife.date，MIT 授權），**免 AI Token**，由 `npm run fetch`（或 `node scripts/fetch-eol.mjs`）本機隨需更新。
- `feed-sources.json`：技術動態的來源設定（19 個 RSS／Atom 來源、分類、每個來源顯示幾則），以及**關注主題與關鍵字**。想增減來源或關鍵字，改這個檔案即可，不用動程式。`mode` 為 `filter` 的來源（流量大，如 Hacker News）只顯示標題符合關注主題的文章；`all` 則顯示最新幾則。英文關鍵字以完整單字比對，`caseSensitive` 內的字（如 SAFe）會區分大小寫。
- `feeds.json`：技術動態的資料，**免 AI Token**，由 `npm run fetch`（或 `node scripts/fetch-feeds.mjs`）本機隨需更新。只保存標題、連結與日期，不保存內文或摘要；所有項目標示為「自動彙整，未經本站查證」。
- `meta.json`：查證日期，以及過期提示的門檻天數（`staleAfterDays`、`developingStaleAfterDays`、`kevStaleAfterDays`、`feedStaleAfterDays`）。

技術動態頁（`/zh-TW/feeds/`）底部提供 OPML 檔（`/feeds.opml`），可一次匯入 Feedly、Inoreader、NetNewsWire 等 RSS 閱讀器。

### 更新模式

| 類型 | 更新方式 | 是否耗 AI Token |
|---|---|---|
| CISA 漏洞、GitHub 套件漏洞、語言版本到期、19 個技術 RSS | 雙擊 `start-hub.cmd` 或執行 `npm start` / `npm run fetch` | **0 Token（免費）** |
| 精選新聞、重大事件影響分析、人工查證漏洞 | 需要時再手動請 AI 依 [docs/UPDATING.md](docs/UPDATING.md) 更新 | 隨需使用，無背景自動消耗 |

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

### Local usage (no schedules, no deployment, 0 tokens daily)

Requires Node.js 20.3.0, or 22 and later. Install dependencies once:

```bash
npm install
```

Whenever you want to read the latest briefing:

- **One-click (Windows)**: double-click `start-hub.cmd` in the repo root (fetches all zero-token public feeds and opens the browser).
- **One command**:
  ```bash
  npm start
  ```
- **Run separately**:
  ```bash
  npm run fetch       # Fetch all zero-token public feeds (KEV / GHSA / EOL / 19 RSS feeds) and validate
  npm run dev         # Start the local site without re-fetching
  npm run check:data  # Validate data files and URLs
  ```

Scheduled GitHub Actions workflows and hosting deployment configs have been removed. Everything runs locally on `main` on demand so no AI tokens are spent in the background.

### Data

Content lives in `src/data/`:

- `news.json`: stories. `title` and `summary` each have `zh-TW` and `en`; `category` is one of `industry`, `ai`, `lang`, `cloud`, `security`; `sourceType` is `official`, `media` or `secondary`; `corroboration` lists other confirming sources (only ones actually found and linked); `dispute` records conflicting reports (optional, at least two claims).
- `cves.json`: vulnerabilities. `severity` is `exploited`, `critical` or `high`; `cvss` is `null` when no score was given.
- `events.json`: event impact cards. `status` is `ongoing`, `monitoring`, `patched` or `resolved`; `updates` is a follow-up timeline, each entry sourced; `disputes` records conflicting reports; `postmortem` links the post-incident review (`null` until published). Market rows must state their timing (close or intraday) and source; security items are split into "reported" and "common pattern".
- `kev.json`: CISA's KEV catalog (**0 AI tokens**), refreshed locally on demand via `npm run fetch` (or `node scripts/fetch-kev.mjs`).
- `ghsa.json`: critical and high GitHub package advisories (CC BY 4.0, **0 AI tokens**), refreshed via `npm run fetch` (or `node scripts/fetch-ghsa.mjs`).
- `eol.json`: latest versions and end-of-support dates for common languages, frameworks and platforms (endoflife.date, MIT licensed, **0 AI tokens**), refreshed via `npm run fetch` (or `node scripts/fetch-eol.mjs`).
- `feed-sources.json`: configuration for the dev feeds page (19 RSS/Atom sources, groups, items per source) and **your topics and keywords**. Edit this file to add or remove sources or keywords; no code changes needed. Sources with `mode: "filter"` (high-volume ones such as Hacker News) show only items whose titles match your topics; `all` shows the latest few. English keywords match whole words, and those under `caseSensitive` (such as SAFe) are case-sensitive.
- `feeds.json`: the dev feeds data (**0 AI tokens**), refreshed via `npm run fetch` (or `node scripts/fetch-feeds.mjs`). It stores titles, links and dates only, never bodies or summaries, and every item is labeled "auto-collected, not verified by this site".
- `meta.json`: the verification date and staleness thresholds (`staleAfterDays`, `developingStaleAfterDays`, `kevStaleAfterDays`, `feedStaleAfterDays`).

The dev feeds page (`/en/feeds/`) offers an OPML file (`/feeds.opml`) for importing every source into Feedly, Inoreader, NetNewsWire or any RSS reader.

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
