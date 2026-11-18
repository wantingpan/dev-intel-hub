// 每天 3 次由 GitHub Actions 執行：從 src/data/feed-sources.json 列出的 RSS／Atom 來源，
// 取得最新文章的標題、連結與日期，存成 src/data/feeds.json。
// Run three times a day by GitHub Actions: read the RSS/Atom sources listed in src/data/feed-sources.json
// and store each source's latest titles, links and dates in src/data/feeds.json.
//
// 只保存標題、連結與日期，不保存內文或摘要（許多來源的 feed 內含全文，不可轉載）。
// Only titles, links and dates are stored; never bodies or summaries (many feeds carry full text we must not republish).
//
// 單一來源失敗時保留該來源上次成功的資料，不影響其他來源。
// When a source fails, its last good data is kept and the other sources are unaffected.
import { readFileSync } from 'node:fs';
import { parseFeed, cleanUrl } from './lib/rss.mjs';
import { clean, writeIfChanged } from './lib/feed.mjs';

const CONFIG = JSON.parse(readFileSync(new URL('../src/data/feed-sources.json', import.meta.url), 'utf8'));
const OUT = new URL('../src/data/feeds.json', import.meta.url);
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_AGE_DAYS = 120; // 超過這個天數的文章不顯示 / articles older than this are dropped

// 台灣時間的日期 / the date in Taiwan time
const twDate = (d) => new Date(d.getTime() + 8 * 3600_000).toISOString().slice(0, 10);

// 關鍵字比對：英文用「完整單字」比對（.NET 不會比到 .NETWORK），中文直接比對字串
// Keyword matching: whole-word for ASCII (".NET" won't match ".NETWORK"), plain substring for CJK
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const compile = (kw, flags) =>
  /[^\x00-\x7f]/.test(kw) ? new RegExp(esc(kw), flags) : new RegExp(`(?<![A-Za-z0-9])${esc(kw)}(?![A-Za-z0-9])`, flags);
const matchers = CONFIG.interests.map((i) => ({
  id: i.id,
  res: [...i.keywords.map((k) => compile(k, 'i')), ...(i.caseSensitive ?? []).map((k) => compile(k, ''))],
}));
const matchesOf = (title) => matchers.filter((m) => m.res.some((re) => re.test(title))).map((m) => m.id);

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'dev-intel-hub feed sync (GitHub Actions)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5' },
    signal: AbortSignal.timeout(30_000),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (new URL(res.url).protocol !== 'https:') throw new Error('redirected to a non-https URL');
  const body = await res.text();
  if (body.length > MAX_BYTES) throw new Error('response too large');
  return body;
}

async function load(source) {
  const raw = parseFeed(await fetchText(source.feedUrl));
  if (raw.length === 0) throw new Error('no entries found (unexpected feed shape)');
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400_000;
  const seen = new Set();
  const items = [];
  for (const r of raw) {
    const url = cleanUrl(r.url);
    const title = clean(r.title, 200);
    if (!url || !title || seen.has(url)) continue; // 略過非 https、空標題或重複 / skip non-https, empty or duplicate
    if (r.published && r.published.getTime() > Date.now() + 86400_000) continue; // 日期在未來，視為異常 / future dates are suspicious
    if (r.published && r.published.getTime() < cutoff) continue;
    seen.add(url);
    items.push({
      title,
      url,
      date: r.published ? twDate(r.published) : null,
      published: r.published ? r.published.toISOString() : null,
      matches: matchesOf(title),
    });
  }
  if (items.length === 0) throw new Error('no usable entries');
  // 依發布時間新到舊；沒有時間的維持 feed 原本順序 / newest first; undated items keep feed order
  items.sort((a, b) => (b.published ?? '').localeCompare(a.published ?? ''));
  const shown = source.mode === 'filter' ? items.filter((i) => i.matches.length > 0) : items;
  return {
    id: source.id,
    items: shown.slice(0, CONFIG.perSource).map(({ published, ...i }) => i),
    // 篩選型來源另外保留未篩選的前幾則，讓讀者可展開查看 / filtered sources also keep the unfiltered top items for an expandable list
    more: source.mode === 'filter' ? items.slice(0, CONFIG.moreCount).map(({ published, ...i }) => i) : [],
  };
}

let prev = { sources: [] };
try {
  prev = JSON.parse(readFileSync(OUT, 'utf8'));
} catch {
  /* 第一次執行 / first run */
}
const prevById = new Map((prev.sources ?? []).map((s) => [s.id, s]));

const results = await Promise.allSettled(CONFIG.sources.map((s) => load(s)));
const sources = [];
const failed = [];
results.forEach((r, i) => {
  const src = CONFIG.sources[i];
  if (r.status === 'fulfilled') {
    sources.push(r.value);
    return;
  }
  failed.push(`${src.id}: ${r.reason?.message ?? r.reason}`);
  // 保留上次成功的資料並標記 failing，畫面會提示；恢復後下次成功就自然移除標記
  // Keep the last good data and flag it failing so the page says so; the flag disappears on the next success
  const old = prevById.get(src.id);
  if (old) sources.push({ ...old, failing: true });
});

for (const f of failed) console.error(`FAILED ${f}`);
console.log(`${sources.length} of ${CONFIG.sources.length} sources have data; ${failed.length} failed this run.`);

// 沒有任何來源可用就不覆寫 / never overwrite with nothing
if (sources.length === 0) {
  console.error('Feed sync failed: no source returned usable data.');
  process.exit(1);
}

// 有變動才寫檔；fetchedAt 由 writeIfChanged 寫入，不計入比對
// Only written when something changed; writeIfChanged adds fetchedAt and ignores it when comparing
writeIfChanged(OUT, { sources }, `${sources.reduce((n, s) => n + s.items.length, 0)} items from ${sources.length} sources`);

// 超過三分之一的來源失敗，視為整體異常，讓這次執行顯示為失敗（資料已寫入）
// More than a third failing means something systemic: fail the run (data is already written)
if (failed.length > CONFIG.sources.length / 3) {
  console.error(`Too many sources failed (${failed.length}/${CONFIG.sources.length}).`);
  process.exit(1);
}
