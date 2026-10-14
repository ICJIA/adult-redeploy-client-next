// src/lib/live/render/listing-rows.ts
// Row builders for the ListingTable index pages. Shared by the .astro build and
// the live mixin so static + live rows are identical. ListingTable renders rows
// via Alpine x-for, so these return plain row objects (no markup) — the table's
// own fmt() formats dates client-side.

import { cleanSlug } from './shared';
import { RESOURCE_CATEGORIES, resEnumToSlug } from '../../resources';
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
export interface SiteEntity {
  slug: string;
  title: string;
  siteType?: string | null;
}
export interface ResourceEntity {
  slug: string;
  title: string;
  category: string;
  publicationDate?: string | null;
}
export interface TableRow {
  href: string;
  [k: string]: unknown;
}

export const NEWS_INDEX_SIG_KEYS = ['publicationDate', 'title', 'href'];
export const MTG_INDEX_SIG_KEYS = ['scheduledDate', 'title', 'href'];
export const SITES_INDEX_SIG_KEYS = ['title', 'siteType', 'href'];
export const RES_INDEX_SIG_KEYS = ['publicationDate', 'title', 'category', 'href'];
export const RES_CAT_SIG_KEYS = ['title', 'publicationDate', 'href'];
export const RECENT_PER_CATEGORY = 5;

export function newsIndexRows(items: NewsEntity[], ctx: LiveContext): TableRow[] {
  return items
    .map((n) => ({
      publicationDate: n.publicationDate ?? n.createdAt ?? '',
      title: n.title,
      href: `${ctx.basePath}/news/${cleanSlug(n.slug)}`,
    }))
    .sort((a, b) => (a.publicationDate < b.publicationDate ? 1 : -1));
}

// Sites index — alphabetical by title (mirrors sites/index.astro's localeCompare
// sort). Type column is the siteType; no date column.
export function sitesIndexRows(items: SiteEntity[], ctx: LiveContext): TableRow[] {
  return items
    .map((s) => ({
      title: s.title,
      siteType: s.siteType ?? '',
      href: `${ctx.basePath}/sites/${cleanSlug(s.slug)}`,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function meetingsIndexRows(
  items: MeetingEntity[],
  ctx: LiveContext,
  cat: { enum: string; slug: string },
  limit?: number,
): TableRow[] {
  const matched = items
    .filter((m) => m.category === cat.enum)
    .sort((a, b) => ((a.scheduledDate ?? '') < (b.scheduledDate ?? '') ? 1 : -1));
  const limited = limit == null ? matched : matched.slice(0, limit);
  return limited.map((m) => ({
    title: m.title,
    scheduledDate: m.scheduledDate ?? '',
    href: `${ctx.basePath}/about/meetings/${cat.slug}/${cleanSlug(m.slug)}`,
  }));
}

// /resources — every publication, newest first, with the short category label.
// An unknown category enum falls back to itself for both label and URL segment
// (mirrors resources/index.astro's original behaviour).
export function resourcesIndexRows(items: ResourceEntity[], ctx: LiveContext): TableRow[] {
  return items
    .map((r) => ({
      publicationDate: r.publicationDate ?? '',
      title: r.title,
      category: RESOURCE_CATEGORIES.find((c) => c.enum === r.category)?.short ?? r.category,
      href: `${ctx.basePath}/resources/${resEnumToSlug[r.category] ?? r.category}/${cleanSlug(r.slug)}`,
    }))
    .sort((a, b) => (a.publicationDate < b.publicationDate ? 1 : -1));
}

// /resources/<category> — that category only, newest first.
export function resourcesCategoryRows(
  items: ResourceEntity[],
  ctx: LiveContext,
  cat: { enum: string; slug: string },
): TableRow[] {
  return items
    .filter((r) => r.category === cat.enum)
    .map((r) => ({
      title: r.title,
      publicationDate: r.publicationDate ?? '',
      href: `${ctx.basePath}/resources/${cat.slug}/${cleanSlug(r.slug)}`,
    }))
    .sort((a, b) => (a.publicationDate < b.publicationDate ? 1 : -1));
}
