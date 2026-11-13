// 建置前檢查資料檔：網址必須是 https://、必填欄位不可缺漏。
// Pre-build data check: URLs must be https:// and required fields must be present.
// 任何錯誤都會讓建置失敗，避免有問題的資料被部署上線。
// Any error fails the build so bad data never gets deployed.
import { readFileSync } from 'node:fs';

const errors = [];
const load = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url), 'utf8'));
const langs = ['zh-TW', 'en'];

function checkUrl(where, value) {
  try {
    if (new URL(value).protocol !== 'https:') errors.push(`${where}: URL must start with https:// (${value})`);
  } catch {
    errors.push(`${where}: invalid URL (${value})`);
  }
}
function checkText(where, obj) {
  for (const l of langs) {
    if (!obj || typeof obj[l] !== 'string' || !obj[l].trim()) errors.push(`${where}: missing "${l}" text`);
  }
}
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
function checkDispute(where, d) {
  checkText(`${where}.topic`, d.topic);
  checkText(`${where}.verdict`, d.verdict);
  if (!Array.isArray(d.claims) || d.claims.length < 2) errors.push(`${where}: a dispute needs at least two claims`);
  for (const [i, c] of (d.claims ?? []).entries()) {
    if (!c.who) errors.push(`${where}.claims[${i}]: missing "who"`);
    checkText(`${where}.claims[${i}].claim`, c.claim);
    checkUrl(`${where}.claims[${i}]`, c.source?.url);
  }
}

const categories = ['industry', 'ai', 'lang', 'cloud', 'security'];
for (const n of load('news.json')) {
  const w = `news.json#${n.id}`;
  if (!isDate(n.date)) errors.push(`${w}: date must be YYYY-MM-DD`);
  if (!categories.includes(n.category)) errors.push(`${w}: unknown category "${n.category}"`);
  checkText(`${w}.title`, n.title);
  checkText(`${w}.summary`, n.summary);
  checkUrl(w, n.url);
  if (!['official', 'media', 'secondary'].includes(n.sourceType)) errors.push(`${w}: unknown sourceType "${n.sourceType}"`);
  if (!Array.isArray(n.corroboration)) errors.push(`${w}: corroboration must be an array`);
  for (const [i, c] of (n.corroboration ?? []).entries()) {
    checkUrl(`${w}.corroboration[${i}]`, c.url);
    if (c.url === n.url) errors.push(`${w}.corroboration[${i}]: duplicates the primary source`);
  }
  if (n.dispute) checkDispute(`${w}.dispute`, n.dispute);
}

const severities = ['exploited', 'critical', 'high'];
for (const c of load('cves.json')) {
  const w = `cves.json#${c.cve}`;
  if (!/^CVE-\d{4}-\d{4,}$/.test(c.cve)) errors.push(`${w}: invalid CVE id`);
  if (!severities.includes(c.severity)) errors.push(`${w}: unknown severity "${c.severity}"`);
  if (c.cvss !== null && (typeof c.cvss !== 'number' || c.cvss < 0 || c.cvss > 10)) errors.push(`${w}: cvss must be 0–10 or null`);
  checkText(`${w}.product`, c.product);
  checkText(`${w}.action`, c.action);
  checkUrl(w, c.url);
}

