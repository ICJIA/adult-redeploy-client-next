// src/lib/live/types.ts
// Shared types for the live-fetch module. Kept free of any ARI-specifics so the
// behavior/ + data/ layers can be lifted into a shared package later; only
// config.ts and render/ are per-site.

export interface LiveContext {
  /** Strapi GraphQL endpoint (absolute, so it works on any deploy origin). */
  endpoint: string;
  /** Mounted base path, e.g. "/adultredeploy", used to build links. */
  basePath: string;
}

/** Options the inline listingTable passes to its live mixin (serialized into x-data). */
export interface LiveListOpts {
  surface: string;
  sig: string;
  /** Per-instance params (e.g. a committee category for the meetings index). */
  params?: Record<string, unknown>;
}

/** A list surface (home cards, index tables). */
export interface CollectionSurface {
  query: string;
  variables?: Record<string, unknown>;
  /** Raw GraphQL payload → array of view rows (mirrors the .astro transform). */
  select: (data: any, ctx: LiveContext, params?: Record<string, unknown>) => any[];
  /** Rows → HTML string for the swapped region (innerHTML mode only). */
  render?: (rows: any[], ctx: LiveContext) => string;
  /** Fields that define "changed"; omit to hash the whole row. */
  signatureKeys?: string[];
  /** 'innerHTML' = re-render a region; 'xfor' = hand rows to a listingTable. */
  mode: 'innerHTML' | 'xfor';
  /** Polite announcement subject, e.g. "ARI news" → "ARI news updated". */
  announceLabel: string;
}

/** A single-record surface (detail pages, homepage About). */
export interface EntrySurface {
  query: string;
  variables?: (slug: string) => Record<string, unknown>;
  /** Raw GraphQL payload → the single view object (or null if absent). */
  select: (data: any, ctx: LiveContext) => any | null;
  /** Apply a changed record to the page subtree (targeted swaps). */
  applyTo: (root: HTMLElement, view: any, ctx: LiveContext) => void | Promise<void>;
  /** Cheap change key; usually `updatedAt`. */
  signature: (view: any) => string;
  announceLabel: string;
}

export interface LiveConfig {
  ctx: LiveContext;
  collections: Record<string, CollectionSurface>;
  entries: Record<string, EntrySurface>;
}
