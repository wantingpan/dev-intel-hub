export type T = { 'zh-TW': string; en: string };
export type Src = { name: string; url: string };
export type MarketRow = { label: T; move: T; basis: T; source: Src; pct: number | null };
export type Dispute = {
  topic: T;
  claims: { who: string; claim: T; source: Src }[];
  verdict: T;
};
export type EventStatus = 'ongoing' | 'monitoring' | 'patched' | 'resolved';
export type Update = { date: string; time: T | null; upcoming?: boolean; text: T; source: Src };
export interface ImpactEvent {
  id: string;
  date: string;
  status: EventStatus;
  verifiedOn: string;
  title: T;
  summary: T;
  facts: T[];
  work: T[];
  securityFacts: T[];
  securityPatterns: T[];
  market: { us: MarketRow[]; tw: MarketRow[]; views: T[]; caveats: T[] };
  disputes: Dispute[];
  updates: Update[];
  nextWatch: T;
  brief: { what: T; impact: T; action: T };
  terms: string[];
  postmortem: Src | null;
  sources: Src[];
}
export type SourceType = 'official' | 'media' | 'secondary';

export interface GlossaryTerm {
  id: string;
  category: 'industry' | 'ai' | 'lang' | 'cloud' | 'security';
  group: GroupId;
  term: T;
  oneLiner: T;
  points: T[];
  why: T;
  related: { news: string[]; events: string[] };
  seeAlso: string[];
  sources: Src[];
  further: Src[];
  verifiedOn: string;
}

export type GroupId = 'foundations' | 'threats' | 'pipeline' | 'identity' | 'reliability';
export interface GlossaryGroup { id: GroupId; name: T; desc: T }
export interface Conference {
  id: string;
  name: string;
  start: string;
  end: string;
  location: T;
  groups: GroupId[];
  note: T | null;
  cfp: { date: string; label: T } | null;
  source: Src;
  official: boolean;
  verifiedOn: string;
}
