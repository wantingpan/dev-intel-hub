# 內容更新作業流程

這份文件說明如何更新網站內容，確保每次更新都符合本站的查證原則。無論是自己更新，或請 Claude 等 AI 工具協助，都請依照同一套標準。

> English summary at the end of this document.

---

## 一、更新頻率

| 項目 | 建議頻率 | 說明 |
|---|---|---|
| 新聞動態 | 每週至少一次 | 超過 3 天未更新，網站頂端會自動顯示「資料可能已過時」 |
| 資安修補清單 | 每月第二個星期二之後 + 有重大漏洞時 | 微軟例行更新在每月第二個星期二發布 |
| 「處理中」「觀察中」的事件 | 每天確認一次 | 超過 1 天未查證，卡片上會自動提醒狀態可能已變化 |
| 「已修補」「已解決」的事件 | 有後續發展時 | 例如事後檢討報告發布 |

門檻天數設定在 `src/data/meta.json` 的 `staleAfterDays`（一般內容）與 `developingStaleAfterDays`（發展中事件）。

### 隨需更新（省 Token 模式）

本專案已停用所有背景排程與自動部署，改為本機隨需更新：

- **日常 0 Token 更新**：雙擊 `start-hub.cmd` 或執行 `npm start`（或 `npm run fetch`），一鍵本機抓取 `kev.json`、`ghsa.json`、`eol.json`、`feeds.json` 並驗證格式，完全不消耗 AI Token。
- **需要整理重點新聞／事件時**：先跑完 `npm run fetch` 讓 `feeds.json` 保持最新，再手動請 AI 從 `feeds.json` 挑選 2～3 則重要條目查證並寫入 `news.json` / `events.json`，可大幅減少 AI 搜尋與消耗的 Token。
- 想調整技術動態的來源或關注主題關鍵字，直接修改 `src/data/feed-sources.json` 即可。

---

## 二、查證規則

每一筆內容在提交前，都要符合以下規則：

1. **每則消息都要有可開啟的原始出處**，網址必須是 `https://` 開頭。
2. **優先使用官方來源**：原廠公告、官方部落格、政府資安單位公告。
3. **焦點新聞至少兩個獨立來源**：只有一個來源的消息可以收錄，但網站會標示「單一來源」，不可標為焦點。
4. **來源數量只算實際查到並附上連結的**，不可為了徽章好看而虛報。
5. **說法互相矛盾時**：並列各方說法，寫出本站判斷與依據；無法判斷就不收錄。
6. **不轉述未經證實的指控**，例如人事異動背後的傳聞。
7. **摘要用自己的話改寫**，不可複製原文段落；直接引用時一則來源最多一句、少於 15 字。
8. **市場資料一定要標明時間點**：收盤、盤中或盤後，並附來源。
9. **不推論因果**：只有媒體明確報導時，才寫出事件與股價的關聯，並列出其他可能的影響因素。
10. **不提供投資建議**，也不預測股價。
11. **中英文內容都要填寫**，英文版不可加入中文版沒有的事實。

---

## 三、各資料檔的更新方式

所有內容都在 `src/data/` 資料夾。

### 新增一則新聞（`news.json`）

```json
{
  "id": "n28",
  "date": "2026-11-20",
  "category": "security",
  "hot": false,
  "title": { "zh-TW": "中文標題", "en": "English headline" },
  "summary": { "zh-TW": "中文摘要，用自己的話改寫。", "en": "English summary in our own words." },
  "originalTitle": "The headline exactly as it appears on the source page",
  "source": "來源名稱",
  "sourceLang": "en",
  "url": "https://example.com/article",
  "sourceType": "media",
  "corroboration": [
    { "name": "其他確認來源", "url": "https://example.org/report" }
  ]
}
```

