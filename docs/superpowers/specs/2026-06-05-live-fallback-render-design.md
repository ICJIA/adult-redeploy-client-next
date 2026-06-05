# Design: Live Fallback Render for Not-Yet-Built News Detail Pages

- **Date:** 2026-06-05
- **Branch:** `live-fallback-render`
- **Status:** Approved, ready for implementation plan
- **Owner:** cschweda

## Summary

On the ARI static build (`output: 'static'`), a news article published to
Strapi **after** the last build appears on the homepage (the `HomeNews`
live island fetches the latest list client-side and links it) but its
detail page `/news/<slug>` returns a **404 until the next rebuild** —
`news/[slug].astro` enumerates pages with `getStaticPaths()` over a
build-time snapshot, so the slug has no generated HTML.

This design closes that gap **without leaving the static model**: the
existing `404.astro` becomes a content-aware **live render host**. When an
unbuilt `/news/<slug>` is requested, the 404 page detects the slug from the
URL, mounts the existing `liveEntry` island in a new **bootstrap mode**,
and renders the article client-side from Strapi using the *same* isomorphic
`markdown-it` renderer the build and the live-refresh layer already use. If
the slug genuinely isn't in the CMS, the page falls through to the normal
404. The HTTP status stays **404** throughout — invisible to a human
author, correct for a transient page (crawlers won't index it), and
replaced by the canonical `200` page on the next rebuild.

**Motivation:** authors don't want to wait for a rebuild — they publish,
then review the *live* detail page and tweak the content based on what they
see. Because the fallback reuses `liveEntry`, the tweak loop comes for free:
`liveEntry` already re-fetches on tab-focus, so publish → view → edit in
Strapi → return to tab → see the edit.

This is the canonical **Model 2 (static + client-side live islands)**
behavior from the v8.1 checklist, extended to cover the one case islands
didn't: a surface whose **page doesn't exist yet**.

## Problem (root cause)

- `astro.config.mjs` → `output: 'static'`, no SSR adapter. The site is a
  `dist/` of static HTML deployed to Netlify, served under the flagship's
  `/adultredeploy/*` path-stripping proxy.
- `src/pages/news/[slug].astro` → `getStaticPaths()` maps
  `getCollection('news')`, and that collection is a build-time snapshot
  (`npm run fetch` → `src/content/_data.json` from `ari.icjia-api.cloud`).
  The set of `/news/<slug>` files is frozen at build.
- New article → `HomeNews` island live-fetches + links it → the detail file
  doesn't exist → Netlify serves static `404.html`. A rebuild re-snapshots
  and emits the page.
- The detail page's own `liveEntry({ surface: 'newsDetail' })` only
  *refreshes an already-built page*; it cannot host a slug that has no page.

## Locked-in decisions

| Decision | Choice |
|---|---|
| Render model | Static + client-side live islands (Model 2) — unchanged |
| Host for unbuilt slug | **`404.astro` live-render host** (HTTP 404, zero Netlify config) — *not* a 200 rewrite shell |
| Scope (v1) | **News only**; mechanism generic (surface map) so meetings/sites are ~1 entry each later |
| Render parity | **Full** — title, posted date, summary, markdown body, **tags** |
| SEO head on fallback | None (transient, 404). Set `document.title` for the author. Canonical JSON-LD/Pagefind page lands on rebuild |
| Markdown renderer | Reuse `src/lib/markdown/core.ts` (`markdown-it` + `xss`, isomorphic) — already client-side via `applyNewsDetail` |
| By-slug query | Reuse `NEWS_BY_SLUG` (`$where: JSON`) — already returns `tags { name slug }` |
| CSP | No change — Strapi origin already in `connect-src` |
| Backstop A (auto-rebuild) | Designed + documented as **owner steps** (Netlify build hook + Strapi webhook); **no code** this round |

## Architecture

### The 404 page as a live render host

`404.astro` keeps its current UI as the **SSR baseline** (so no-JS clients,
crawlers, and genuine 404s always get a real 404 page) and gains a 3-state,
no-flash machine — the icjia `data-nf-state` shape, upgraded from a
"publishing" *message* to a full *render*:

```
SSR baseline           = existing 404 UI (visible by default)
early is:inline detect → strip base prefix; match /news/<slug>?
   match    → state = "checking": hide 404 UI, show empty NewsDetailShell
              + "Loading…" affordance; stash window.__nf = { surface, slug }
   no match → stay "default": normal 404 UI, no island mounted
liveEntry({ surface:'newsDetail', slug, sig:'', bootstrap:true, onHit, onMiss })
   view found → onHit(): state = "rendered" (hide "Loading…");
                applyNewsDetail paints title/date/summary/body/tags;
                set document.title
   null/error → onMiss(): state = "default" → revert to the normal 404 UI
```

No-flash is load-bearing: the `is:inline` script runs at parse time (before
Alpine's deferred module and before first paint), so an author never sees a
404 flash before the article. For a genuine bad slug under `/news/`, the
brief "checking → 404" transition is acceptable (rare; matches the icjia
prior art).

### Data flow

```
/news/<new-slug>  →  no dist file  →  Netlify serves 404.html (status 404)
  404.astro inline detect  →  window.__nf = { surface:'newsDetail', slug }
  Alpine init  →  liveEntry.init() (idle + on-focus)
    gqlFetch(ctx.endpoint, NEWS_BY_SLUG, { where:{ slug, isPublished:true } })
      view  →  applyNewsDetail(root, view, ctx)
                 renderMarkdown(view.content)   // lazy markdown-it chunk
                 render tags from view.tags
      null/err → onMiss → normal 404 UI
  later: tab-focus → liveEntry refetch → author sees their Strapi edit
```

### Components (four small, single-purpose units)

1. **`src/components/NewsDetailShell.astro`** *(new — extracted)*
   The `ArticleCard` + `data-live` slots currently inline in
   `news/[slug].astro`. Prop `item?: News`:
   - `item` present (real detail page) → render filled markup + `data-live`
     hooks (current behavior, byte-for-byte).
   - `item` absent (404 host) → render empty `data-live` slots + a
     `data-live="tags"` container, ready for `applyNewsDetail` to fill.
   *Purpose:* one source of the detail markup so static and fallback can't
   drift. *Depends on:* `ArticleCard`, `Markdown`, `Tag`. *Consumers:*
   `news/[slug].astro` (passes `item`), `404.astro` (no `item`).

2. **`liveEntry` bootstrap option** — `src/lib/live/behavior/liveEntry.ts`
   *(stays generic in `behavior/`)*
   Add to `opts`: `bootstrap?: boolean`, `onHit?: () => void`, and
   `onMiss?: () => void`. Track a private `_rendered` flag. In `refresh()`:
   - `sig: ''` baseline already makes the first real fetch always apply.
   - on the first successful `applyTo` → `_rendered = true`; fire `onHit()`
     once (the host hides "Loading…" → state `rendered`).
   - if `!view` (null select) **and** `bootstrap` **and** `!_rendered` →
     `onMiss()`.
   - in the `catch`, if `bootstrap && !_rendered` → `onMiss()`.
   After the first successful render, later focus-refetch failures keep the
   rendered DOM (current behavior) — `onMiss` never fires post-render.
   *Purpose:* a generic "render-from-nothing, or report a miss" mode reused
   by meetings/sites later. *Depends on:* `gqlFetch`, the surface config.

3. **404-host wiring** — `src/pages/404.astro`
   - early `is:inline` detect script: base-strip + a small inlined surface
     map → set `document.documentElement.dataset.nfState` + `window.__nf`.
   - a hidden host:
     `<div x-data="liveEntry({ surface: window.__nf?.surface, slug: window.__nf?.slug, sig:'', bootstrap:true, onHit, onMiss })"><NewsDetailShell /></div>`
     (`liveEntry.init` already no-ops when the surface is unregistered, so a
     non-match is safe).
   - CSS keyed on `[data-nf-state]` (`default` / `checking` / `rendered`)
     toggling the 404 UI, the "Loading…" affordance, and the filled shell.
   - `onHit` flips `nfState` to `rendered`; `onMiss` flips it back to
     `default`.
   The `is:inline` script can't `import` (repo Alpine convention, checklist
   lesson #16), so it carries a tiny inlined matcher + the `JSON.stringify`'d
   surface map; the matcher's logic is mirrored by a pure, unit-tested twin
   (below) with a keep-in-sync comment.

4. **Pure detection twin** — `src/lib/live/fallback/detect.ts` *(new)*
   `detectSurface(pathname, base) → { surface, slug } | null`. Pure (no
   browser deps), so it unit-tests cleanly and documents the canonical
   matching rules; the inline script's copy mirrors it. Surface map for v1:
   `[{ prefix: '/news/', surface: 'newsDetail' }]`.

5. **Tags in the renderer** — `src/lib/live/render/news-detail.ts`
   Extend `applyNewsDetail` to fill `data-live="tags"` from `view.tags`
   (base-path-aware `Tag` markup as an HTML string). Bonus: existing built
   detail pages now also refresh tags live, not just title/summary/body.

### Base-path / proxy handling

Detection normalizes both hosting paths before matching:
- Proxied prod: the flagship strips `/adultredeploy`, so the site sees
  `location.pathname === '/news/<slug>'`.
- Raw `*.netlify.app`: the raw-host rewrite serves the file but the URL bar
  stays `'/adultredeploy/news/<slug>'`.

So `detectSurface` strips an optional leading `base` (`/adultredeploy`)
first, then matches `/news/<slug>`. Same logic both places.

## a11y / SEO invariants

- Inherits the live-island invariants automatically (idle + focus refetch,
  fade-in swap → no CLS, one polite `aria-live` announce on a real change,
  `prefers-reduced-motion`-gated motion, never-blank-on-failure).
- A genuine `/news/<bad-slug>` ends on the real 404 UI at **404 status** →
  no SEO regression, no perpetual spinner.
- The fallback emits **no** article JSON-LD/canonical (it's a 404); the
  canonical, structured, Pagefind-indexed `200` page is produced by the
  rebuild. `document.title` is updated for the author's tab only.
- axe AA must be **0** on the rendered fallback state.

## Testing strategy

Per the checklist (verify on build/deploy, never `astro dev` — Vite
stale-cache traps, lessons #7/#21; HTTP-200 ≠ working interactivity,
lesson #10):

- **vitest (unit):**
  - `detect.test.ts` — `/news/x` → hit; `/news/`, `/about`, `/news` → null;
    base-prefixed variants (`/adultredeploy/news/x`) → hit.
  - `liveEntry` bootstrap — mock `gqlFetch`: view → `applyTo` called +
    `_rendered`; null → `onMiss`; throw → `onMiss`; a post-render failure →
    **no** `onMiss`.
  - `news-detail.test.ts` — `applyNewsDetail` fills `data-live="tags"` from
    `view.tags` (mirrors `meeting-detail.test.ts`).
- **Production build** green (`npm run build`).
- **Browser / deploy preview:** the author loop — publish a test article →
  visit `/news/<slug>` (proxied + raw host) → renders; edit in Strapi →
  tab-focus → updates; bad slug → 404 UI. axe AA = 0 on the rendered state.

## Backstop A — auto-rebuild (owner steps, no code)

The fallback is the **pre-rebuild bridge**; the rebuilt static page is the
authoritative artifact (SEO, JSON-LD, Pagefind, no-JS). To shrink the window
to ~1–3 min and remove the *manual* rebuild:

1. Create a **Netlify build hook** (Site config → Build hooks); store the
   URL in env / Netlify, never in code.
2. Add a **Strapi webhook** on news create/update/publish that POSTs that
   URL.

Optional later: a small debounce/guard (shared secret) like the flagship's
purge function. Documented here; configuration is an owner step.

## Traps respected (v8.1 checklist)

- Reuse `NEWS_BY_SLUG`'s `$where: JSON` form — avoids the Strapi-v3
  "variable inside a `where` literal is ignored → returns all rows" bug.
- Base-prefix strip in detection — proxied path vs raw-host URL.
- CSP already allows the Strapi origin → **zero** header change.
- Bootstrap factory stays generic in `behavior/`; news-specifics in
  `render/`; the build-time `.astro` frontmatter imports no browser-only
  live modules (the host needs no build signature — the slug isn't built).
- Single-source detail markup (`NewsDetailShell`) so static + live can't
  drift.

## Acceptance criteria

1. A news article published after the last build renders fully (title,
   date, summary, markdown body, tags) at `/news/<slug>` with no manual
   rebuild — on the proxied prod URL and the raw host. (Status 404 is
   acceptable.)
2. Editing that article in Strapi and returning to the tab refreshes the
   rendered content (author tweak loop).
3. A nonexistent `/news/<bad-slug>` shows the normal 404 UI (no perpetual
   loading) at 404 status.
4. Every existing built `/news/<slug>` is unchanged — real static file
   served; its `liveEntry` refresh still works and now also refreshes tags.
5. axe AA = 0 on the rendered fallback; live a11y invariants intact.
6. vitest green (detection + bootstrap + tags); `npm run build` green.
7. No CSP/header change; the fallback fetch succeeds under both the prod
   (proxy) CSP and the raw-host CSP.
8. *(Backstop, owner)* a Strapi publish webhook → Netlify build hook
   triggers a rebuild; the canonical 200 page replaces the fallback within
   minutes.

## Out of scope / future

- **Other surfaces** (meetings `/about/meetings/<cat>/<slug>`, sites
  `/sites/<slug>`, bios): the surface map + `*_BY_SLUG` queries +
  bootstrap-capable renderers make each a small follow-up; meetings carry a
  category segment in the path, so their detection rule differs slightly.
- **200-rewrite host** (clean status code) — deferred; the 404 host is
  simpler and sufficient for the author loop.
- **Guarded/debounced build-hook function** — the raw webhook → build hook
  is enough for v1.
