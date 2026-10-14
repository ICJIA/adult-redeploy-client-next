# CMS freshness for every route — Implementation Plan

> **For agentic workers:** This plan was executed inline (native) in the session that
> wrote it, test-first per task. It is kept as the record of task boundaries and
> verification; steps use checkbox syntax.

**Goal:** Every ARI-CMS-backed route live-refreshes from Strapi, new records get a
real page within minutes, and nothing is ever more than a day stale.

**Architecture:** Follow `src/lib/live/` layering — per-surface `render/*.ts` functions
shared by the static `.astro` (`set:html`) and the island; `config.ts` wiring; generic
`behavior/` untouched except forwarding `params` in `liveCollection`. 404 host gains two
bootstrap shells. A Netlify scheduled function posts the existing build hook nightly.

**Tech Stack:** Astro 5, Alpine 3, Strapi 3 GraphQL, vitest, Netlify scheduled functions.

**Spec:** `docs/superpowers/specs/2026-10-14-cms-freshness-all-routes-design.md`

## Global Constraints

- Static output for an unchanged view must not change (no spurious swap/announce):
  every build-time signature uses the same select + keys as the live island.
- All interpolated text in render functions is HTML-escaped; bodies go through the
  xss-sanitizing markdown renderer.
- No CSP change (`connect-src`/`img-src` already allow `https://ari.icjia-api.cloud`).
- No AI co-author trailers in commits (owner rule).

## Review Focus

- A bio with no headshot, or a headshot not in the manifest → raw Strapi `<img>`, never a broken image or crash (bio-list tests).
- All staff unpublished → empty list rendered, not the stale one; a malformed payload (no `biographies` key) → static DOM kept (config `select` returns null).
- Page `where` must constrain `section.slug`; `pageDetail` id without a slash still works (page-detail tests).
- `/resources/<cat>/<slug>` 404 rule needs exactly two segments; `/about/biographies/` with no slug must not bootstrap (detect tests).
- Nightly function without `NETLIFY_BUILD_HOOK_URL` logs and exits without throwing.

---

### Task 1: Biographies carry `updatedAt` at build
- Modify: `scripts/strapi-query.mjs`, `src/content/config.ts`
- Test: `src/lib/live/data/queries.test.ts` (new) asserts the live bio queries fetch `updatedAt`; build fetch verified by `npm run fetch` counts.

### Task 2: `render/bio-list.ts` — select/sort + staff & board renderers
- Create: `src/lib/live/render/bio-list.ts`, `src/lib/live/render/bio-list.test.ts`
- Produces: `BioRow`, `BioRenderDeps`, `BIO_LIST_SIG_KEYS`, `fullName`, `stripTags`, `selectStaff`, `selectBoard`, `renderStaffList`, `renderBoardList`, `applyBioList`, `loadBioDeps`, `STAFF_CLASSES`, `BOARD_CLASSES`.

### Task 3: Queries + `staffList` / `boardList` surfaces; wire `/about/staff` and `/about/oversight`
- Modify: `src/lib/live/data/queries.ts` (`BIOS_LIST`, `BIOS_LIST_FULL`), `src/lib/live/config.ts`, `src/pages/about/staff.astro`, `src/pages/about/oversight.astro`
- Test: `src/lib/live/config.test.ts` (new) — select returns null on shape mismatch, sorted rows otherwise; signature equals `stableSignature`.

### Task 4: `pageDetail` surface — `/<section>/<page>` + staff/oversight intros
- Create: `src/lib/live/render/page-detail.ts` (+ test)
- Modify: `queries.ts` (`PAGE_BY_SLUG`), `config.ts`, `src/pages/[section]/[slug].astro`, staff/oversight pages.
- Produces: `parsePageId`, `pageDetailWhere`, `applyPageDetail`, `PAGE_DETAIL_SIG`.

### Task 5: `bioDetail` surface + `BioDetailShell` + 404 host rule
- Create: `src/lib/live/render/bio-detail.ts` (+ test), `src/components/BioDetailShell.astro`
- Modify: `queries.ts` (`BIO_BY_SLUG`), `config.ts`, `src/pages/about/biographies/[slug].astro`, `src/lib/live/fallback/detect.ts` (+ test), `src/pages/404.astro`.

### Task 6: Resources index tables live
- Modify: `src/lib/live/render/listing-rows.ts` (+ test), `queries.ts` (`RESOURCES_BRIEF`), `config.ts`, `src/pages/resources/index.astro`, `src/pages/resources/[category]/index.astro`.

### Task 7: `resourceDetail` surface + `ResourceDetailShell` + 404 host rule
- Create: `src/lib/live/render/resource-detail.ts` (+ test), `src/components/ResourceDetailShell.astro`
- Modify: `queries.ts` (`RESOURCE_BY_SLUG`), `config.ts`, `src/pages/resources/[category]/[slug].astro`, `detect.ts`, `404.astro`.

### Task 8: `tagPage` surface (+ `liveCollection` params)
- Create: `src/lib/live/render/tag-page.ts` (+ test)
- Modify: `behavior/liveCollection.ts`, `queries.ts` (`TAGGED_ITEMS`), `config.ts`, `src/pages/tags/[slug].astro`.

### Task 9: Nightly rebuild backstop
- Create: `netlify/functions/nightly-rebuild.mjs` (+ `scripts`-style test via vitest `netlify/**/*.test.mjs`)
- Modify: `netlify.toml` (`[functions]`), `vitest.config.ts` include, `.gitignore` (`.netlify/`)
- Netlify: env var `NETLIFY_BUILD_HOOK_URL` (Functions scope, secret, production) = existing `manual_build` hook; schedule `0 5 * * *` like the flagship.

### Task 10: Docs
- Modify: `CHANGELOG.md`, `README.md`, `src/lib/live/README.md`.

### Task 11: Verification
- `npm test`, `npx astro check`, `npm run build`, `npx astro preview` + browser checks
  (no-swap on unchanged, forced-swap parity, 404 host hit/miss), axe on changed pages.