- `id`：接續最後一個編號，不可重複。
- `category`：`industry`、`ai`、`lang`、`cloud`、`security` 其中之一。
- `originalTitle`：來源網頁上的英文標題，**原樣照抄**（去掉網站名稱後綴，例如「 | TechCrunch」），網站會顯示在新聞內容裡，供對照英文用。只有 `sourceLang` 為 `en` 且來源是單篇文章時才填；來源是中文或週報彙整頁時填 `null`。只抄標題，內文仍用自己的話改寫，不轉載原文段落。
- `sourceLang`：主要來源的語言，`zh` 或 `en`。
- `sourceType`：`official`（官方）、`media`（媒體）、`secondary`（第三方彙整）。
- `corroboration`：沒有其他來源時填 `[]`。
- 說法分歧時加上 `dispute` 欄位，格式見下方「說法分歧」。

### 新增一個漏洞（`cves.json`）

```json
{
  "cve": "CVE-2026-000000",
  "severity": "critical",
  "cvss": 9.8,
  "product": { "zh-TW": "產品名稱", "en": "Product name" },
  "action": { "zh-TW": "升級至某版本", "en": "Upgrade to version X" },
  "source": "來源名稱",
  "url": "https://example.com/advisory"
}
```

- `severity`：`exploited`（已遭利用）、`critical`（重大）、`high`（高）。
- `cvss`：來源沒有提供分數時填 `null`，不可自行推估。

### 更新事件卡片（`events.json`）

**新增後續追蹤**：在 `updates` 陣列加入一筆，依時間順序排列。

```json
{
  "date": "2026-11-14",
  "time": { "zh-TW": "美東約 10:00", "en": "about 10 a.m. ET" },
  "text": { "zh-TW": "發生了什麼。", "en": "What happened." },
  "source": { "name": "來源名稱", "url": "https://example.com/update" }
}
```

- 沒有確切時間時，`time` 填 `null`。
- 未來的期限或預定事件，加上 `"upcoming": true`；日期過了之後，網站會自動改標為「已過」。

**更新狀態**：`status` 依事件發展調整。

| 狀態 | 何時使用 |
|---|---|
| `ongoing` 處理中 | 問題尚未排除，例如服務中斷中 |
| `monitoring` 觀察中 | 事件本身已發生，後續影響仍待觀察 |
| `patched` 已修補 | 漏洞已有修補程式 |
| `resolved` 已解決 | 事件完全結束 |

**事後檢討報告發布時**：

```json
"postmortem": { "name": "報告名稱", "url": "https://example.com/postmortem" }
```

**說法分歧**（新聞的 `dispute` 與事件的 `disputes` 格式相同）：

```json
{
  "topic": { "zh-TW": "爭議主題", "en": "What's disputed" },
  "claims": [
    { "who": "來源 A", "claim": { "zh-TW": "A 的說法", "en": "A's claim" }, "source": { "name": "來源 A", "url": "https://a.example/x" } },
    { "who": "來源 B", "claim": { "zh-TW": "B 的說法", "en": "B's claim" }, "source": { "name": "來源 B", "url": "https://b.example/y" } }
  ],
  "verdict": { "zh-TW": "本站依據哪項資料、如何判斷。", "en": "Which data we relied on and why." }
}
```

至少要有兩方說法。

**每次查證事件後**，都要把該事件的 `verifiedOn` 改成當天日期，即使內容沒有變化。這代表「我們確認過了，狀態仍是如此」。

### 新增名詞（`glossary.json`）

名詞小教室收錄軟體人應該知道的資安與工程名詞，寫法沿用「白話說明」原則：先講結論、一句只講一件事、術語第一次出現時附白話解釋。

```json
{
  "id": "sbom",
  "category": "security",
  "term": { "zh-TW": "SBOM 軟體物料清單", "en": "SBOM (software bill of materials)" },
  "oneLiner": { "zh-TW": "30 字內的一句話說明。", "en": "One-sentence explanation." },
  "points": [
    { "zh-TW": "重點一。", "en": "Point one." },
    { "zh-TW": "重點二。", "en": "Point two." }
  ],
  "why": { "zh-TW": "為什麼軟體人需要知道。", "en": "Why engineers should care." },
  "related": { "news": ["n22"], "events": ["outlook-zero-day-2026-11"] },
  "seeAlso": ["cve"],
  "sources": [{ "name": "權威來源", "url": "https://example.org/definition" }],
  "further": [],
  "verifiedOn": "2026-11-13"
}
```

