// src/lib/live/data/slug.mjs
// Slug hygiene — trim stray leading/trailing whitespace from CMS slugs. A slug
// with a trailing space (a common Strapi data-entry slip) can't round-trip
// through a URL, so it silently breaks THREE things: the static route, the
// homepage/index links, and the 404 live-fallback's exact-match lookup.
// Normalizing here keeps every slug clean at the source.
//
// Plain ESM (.mjs) ON PURPOSE so BOTH the build fetcher (scripts/, runs in
// Node) and the live render layer (TypeScript) can import the same helper —
// see meeting-cats.mjs for the same shared-module pattern.

/** Trim whitespace from a slug; pass non-strings through unchanged. */
export const cleanSlug = (s) => (typeof s === 'string' ? s.trim() : s);

/**
 * Trim every record's `slug` (and nested `tags[].slug`) across every
 * collection array in the build snapshot, in place. Non-array top-level
 * values and records without a string slug are left untouched. Idempotent.
 * Returns the same object for convenience.
 */
export function normalizeSlugs(data) {
  if (!data || typeof data !== 'object') return data;
  for (const value of Object.values(data)) {
    if (!Array.isArray(value)) continue;
    for (const rec of value) {
      if (!rec || typeof rec !== 'object') continue;
      if (typeof rec.slug === 'string') rec.slug = rec.slug.trim();
      if (Array.isArray(rec.tags)) {
        for (const t of rec.tags) {
          if (t && typeof t.slug === 'string') t.slug = t.slug.trim();
        }
      }
    }
  }
  return data;
}
