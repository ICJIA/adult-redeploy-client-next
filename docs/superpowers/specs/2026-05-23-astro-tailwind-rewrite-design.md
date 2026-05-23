# Design: ARI Site Rewrite — Astro + Tailwind

- **Date:** 2026-05-23
- **Branch:** `astro-rewrite`
- **Status:** Approved, ready for implementation plan
- **Owner:** cschweda

## Summary

Replace the current Vue 2 + Vuetify 2 build of the Adult Redeploy Illinois
site with a static Astro + Tailwind build. Visual presentation stays
recognizably the same, but the framework is modernized end-to-end. The
current stack is end-of-life (Vue 2 EOL Dec 2023, Vuetify 2 last release
Jan 2024), ships ~700 KiB of unused CSS and ~270 KiB of unused JS, and
delivers Lighthouse mobile performance of ~54. The rewrite targets
Lighthouse mobile ≥ 95, accessibility 100/100 across all representative
pages, and a much smaller maintenance surface.

Work happens entirely on the `astro-rewrite` branch. The branch contains
**only** Astro/Tailwind code — every Vue, Vuetify, and Vue-CLI artifact
is deleted in the first commit. `master` keeps building the current Vue
site until the cutover.

## Locked-in decisions

| Decision | Choice |
|---|---|
| Build strategy | Pure SSG, rebuild on push (no Strapi webhook for v1) |
| Visual fidelity | Visually faithful, not pixel-exact |
| Approach | Greenfield rewrite — no Vue components carried over |
| Framework | Astro 5 + Tailwind CSS 4 + Alpine.js 3 |
| Component library | Hand-rolled Tailwind (no daisyUI / Flowbite) |
| Search | Pagefind (indexes the built HTML) |
| Map port | SVG paths copied verbatim, handlers rewritten in Alpine |
| Base path | `/adultredeploy/` preserved |
| Branch name | `astro-rewrite` |
| Cleanup scope | Remove every Vue/Vuetify/Vue-CLI file; CHANGELOG kept |

## Architecture

### Stack

- **Astro 5** — static output, `base: '/adultredeploy'`.
- **Tailwind CSS 4** via the `@tailwindcss/vite` plugin (Tailwind 4's
  current Astro path; `@astrojs/tailwind` is v3-only). Design tokens
  live in CSS via `@theme`, not a JS config.
- **Alpine.js 3** + `@alpinejs/focus` for client interactivity. Total JS
  on interactive pages ≈ 12 KiB gzipped. Pages without interactive
  components ship zero JS.
- **Pagefind** for site-wide search.
- **Netlify** for hosting (unchanged).

### Repo layout (new — only lives on `astro-rewrite`)

```
/
├── astro.config.mjs            # base path, integrations, Vite plugins
├── netlify.toml                # build cmd + headers (CSP kept)
├── package.json
├── public/                     # static assets, favicon, robots.txt, /img
├── scripts/
│   └── fetch-content.mjs       # single Strapi GraphQL fetch
└── src/
    ├── content/                # Astro content collections
    │   ├── _data.json          # generated, gitignored
    │   └── config.ts           # Zod schemas
    ├── layouts/
    │   └── BaseLayout.astro
    ├── components/
    │   ├── ui/                 # Card, Button, Tag, Breadcrumb, etc.
    │   ├── alpine/             # DrawerNav, DropdownMenu, ListingTable
    │   ├── SiteIllinois.astro
    │   └── Markdown.astro
    ├── pages/                  # file-based routing
    ├── lib/                    # markdown, dates, slug utils
    └── styles/
        └── global.css          # Tailwind import + @theme tokens
```

### Two-stage build

1. `node scripts/fetch-content.mjs` hits Strapi GraphQL once, writes
   `src/content/_data.json`.
2. `astro build` reads that JSON via content collections, generates
   static HTML for every route.
3. `pagefind --site dist/adultredeploy` crawls the built HTML and
   writes the search index.
4. Output to `dist/`, Netlify deploys it.

## Content pipeline

### Single Strapi fetch

