// src/lib/live/render/programs-map.ts
// Pure data helpers for the /programs Illinois county map, shared by the .astro
// build (baseline signature) and the live refresh so static + live agree. Imports
// only the pure signature helper — safe to import from .astro frontmatter.
//
// `byCounty` is keyed by SITE slug (= the SVG's data-county value). The SVG only
// ever indexes the build-time-active counties, so building the map from ALL sites
// simply adds unused keys — which keeps the live path free of the static
// county→circuit config (that config, not the CMS, decides which counties are
// clickable; see scripts/usiljs-config.js).

import { stableSignature } from '../behavior/signature';

export interface SitePanel { slug: string; title: string; summary?: string | null; }
export interface CountyInfo { title: string; summary: string | null; slug: string; }
export type ByCounty = Record<string, CountyInfo>;

// Fields that define a "changed" panel; siteType is irrelevant to the map.
export const MAP_SIG_KEYS = ['slug', 'title', 'summary'];

export function buildByCounty(sites: SitePanel[]): ByCounty {
  const out: ByCounty = {};
  for (const s of sites) out[s.slug] = { title: s.title, summary: s.summary ?? null, slug: s.slug };
  return out;
}

// Order-independent (sorted by slug) so the build baseline and the live hash match
// regardless of collection/query ordering.
export function mapSignature(sites: SitePanel[]): string {
  const rows = sites
    .map((s) => ({ slug: s.slug, title: s.title, summary: s.summary ?? null }))
    .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  return stableSignature(rows, MAP_SIG_KEYS);
}
