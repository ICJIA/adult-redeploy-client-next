// src/lib/live/render/tag-page.ts
// /tags/<slug>: every news post, meeting and resource carrying the tag, grouped.
// tagPageRows + renderTagSections drive BOTH the static page (set:html) and the
// live island (surface tagPage, innerHTML mode with params: { tag }), so static
// and live markup can't drift. The tag is matched client-side exactly as the
// build does, from one TAGGED_ITEMS round trip (no bodies).

import { escapeHtml, cleanSlug } from './shared';
import { MEETING_ENUM_TO_SLUG } from '../data/meeting-cats.mjs';
import { resEnumToSlug } from '../../resources';
import type { LiveContext } from '../types';

export interface TagRow {
  group: 'News' | 'Meetings' | 'Resources';
  title: string;
  href: string;
}
interface Tagged {
  slug: string;
  title: string;
  category?: string | null;
  tags?: Array<{ slug: string }> | null;
}
export interface TaggedData {
  posts?: Tagged[] | null;
  meetings?: Tagged[] | null;
  resources?: Tagged[] | null;
}

export const TAG_SIG_KEYS = ['group', 'title', 'href'];

// tap-target: the link is the sole content of its <li> (SIA-R111 / 2.5.5).
const LINK = 'tap-target text-brand-primary underline hover:no-underline '
  + 'focus-visible:outline focus-visible:outline-2 '
  + 'focus-visible:outline-brand-primary focus-visible:outline-offset-2';

const withTag = (items: Tagged[] | null | undefined, tag: string): Tagged[] =>
  (items ?? []).filter((x) => (x?.tags ?? []).some((t) => t?.slug === tag));

export function tagPageRows(data: TaggedData, ctx: LiveContext, tag: string): TagRow[] {
  const news: TagRow[] = withTag(data.posts, tag).map((n) => ({
    group: 'News', title: n.title,
    href: `${ctx.basePath}/news/${cleanSlug(n.slug)}`,
  }));
  const meetings: TagRow[] = withTag(data.meetings, tag).map((m) => ({
    group: 'Meetings', title: m.title,
    href: `${ctx.basePath}/about/meetings/${(MEETING_ENUM_TO_SLUG as Record<string, string>)[m.category ?? ''] ?? m.category}/${cleanSlug(m.slug)}`,
  }));
  const resources: TagRow[] = withTag(data.resources, tag).map((r) => ({
    group: 'Resources', title: r.title,
    href: `${ctx.basePath}/resources/${resEnumToSlug[r.category ?? ''] ?? r.category}/${cleanSlug(r.slug)}`,
  }));
  return [...news, ...meetings, ...resources];
}

export function renderTagSections(rows: TagRow[]): string {
  if (!rows.length) return '<p class="mt-6 italic">No tagged content yet.</p>';
  const groups: TagRow['group'][] = ['News', 'Meetings', 'Resources'];
  return groups.map((g) => {
    const items = rows.filter((r) => r.group === g);
    if (!items.length) return '';
    const lis = items.map((i) => `
        <li><a href="${escapeHtml(i.href)}" class="${LINK}">${escapeHtml(i.title)}</a></li>`).join('');
    return `<section class="mt-8">
      <h2 class="font-heading font-bold text-xl mb-3">${g}</h2>
      <ul class="space-y-2">${lis}
      </ul>
    </section>`;
  }).join('');
}