`scripts/fetch-content.mjs` runs before Astro. It issues one GraphQL
query (the same shape as the current `buildSearchIndex.js` plus the
`sections` collection) and writes the result to
`src/content/_data.json`. The file is gitignored — regenerated on every
build.

```js
// scripts/fetch-content.mjs (sketch)
import { request } from 'graphql-request';
import fs from 'node:fs/promises';

const ENDPOINT = process.env.STRAPI_ENDPOINT
              ?? 'https://ari.icjia-api.cloud/graphql';
const QUERY = /* pages, posts, meetings, sites, biographies,
                 resources, sections, tags */;

const data = await request(ENDPOINT, QUERY);
await fs.writeFile('src/content/_data.json',
                   JSON.stringify(data, null, 2));
```

### Typed content collections

`src/content/config.ts` defines one collection per content type with a
Zod schema. The schemas mirror the Strapi fields we actually use. A
build fails fast if Strapi changes shape — no silent breakage.

```ts
import { defineCollection, z } from 'astro:content';

const news = defineCollection({
  loader: () => import('./_data.json').then(d => d.default.news),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    publicationDate: z.string(),
    updatedAt: z.string(),
    summary: z.string().optional(),
    content: z.string(),
    tags: z.array(z.object({
      name: z.string(),
      slug: z.string(),
    })).optional(),
  }),
});

export const collections = {
  news, meetings, sites, biographies,
  resources, pages, sections, tags,
};
```

### Markdown rendering

Strapi content fields are markdown. We render once at build time using
`markdown-it` (already trusted in this project) with the same options
the current build uses (`html: true`, `linkify: true`, etc.). XSS
sanitization via `xss` (also already in use), applied at build time so
the runtime ships pre-sanitized HTML.

### Error handling

- Strapi unreachable: `fetch-content.mjs` exits non-zero, build fails,
  no broken site is deployed.
- Malformed collection: Zod throws on that specific collection, build
  fails, others unaffected by silent corruption.
- Atomic deploy: Astro writes to a temp dir; Netlify swaps to the
  final URL only on success.

## Routing

File-based, mirrors the current URL structure exactly.

```
src/pages/
├── index.astro                       → /
├── 404.astro                         → any unmatched path
├── programs.astro                    → /programs
├── apps.astro                        → /apps
├── search.astro                      → /search
├── sites/
│   ├── index.astro                   → /sites
│   └── [slug].astro                  → /sites/<slug>
├── news/
│   ├── index.astro                   → /news
│   └── [slug].astro                  → /news/<slug>
├── about/
│   ├── oversight.astro               → /about/oversight
│   ├── staff.astro                   → /about/staff
│   ├── biographies/[slug].astro      → /about/biographies/<slug>
│   └── meetings/
│       ├── index.astro               → /about/meetings
│       ├── [category]/
│       │   ├── index.astro           → /about/meetings/<category>
│       │   └── [slug].astro          → /about/meetings/<category>/<slug>
├── resources/
│   ├── index.astro                   → /resources
│   ├── [category]/
│   │   ├── index.astro               → /resources/<category>
│   │   └── [slug].astro              → /resources/<category>/<slug>
├── tags/[slug].astro                 → /tags/<slug>
└── [section]/                        # generic catch-all
    ├── index.astro                   → /:section
    └── [slug].astro                  → /:section/:slug
```

Dynamic routes use `getStaticPaths`:

```astro
---
// src/pages/news/[slug].astro
import { getCollection } from 'astro:content';
import BaseLayout from '~/layouts/BaseLayout.astro';
import NewsArticle from '~/components/NewsArticle.astro';

export async function getStaticPaths() {
  const items = await getCollection('news');
  return items.map(item => ({
    params: { slug: item.data.slug },
    props: { item: item.data },
  }));
}
const { item } = Astro.props;
---
<BaseLayout title={item.title} description={item.summary}>
  <NewsArticle item={item} />
</BaseLayout>
```

### Discarded routes

- `/error` — Vue SPA fallback for invalid Strapi slugs. Unneeded in
  SSG; invalid slugs do not exist at build time.
