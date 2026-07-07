# Design: Live Refresh for Section Index Pages (`/grants`, `/about`, `/approach`)

- **Date:** 2026-07-07
- **Branch:** `section-live-refresh`
- **Status:** Approved, ready for implementation plan
- **Owner:** cschweda

## Summary

On the ARI static build (`output: 'static'`), a **section** page renders its
Markdown `content` from a build-time snapshot (`npm run fetch` →
`src/content/_data.json`). When an editor updates a section's body in Strapi
**after** the last build, the change does not appear until the next rebuild.
This was observed on `/grants`.

This design closes that gap the same way `/news` already does: add a small
Alpine **live island** that hydrates the last-built HTML, then (deferred to
idle, and again on tab focus) fetches the section from the Strapi GraphQL
endpoint and swaps the body in **only when `updatedAt` changed**. It reuses
the existing generic **`page-body`** surface (`render/page-body.ts`) — the same
one already behind the homepage About block and `/programs` — so almost no new
code is introduced. Static output, SEO, Pagefind, no-JS, and first paint are
unchanged; the live layer is purely additive.

Because `/grants`, `/about`, and `/approach` are all served by one shared
template (`src/pages/[section]/index.astro`), the single edit makes **all three**
section index pages live.

## Problem (root cause)

- `astro.config.mjs` → `output: 'static'`, no SSR adapter. Section pages are
  static HTML in `dist/`.
- `src/pages/[section]/index.astro` renders `section.content` (Markdown) from
  `getCollection('sections')`, a build-time snapshot of `_data.json`
  (fetched from `ari.icjia-api.cloud`). The body is frozen at build.
- Editing a section body in the CMS therefore has no effect on the deployed
  page until a rebuild re-snapshots and re-emits it.
- The live-refresh layer under `src/lib/live/` already solves exactly this for
  other surfaces (news/meeting/site detail, homepage About, `/programs` body),
  but no surface is wired for section index pages.

## Locked-in decisions

| Decision | Choice |
|----------|--------|
| Scope | **All** section index pages (`/grants`, `/about`, `/approach`) via the shared template — no per-slug guard. |
| Surface kind | **Entry** (`liveEntry`), like `newsDetail` — a targeted `[data-live="body"]` swap, not a table/collection. |
| Renderer | **Reuse** the generic `applyPageBody` / `PAGE_BODY_SIG` from `render/page-body.ts`. No new render module. |
| Change signal | `updatedAt`. **Not** `publishedAt` — see below. |
| What refreshes | The section **body only**. The sub-page `<ul>` stays static (YAGNI). |
| CSP | No change — `connect-src` already allows `https://ari.icjia-api.cloud`. |

### Why `updatedAt`, not `publishedAt`

`updatedAt` is already the change signal for every entry surface
(`PAGE_BODY_SIG`, `SITE_DETAIL_SIG`, `NEWS_DETAIL_SIG` are all
`String(v?.updatedAt ?? '')`). It bumps on **any** edit and is a superset of
`publishedAt` (which only moves on re/publish). Sections already carry
`updatedAt` (`strapi-query.mjs:41`).

This site does **not** gate visibility on Strapi's native draft/publish
(`publishedAt`); it filters on a **custom `isPublished` boolean**
(`where: { isPublished: true }`). The two real transitions are both already
handled without `publishedAt`:

| Transition | Handled by |
|------------|-----------|
| Edit an already-published section | `updatedAt` bumps → signature differs → body fades in |
| A new section gets published | It starts appearing in the `isPublished:true` results → `liveEntry` miss→hit |
| A section gets unpublished | Drops out of the filter → `liveEntry` onMiss → static DOM kept |

`publishedAt` is therefore redundant here and isn't even pulled into the build.
Skip it.

## Architecture

One new **entry** surface, `sectionDetail`, mirroring the existing `homeAbout`
surface but pointed at the `sections` GraphQL type instead of `pages`.

```
[section]/index.astro  →  x-data="liveEntry({ surface:'sectionDetail',
                                               slug, sig: PAGE_BODY_SIG(section) })"
        │                         │
        │ data-live="body"        │ (shared behavior/ layer:
        ▼                         ▼  idle fetch, focus refetch, progress,
   static Markdown body      SECTION_BY_SLUG → applyPageBody → fadeSwap body
```

Data flow on a live tick (all inherited from `behavior/liveEntry.ts`):

1. Island hydrates over the server-rendered body; signature baselined to the
   build-time `section.updatedAt`.
2. On idle (and on subsequent tab-focus), POST `SECTION_BY_SLUG` to the
   endpoint (`no-store`, de-duped).
3. `select` picks the single section row; `liveEntry` compares
   `PAGE_BODY_SIG(row)` to the baseline.
4. **Unchanged** → nothing swaps, zero markdown JS downloaded.
5. **Changed** → `applyPageBody` lazily imports the isomorphic markdown
   renderer, re-renders `content`, and `fadeSwap`s it into `[data-live="body"]`;
   one polite `aria-live` announcement fires.

