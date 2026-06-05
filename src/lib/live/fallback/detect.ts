// src/lib/live/fallback/detect.ts
// Pure URL → live-surface matcher for the 404 fallback host. Given a request
// path it returns the surface + slug to live-render, or null. Kept PURE (no
// window/DOM) so it unit-tests in the node vitest env; the 404 page's
// is:inline script MIRRORS this logic (it can't import). KEEP THE TWO IN SYNC.

export interface FallbackSurface {
  /** Path prefix that identifies the surface, e.g. "/news/". */
  prefix: string;
  /** The liveConfig.entries key to bootstrap, e.g. "newsDetail". */
  surface: string;
}

export interface FallbackMatch {
  surface: string;
  slug: string;
}

// v1: news only. Add one entry per CMS detail surface later (meetings carry a
// category segment, so they need their own rule — see the spec's "future").
export const FALLBACK_SURFACES: FallbackSurface[] = [
  { prefix: '/news/', surface: 'newsDetail' },
];

/**
 * Match a request path to a fallback surface + slug, or null.
 * - Strips an optional leading `base` (proxied prod sees "/news/x"; the raw
 *   *.netlify.app host sees "/adultredeploy/news/x").
 * - Requires a single non-empty path segment after the prefix, so "/news/"
 *   and "/news/a/b" do NOT match.
 */
export function detectSurface(
  pathname: string,
  base: string,
  surfaces: FallbackSurface[] = FALLBACK_SURFACES,
): FallbackMatch | null {
  let path = pathname;
  if (base && path.indexOf(base) === 0) path = path.slice(base.length) || '/';
  for (const e of surfaces) {
    if (path.indexOf(e.prefix) === 0) {
      const slug = path.slice(e.prefix.length).replace(/\/+$/, '');
      if (slug && !slug.includes('/')) return { surface: e.surface, slug };
      return null;
    }
  }
  return null;
}
