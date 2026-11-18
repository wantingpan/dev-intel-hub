// 首頁「需要行動」挑出的漏洞，以及它們的 CVE 編號：下面的資安與漏洞頁籤用來避免重複列出。
// The vulnerabilities picked for "Act on this" and their CVE ids; the vulnerability tabs below use them to avoid listing the same CVE twice.
import cves from '../data/cves.json';

const rank = { exploited: 0, critical: 1, high: 2 } as const;
export const ACTION_COUNT = 4;

export const actionTop = [...cves]
  .sort((a, b) => rank[a.severity as keyof typeof rank] - rank[b.severity as keyof typeof rank])
  .slice(0, ACTION_COUNT);

export const actionIds = new Set(actionTop.map((c) => c.cve));
