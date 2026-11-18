// OPML：把技術動態用到的所有 RSS 網址整理成一個檔案，可一次匯入 Feedly、Inoreader、NetNewsWire 等閱讀器。
// OPML: every RSS URL used by the dev feeds page in one file, importable into Feedly, Inoreader, NetNewsWire and similar readers.
// 內容只有公開的網站與 feed 網址，沒有任何個人資料。
// It holds public site and feed URLs only, nothing personal.
import config from '../data/feed-sources.json';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function GET() {
  const body = config.groups
    .map((g) => {
      const outlines = config.sources
        .filter((x) => x.group === g.id)
        .map((x) => `      <outline type="rss" text="${esc(x.name)}" title="${esc(x.name)}" xmlUrl="${esc(x.feedUrl)}" htmlUrl="${esc(x.siteUrl)}" />`)
        .join('\n');
      return `    <outline text="${esc(g.name.en)}" title="${esc(g.name.en)}">\n${outlines}\n    </outline>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Dev feeds</title>
  </head>
  <body>
${body}
  </body>
</opml>
`;
  return new Response(xml, { headers: { 'Content-Type': 'text/x-opml; charset=utf-8' } });
}