for (const e of load('events.json')) {
  const w = `events.json#${e.id}`;
  if (!isDate(e.date)) errors.push(`${w}: date must be YYYY-MM-DD`);
  checkText(`${w}.title`, e.title);
  checkText(`${w}.summary`, e.summary);
  for (const k of ['us', 'tw']) {
    for (const [i, r] of e.market[k].entries()) {
      checkText(`${w}.market.${k}[${i}].basis`, r.basis);
      if (r.pct !== null && (typeof r.pct !== 'number' || Math.abs(r.pct) > 100))
        errors.push(`${w}.market.${k}[${i}]: pct must be a number between -100 and 100, or null`);
      // 圖表只畫收盤數據 / Only closing data goes into charts
      const basisZh = r.basis?.['zh-TW'] ?? '';
      if (typeof r.pct === 'number' && (!/收盤/.test(basisZh) || /非.{0,2}收盤/.test(basisZh)))
        errors.push(`${w}.market.${k}[${i}]: pct is only allowed for closing data (basis must say 收盤)`);
      checkUrl(`${w}.market.${k}[${i}]`, r.source.url);
    }
  }
  for (const [i, s] of e.sources.entries()) checkUrl(`${w}.sources[${i}]`, s.url);
  if (!['ongoing', 'monitoring', 'patched', 'resolved'].includes(e.status)) errors.push(`${w}: unknown status "${e.status}"`);
  if (!isDate(e.verifiedOn)) errors.push(`${w}: verifiedOn must be YYYY-MM-DD`);
  checkText(`${w}.nextWatch`, e.nextWatch);
  for (const k of ['what', 'impact', 'action']) checkText(`${w}.brief.${k}`, e.brief?.[k]);
  if (e.postmortem) checkUrl(`${w}.postmortem`, e.postmortem.url);
  if (!Array.isArray(e.updates) || e.updates.length === 0) errors.push(`${w}: needs at least one update`);
  for (const [i, u] of (e.updates ?? []).entries()) {
    if (!isDate(u.date)) errors.push(`${w}.updates[${i}]: date must be YYYY-MM-DD`);
    if (u.time) checkText(`${w}.updates[${i}].time`, u.time);
    checkText(`${w}.updates[${i}].text`, u.text);
    checkUrl(`${w}.updates[${i}]`, u.source?.url);
    if (u.upcoming && isDate(u.date) && isDate(e.verifiedOn) && u.date <= e.verifiedOn)
      errors.push(`${w}.updates[${i}]: marked upcoming but the date isn't after verifiedOn`);
  }
  for (const [i, d] of (e.disputes ?? []).entries()) checkDispute(`${w}.disputes[${i}]`, d);
}

// 名詞小教室 / Glossary
const glossary = load('glossary.json');
const termIds = new Set();
const newsIds = new Set(load('news.json').map((n) => n.id));
const eventIds = new Set(load('events.json').map((e) => e.id));
for (const g of glossary) {
  const w = `glossary.json#${g.id}`;
  if (!/^[a-z0-9-]+$/.test(g.id ?? '')) errors.push(`${w}: id must use lowercase letters, digits and hyphens`);
  if (termIds.has(g.id)) errors.push(`${w}: duplicate id`);
  termIds.add(g.id);
  if (!categories.includes(g.category)) errors.push(`${w}: unknown category "${g.category}"`);
  for (const k of ['term', 'oneLiner', 'why']) checkText(`${w}.${k}`, g[k]);
  if (!Array.isArray(g.points) || g.points.length < 2) errors.push(`${w}: needs at least two points`);
  for (const [i, p] of (g.points ?? []).entries()) checkText(`${w}.points[${i}]`, p);
  if (!Array.isArray(g.sources) || g.sources.length < 1) errors.push(`${w}: needs at least one source`);
  for (const [i, x] of [...(g.sources ?? []), ...(g.further ?? [])].entries()) checkUrl(`${w}.sources/further[${i}]`, x.url);
  for (const id of g.related?.news ?? []) if (!newsIds.has(id)) errors.push(`${w}: related news "${id}" doesn't exist`);
  for (const id of g.related?.events ?? []) if (!eventIds.has(id)) errors.push(`${w}: related event "${id}" doesn't exist`);
  if (!isDate(g.verifiedOn)) errors.push(`${w}: verifiedOn must be YYYY-MM-DD`);
}
// 名詞分組與研討會 / Glossary groups and conferences
const groupIds = new Set(load('glossary-groups.json').map((g) => g.id));
for (const g of load('glossary-groups.json')) {
  checkText(`glossary-groups.json#${g.id}.name`, g.name);
  checkText(`glossary-groups.json#${g.id}.desc`, g.desc);
}
for (const g of glossary) if (!groupIds.has(g.group)) errors.push(`glossary.json#${g.id}: unknown group "${g.group}"`);
for (const c of load('conferences.json')) {
  const w = `conferences.json#${c.id}`;
  if (!c.name) errors.push(`${w}: missing name`);
  if (!isDate(c.start) || !isDate(c.end)) errors.push(`${w}: start and end must be YYYY-MM-DD`);
  else if (c.end < c.start) errors.push(`${w}: end is before start`);
  checkText(`${w}.location`, c.location);
  if (c.note) checkText(`${w}.note`, c.note);
  if (c.cfp) {
    if (!isDate(c.cfp.date)) errors.push(`${w}.cfp: date must be YYYY-MM-DD`);
    checkText(`${w}.cfp.label`, c.cfp.label);
  }
  if (!Array.isArray(c.groups) || c.groups.length === 0) errors.push(`${w}: needs at least one group`);
  for (const id of c.groups ?? []) if (!groupIds.has(id)) errors.push(`${w}: unknown group "${id}"`);
  checkUrl(w, c.source?.url);
  if (typeof c.official !== 'boolean') errors.push(`${w}: official must be true or false`);
  if (!isDate(c.verifiedOn)) errors.push(`${w}: verifiedOn must be YYYY-MM-DD`);
}

