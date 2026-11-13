import glossary from '../data/glossary.json';
import groupData from '../data/glossary-groups.json';
import confData from '../data/conferences.json';
import type { Conference, GlossaryGroup, GlossaryTerm, GroupId } from '../types';

export const terms = glossary as GlossaryTerm[];
export const groups = groupData as GlossaryGroup[];
export const conferences = [...(confData as Conference[])].sort((a, b) => a.start.localeCompare(b.start));

const byId = new Map(terms.map((g) => [g.id, g]));
export const getTerm = (id: string) => byId.get(id);
export const termsIn = (group: GroupId) => terms.filter((g) => g.group === group);
export const conferencesFor = (group: GroupId) => conferences.filter((c) => c.groups.includes(group));
