// 每天 08:00–17:00（台灣時間）每小時由 GitHub Actions 執行：抓取 GitHub Advisory Database 中
// 經 GitHub 審核、等級為重大或高的套件漏洞，只保留最新幾筆。
// Run hourly 08:00–17:00 Taiwan time by GitHub Actions: fetch GitHub-reviewed critical and high
// advisories from the GitHub Advisory Database and keep the newest entries.
//
// 資料授權：GitHub Advisory Database 採 CC BY 4.0，網站上必須標示出處。
// License: the GitHub Advisory Database is CC BY 4.0, so the site must credit it.
//
// 在 GitHub Actions 中會帶入 GITHUB_TOKEN 提高請求上限；本機沒有也能執行。
// GitHub Actions passes GITHUB_TOKEN for a higher rate limit; it also runs locally without one.
import { makeFail, clean, toDate, fetchJson, writeIfChanged } from './lib/feed.mjs';

const API = 'https://api.github.com/advisories';
const SITE = 'https://github.com/advisories';
const OUT = new URL('../src/data/ghsa.json', import.meta.url);
const LIMIT = 12;
const fail = makeFail('GHSA');

// 一般開發者常用的套件生態系 / Package ecosystems most engineers use
const ECOSYSTEMS = ['npm', 'pip', 'maven', 'nuget', 'go', 'composer', 'rubygems', 'rust'];

const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const raw = [];
for (const severity of ['critical', 'high']) {
  const q = new URLSearchParams({ type: 'reviewed', severity, per_page: '50', sort: 'published', direction: 'desc' });
  const page = await fetchJson(`${API}?${q}`, { headers, fail });
  if (!Array.isArray(page)) fail(`unexpected response shape for severity=${severity}`);
  raw.push(...page);
}

const score = (a) => {
  const s = a?.cvss_severities?.cvss_v4?.score ?? a?.cvss_severities?.cvss_v3?.score ?? a?.cvss?.score;
  return typeof s === 'number' && s > 0 && s <= 10 ? Math.round(s * 10) / 10 : null;
};

const seen = new Set();
const items = [];
for (const a of raw) {
  const ghsa = clean(a?.ghsa_id, 30);
  if (!/^GHSA(-[23456789cfghjmpqrvwx]{4}){3}$/.test(ghsa) || seen.has(ghsa)) continue; // 略過格式不符或重複 / skip malformed or duplicate
  if (a.withdrawn_at) continue; // 已撤回的公告不顯示 / skip withdrawn advisories
  const published = toDate(a.published_at);
  if (!published) continue;
  const vulns = Array.isArray(a.vulnerabilities) ? a.vulnerabilities : [];
  const ecosystem = clean(vulns[0]?.package?.ecosystem, 20);
  if (!ECOSYSTEMS.includes(ecosystem)) continue;
  const packages = [...new Set(vulns.map((v) => clean(v?.package?.name, 100)).filter(Boolean))].slice(0, 3);
  if (packages.length === 0) continue;
  const patched = [...new Set(vulns.map((v) => clean(v?.first_patched_version, 40)).filter(Boolean))].slice(0, 4);
  const cve = clean(a.cve_id, 30);
  seen.add(ghsa);
  items.push({
    ghsa,
    cve: /^CVE-\d{4}-\d{4,}$/.test(cve) ? cve : null,
    severity: a.severity === 'critical' ? 'critical' : 'high',
    cvss: score(a),
    ecosystem,
    packages,
    patched,
    summary: clean(a.summary, 200),
    published,
  });
}
if (items.length === 0) fail('no valid entries');
items.sort((x, y) => y.published.localeCompare(x.published) || x.ghsa.localeCompare(y.ghsa));

const next = {
  source: 'GitHub Advisory Database',
  sourceUrl: SITE,
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  items: items.slice(0, LIMIT),
};
writeIfChanged(OUT, next, `${next.items.length} advisories, newest ${next.items[0].ghsa} (${next.items[0].published})`);
