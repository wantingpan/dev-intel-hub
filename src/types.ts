export type T = { 'zh-TW': string; en: string };
export type Src = { name: string; url: string };
export type MarketRow = { label: T; move: T; basis: T; source: Src };
export interface ImpactEvent {
  id: string;
  date: string;
  title: T;
  summary: T;
  facts: T[];
  work: T[];
  securityFacts: T[];
  securityPatterns: T[];
  market: { us: MarketRow[]; tw: MarketRow[]; views: T[]; caveats: T[] };
  sources: Src[];
}
