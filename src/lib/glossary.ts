import glossary from '../data/glossary.json';
import type { GlossaryTerm } from '../types';

export const terms = glossary as GlossaryTerm[];
const byId = new Map(terms.map((g) => [g.id, g]));
export const getTerm = (id: string) => byId.get(id);
