# Astro conversion checklist — patterns to repeat

> **This is v1 (Astro 5 + yarn, mid-2025). A newer [v2 checklist](https://github.com/ICJIA/icjia-i2i-v2-2024/blob/main/docs/astro-conversion-checklist.md)
> supersedes it** with updates for Astro 6, pnpm, hash-locked CSP,
> COOP/CORP, context-scoped headers, audit scripts, and a Sharp-
> postinstall gotcha. **Use v2 for new projects.** v1 is still valid
> for existing Astro 5 + yarn projects that aren't upgrading.

Practical patterns that earned their keep on this Vue 2 / Nuxt → Astro 5 +
Tailwind 4 + Alpine.js rewrite. Copy what fits; nothing here is sacred.

Production reference: <https://icjia.illinois.gov/adultredeploy>.

## How to use this checklist

**Direct URL** (preferred):
<https://github.com/ICJIA/adult-redeploy-client-next/blob/master/docs/astro-conversion-checklist.md>

- **In Claude Code (other repos):** point the assistant at the URL —
  e.g. *"apply the patterns from
  github.com/ICJIA/adult-redeploy-client-next/blob/master/docs/astro-conversion-checklist.md
  to this codebase, starting with the image pipeline."* Claude will
  fetch and apply.
- **Locally:** clone or `wget` the file into your repo's `docs/` folder
  so it's part of the working set.
- **By section:** each numbered section is self-contained. You can
  reference just one, e.g. *"set up §5 (image optimization) and §6
  (self-host fonts)."*
- **Cherry-pick the scripts.** `scripts/fetch-cms-images.mjs`,
  `scripts/build-og-image.mjs`, `scripts/check-links.mjs`, and
  `src/lib/cms-image.ts` are intentionally small and generic enough to
  drop into another Astro project with light edits (mostly: which CMS
  host, which fields to scan).

---

## 1. Project shape

```
src/
├── assets/                # images Astro should optimize (Image / Picture)
│   └── *.jpg|.png|.svg
├── content/
│   ├── _data.json         # single fetched JSON from headless CMS (gitignored)
│   └── config.ts          # Zod schemas + file() loaders
├── components/
│   ├── alpine/            # Alpine-driven interactive bits (dropdown, drawer, table)
│   ├── svg/               # pre-processed SVG partials (illinois-paths.html etc.)
│   ├── ui/                # presentational primitives (Card, Button, Tag, Breadcrumb)
│   ├── *.astro            # page-specific composites
├── layouts/
│   └── BaseLayout.astro   # head + skip-link + header/footer + Alpine bootstrap
├── lib/                   # small TS helpers (dates, markdown, cms-image, etc.)
├── pages/                 # routes; one .astro per template
└── styles/global.css      # Tailwind 4 entry + @theme tokens + custom rules

scripts/
├── fetch-content.mjs      # build-time GraphQL fetch from headless CMS → _data.json
├── fetch-cms-images.mjs   # download / decode CMS images, Sharp → WebP variants
├── build-counties.mjs     # legacy data → JSON
├── build-svg.mjs          # legacy template → static SVG partial
├── build-og-image.mjs     # OpenGraph PNG via Sharp from SVG source
├── audit-axe.mjs          # CLI axe-core wrapper
├── audit-lighthouse.mjs   # CLI Lighthouse wrapper
└── check-links.mjs        # internal + external link sanity scanner

public/                    # static, copied to dist as-is
.cache/                    # local-only caches for build scripts (gitignored)
docs/                      # specs, plans, audits — historical record
```

Rationale: `src/assets/` for things you want Vite/Sharp to fingerprint and
optimize; `public/` for things you want at a known URL (favicon, robots.txt,
sitemap, og-image.png that other services hotlink). Pre-processed assets
that are technically derivable but slow to recompute (like
`scripts/illinois-svg.html` from a legacy export) live in `scripts/` so the
transformer stays close to the source.

---

## 2. Astro config — the few flags that matter

```js
// astro.config.mjs
export default defineConfig({
  site: 'https://icjia.illinois.gov', // absolute origin, no path
  base: '/adultredeploy',              // mount path
  trailingSlash: 'never',              // pick one; stick to it
  output: 'static',                    // 'static' unless you genuinely need SSR
  integrations: [sitemap({ ... })],    // see §11
  vite: { plugins: [tailwindcss()] },  // Tailwind 4 — vite plugin, not the v3 PostCSS one
});
```

**Pitfalls:**

- `site` is the origin; **don't** include the base path in it. `base` adds
  it. `Astro.url` and emitted URLs assemble correctly when both are set.
- For mounted sites, every internal href must include `base`. Centralize
  with `const base = import.meta.env.BASE_URL || '/your-mount';` and use
  template literals: `${base}/news/${slug}`.
- `trailingSlash: 'never'` means routes are `/news` not `/news/`. If the
  upstream CDN normalizes the other way, expect a redirect.

---

## 3. Content collections backed by a single JSON

Headless CMS data fetched once at build time, validated with Zod, then
imported via `getCollection()` / `getEntry()` like any Astro content
collection. The "secret" is `loader: file(DATA, { parser: ... })`:

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const DATA = './_data.json';
const withId = (key) => (text) =>
  JSON.parse(text)[key].map((entry, i) => ({
    id: entry.slug ?? String(i),  // file loader requires id
    ...entry,
  }));

const news = defineCollection({
  loader: file(DATA, { parser: withId('news') }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    publicationDate: z.string().nullable().optional(),
    // ... permissive shapes for nullable CMS fields
  }),
});