- `/sandbox` — dev-only.

### Metadata

Every page sets `<title>`, `<meta name="description">`, and
`<link rel="canonical">` via `BaseLayout`. Canonical URL:
`https://icjia.illinois.gov${Astro.url.pathname}`.

### Env vars

- `STRAPI_ENDPOINT` (default
  `https://ari.icjia-api.cloud/graphql`) — read by
  `fetch-content.mjs`, never shipped to client.
- `PLAUSIBLE_DOMAIN` (default
  `icjia.illinois.gov/adultredeploy`) — read by the layout's analytics
  script tag.
- `.env` is git-ignored; Netlify provides values via its UI.

## UI components

### Design tokens

Extracted from the current Vuetify site by sampling live styles, encoded
in `src/styles/global.css` using Tailwind 4's `@theme` block (CSS-first
config — no `tailwind.config.mjs`):

```css
@import "tailwindcss";

@theme {
  /* Brand palette — sampled from the Vuetify site */
  --color-brand-primary:    #043e3f;  /* dark teal — links, headings */
  --color-brand-secondary:  #05797a;  /* teal accent — "Scheduled" */
  --color-brand-accent:     #B158C2;  /* purple — overlays */
  --color-brand-ink:        #222;     /* body text */
  --color-brand-muted:      #aaa;     /* dividers, borders */

  --color-surface:          #fff;
  --color-surface-subtle:   #fafafa;  /* page background */
  --color-surface-shaded:   #eee;     /* panel bg, DownloadBox */

  /* Type */
  --font-sans:    "Lato", "Roboto", system-ui, sans-serif;
  --font-heading: "Roboto", "Lato", system-ui, sans-serif;

  /* Vuetify-equivalent elevations */
  --shadow-elev1: 0 1px 3px rgb(0 0 0 / 0.12),
                  0 1px 2px rgb(0 0 0 / 0.24);
  --shadow-elev3: 0 3px 6px rgb(0 0 0 / 0.16),
                  0 3px 6px rgb(0 0 0 / 0.23);
}
```

### Component inventory

| Component | Replaces | Notes |
|---|---|---|
| `AppHeader.astro` | `AppNav.vue` + `v-app-bar` | Fixed 90px header, logo + title + nav menu |
| `DrawerNav.astro` | `AppDrawer.vue` + `v-navigation-drawer` | Alpine, ARIA dialog pattern |
| `AppFooter.astro` | `AppFooter.vue` + `v-footer` | Dark footer, three columns |
| `Breadcrumb.astro` | `Breadcrumb.vue` | `<nav aria-label="Breadcrumb">` + `<ol>` |
| `Card.astro` | `v-card` (outlined / elevated / link variants) | Slot-based. `href` prop renders as `<a>` — no `tabindex="0"` div pattern |
| `Button.astro` | `v-btn` | Solid / outlined / text variants. Real `<button>` or `<a>` based on `href`. `:focus-visible` styles built in |
| `Tag.astro` | `TagList` chips | Small rounded badge |
| `ListingTable.astro` | `v-data-table` family | Alpine — see §Interactivity |
| `Loader.astro` | `Loader.vue` | Inline SVG spinner with `aria-label`. Used only by the search island |
| `Skip.astro` | skip-link `<a>` | Header skip link |
| `Markdown.astro` | `renderToHtml` + `dynamic-content` | Build-time markdown→HTML, sanitized once |
| `SiteIllinois.astro` | `SiteIllinois.vue` | See §Interactivity |
| `Search.astro` | `Search.vue` + fuse.js | Pagefind UI |
| `Pagination.astro` | `v-pagination` | If needed by `/news` archive |

~14 components total. Small enough to review individually.

### Authoring rules baked in

- Every interactive element is `<button>` or `<a>` — never `<div>` with
  tabindex.
- Every `:focus-visible` state has a visible outline.
- Headings are real `<h1>`–`<h4>`, never styled spans.
- Color contrast verified against brand tokens at design time.

## Interactivity (Alpine patterns)

