// src/lib/live/render/listing-rows.ts
// Row builders for the ListingTable index pages. Shared by the .astro build and
// the live mixin so static + live rows are identical. ListingTable renders rows
// via Alpine x-for, so these return plain row objects (no markup) — the table's
// own fmt() formats dates client-side.

import type { LiveContext } from '../types';

export interface NewsEntity {
  slug: string;
  title: string;
  publicationDate?: string | null;
  createdAt?: string | null;
}
export interface MeetingEntity {
  slug: string;
  title: string;
  scheduledDate?: string | null;
  category: string;
}
export interface TableRow {
  href: string;
  [k: string]: unknown;
}

export const NEWS_INDEX_SIG_KEYS = ['publicationDate', 'title', 'href'];
export const MTG_INDEX_SIG_KEYS = ['scheduledDate', 'title', 'href'];
export const RECENT_PER_CATEGORY = 5;

export function newsIndexRows(items: NewsEntity[], ctx: LiveContext): TableRow[] {
  return items
    .map((n) => ({
      publicationDate: n.publicationDate ?? n.createdAt ?? '',
      title: n.title,
      href: `${ctx.basePath}/news/${n.slug}`,
    }))
    .sort((a, b) => (a.publicationDate < b.publicationDate ? 1 : -1));
}

export function meetingsIndexRows(
  items: MeetingEntity[],
  ctx: LiveContext,
  cat: { enum: string; slug: string },
  limit = RECENT_PER_CATEGORY,
): TableRow[] {
  return items
    .filter((m) => m.category === cat.enum)
    .sort((a, b) => ((a.scheduledDate ?? '') < (b.scheduledDate ?? '') ? 1 : -1))
    .slice(0, limit)
    .map((m) => ({
      title: m.title,
      scheduledDate: m.scheduledDate ?? '',
      href: `${ctx.basePath}/about/meetings/${cat.slug}/${m.slug}`,
    }));
}