for (const g of glossary) for (const id of g.seeAlso ?? []) if (!termIds.has(id)) errors.push(`glossary.json#${g.id}: seeAlso "${id}" doesn't exist`);
for (const n of load('news.json')) for (const id of n.terms ?? []) if (!termIds.has(id)) errors.push(`news.json#${n.id}: term "${id}" doesn't exist`);
for (const e of load('events.json')) for (const id of e.terms ?? []) if (!termIds.has(id)) errors.push(`events.json#${e.id}: term "${id}" doesn't exist`);

// CISA KEV（由排程自動同步，外部資料）/ CISA KEV (synced on a schedule; external data)
const kev = load('kev.json');
checkUrl('kev.json.sourceUrl', kev.sourceUrl);
if (!Array.isArray(kev.items)) errors.push('kev.json: items must be an array');
if (kev.dateReleased !== null && Number.isNaN(Date.parse(kev.dateReleased))) errors.push('kev.json: dateReleased is not a date');
for (const [i, v] of (kev.items ?? []).entries()) {
  const w = `kev.json.items[${i}]`;
  if (!/^CVE-\d{4}-\d{4,}$/.test(v.cve ?? '')) errors.push(`${w}: invalid CVE id`);
  if (!isDate(v.dateAdded)) errors.push(`${w}: dateAdded must be YYYY-MM-DD`);
  if (v.dueDate !== null && !isDate(v.dueDate)) errors.push(`${w}: dueDate must be YYYY-MM-DD or null`);
  if (typeof v.ransomware !== 'boolean') errors.push(`${w}: ransomware must be true or false`);
  for (const k of ['vendor', 'product', 'name', 'action']) {
    if (typeof v[k] !== 'string' || v[k].length > 400) errors.push(`${w}: ${k} must be a string of at most 400 characters`);
  }
}

// 查證日期不可晚於今天（容許台灣與 UTC 的時差）/ Verification dates can't be in the future (allowing for Taiwan vs UTC)
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const meta = load('meta.json');
if (!isDate(meta.verifiedOn)) errors.push('meta.json: verifiedOn must be YYYY-MM-DD');
else if (meta.verifiedOn > tomorrow) errors.push(`meta.json: verifiedOn ${meta.verifiedOn} is in the future`);
for (const k of ['staleAfterDays', 'developingStaleAfterDays', 'kevStaleAfterDays']) {
  if (!Number.isInteger(meta[k]) || meta[k] < 1) errors.push(`meta.json: ${k} must be a positive integer`);
}
for (const e of load('events.json')) {
  if (isDate(e.verifiedOn) && e.verifiedOn > tomorrow) errors.push(`events.json#${e.id}: verifiedOn ${e.verifiedOn} is in the future`);
}

if (errors.length) {
  console.error(`Data check failed (${errors.length}):\n- ` + errors.join('\n- '));
  process.exit(1);
}
console.log('Data check passed.');