Five patterns cover the whole site. Total Alpine bundle on interactive
pages ≈ 12 KiB gzipped.

### Drawer (mobile nav)

ARIA dialog pattern. Toggle button has `aria-expanded` +
`aria-controls`. Drawer has `role="dialog" aria-modal="true"`. Focus
moves to first item on open, trapped while open via `x-trap`, restored
on close. Esc closes; click outside closes.

### Dropdown menu (header section menus)

ARIA menu button pattern. Real `<a>` list items (browser handles
arrow-key nav semantics for links naturally). Closes on Esc, outside
click, blur.

### ListingTable (news / meetings / resources)

Static HTML table pre-rendered with every row. Alpine adds client-side
search + sort + visibility filtering — **no expand-to-preview** (the
current Vuetify pattern). Row title cells link to the detail page.

```js
function listingTable({ items }) {
  return {
    q: '', sortKey: null, sortDir: 'none', items,
    get filtered() {
      let r = this.items;
      if (this.q) {
        const q = this.q.toLowerCase();
        r = r.filter(x => x.title.toLowerCase().includes(q)
                       || (x.summary || '').toLowerCase().includes(q));
      }
      if (this.sortKey) {
        const dir = this.sortDir === 'asc' ? 1 : -1;
        r = [...r].sort((a, b) =>
          (a[this.sortKey] > b[this.sortKey] ? 1 : -1) * dir);
      }
      return r;
    },
    sortBy(k) {
      if (this.sortKey === k) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = k; this.sortDir = 'asc';
      }
    },
  };
}
```

`aria-sort` updates as columns sort. `<th scope="col">` is correct from
the start — the `td-has-header` class of issue is impossible by
construction.

### SiteIllinois map

SVG paths copy verbatim from the current `SiteIllinois.vue`. Each path
gets `data-county`, `tabindex="0"`, `role="button"`, and `aria-label`.
Click and Enter/Space activate the same handler. The current Vue
version has zero keyboard access for the map — this is a strict
a11y upgrade.

Site descriptions for each county come from the `sites` collection at
build time (no runtime fetch).

### Search input (Pagefind UI)

Pagefind ships a pre-built accessible UI component (combobox pattern,
`aria-live` result list, keyboard nav). We wrap it in a Tailwind shell.
No custom interactivity to write.

### Alpine plugins used

- `@alpinejs/focus` (for `x-trap`, ~3 KiB)

That's it.

## Search

Pagefind runs after `astro build`, crawls `dist/` HTML, writes a static
index to `dist/adultredeploy/pagefind/`.

### Indexed content

Each page marks its primary `<article>` with `data-pagefind-body` and
attaches type/date metadata:

```astro
<article data-pagefind-body
         data-pagefind-meta={`type:news`}
         data-pagefind-meta={`date:${item.publicationDate}`}>
  <h1>{item.title}</h1>
  <Markdown content={item.content} />
</article>
```

### Search page (`/search`)

```astro
<div id="search"></div>
<link rel="stylesheet"
      href="/adultredeploy/pagefind/pagefind-ui.css">
<script src="/adultredeploy/pagefind/pagefind-ui.js"></script>
<script>
  window.addEventListener('DOMContentLoaded', () => {
    new PagefindUI({
      element: '#search',
      showSubResults: true,
      resetStyles: false,
      showImages: false,
      excerptLength: 30,
    });
  });
</script>
```

### Header search box

A small `<form action="/adultredeploy/search">` in the header. Pagefind
UI reads `?q=` from the URL and pre-runs the query. Works without JS;
no popover overlay needed.

### What goes away

The current 300–500 KiB `searchIndex.json` shipped to every visitor of
`/search` is gone. Pagefind loads only the index chunks the query needs
(~10 KiB initial, more on demand).

## Accessibility & QA

Three layers: build-time guards, automated audits, manual checks.

### Build-time guards

- `@astrojs/check` for type checking.
- Lint rules flagging `<div onclick>`, `<div tabindex>`, headings used
  as links.