export const collections = { news, /* ... */ };
```

```js
// scripts/fetch-content.mjs (gist)
const data = await request(ENDPOINT, QUERY);
// post-process: canonicalize URLs, strip CMS quirks, normalize names
await fs.writeFile('src/content/_data.json', JSON.stringify(data, null, 2));
```

**Patterns that paid off:**

- **One file, many collections.** Fetching everything in a single GraphQL
  query is faster and easier to debug than a per-collection request.
- **`_data.json` is gitignored.** It's regenerated per build, so don't
  commit it (it'll diff constantly).
- **Build-time content-mutating step.** After fetch, rewrite known CMS
  errors (e.g. wrong URL slugs in markdown bodies) in `_data.json`
  itself. The site then ships canonical URLs and you don't need runtime
  redirects.
- **Permissive Zod schemas.** Use `.nullable().optional()` liberally on
  CMS fields. Strict schemas break the build the moment an editor saves
  an empty string.

---

## 4. Markdown rendering — markdown-it + xss + post-process

```ts
// src/lib/markdown.ts
import MarkdownIt from 'markdown-it';
import xss from 'xss';
import { getCmsImage } from './cms-image';

const md = new MarkdownIt({ html: true, linkify: true, breaks: false });

const imgAllow = ['src', 'alt', 'title', 'width', 'height',
                  'loading', 'decoding', 'fetchpriority', 'sizes', 'srcset'];

