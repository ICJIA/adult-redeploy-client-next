// src/lib/live/data/content-patches.mjs
// Slug-keyed body fixups for SiteImprove structural flags that are really CMS
// content bugs — R53 "Headings are not structured" (skipped levels) and R78
// "Content missing after heading". Plain ESM so the Node build fetch
// (scripts/fetch-content.mjs) and the browser live islands share ONE list:
// whatever the static page shows, a live re-render (or the 404 host's bootstrap
// render) shows too. Each patch no-ops once the CMS copy is corrected upstream,
// at which point it can be deleted.

export const CONTENT_PATCHES = [
  {
    bucket: 'resources', slug: 'eligibility-webinar',
    // An h5 directly after the page h1 (R53 level skip) with no content after
    // it (R78) — and the `{.muted .mt-5}` attrs syntax renders as literal text
    // because markdown-it-attrs isn't in the render pipeline. It's a caption
    // for the YouTube thumbnail, not a heading.
    find: '##### Click to play on YouTube{.muted .mt-5}',
    replace: '**Click to play on YouTube**',
  },
  {
    bucket: 'news', slug: 'ari-nofo-sfy21',
    // First body heading is an h3, but the page h1 is the article-card title —
    // so the body must start heading levels at h2 (R53).
    find: '### Application deadline: March 31, 2020.',
    replace: '## Application deadline: March 31, 2020.',
  },
];

/** Apply every patch registered for this bucket + slug; non-strings pass through. */
export function patchContent(bucket, slug, content) {
  if (typeof content !== 'string') return content;
  let out = content;
  for (const p of CONTENT_PATCHES) {
    if (p.bucket === bucket && p.slug === slug && out.includes(p.find)) {
      out = out.replace(p.find, p.replace);
    }
  }
  return out;
}
