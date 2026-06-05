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
  /**
   * Number of path segments after the prefix; the slug is the LAST one.
   * Default 1. News is "/news/<slug>" (1); meetings are
   * "/about/meetings/<category>/<slug>" (2, slug = last segment).
   */
  segments?: number;
}

export interface FallbackMatch {
  surface: string;
  slug: string;
}

// Each CMS detail surface that should live-render on the 404 host. Add a row
// per surface; meetings carry a category segment, so segments: 2.
export const FALLBACK_SURFACES: FallbackSurface[] = [
  { prefix: '/news/', surface: 'newsDetail' },
  { prefix: '/about/meetings/', surface: 'meetingDetail', segments: 2 },
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
    if (path.indexOf(e.prefix) !== 0) continue;
    const rest = path.slice(e.prefix.length).replace(/\/+$/, '');
    if (!rest) return null;
    const segs = rest.split('/');
    const want = e.segments ?? 1;
    // Exact segment depth, no empty segments → the LAST segment is the slug.
    if (segs.length !== want || segs.some((s) => !s)) return null;
    return { surface: e.surface, slug: segs[segs.length - 1] };
  }
  return null;
}