export function renderMarkdown(src) {
  if (!src) return '';
  const html = md.render(src);
  const safe = xss(html, {
    stripIgnoreTagBody: ['script', 'style'],
    whiteList: { ...xss.getDefaultWhiteList(), img: imgAllow },
  });
  return rewriteImages(safe);
}
```

**Why this combo:**

- **`stripIgnoreTagBody: ['script', 'style']`.** Default xss escapes
  unknown tags' bodies, leaking CMS-authored CSS as visible text. Strip
  the body too.
- **Extend the `img` whitelist** with `loading`, `decoding`, `srcset`,
  `sizes`, `fetchpriority`. xss strips them otherwise and you lose every
  perf attr you tried to add.
- **Post-process the rendered HTML.** Markdown-it's image rule only fires
  for `![]()`, not raw HTML `<img>` tags — many CMS bodies use the
  latter. Do a single regex pass after xss to handle both.

```ts
// inject loading=lazy, decoding=async, rewrite CMS image URLs in one pass
const IMG_RX = /<img\b((?:[^>"]|"[^"]*")*?)\s*\/?\s*>/gi;
function rewriteImages(html) {
  return html.replace(IMG_RX, (_, attrs) => {
    const optimized = swapCmsImage(attrs);  // looks up build-time manifest
    let out = optimized;
    if (!/\bloading\s*=/i.test(out))  out += ' loading="lazy"';
    if (!/\bdecoding\s*=/i.test(out)) out += ' decoding="async"';
    return `<img${out}>`;
  });
}
```

**For per-tag prose styling without the Tailwind Typography plugin:**

Tailwind 4 ships no `prose` by default. Add a small set of `.prose` rules
in `global.css` covering `p`, `ul/ol`, `li`, headings, `a`, `blockquote`,
`code`, `pre`, `table`, `img`, `hr`, `details`, `summary`. ~80 lines, no
extra dep. The CMS Markdown components render into `<div class="prose
max-w-none">` and that's all the typography you need for most sites.

---

## 5. Image optimization — three tiers

### Tier 1: local assets you control

Put them in `src/assets/` and use Astro's built-in:

```astro
---
import { Image } from 'astro:assets';
import splash from '../assets/hero.jpg';
---
<Image
  src={splash}
  widths={[640, 960, 1280, 1920]}
  sizes="100vw"
  formats={['webp']}
  alt=""
  loading="eager"
  fetchpriority="high"
/>
```

Astro / Sharp generate WebP variants at build time; emit `srcset` + intrinsic
`width`/`height`. **One change usually moves mobile LCP > 25%.**

### Tier 2: remote CMS-hosted images (Strapi, etc.)

Build-time download + Sharp → WebP, write to `public/_cms-img/`, build a
manifest keyed by original URL. At render time, look up the manifest and
emit the optimized URL + `srcset` + intrinsic dimensions.

```js
// scripts/fetch-cms-images.mjs (gist)
for (const url of collectUrls(_dataJson)) {
  const buffer = await fetch(url).then(r => r.buffer());
  const meta = await sharp(buffer).metadata();
  for (const w of [640, 960, 1280, meta.width]) {
    await sharp(buffer).resize(w).webp({ quality: 82 })
                       .toFile(`public/_cms-img/${hash}-${w}.webp`);
  }
  manifest[url] = { width: meta.width, height: meta.height, variants };
}
fs.writeFileSync('src/lib/cms-image-manifest.json',
                 JSON.stringify(manifest));
```

```ts
// src/lib/cms-image.ts
import manifestData from './cms-image-manifest.json' with { type: 'json' };

export function getCmsImage(url) {
  const e = manifest[url];
  return e && {
    src: `${BASE}${e.largest}`,
    srcset: e.variants.map(v => `${BASE}${v.src} ${v.w}w`).join(', '),
    width: e.width,
    height: e.height,
  };
}
```

**Pitfalls:**

- Cache downloaded buffers in `.cache/cms-img/<hash>` (gitignored) so
  re-builds skip the network.
- **Import the manifest as JSON** (`with { type: 'json' }`), not via
  `fs.readFileSync` at module top-level. Vite's SSR bundler doesn't
  always resolve `__dirname`-relative reads the way you expect.
- **Commit the manifest, gitignore the generated WebPs.** Manifest is
  small and useful diffs; the WebPs are large and regenerable.

### Tier 3: inline base64 data URIs from CMS

(Looking at you, Researchhub.) Same script, separate path: detect
`data:image/...;base64,` strings, hash the payload, decode to buffer,
process through the same Sharp path, **then rewrite the JSON field
in-place** to a stable key like `cms-base64:<hash>` so subsequent build
steps and rendered pages never see the original base64.

On this site that single change took `/apps` from a 1.56 MB HTML
document to 24 KB.

---

## 6. Fonts — self-host always

Google Fonts is the #1 lighthouse blocker on most sites. Self-host with
`@fontsource`:

```sh
npm install @fontsource/roboto @fontsource/lato
```

```css
/* src/styles/global.css */
@import "@fontsource/roboto/400.css";
@import "@fontsource/roboto/700.css";
@import "@fontsource/lato/400.css";
@import "@fontsource/lato/700.css";
```

Drop the Google Fonts `<link>` from BaseLayout, drop
`fonts.googleapis.com` / `fonts.gstatic.com` from CSP `style-src` /
`font-src`. Each weight ships as a same-origin WOFF2 with `font-display:
swap` already set.

**Variable fonts** (`@fontsource-variable/...`) are even smaller — one
file covers 100–900. Use them where available.

---

## 7. Interactivity with Alpine.js

```astro
---
// astro frontmatter — server-only, runs at build
---
<button x-data="{ open: false }"
        x-on:click="open = !open"
        :aria-expanded="open">
  Toggle
</button>
<div x-show="open" x-transition>...</div>

<script>
  import Alpine from 'alpinejs';
  import focus from '@alpinejs/focus';
  Alpine.plugin(focus);
  Alpine.start();
</script>
```

**Patterns from this site:**

- Bootstrap Alpine **once** in `BaseLayout.astro` `<script>` block.
- Per-component Alpine state lives inline (`x-data="{...}"`); shared
  state via `Alpine.store(...)` (e.g. drawer open/closed).
- For ARIA dialogs (drawer / modal): use `@alpinejs/focus` and
  `x-trap.noscroll.inert="$store.drawer.open"`.
- **CSP requires `'unsafe-eval'`** in `script-src` — Alpine evaluates
  `x-*` directives via `new Function()`. There's no way around this
  (yet); accept it or use a different reactivity lib.

---

## 8. SEO — `astro-seo` + per-page descriptions

```sh
npm install astro-seo
```

```astro
---
// BaseLayout.astro
import { SEO } from 'astro-seo';
const { title, description, ogImage } = Astro.props;
const canonical = `${origin}${Astro.url.pathname}`.replace(/\/$/, '');
const meta = makeDescription(description);  // strip md/html, trim to 160
---
<SEO
  title={`Brand | ${title}`}
  description={meta}
  canonical={canonical}
  openGraph={{
    basic: { title: ogTitle, type: 'website', image: ogImageUrl, url: canonical },
    image: { width: 1200, height: 630, alt: '...' },
    optional: { description: meta, locale: 'en_US', siteName: SITE_NAME },
  }}
  twitter={{ card: 'summary_large_image', title: ogTitle,
             description: meta, image: ogImageUrl, imageAlt: '...' }}
  extend={{
    meta: [{ name: 'robots', content: 'index, follow' }],
    link: [{ rel: 'icon', href: `${base}/favicon.ico` }],
  }}
/>
```

**Description-cleaning helper.** CMS summaries come with markdown link
syntax, stray `<span>`, newlines. One pass:

```ts
function makeDescription(raw) {
  const c = (raw ?? DEFAULT)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // [text](url) → text
    .replace(/[*_`]/g, '')                       // **bold** etc
    .replace(/<[^>]+>/g, '')                     // any HTML
    .replace(/\s+/g, ' ').trim();
  if (c.length <= 160) return c;
  const cut = c.slice(0, 157);
  const sp = cut.lastIndexOf(' ');
  return cut.slice(0, sp > 100 ? sp : 157) + '…';
}
```

**OG image:** ship a 1200×630 PNG (Twitter / OpenGraph standard).
Generated from SVG via Sharp at build time so identity changes live in
one file. See `scripts/build-og-image.mjs`.

**Per-page descriptions.** Every page template should pass `description`
to BaseLayout — usually `item.summary ?? item.abstract`. The helper
truncates safely. Pages without descriptions get the site-wide default.

---

## 9. Analytics — Plausible (self-hosted) snippet

**Use this exact snippet across every ICJIA site.** Only the
`data-domain` value changes per site.

```astro
<!-- BaseLayout.astro head -->
<script is:inline defer
        data-domain={plausibleDomain}
        src="https://plausible.icjia.cloud/js/script.file-downloads.outbound-links.js">
