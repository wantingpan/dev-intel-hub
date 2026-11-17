// 自動同步腳本共用的工具：抓取外部 JSON、清理文字、內容沒變就不寫檔。
// Shared helpers for the sync scripts: fetch external JSON, clean text, and skip writing when nothing changed.
//
// 外部資料一律視為不可信：限制回應大小、不跟隨轉址、逐欄清理與限制長度。
// External data is untrusted: responses are size-capped, redirects are refused, and every field is cleaned and length-capped.
import { readFileSync, writeFileSync } from 'node:fs';

const MAX_BYTES = 20 * 1024 * 1024;

export const makeFail = (name) => (msg) => {
  console.error(`${name} sync failed: ${msg}`);
  process.exit(1);
};

// 移除控制字元並限制長度 / Strip control characters and cap length
export const clean = (v, max = 300) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';

export const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

// 把 ISO 時間或日期轉成 YYYY-MM-DD，格式不符時回傳 null / ISO timestamp or date → YYYY-MM-DD, or null
export const toDate = (v) => {
  const d = clean(v, 40).slice(0, 10);
  return isDate(d) ? d : null;
};

export async function fetchJson(url, { headers = {}, fail }) {
  let res;
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': 'dev-intel-hub data sync (GitHub Actions)', Accept: 'application/json', ...headers },
      signal: AbortSignal.timeout(30_000),
      redirect: 'error',
    });
  } catch (e) {
    fail(`request error for ${url}: ${e.message}`);
  }
  if (!res.ok) fail(`HTTP ${res.status} for ${url}`);
  const text = await res.text();
  if (text.length > MAX_BYTES) fail(`response too large for ${url}`);
  try {
    return JSON.parse(text);
  } catch {
    fail(`response is not valid JSON for ${url}`);
  }
}

// 內容（不含 fetchedAt）沒變就不寫檔，避免無意義的提交與部署
// Only write when the content (ignoring fetchedAt) changed, to avoid empty commits and deploys
export function writeIfChanged(outUrl, next, label) {
  let prev = null;
  try {
    prev = JSON.parse(readFileSync(outUrl, 'utf8'));
  } catch {
    /* 第一次執行 / first run */
  }
  const strip = (o) => JSON.stringify({ ...o, fetchedAt: undefined });
  if (prev && strip(prev) === strip(next)) {
    console.log(`No change (${label}).`);
    return false;
  }
  writeFileSync(outUrl, JSON.stringify({ ...next, fetchedAt: new Date().toISOString() }, null, 2) + '\n');
  console.log(`Updated: ${label}.`);
  return true;
}