## Files changed (~30 lines, 3 files)

1. **`src/lib/live/data/queries.ts`** — add:
   ```graphql
   query SectionBySlug($where: JSON) {
     sections(where: $where) { slug title summary content updatedAt }
   }
   ```
   `where` is passed as a whole JSON variable (Strapi-3 scalar gotcha, per the
   file's existing note).

2. **`src/lib/live/config.ts`** — add to `entries`:
   ```ts
   sectionDetail: {
     query: SECTION_BY_SLUG,
     variables: (slug) => ({ where: { isPublished: true, slug } }),
     select: (data) => (data?.sections ?? [])[0] ?? null,
     applyTo: applyPageBody,       // reused; already imported for homeAbout
     signature: PAGE_BODY_SIG,     // reused
     announceLabel: 'Page',
   },
   ```
   (`applyPageBody` / `PAGE_BODY_SIG` are exported from `render/page-body.ts`;
   `config.ts` currently imports the `applyHomeAbout` / `ABOUT_SIG` aliases —
   import the underlying names or add the new import.)

3. **`src/pages/[section]/index.astro`** — mirror the homepage About island
   (`index.astro:15,33,42`). In the frontmatter, import the signature and build
   the `x-data` string:
   ```ts
   import { PAGE_BODY_SIG } from '../../lib/live/render/page-body';
   const sectionXData = `liveEntry({ surface: 'sectionDetail', slug: ${JSON.stringify(section.slug)}, sig: ${JSON.stringify(PAGE_BODY_SIG(section))} })`;
   ```
   Then wrap the body region and pass `dataLive="body"` **straight to
   `<Markdown>`** (which already forwards it to its `.prose` div —
   `Markdown.astro:8`); no extra wrapper element:
   ```astro
   <div x-data={sectionXData}>
     <Markdown content={section.content ?? ''} class="mt-6" dataLive="body" />
     {!section.content && section.summary && <p class="mt-3 text-lg">{section.summary}</p>}
   </div>
   ```
   The `<h1>` title and the sub-page `<ul>` stay **outside** the island,
   unchanged. Always rendering `<Markdown>` (even with empty `content`) yields a
   stable empty `.prose` `data-live="body"` target — see edge cases.

No changes to `register.ts` (the `liveEntry` Alpine component is already
registered), `BaseLayout`, CSP, or the build query.

## Edge cases

- **Empty-at-build body.** Always render `<Markdown … dataLive="body" />` so an
  empty `.prose` swap target exists even when `content` is blank at build (a body
  *added* after build, not just *edited*, then has a target). The summary
  fallback is a **sibling** `<p>`, not inside the body target — so if a section
  shipped summary-only and gains a body mid-session, the live body appears above
  the now-redundant summary until the next rebuild. A rare, self-correcting
  cosmetic case, not a data error.
- **Static/live markup must agree.** `data-live="body"` sits on the `.prose` div
  whose `innerHTML` the swap replaces, and its server-rendered content must match
  what `applyPageBody`'s `renderMarkdown(content)` produces, so an unchanged
  refresh is a no-op. This is the **exact pairing the `homeAbout` surface already
  ships** (`<Markdown … dataLive="body" />` + `applyPageBody`), so agreement is
  proven in production — both paths resolve to the same `markdown` renderer.
- **Sub-page list stays static.** Grants' three sub-pages are all
  `isPublished: false`, so the index currently shows no list. If a section's nav
  sub-pages are added/edited/published, that still requires a rebuild. Declared
  a known limitation, not a bug.
- **Fetch failure / offline.** Inherited: any failure keeps the static DOM; the
  page is never blanked.

## UX / a11y invariants (inherited, unchanged)

- Progress bar runs on every query (incl. no-change), min-visible ~400 ms.
- Changed body **fades in** (opacity only → no CLS).
- One polite `aria-live` announcement, only on a real change.
- All motion respects `prefers-reduced-motion`.
- Signature baselined at build, so a no-op refresh writes nothing and downloads
  no markdown JS.

## Testing

- **Unit:** none new strictly required — `applyPageBody` and `PAGE_BODY_SIG`
  already have coverage via the home-about/page-body path. Optionally add a
  `select`/signature smoke test for `sectionDetail` if the other entries have
  one.
- **Build:** `npm run build` succeeds offline (island is additive; no new
  build-time data dependency).
- **Manual (against live Strapi):**
  1. Load `/grants`; confirm body renders identically to today (no flash, no
     layout shift).
  2. Edit the grants section body in Strapi; return to the tab → body fades to
     the new content; one screen-reader announcement.
  3. Repeat on `/about` and `/approach` to confirm the shared template covers
     all three.
  4. No-JS: body still present (static). Reduced-motion: swap is instant.

## Out of scope

- Live-rebuilding the section sub-page `<ul>`.
- Any change to `publishedAt` handling or the `isPublished` filter model.
- Section pages that have dedicated routes (`/programs`, `/news`, `/sites`,
  `/resources`, `/apps`) — they have their own already-live surfaces.
