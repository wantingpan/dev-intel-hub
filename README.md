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

需要 Node.js 18.20.8、20.3.0 或 22 以上版本。

```bash
npm install
npm run dev
```

### 部署到 GitHub Pages

1. `astro.config.mjs` 已設定為 `wantingpan` 帳號與 `dev-intel-hub` repo；若改了 repo 名稱，請同步修改 `base`。
2. 推送到 GitHub 的 `main` 分支。
3. 在 repo 的 **Settings → Pages**，將 **Source** 設為 **GitHub Actions**。
4. 之後每次推送到 `main`，`.github/workflows/deploy.yml` 會自動建置並部署。

網址：`https://wantingpan.github.io/dev-intel-hub/`

### 資料格式

內容放在 `src/data/`：

- `news.json`：新聞。`title` 與 `summary` 各有 `zh-TW` 與 `en` 兩種語言；`category` 為 `industry`、`ai`、`lang`、`cloud`、`security` 其中之一。
- `cves.json`：漏洞。`severity` 為 `exploited`、`critical` 或 `high`；`cvss` 沒有分數時為 `null`。
- `events.json`：事件影響卡片。市場資料需註明時間點（收盤或盤中）與來源；資安內容分為「已報導」與「常見模式」。
- `meta.json`：查證日期。

介面文字放在 `src/i18n/ui.ts`。

### 內容原則

- 每則消息都要有可查證的原始出處。
- 摘要以自己的文字改寫並附原始連結，不轉載全文。
- 來源說法互相矛盾時，標註或不收錄。
- 來自週報或彙整網站的項目，在摘要中註明。
- 事件影響頁：只在媒體明確報導時指出事件與股價的關聯，並列出其他可能影響股價的因素；不提供買賣建議或股價預測。

### 發展規劃

- [x] 第一階段：雙語靜態網站（目前版本，資料手動更新）
- [ ] 第二階段：以 GitHub Actions 排程，自動抓取公開資料來源（各來源須先確認使用條款）
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

Requires Node.js 18.20.8, 20.3.0, or 22 and later.

```bash
npm install
npm run dev
```

### Deploy to GitHub Pages

1. `astro.config.mjs` is set up for the `wantingpan` account and the `dev-intel-hub` repo; if you rename the repo, update `base` too.
2. Push to the `main` branch.
3. In **Settings → Pages**, set **Source** to **GitHub Actions**.
4. Every push to `main` then builds and deploys through `.github/workflows/deploy.yml`.

Site URL: `https://wantingpan.github.io/dev-intel-hub/`

### Data

Content lives in `src/data/`:

- `news.json`: stories. `title` and `summary` each have `zh-TW` and `en`; `category` is one of `industry`, `ai`, `lang`, `cloud`, `security`.
- `cves.json`: vulnerabilities. `severity` is `exploited`, `critical` or `high`; `cvss` is `null` when no score was given.
- `events.json`: event impact cards. Market rows must state their timing (close or intraday) and source; security items are split into "reported" and "common pattern".
- `meta.json`: the verification date.

UI strings live in `src/i18n/ui.ts`.

### Content principles

- Every item needs a verifiable original source.
- Summaries are written in our own words and link to the original; full articles are never reproduced.
- Conflicting reports are flagged or left out.
- Items from weekly roundups or aggregators are marked as such.
- Event impact: an event is linked to a price move only when the media reports that link, alongside other factors that may have moved the price. No buy or sell advice, no price predictions.

### Roadmap

- [x] Phase 1: bilingual static site (current; data updated by hand)
- [ ] Phase 2: scheduled GitHub Actions that pull from public sources (each source's terms checked first)
- [ ] Phase 2: optional AI-drafted summaries and translations, published after human review
- [ ] Phase 2: connect a market data source (licensing for redisplay must be checked first)
- [ ] Phase 3: site RSS feed, newsletter, reader interaction

### API keys and costs (Phase 2, not yet built)

AI summaries and translations are **optional**. To enable them, whoever deploys the site supplies their own AI API key and pays for usage. The key is stored under **Settings → Secrets and variables → Actions**, used only during the build, and **never shipped to the browser**. Without a key, the site keeps working with hand-updated data.
