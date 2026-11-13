// 每小時由 GitHub Actions 執行：抓取 CISA 已遭利用漏洞清單（KEV），只保留最新幾筆。
// Run hourly by GitHub Actions: fetch CISA's Known Exploited Vulnerabilities (KEV) feed and keep the newest entries.
//
// 外部資料一律視為不可信：逐欄檢查格式、限制長度；整體格式不符就中止，不覆寫現有資料。
// External data is untrusted: every field is validated and length-capped; on an unexpected shape we abort and keep the existing file.
import { readFileSync, writeFileSync } from 'node:fs';

const FEED = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
const CATALOG = 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog';
const OUT = new URL('../src/data/kev.json', import.meta.url);
const LIMIT = 12;
const MAX_BYTES = 20 * 1024 * 1024;

const fail = (msg) => { console.error(`KEV sync failed: ${msg}`); process.exit(1); };
// 移除控制字元並限制長度 / Strip control characters and cap length
const clean = (v, max = 300) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '');
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

let res;
try {
  res = await fetch(FEED, {
    headers: { 'User-Agent': 'dev-intel-hub KEV sync (GitHub Actions)', Accept: 'application/json' },
    signal: AbortSignal.timeout(30_000),
    redirect: 'error',
  });
} catch (e) {
  fail(`request error: ${e.message}`);
}
if (!res.ok) fail(`HTTP ${res.status}`);
const text = await res.text();
if (text.length > MAX_BYTES) fail('response too large');

let feed;
try { feed = JSON.parse(text); } catch { fail('response is not valid JSON'); }
if (!feed || !Array.isArray(feed.vulnerabilities) || feed.vulnerabilities.length === 0) fail('unexpected feed shape');

const items = [];
for (const v of feed.vulnerabilities) {
  const cve = clean(v?.cveID, 30);
  const dateAdded = clean(v?.dateAdded, 10);
  const dueDate = clean(v?.dueDate, 10);
  if (!/^CVE-\d{4}-\d{4,}$/.test(cve) || !isDate(dateAdded)) continue; // 略過格式不符的項目 / skip malformed entries
  items.push({
    cve,
    vendor: clean(v.vendorProject, 80),
    product: clean(v.product, 120),
    name: clean(v.vulnerabilityName, 200),
    action: clean(v.requiredAction, 400),
    dateAdded,
    dueDate: isDate(dueDate) ? dueDate : null,
    ransomware: v.knownRansomwareCampaignUse === 'Known',
  });
}
if (items.length === 0) fail('no valid entries');
items.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded) || b.cve.localeCompare(a.cve));

const released = clean(feed.dateReleased, 40);
const next = {
  source: 'CISA Known Exploited Vulnerabilities Catalog',
  sourceUrl: CATALOG,
  catalogVersion: clean(feed.catalogVersion, 20) || null,
  dateReleased: released && !Number.isNaN(Date.parse(released)) ? released : null,
  total: Number.isInteger(feed.count) ? feed.count : items.length,
  items: items.slice(0, LIMIT),
};

// 內容沒變就不寫檔，避免產生無意義的提交 / Don't rewrite the file when nothing changed, to avoid empty commits
let prev = null;
try { prev = JSON.parse(readFileSync(OUT, 'utf8')); } catch { /* 第一次執行 / first run */ }
const same = prev && JSON.stringify({ ...prev, fetchedAt: undefined }) === JSON.stringify({ ...next, fetchedAt: undefined });
if (same) {
  console.log(`No change (catalog ${next.catalogVersion}, ${next.total} entries).`);
} else {
  writeFileSync(OUT, JSON.stringify({ ...next, fetchedAt: new Date().toISOString() }, null, 2) + '\n');
  console.log(`Updated: catalog ${next.catalogVersion}, ${next.total} entries, newest ${next.items[0].cve} (${next.items[0].dateAdded}).`);
}
