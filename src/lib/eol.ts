// 90 天內到期的版本，供首頁提醒用。建置當下計算；每次同步都會重新建置。
// Versions ending support within 90 days, for the home page hint. Computed at build time; every sync rebuilds.
import eol from '../data/eol.json';

export interface EndingSoon { product: string; cycle: string; eol: string }

export function endingSoon(days = 90): EndingSoon[] {
  const today = new Date().toISOString().slice(0, 10);
  const limit = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  const out: EndingSoon[] = [];
  for (const p of eol.products ?? []) {
    for (const c of p.cycles ?? []) {
      if (c.eol && c.eol >= today && c.eol <= limit) out.push({ product: p.label, cycle: c.cycle, eol: c.eol });
    }
  }
  return out.sort((a, b) => a.eol.localeCompare(b.eol));
}
