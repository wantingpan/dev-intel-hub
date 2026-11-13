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

### 更新查證日期（`meta.json`）

完成一輪更新後，把 `verifiedOn` 改成當天日期（台灣時間）。這個日期決定網站頂端是否顯示過期提示。

---

## 四、提交流程

建議用 Pull Request 更新內容，上線前先在預覽網址確認。

```powershell
# 1. 從 main 建立新分支
git checkout main
git pull
git checkout -b content/2026-11-20

# 2. 修改 src/data 裡的檔案後，檢查資料
npm run check:data

# 3. 建置並預覽
npm run build
npm run preview

# 4. 提交並推送分支
git add src/data
git commit -m "Content update 2026-11-20"
git push -u origin content/2026-11-20
```

5. 到 GitHub 開 Pull Request，依照範本的檢查清單逐項確認。
6. 等待 CI 檢查通過，並打開 Netlify 自動產生的預覽網址確認畫面。
7. 確認無誤後合併，Netlify 會自動部署到正式網站。

---

## 五、請 AI 協助更新時的提示範本

請 Claude 等 AI 工具協助查證與更新時，可以直接複製以下內容，確保它遵守同樣的規則：

```text
請協助更新 dev-intel-hub 網站內容，日期是 [今天日期]。

任務：
- [例：查證 Microsoft 365 斷線事件的最新進展，更新時間軸與狀態]
- [例：搜尋本週 AI、語言與框架、雲端、資安的重要新聞，各 3～5 則]

請遵守 docs/UPDATING.md 的查證規則，特別是：
1. 每則內容都要上網查證並附 https 出處，不可憑記憶或推測。
2. 焦點新聞至少兩個獨立來源；只找到一個就標為單一來源、不列焦點。
3. 說法矛盾時並列各方說法並寫出判斷依據。
4. 市場資料標明收盤、盤中或盤後，不推論因果、不給投資建議。
5. 摘要用自己的話改寫，中英文都要填寫。
6. 輸出符合 src/data 現有格式的 JSON，並更新 verifiedOn。
```

---

## English summary

- **Cadence**: news weekly at minimum; developing events (`ongoing`, `monitoring`) daily. The site shows a staleness notice after `staleAfterDays` (general) or `developingStaleAfterDays` (developing events) from `src/data/meta.json`.
- **Verification rules**: every item needs an `https://` source; prefer official sources; top stories need at least two independent sources; count only sources actually found and linked; show conflicting claims side by side with our call; never repeat unverified allegations; summarize in our own words; label market data timing; no causal claims without reporting; no investment advice; fill in both languages with the same facts.
- **Data files**: see the JSON templates above for `news.json`, `cves.json` and `events.json`. Update an event's `verifiedOn` every time it's checked, and `meta.json`'s `verifiedOn` after each update round.
- **Workflow**: branch → edit `src/data` → `npm run check:data` → `npm run build` and `npm run preview` → push → pull request → CI and Netlify preview → merge.