</script>
```

```ts
// Top of BaseLayout.astro frontmatter
const plausibleDomain = import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN
  ?? 'icjia.illinois.gov/<your-mount>';   // e.g. 'icjia.illinois.gov/adultredeploy'
```

### Why this script variant

The path `.file-downloads.outbound-links.js` bundles two Plausible
extensions into a single 2.5 KB request:

| Event name (in Plausible) | Triggered by |
|---|---|
| `Outbound Link: Click` | any `<a>` click where the hostname differs from the page hostname |
| `File Download`         | any `<a>` whose href ends in a downloadable extension (`.pdf`, `.zip`, `.docx`, `.xlsx`, `.csv`, `.dmg`, etc.) |

Both fire automatically — no per-link instrumentation required. The
extension URLs each external link as a custom-event prop, so you can
slice "top outbound destinations" or "most-downloaded PDFs" directly
in the Plausible dashboard.

Other Plausible script variants (use **only** if a site genuinely
doesn't need the bundled features — the size delta is trivial):

- `script.js` — base only
- `script.outbound-links.js` — outbound only
- `script.file-downloads.js` — file downloads only
- `script.hash.js` — for SPAs with hash routing (not relevant for Astro)

### Required CSP entries

```toml
# netlify.toml
Content-Security-Policy = """
  script-src  'self' 'unsafe-inline' 'unsafe-eval' https://plausible.icjia.cloud;
  connect-src 'self' https://plausible.icjia.cloud;
  ...
"""
```

Both directives are required: `script-src` to load the JS,
`connect-src` for the `POST /api/event` calls that fire on every
pageview / outbound click / download.

### Mounted sites — `data-domain` format

For path-mounted deployments, set `data-domain` to the **full path
identifier** (host + mount), not just the host:

```
✓ icjia.illinois.gov/adultredeploy
✓ icjia.illinois.gov/researchhub
✗ icjia.illinois.gov   ← rolls events up into the parent site
```

Each mount gets its own Plausible dashboard this way. The
`PUBLIC_PLAUSIBLE_DOMAIN` env var lets you override per environment
(staging vs. prod) without code changes.

### Privacy notes (defensive)

Plausible is **cookieless** — no `Set-Cookie` on the script fetch or
the event POST. Confirmed against this instance. If a Chrome
DevTools "Cookie" warning surfaces, it's from something else on the
page (CMS image origin, a browser extension, etc.), not from
Plausible.

### Verification (do this after every deploy)

1. Visit the deployed page, then check Plausible's "Realtime" view —
   you should appear within seconds.
2. Click any external `<a>` (e.g. the ICJIA Document Archive link
   in the footer) and confirm `Outbound Link: Click` appears under
   the site's **Goals** within ~30 seconds.
3. Click a `.pdf` link and confirm `File Download` fires the same
   way.
4. In DevTools → Network, filter on `plausible` and watch for the
   `pageview` POST plus any event POSTs as you interact.

### Other tags worth knowing

- `is:inline` keeps Astro from rewriting the tag during build.
- `defer` (not `async`) — analytics is never critical-path; defer
  lets the parser keep going, then runs the script before
  `DOMContentLoaded`.
- Don't preconnect to Plausible. The script is loaded `defer`, so a
  preconnect just costs you a request slot you could give to the LCP
  image instead.

---

## 10. Sitemap

```sh
npm install @astrojs/sitemap
```

```js
// astro.config.mjs
integrations: [sitemap({
  filter: (page) => !/\/404\/?$/.test(page),
  changefreq: 'weekly',
  priority: 0.7,
  lastmod: new Date(),
  serialize(item) {
    if (item.url === 'https://example.com/') item.priority = 1.0;
    return item;
  },
})],
```

Then reference it in `public/robots.txt`:

```
User-agent: *
Disallow:

