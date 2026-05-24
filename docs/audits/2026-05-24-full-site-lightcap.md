# Full-site Lighthouse audit — 2026-05-24

Site under test: <https://icjia.illinois.gov/adultredeploy/> at release **2.2.2**.
Tool: `lightcap` (Lighthouse, mobile emulation unless noted).
Scope: one representative URL per page template (290 routes total; bio /
news / meeting / site / resource / tag detail pages share templates).

## Headline numbers

**Accessibility: 100 on every page.** axe-core spot-checks also returned 0
violations.

**Best practices: 100 on every page** except `/about/biographies/<bio>`,
which scores **96** because some headshot uploads (Strapi-hosted) are
373–600 px wide and look soft on 2×/3× density displays. Fixable only by
re-uploading higher-resolution source images on the CMS side.

**SEO: 100 on every page** except four templates that ship without a
`<meta name="description">`. All score 92 for that single line item:

- `/resources/<category>` (category index)
- `/about/meetings/<category>` (category index)
- `/tags/<slug>`
- `/404`

These pages haven't ever had a description; an easy follow-up.

**Performance (mobile):**

| Template | URL audited | Perf | LCP / FCP |
|---|---|---|---|
| Section page (static) | `/about/contact`           | **100** | — |
| FAQ page              | `/about/faqs`              | **100** | — |
| News detail          | `/news/2025-summit`        | **100** | — |
| Meetings listing      | `/about/meetings`          | 95  | LCP 2.9s |
| Section page (CMS body) | `/about/overview`        | 90  | 2.9s |
| Grants index          | `/grants`                  | 90  | 2.9s |
| Section detail        | `/approach/local-control`  | 90  | 2.9s |
| Resources listing     | `/resources`               | 90  | 2.9s |
| Search                | `/search`                  | 90  | 2.9s |
| Site detail           | `/sites/cook-county`       | 90  | 2.9s |
| Meeting detail        | `/about/meetings/regular-oversight/ariob-meeting-2025-4` | 90 | 2.9s |
| Meeting category      | `/about/meetings/regular-oversight` | 90 | 2.9s |
| About index           | `/about`                   | 88  | 3.0s |
| Approach index        | `/approach`                | 89  | 3.0s |
| News listing          | `/news`                    | 89  | 2.9s |
| Resources category    | `/resources/annual-report` | 89  | 3.0s |
| Sites listing         | `/sites`                   | 89  | 2.9s |
| Apps listing          | `/apps`                    | **89** ↑ from "very low" | 3.0s |
| Staff                 | `/about/staff`             | 89  | 2.9s |
| Oversight             | `/about/oversight`         | 89  | 3.0s |
| Biography detail      | `/about/biographies/mary-ann-dyar` | 89 | 2.9s |
| Tag page              | `/tags/tag-0`              | 89  | 3.0s |
| 404                   | `/404`                     | 88  | CLS 0.24 |
| Programs (map)        | `/programs`                | 87  | 3.1s |
| Home                  | `/`                        | 86  | 3.3s |

**Performance (desktop) — only `/` audited as a control:**

| Template | URL | Perf | LCP / FCP |
|---|---|---|---|
| Home | `/` | 72 | LCP 4.8s, FCP 1.4s |

## Common signal across pages

Three perf line items appear on almost every page. None of them are
content-specific — they're all front-end loading bottlenecks:

1. **`network-dependency-tree-insight`** — Google Fonts CSS (Roboto +
   Lato) is fetched cross-origin. The browser can't begin the font file
   requests until the CSS arrives, which is itself behind the preconnect.
   This is the single biggest lever left on the FCP/LCP numbers.
2. **`render-blocking-insight`** — ~120 ms savings desktop. Same Google
   Fonts CSS request blocks rendering. We already load the stylesheet
   with `media="print"` + `onload="this.media='all'"` (lazy stylesheet
   pattern) plus a `<noscript>` fallback, but Lighthouse still counts the
   request as render-blocking-ish until it returns.
3. **`first-contentful-paint`** — ~2.9–3.3 s mobile. Driven by #1+#2.

**The fix that would push almost everything to 95+: self-host Roboto and
Lato.** Drop the two `<link rel="preconnect">` to googleapis/gstatic,
include the WOFF2 files in `src/assets/fonts/` (or `public/fonts/`),
declare `@font-face` rules in `global.css` with `font-display: swap`,
fingerprint the WOFF2s. Cuts two cross-origin round-trips out of every
page load. Worth queuing for the next perf push.

## Page-specific notes

- **`/` desktop Perf 72.** The hero image LCP is already optimized
  (15 KB WebP at 640w, srcset to 1920w). At desktop sizes the browser
  pulls the 1920w variant which is ~100 KB; combined with the Google
  Fonts blocking, LCP lands at ~4.8s. The mobile variant doesn't suffer
  this because it picks the 640w variant. A follow-up here would be
  preloading the desktop-size WebP, but the marginal gain is small once
  fonts are self-hosted.
- **`/404` CLS 0.24.** Layout shifts come from the footer + the
  body wrapping `main`. The 404 page has very little content so the
  footer + main do a perceptible reshuffle. Adding `min-height` on the
  404 content card would close it.
- **`/about/biographies/<bio>` BP 96.** "Serves images with low
  resolution." Cause is upstream — Strapi has 373–600 px headshots and
  no higher source. Not fixable in code.
- **`/apps` mobile Perf 89.** Up from "very low" in the user report. Was
  previously 1.56 MB of inline base64 per visit; now 24 KB with WebP
  variants from the build-time pipeline introduced in 2.2.2.

## Things to remember

- **Thumbor (`image.icjia.cloud`) is no longer used anywhere.** Verified
  zero references in `src/`, `scripts/`, `public/`, `netlify.toml`,
  `astro.config.mjs`, `package.json`, build output `dist/`, the live
  prod HTML on home / apps / news, and the live prod CSP response
  header. The only remaining mentions are in `CHANGELOG.md` and
  `docs/superpowers/` (historical / migration record).
- All CMS images now flow through the build-time WebP pipeline
  (Strapi-hosted via URL + Researchhub base64 data URIs alike).
- Skip-link, prose markdown spacing, meeting URL canonicalization, FAQ
  `<style>` stripping, county map shading, listing-table row clicks all
  still working — A11y 100 across the board.

## Easy follow-ups (not in this release)

1. **Self-host Roboto + Lato** — biggest perf lever; would push most
   pages to 95+ on mobile.
2. **Add meta descriptions** to category indexes (`/resources/<cat>`,
   `/about/meetings/<cat>`), tag pages (`/tags/<slug>`), and `/404`.
   Each becomes a one-line `<BaseLayout description={...}>` change.
3. **`/404` CLS** — set a `min-height` on the 404 main container.
4. **Higher-res bio headshots** (CMS-side editorial follow-up).