- `id`：小寫英文、數字與連字號，會成為網址錨點，例如 `/zh-TW/learn/#sbom`。
- `points`：至少兩點，每點一兩句。
- `sources`：至少一個權威來源，優先使用標準組織、政府機關或原始文件。
- `related`、`seeAlso`：只能填已存在的新聞、事件或名詞 id，資料檢查會自動確認。
- 在新聞或事件的 `terms` 欄位填入名詞 id，畫面上就會出現「相關名詞」連結。

### 新增研討會（`conferences.json`）

```json
{
  "id": "cybersec-2027",
  "name": "CYBERSEC 2027 臺灣資安大會",
  "start": "2027-05-04",
  "end": "2027-05-06",
  "location": { "zh-TW": "臺北南港展覽館二館", "en": "Taipei Nangang Exhibition Center, Hall 2" },
  "groups": ["foundations", "threats", "identity"],
  "note": null,
  "cfp": { "date": "2026-11-30", "label": { "zh-TW": "講者徵稿截止", "en": "Call for speakers closes" } },
  "source": { "name": "iThome CYBERSEC", "url": "https://cybersec.ithome.com.tw/2027/CFP" },
  "official": true,
  "verifiedOn": "2026-11-13"
}
```

- `groups`：對應名詞小教室的分組，可填 `foundations`、`threats`、`pipeline`、`identity`、`reliability`。
- `official`：日期來自主辦單位官網填 `true`；來自第三方彙整網站填 `false`，畫面上會標示。
- 活動結束後，畫面會自動把「即將到來」改成「已過」，可以在下次更新時移除。
- 新增名詞時，記得在 `glossary.json` 填入 `group` 欄位。

### 更新查證日期（`meta.json`）

完成一輪更新後，把 `verifiedOn` 改成當天日期（台灣時間）。這個日期決定網站頂端是否顯示過期提示。

---

## 四、本機驗證與保存流程

因不需站台部署，直接在 `main` 分支修改並本機預覽即可：

```powershell
# 1. 更新免 Token 公開資料並檢查格式
npm run fetch

# 2. 若有手動／AI 更新 src/data 裡的檔案，執行格式檢查
npm run check:data

# 3. 本機啟動查看（或直接雙擊 start-hub.cmd）
npm run dev

# 4. 想備份到 Git 時再提交（選用）
git add src/data
git commit -m "Content update 2026-11-20"
```

---

## 五、請 AI 協助更新時的提示範本（省 Token 版）

需要整理重點新聞時，先跑過 `npm run fetch` 更新 `src/data/feeds.json`，再把以下提示交給 AI（直接從候選清單挑選，最省 Token）：

```text
請幫我從 src/data/feeds.json 挑選今天（[今天日期]）對軟體工程師最重要的 3 則消息，
查證原文後新增到 src/data/news.json，並更新 src/data/meta.json 的 verifiedOn。

規則（簡版）：
1. 只查證選出的這 3 則，不額外大海撈針搜尋。
2. 每則附上 https:// 原文出處，摘要用自己的話改寫（中英文都要填）。
3. 單一來源直接標記為非焦點（hot: false），不需硬找多個來源。
4. 改完後執行 npm run check:data 確認格式通過。
```

---

## English summary

- **Cadence**: news weekly at minimum; developing events (`ongoing`, `monitoring`) daily. The site shows a staleness notice after `staleAfterDays` (general) or `developingStaleAfterDays` (developing events) from `src/data/meta.json`.
- **Verification rules**: every item needs an `https://` source; prefer official sources; top stories need at least two independent sources; count only sources actually found and linked; show conflicting claims side by side with our call; never repeat unverified allegations; summarize in our own words; label market data timing; no causal claims without reporting; no investment advice; fill in both languages with the same facts.
- **Data files**: see the JSON templates above for `news.json`, `cves.json`, `events.json` and `glossary.json` (at least two points and one authoritative source per term). Update an event's `verifiedOn` every time it's checked, and `meta.json`'s `verifiedOn` after each update round.
- **Workflow**: branch → edit `src/data` → `npm run check:data` → `npm run build` and `npm run preview` → push → pull request → CI and preview URL → merge.