Sitemap: https://example.com/sitemap-index.xml
```

For mounted sites: the sitemap lands at
`https://example.com/<base>/sitemap-index.xml`, not at the origin root.

---

## 11. Security headers (Netlify)

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options       = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy       = "strict-origin-when-cross-origin"
    Permissions-Policy    = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = """
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.example.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https: https://cms.example.com;
      font-src 'self' data:;
      connect-src 'self' https://cms.example.com https://analytics.example.com;
      frame-ancestors 'self'
    """
```

**Gotchas seen on this rebuild:**

- Alpine.js needs `'unsafe-eval'` in `script-src`. Non-negotiable.
- Self-hosted fonts: drop `fonts.googleapis.com` from `style-src` and
  `fonts.gstatic.com` from `font-src`. Smaller CSP, no cross-origin
  whitelisting.
- After every CSP change, smoke-test the deployed page — browsers will
  silently block matched directives and you'll wonder why a dropdown
  doesn't open.

---

## 12. Accessibility — the patterns that earn 100/100

- **Skip-link**: see §12a below for the full pattern and the
  `clip-path` gotcha that bit this site.
- **Tab a real browser** before declaring an a11y feature working. Most
  rules check structural shape, not visual outcome.
- **Markdown image post-process** also dedupes alt-text gaps: any
  rendered `<img>` without `loading`/`decoding` gets both injected. Pair
  with an alt-text linter on the CMS side.
- **Interactive table rows**: keep the real `<a>` on the title cell for
  keyboard + SR, then add a row-level click handler that suppresses
  itself when the click target is already a link/button/input or when
  text is selected.

## 12a. Skip-links — the pattern, the gotcha, the verification

### The pattern

```astro
<!-- BaseLayout.astro, first child of <body> -->
<a href="#content-top"
   class="sr-only focus:not-sr-only focus:absolute
          focus:top-2 focus:left-2 focus:z-50
          focus:bg-brand-primary focus:text-white
          focus:px-4 focus:py-2 focus:rounded">
  Skip to main content
