// 極簡的 RSS 2.0／Atom 解析：只取標題、連結、發布時間。不安裝套件，降低供應鏈風險。
// Minimal RSS 2.0 / Atom parser: title, link and published time only. No dependency, to keep the supply chain small.
//
// 輸入視為不可信：只用字串與正規表示式處理，不執行、不展開任何外部實體；解析不出來就回傳空陣列，由呼叫端保留舊資料。
// Input is untrusted: only string and regex work, no external entities are expanded; unparseable input yields an empty array so the caller keeps old data.

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', hellip: '…' };

function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m;
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}

// 去掉 CDATA 外框與標籤，再解碼 HTML 實體 / Unwrap CDATA, drop tags, then decode entities
function text(raw) {
  if (typeof raw !== 'string') return '';
  const unwrapped = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  return decodeEntities(unwrapped.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : null;
}

function atomLink(block) {
  const links = [...block.matchAll(/<link\b([^>]*?)\/?>/gi)].map((m) => m[1]);
  const pick = links.find((a) => /rel=["']alternate["']/i.test(a)) ?? links.find((a) => !/rel=/i.test(a)) ?? links[0];
  const href = pick?.match(/href=["']([^"']+)["']/i)?.[1];
  return href ? decodeEntities(href) : null;
}

// 日期：標準格式交給 Date；iThome 這類沒有時區的「2026-11-18  12:11:00」視為台灣時間
// Dates: standard formats go to Date; zone-less ones like iThome's "2026-11-18  12:11:00" are treated as Taiwan time
export function parseDate(raw) {
  const s = text(raw ?? '');
  if (!s) return null;
  const bare = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T]+(\d{2}):(\d{2})(?::(\d{2}))?$/);
  const d = bare ? new Date(`${bare[1]}-${bare[2]}-${bare[3]}T${bare[4]}:${bare[5]}:${bare[6] ?? '00'}+08:00`) : new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseFeed(xml) {
  if (typeof xml !== 'string' || !/<(rss|feed|rdf:RDF)\b/i.test(xml.slice(0, 4000))) return [];
  const blocks = [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => m[2]);
  const items = [];
  for (const b of blocks) {
    const title = text(tag(b, 'title') ?? '');
    const rssLink = tag(b, 'link');
    const url = (rssLink && text(rssLink).startsWith('http') ? text(rssLink) : null) ?? atomLink(b) ?? (/isPermaLink="true"/i.test(b) ? text(tag(b, 'guid') ?? '') : null);
    const published = parseDate(tag(b, 'pubDate') ?? tag(b, 'published') ?? tag(b, 'dc:date') ?? tag(b, 'updated'));
    if (title && url) items.push({ title, url, published });
  }
  return items;
}

// 去掉追蹤參數，只允許 https，並限制長度 / Strip tracking parameters, allow https only, cap length
const TRACKING = /^(utm_[a-z]+|fbclid|gclid|mc_cid|mc_eid|ref|ref_src|source|igshid|_hsenc|_hsmi|s_cid)$/i;
export function cleanUrl(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password) return null;
    for (const k of [...u.searchParams.keys()]) if (TRACKING.test(k)) u.searchParams.delete(k);
    const out = u.href;
    return out.length <= 500 ? out : null;
  } catch {
    return null;
  }
}
