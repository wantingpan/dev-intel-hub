// 每天 08:00–17:00（台灣時間）每小時由 GitHub Actions 執行：從 endoflife.date 抓取常用語言、
// 框架與平台的最新版本與支援到期日。
// Run hourly 08:00–17:00 Taiwan time by GitHub Actions: fetch the latest versions and end-of-support
// dates for common languages, frameworks and platforms from endoflife.date.
//
// 資料授權：endoflife.date 採 MIT 授權，網站上標示出處。
// License: endoflife.date is MIT licensed; the site credits it.
import { makeFail, clean, toDate, fetchJson, writeIfChanged } from './lib/feed.mjs';

const API = 'https://endoflife.date/api/v1/products';
const SITE = 'https://endoflife.date';
const OUT = new URL('../src/data/eol.json', import.meta.url);
const MAX_CYCLES = 6;
const fail = makeFail('endoflife.date');

// 要追蹤的產品（endoflife.date 的產品代號）/ Products to track (endoflife.date product ids)
const PRODUCTS = [
  'nodejs', 'python', 'dotnet', 'eclipse-temurin', 'go', 'php',
  'react', 'angular', 'vue', 'nextjs', 'django', 'spring-boot',
  'kubernetes', 'postgresql',
];

const today = new Date().toISOString().slice(0, 10);
const products = [];
for (const id of PRODUCTS) {
  const body = await fetchJson(`${API}/${id}/`, { fail });
  const r = body?.result;
  if (!r || !Array.isArray(r.releases)) fail(`unexpected shape for ${id}`);
  const cycles = [];
  for (const c of r.releases) {
    if (c?.isMaintained !== true) continue; // 只列仍在支援的版本 / maintained release cycles only
    const cycle = clean(c.name, 30);
    if (!cycle) continue;
    const eol = toDate(c.eolFrom);
    // 官方支援已結束、只剩付費延長支援的版本不列 / skip cycles past official support (paid extended support only)
    if (eol && eol < today) continue;
    cycles.push({
      cycle,
      latest: clean(c.latest?.name, 40) || null,
      latestDate: toDate(c.latest?.date),
      lts: c.isLts === true,
      eol,
    });
    if (cycles.length >= MAX_CYCLES) break;
  }
  if (cycles.length === 0) continue; // 沒有仍在支援的版本就略過 / skip products with nothing maintained
  products.push({
    id,
    label: clean(r.label, 60) || id,
    url: `${SITE}/${id}`,
    cycles,
  });
}
if (products.length === 0) fail('no valid products');

const next = {
  source: 'endoflife.date',
  sourceUrl: SITE,
  license: 'MIT',
  products,
};
writeIfChanged(OUT, next, `${products.length} products`);