</a>

<main id="content-top" tabindex="-1" class="flex-1 outline-none">
  <slot />
</main>
```

- `sr-only` hides it visually but keeps it in the tab order.
- `focus:not-sr-only` reveals it on keyboard focus.
- The `focus:absolute focus:top-2 focus:left-2` positioning surfaces it
  in the top-left when focused.
- `focus:z-50` keeps it above the sticky header.
- The target `<main id="content-top" tabindex="-1">` accepts focus and
  is where the skip jumps to. `tabindex="-1"` lets the URL hash focus
  it without putting it in the tab order itself; `outline-none` hides
  the focus ring on the `<main>` itself (the focus is on the *content*,
  not the wrapper).

### The gotcha — don't reinvent `sr-only`

We had a custom `.visually-hidden` class using modern `clip-path`:

```css
/* DON'T DO THIS */
.visually-hidden {
  position: absolute !important;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);    /* <-- the problem */
  white-space: nowrap;
  border: 0;
}
```

Tailwind's `focus:not-sr-only` only resets the *legacy* `clip` property
(deprecated, used by Tailwind's built-in `.sr-only`). It does **not**
reset `clip-path`. So:

- Page loads → `.visually-hidden` clips skip-link to 0×0.
- Tab pressed → `focus:not-sr-only` adds `width: auto; height: auto;
  clip: auto;` and the brand-color focus styles…
- …but `clip-path: inset(50%)` from `.visually-hidden` is still
  active, **so the skip-link stays clipped to 0×0 and never appears**.

**Both Lighthouse and axe-core scored this 100 / 0-violations.** They
verify the element exists with a valid `href` target; they do **not**
verify it's visible when focused.

### The fix

Use Tailwind's `sr-only` instead of a custom class. Its definition
matches `focus:not-sr-only` (both use legacy `clip`), so the reveal
works.

### Visual verification (mandatory)

Open the deployed page and press Tab. The skip-link should appear in
the top-left corner. Screenshot it. Add the check to your release
checklist — it's the single a11y feature audits don't catch.

```sh
# quick smoke test from the CLI using chrome-devtools MCP
# or just: open the URL, hit Tab, eyeball.
```

If the focused element you see is the first nav link instead, the
skip-link is broken even if your audits are clean.

---

## 13. Broken-link / Thumbor sweep

Stand up a quick scanner that walks the built `dist/` for hrefs, treats
absolute URLs back at your own host as internal (checked against the
filesystem), and HEAD-checks every external URL with a real browser UA
and a GET fallback. See `scripts/check-links.mjs` for a ~150-line
implementation.

If your project has a Thumbor / image-proxy URL listed in CSP `connect-src`
from a previous incarnation, audit whether it's actually used. We had
`image.icjia.cloud` reserved in our CSP for "future responsive variants"
that never materialized — dropped it once build-time WebPs landed.

---

## 14. Audit & ship loop

After each meaningful change:

```sh
npm run build            # full pipeline
npm run check:links      # internal + external link sweep
npm run audit:axe        # WCAG axe-core
npm run audit:lh         # Lighthouse perf / a11y / SEO / BP
```

Wire these into `package.json` so they're discoverable.

Deploy to a real URL before trusting numbers. Local Lighthouse and
prod-deployed Lighthouse can differ by 10+ Perf points because of caching
and network behavior.

---

## 15. Mobile-specific optimization

Most lighthouse scoring lives on mobile (throttled CPU, 4G network), so
this is where the wins come from. Patterns that moved the needle here:

### Mobile-first asset selection

- **Set `widths` on `<Image>` from smallest to largest** —
  `[640, 960, 1280, 1920]`. The smallest is what mobile picks via
  `sizes="100vw"`. Don't include only 1920w "to be safe": mobile pays
  for that decision in LCP.
- **Test the actual variant chosen.** Open the deployed page in Chrome
  with device emulation, watch the Network tab, confirm the 640w (or
  whichever) variant is what loaded. If it's the 1920w, your `sizes`
  attribute is wrong.
- **`sizes="100vw"`** is correct for full-width hero / banner images.
  For content images that share the viewport with other layout, use
  `sizes="(min-width: 768px) 33vw, 100vw"` or similar — match your
  actual grid.

### Hero / LCP image

- **The single biggest mobile perf lever** is the LCP image. Optimize
  it before anything else. On this site: 233 KB JPG → 15 KB WebP at
  640w cut mobile LCP from 4.7s → 3.4s, Perf 77 → 85.
- Keep `loading="eager"` and `fetchpriority="high"` on the LCP image
  only. Everywhere else: `loading="lazy"`.
- Don't preload responsive images with a static `<link rel="preload">`
  — it pins one URL and bypasses `srcset` selection. Trust the
  `srcset` + `fetchpriority="high"` combo instead.

### Mobile viewport reality

- Real iPhones render at 320–428 CSS px wide. Test with the smallest
  width you support; Lighthouse defaults to ~375.
- **Above-the-fold = anything in the first ~600 CSS px.** That's roughly
  one hero or two stacked card heights on mobile. Everything else can
  be `loading="lazy"`.
- Hamburger / drawer nav: use `role="dialog"`, `aria-modal="true"`,
  trap focus, lock scroll. Don't use a hover-driven dropdown — mobile
  has no hover.

### Touch targets and interactions

- **Minimum tap target: 44×44 CSS px** (WCAG 2.5.5). Tailwind `p-2`
  (16px padding around a 16px icon = 32px total) is too small. Use
  `p-3` or larger, or wrap in a `min-h-[44px] min-w-[44px]` button.
- Use `whitespace-nowrap` on date columns / labels that have a fixed
  expected width. Otherwise the browser sometimes wraps "November 17,
  2025" onto two lines on narrow screens (see §17 — listing tables).
- Honor `prefers-reduced-motion` on any `x-transition` or CSS animation
  longer than ~150 ms.

### Mobile-specific image artifacts

- **Researchhub / many CMSes return inline base64 images.** They look
  innocuous in the JSON but balloon HTML to MBs on mobile. Always
  process them through your build-time pipeline (see §5 tier 3).
- **Bio / headshot uploads are often too small for 2× / 3× density
  displays.** Lighthouse flags this as `image-size-responsive` (BP 96
  instead of 100). The fix is on the CMS upload side — request at
  minimum 2× the display size.

---

## 16. Performance strategies — what to chase, in order

When Lighthouse mobile Perf is < 90, the lever you pull depends on the
*specific* metric failing. Don't optimize blindly.

### Lighthouse "insights" decoded

| Insight | What it means | Fix |
|---|---|---|
| `image-delivery-insight` | Largest images are too big or wrong format | WebP, `srcset`, build-time Sharp |
| `unsized-images` | `<img>` missing `width`/`height` | Set intrinsic dimensions (CLS killer) |
| `render-blocking-insight` | CSS / font CSS blocks first paint | Self-host fonts; inline critical CSS |
| `network-dependency-tree-insight` | Cross-origin requests block each other | Drop / preconnect external origins |
| `lcp-discovery-insight` | LCP element discovered too late | Make sure LCP is in initial HTML; `fetchpriority="high"` |
| `cls-culprits-insight` | Layout shifts | Intrinsic image dims; reserve space for late-loading content |
| `cache-insight` | Static asses have short cache headers | Netlify long-cache `_astro/` (already default) |

### LCP

- LCP is **usually the hero image** on content sites. Optimize that
  first (§15).
- If LCP is text (no hero image), the bottleneck is fonts. Self-host
  with `@fontsource` (§6).
- `fetchpriority="high"` only on the LCP element.
- Avoid `<picture>` for the LCP image if you can use `<img srcset>` —
  one less DOM node and the browser preloader handles `<img srcset>`
  more aggressively.

### FCP

- FCP is "when the browser draws the first pixel of content."
  Dominated by render-blocking CSS and fonts.
- Self-host fonts. The `media="print" onload="this.media='all'"`
  trick saves *some* time but a same-origin request still beats a
  cross-origin one.
- Inline critical CSS only as a last resort — Tailwind 4's CSS output
  is small enough (~20 KB gzipped) that this isn't worth the
  complexity for most sites.

### CLS

- Every `<img>` needs intrinsic `width`/`height`. Every. Single. One.
- For images whose dimensions you don't know at SSR (CMS images),
  fetch them at build time and stash in a manifest (§5).
- Reserve space for Alpine-controlled toggled regions (`min-height` on
  the table container; the listing-table component on this site does
  this).
- Ad-style "below the fold loads in and pushes content" patterns —
  don't.

### TTI / TBT

- Astro static + Alpine = ~30 KB of JS. There's almost nothing to
  optimize. Don't reach for React/Vue islands unless you have a real
  use case — they triple the JS budget.
- Minify and tree-shake everything (default with Astro build).

### Cache strategy

- Astro fingerprints assets under `/_astro/<name>.<hash>.<ext>`.
  Netlify defaults `Cache-Control: public, max-age=0, must-revalidate`
  for HTML and `immutable, max-age=31536000` for fingerprinted assets.
- The "leftover" Lighthouse cache savings (~100 KiB) on this site is
  the CMS-hosted images served direct from Strapi. If you really want
  the score, proxy CMS images through Netlify with long-cache headers
  — but the build-time WebP pipeline (§5) usually wins more by
  shrinking the bytes than by caching the larger originals.

### Network

- Every cross-origin request adds DNS + TLS handshake (~100–300 ms on
  mobile networks). **Audit your `<link>` and `<script>` srcs.** Goal:
  zero cross-origin requests in the critical path.
- After self-hosting fonts and processing CMS images at build time,
  this site has **one** remaining cross-origin request: the Plausible
  analytics script (defer'd, so it's not critical-path).

### Measuring on real mobile, not just Lighthouse

- Lighthouse uses Moto G Power emulation. Real-world numbers vary.
- Plausible-style web-vitals tracking gives you the actual P75 LCP /
  FCP / CLS from real visitors. Worth adding if you have the option.
- Chrome DevTools → Performance → Lighthouse → "Slow 4G" + 4× CPU
  throttling matches the audit conditions if you want to debug
  locally.

### Mobile-perf decision tree (in order)

1. Is the LCP image > 50 KB? → §5 Image optimization.
2. Are fonts loading from a CDN? → §6 Self-host fonts.
3. Are images missing `width`/`height`? → §5 + intrinsic dims.
4. Are images eager-loading off-screen? → `loading="lazy"`.
5. Is there `<picture>` / multiple `<img>` competing for LCP? →
   Simplify, mark only one LCP-eligible.
6. Anything left? → It's probably the third-party script you forgot
   about. Defer it or drop it.

---

## 17. Cutover checklist (Vue/Nuxt → Astro)

When you're ready to flip the merge / domain:

1. Tag the last legacy commit (`git tag v1-final`).
2. Verify CSP allows everything actually used in the new build
   (open the deployed page, watch console for blocks).
3. `npm run check:links` — fix the broken internal links first; add
   netlify redirects for legacy URLs you can't fix at the source.
4. Run Lighthouse against the deployed build, **mobile and desktop**.
5. Verify analytics is registering (real network request to your
   Plausible / GA endpoint).
6. Verify skip-link visually (Tab on the homepage).
7. Smoke-test forms, dropdowns, drawers, search.
8. Merge. Don't delete the legacy branch immediately — keep it around
   for a week in case of rollback.

That last point is from experience.
