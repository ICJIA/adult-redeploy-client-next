# Adult Redeploy Illinois — site
[![Netlify Status](https://api.netlify.com/api/v1/badges/a1e29cf9-84eb-406a-b78d-7fa4c82646d1/deploy-status)](https://app.netlify.com/projects/adultredeploy/deploys)

![Adult Redeploy Illinois — community-based alternatives to incarceration.](./public/img/og-image.png)

Astro 5 + Tailwind 4 + Alpine.js. A **static build with client-side "live islands"**:
every page is prerendered (SEO / Pagefind / no-JS / instant paint all intact), then
small Alpine islands refetch the Strapi CMS in the browser and swap in changed
content — so content authors see published edits within ~1s of a reload, with **no
rebuild**. Production: <https://icjia.illinois.gov/adultredeploy>.

## Local dev

    nvm use            # Node 22
    cp .env.sample .env
    npm install
    npm run dev        # fetches Strapi, then astro dev (port 4321)

## Build

    npm run build      # fetch Strapi → build SVG/OG → astro build → Pagefind index

Output: `dist/`.

## Preview (production output)

    npx astro preview  # serves the built dist/ under /adultredeploy

Use this (not `astro dev`) when measuring performance or smoke-testing the live
islands — `astro dev` ships unminified JS + the Astro toolbar, so its Lighthouse
scores are an artifact.

## Live CMS islands

Static-first, then live-refresh after paint **and** on tab focus; a region swaps only
when its content **signature** changed (a list's tracked fields, or an entry's
`updatedAt`). A thin top progress bar runs on every query (even no-change), changed
content fades in, one polite `aria-live` announce fires on a real change, all motion is
`prefers-reduced-motion`-gated, and swaps are opacity/overlay-only so there's **no CLS**.
On any fetch failure the static DOM is kept (never blanks).

**For authors:** publish in Strapi, then just reload any page.

Live surfaces (every route backed by the ARI Strapi):

- **Home** — About, ARI News, Upcoming Meetings
- **Section pages** — `/about`, `/approach`, `/grants` bodies and every
  `/<section>/<page>` card (title, summary, body)
- **About** — Staff list + intro, Oversight Board grid + intro, biography detail
- **News** — index + article detail
- **Meetings** — index (per committee) + meeting detail
- **Resources** — index, per-category tables, resource detail (body, downloads,
  external links, tags)
- **Sites** — index + site detail
- **Tags** — `/tags/<slug>` grouped lists
- **Programs** — the county-map **side panel** (site title/summary/link). The set of
  *clickable* counties is build-time: it comes from a static legacy config
  (`scripts/usiljs-config.js`), not the CMS, so a newly-funded county appears on the
  next rebuild while existing counties' panel data refreshes live.

A **new** record (a member, article, meeting, or publication published after the
last build) already appears in the live lists; its detail URL has no static file
yet, so `404.astro` live-renders it from Strapi (news, meetings, biographies,
resources) until the next build creates the real page.

Rebuild path only: `/apps` + the homepage "ICJIA Publications" (researchhub
backend), the Pagefind search index, the sitemap, the nav menu, and the map's
clickable counties — see **Keeping content fresh** below.

The module lives in `src/lib/live/` (data / behavior / render / config layers — see its
own `README.md`) and is built to be extracted for reuse on other Astro/Tailwind/Alpine
sites: only `config.ts` + `render/` are site-specific. Detail-page markdown is
re-rendered by the **same isomorphic renderer** as the build, imported lazily and only
when content actually changed (a chunk most views never download).

## Architecture notes

- **Base path** `/adultredeploy` (`astro.config.mjs`). Internal links carry the prefix;
  the built files sit at the dist **root**.
- **Served via the ICJIA proxy.** `icjia.illinois.gov/adultredeploy/*` is a `200!`
  rewrite (in the flagship `icjia-public-client-2021` repo) that **strips**
  `/adultredeploy` before forwarding here. Consequence: this repo's `netlify.toml`
  redirects use an **un-prefixed `from`** (matches the stripped path) and a **prefixed
  `to`** (the browser-facing `Location`).
- **View the raw deploy directly** (no proxy, for fast checks):
  <https://adultredeploy.netlify.app/adultredeploy/> — a top-level rewrite strips the
  prefix on the bare host. Safe for production: proxied requests arrive already stripped
  and never match `/adultredeploy/*`; canonical URLs still point at
  `icjia.illinois.gov`.
- **CMS:** public Strapi 3 GraphQL at `https://ari.icjia-api.cloud/graphql` — used by
  both the build fetch and the browser live fetch, so it must stay in the CSP
  `connect-src` (`netlify.toml`).
- **Sitemap:** `/sitemap.xml` `200`-rewrites to `sitemap-0.xml` (the actual URL list;
  `@astrojs/sitemap` also emits an index that reads as "a single page"). This is the
  path wired to Google Search Console; it regenerates every build.

## Scripts

| command | what it does |
|---|---|
| `npm run dev` | fetch Strapi + CMS images, then `astro dev` |
| `npm run build` | fetch → build SVG + OG image → `astro build` → Pagefind |
| `npm run preview` | serve the built `dist/` |
| `npm run check` | `astro check` (type-check) |
| `npm test` | `vitest` (markdown sanitizer + live render-parity) |
| `npm run audit` | axe + Lighthouse against the build |
| `npm run check:links` | crawl built HTML for broken links |

## Deployment

Netlify deploys `master` to the `adultredeploy` site. A push triggers a build (fetch
Strapi → build → Pagefind). The full conversion playbook and every architecture lesson
behind this site live in [`docs/astro-conversion-checklist-v8.1.md`](./docs/astro-conversion-checklist-v8.1.md).

## Keeping content fresh

Three layers, from fastest to slowest:

1. **Live islands** (above) — existing pages reflect a Strapi edit on the next
   reload, no build.
2. **Publish → rebuild (owner step, Strapi admin).** Netlify build hook
   `manual_build` exists on the site (`Site configuration → Build hooks`). In the
   ARI Strapi admin add a webhook (`Settings → Webhooks`) that POSTs that hook URL
   on Entry create / update / delete / publish / unpublish and Media create /
   update / delete. Every save then triggers a ~1.5 min build, so new records get
   real static pages, and the search index, sitemap, nav, and optimized images
   refresh within minutes. Add the same hook to the researchhub Strapi so `/apps`
   and the homepage publications refresh on publish too.
3. **Nightly rebuild** — `netlify/functions/nightly-rebuild.mjs` is a Netlify
   scheduled function, the same mechanism and schedule as icjia.illinois.gov
   (`0 5 * * *` UTC ≈ midnight US Central). It POSTs the hook URL from the
   `NETLIFY_BUILD_HOOK_URL` env var (Functions scope, secret, production). Nothing
   build-time is ever more than a day stale even if the webhook is missing or
   misses an event. Set `NIGHTLY_REBUILD_DISABLED=1` to pause it; the deploy list
   shows each night's build as triggered by the `manual_build` hook. Scheduled
   functions run only on the published production deploy, so the first run
   happens the night after this change is pushed.