- Vitest for JS helpers (markdown sanitizer, slug utils, date format).
- Optional `npm run a11y` running Pa11y CI against `npm run dev`.

### Automated audits on every build

```jsonc
// package.json scripts
{
  "audit:axe": "node scripts/audit-axe.mjs",
  "audit:lh":  "node scripts/audit-lighthouse.mjs",
  "audit":     "npm run audit:axe && npm run audit:lh"
}
```

Targets the same representative page set used during the May 2026 a11y
pass (home, programs, sites, sites/:slug, news, news/:slug, apps,
about/staff, about/biographies/:slug, about/meetings,
meetings/<cat>/<slug>, resources, about/contact, search) on mobile and
desktop. Fails the build if any axe violation appears or any Lighthouse
a11y score drops below 100.

### Manual checks before merge

- Run axe DevTools (Deque Chrome extension) on at least one page of
  every template type — `best-practices` + `experimental` rules enabled.
  Target: 0 serious findings. Catches the advanced rules that bundled
  axe-core (axecap) doesn't run, such as `css-focus-visible`,
  `heading-markup`, and `focus-order-semantics`.
- Tab through every page from the top — focus order matches reading
  order, no traps, every focus ring visible.
- Activate every interactive element with keyboard only (Enter, Space,
  Esc).
- VoiceOver pass (Safari, then Chrome) — note any odd announcements.
- 320 px width — no overflow, touch targets ≥ 24×24 CSS px.
- 200 % and 400 % zoom — no horizontal scroll, no content cut off.
- Forced Colors mode — icons and buttons still legible.

### SiteImprove reconciliation

Per project memory: SiteImprove flags AAA/best-practice items that ADA
Title II / IITAA 2.1 do not require. The new build targets WCAG 2.1 AA
strictly. Any SiteImprove-only findings get documented with their
conformance level so a sub-100 SiteImprove score is defensible.

### Visual regression

Out of scope for v1. If desired later: Playwright with screenshot mode
comparing against current-prod screenshots. ~2 hours to set up.

## Deployment & migration

### Branch strategy

```
master (live)           ← unchanged, keeps producing the current Vue build
└── astro-rewrite (new) ← the rewrite, Astro/Tailwind only
```

### Cleanup commit (Phase 0)

`astro-rewrite` begins with a single commit that deletes every Vue
artifact. After the commit, the working tree is Vue-free and a fresh
`npm install` pulls only Astro/Tailwind/Alpine/Pagefind.

**Deleted:**

```
src/                         # all Vue: components, views, mixins,
                             # services, store.js, router.js,
                             # App.vue, main.js, entry.js, api/,
                             # plugins/, sass/, css/, assets/
public/                      # Vue-CLI public dir — rebuilt fresh
dist/                        # Vue-CLI build output
vue.config.js
babel.config.js
postcss.config.js
jest.config.js
buildSearchIndex.js          # replaced by scripts/fetch-content.mjs
buildSitemap.js              # replaced by @astrojs/sitemap
buildFilemap.js
buildConfig.js
generateBuildInfo.js
healthcheck.js
axe-audit.mjs
axe-audit-report.json
.audit/
.browserslistrc
test-*.js
testxss.js
tests/
.eslintrc.js                 # Vue rules — replaced by Astro eslint
package-lock.json            # wiped, regenerated with new deps
```

**Kept (contents may be rewritten):**

```
.git/                        # history preserved
.gitignore                   # re-checked, adds src/content/_data.json
.nvmrc                       # Node 22, still right
.env.sample                  # refreshed with STRAPI_ENDPOINT
.vscode/                     # editor config
README.md                    # rewritten for the new stack
package.json                 # rewritten — Astro/Tailwind/Alpine deps only
netlify.toml                 # rewritten for Astro
CHANGELOG.md                 # kept, rewrite work appends new entries
docs/                        # this spec lives here
```

After this commit: searching the working tree (excluding `.git/`,
`node_modules/`, and `package-lock.json`) for `vue`, `vuetify`, or
`vue-cli` should return zero matches.

### Netlify config

Each branch gets its own Netlify deploy preview automatically:

- `master` → still deploys to production
- `astro-rewrite` → preview at
  `https://astro-rewrite--<site>.netlify.app/adultredeploy/`

We test on the preview throughout, never touching production.

`netlify.toml` on `astro-rewrite`:

```toml
[build]
  Command  = "node scripts/fetch-content.mjs && astro build && npx -y pagefind --site dist/adultredeploy"
  Publish  = "dist"

[build.environment]
  NODE_VERSION = "22"

# All [[headers]] blocks from the current netlify.toml are carried
# over verbatim (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection,
# Referrer-Policy, Permissions-Policy, Content-Security-Policy). The
# only field that may need adjustment is script-src: revisit
# 'unsafe-inline'/'unsafe-eval' after measuring whether Pagefind UI's
# bundle requires them. Astro itself doesn't.
```

### Cutover checklist

When `astro-rewrite` is ready:

1. All representative page types audit clean — axe 0 violations, Lighthouse a11y 100/100.
2. Manual a11y pass complete.
3. Side-by-side review of 5 random Strapi entries per content type — rendering matches.
4. Preview deploy stable for ≥ 3 days.
5. Decide merge strategy:
   a. Merge `astro-rewrite` → `master` (cleanest, history preserved), or
   b. Rename branches: `master` → `vue-legacy`, `astro-rewrite` → `master`.
6. Update Netlify production "branch to deploy" if swapping.
7. Tag the last Vue release as `v1-final`.

### Rollback

If anything blows up: `git revert` the merge commit, or in the
swap-branches case, repoint Netlify production back to `vue-legacy`.
< 5 minutes either way.

## Phasing

Roughly 9 phases. Each ships something testable on the preview URL.

| Phase | Scope | Effort |
|---|---|---|
| 0 | Branch + cleanup | ~1 h |
| 1 | Astro scaffold + design tokens + first preview deploy | ~half day |
| 2 | Content pipeline + Zod collections | ~half day |
| 3 | Layout shell (header, drawer, footer, breadcrumb, skip-link) | ~1 day |
| 4 | Static pages (home, contact, oversight, staff, apps, generic section/page) | ~1 day |
| 5 | Listings + detail pages (news, meetings, resources, biographies, sites) | ~2 days |
| 6 | Illinois map port | ~1 day |
| 7 | Search (Pagefind) + sitemap | ~half day |
| 8 | A11y + Lighthouse hardening (all reps × mobile/desktop) | ~1 day |
| 9 | Cutover | ~2 h |

**Total: ~8–10 working days of focused effort.** Calendar likely
2–3 weeks accounting for review cycles and Strapi-data edge cases.

## Open questions / deferred

- **CSP tightening:** Pagefind UI may use inline event handlers in its
  bundle. We may need to keep `'unsafe-inline'` for `script-src`
  initially and revisit after measuring.
- **Image optimization:** Astro has built-in image optimization via
  `<Image>` and `<Picture>`. Strapi delivers images via
  `image.icjia.cloud`. v1 of the rewrite uses them as-is; if Lighthouse
  flags `image-delivery-insight` we add an Astro Image wrapper.
- **Strapi webhook for auto-rebuild:** out of scope for v1. One-line
  add later if desired.
- **Visual regression CI:** out of scope for v1.
- **Translation / i18n:** not in scope; the current site is English-only.
- **Dark mode:** not in scope; the current site is light-only.

## Success criteria

- Lighthouse mobile performance ≥ 95 on home, news, meetings, resources, sites.
- Lighthouse accessibility 100/100 on every representative page.
- axe-core (axecap) 0 violations at WCAG 2.1 AA.
- axe DevTools (Deque advanced + experimental rules) 0 serious findings.
- Visual review confirms layout and brand parity with the current site.
- Searching the merged branch (excluding `.git/`, `node_modules/`,
  `package-lock.json`) for `vue`, `vuetify`, or `vue-cli` returns
  zero matches.
- Build time ≤ 2 minutes on Netlify.
- Final JS payload on a content page (e.g., `/news`) ≤ 30 KiB gzipped.
