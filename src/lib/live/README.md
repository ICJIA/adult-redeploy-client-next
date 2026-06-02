# `src/lib/live/` — static-first live CMS refresh

Small Alpine islands that hydrate the last-built HTML, then (deferred to idle,
and again on tab focus) fetch live data from the Strapi GraphQL endpoint and
swap a region in **only when it actually changed**. Static output is unchanged —
SEO, Pagefind, no-JS, and first paint are exactly as before; the live layer is
additive. Built so the generic parts can later be lifted into a shared package
reused across the other Astro/Tailwind/Alpine sites.

## Layers (extraction seam)

| Layer | Files | Per-site? |
|-------|-------|-----------|
| **data** | `data/endpoint.ts` (POST + no-store + de-dupe), `data/queries.ts`, `data/meeting-cats.mjs`, `render/listing-rows.ts` | queries/cats are content-model-specific; `endpoint.ts` is generic |
| **behavior** | `behavior/{liveCollection,liveEntry,liveList,signature,announce,progress,transition,focus-refetch}.ts` | **generic — extracts verbatim** |
| **render** | `render/*.ts` | **per-site** (mirrors each site's markup) |
| **config** | `config.ts` | **per-site** (the seam: endpoint + surface map) |
| **wiring** | `register.ts`, `components/alpine/{LiveRegion,LiveProgress}.astro` | generic wiring + one call in BaseLayout |

To extract: move `behavior/` + `data/endpoint.ts` + the Alpine wiring into a
package; each site keeps its own `config.ts` + `render/` + queries, and adds the
API origin to its CSP `connect-src`.

## Two surface kinds

- **Collection** (`liveCollection`, `mode: 'innerHTML'`) — home cards: a render
  fn produces the region HTML; `.astro` emits it via `set:html` and the island
  reuses the same fn, so static + live can't diverge.
- **Collection** (`mode: 'xfor'`) — index tables: augments the inline
  `listingTable` via `window.__live.listMixin`; a swap reassigns `items`
  (search/sort preserved).
- **Entry** (`liveEntry`) — detail pages + About: targeted `[data-live="…"]`
  swaps; the markdown renderer is imported **inside** `applyTo`, so it downloads
  only when an entry changed.

## UX / a11y invariants

- Progress bar runs on **every** query (incl. no-change), min-visible ~400 ms.
- Changed content **fades in** (opacity only → no CLS).
- One polite `aria-live` announcement, **only on a real change**.
- All motion respects `prefers-reduced-motion`. Any fetch failure keeps the
  static DOM — the page is never blanked.
- Signatures are baselined at build (`stableSignature` / entry `updatedAt`), so a
  no-op refresh writes nothing.

## Gotchas

- Strapi 3 `where` is a JSON scalar: a GraphQL **variable inside** a `where`
  object literal (`{ slug: $slug }`) is silently ignored and returns all rows.
  Pass the whole `where` as a `$where: JSON` variable (see `data/queries.ts`).
- The inline `ListingTable` can't `import`; it reads helpers off `window.__live`,
  set by `register.ts` before `Alpine.start()`.
