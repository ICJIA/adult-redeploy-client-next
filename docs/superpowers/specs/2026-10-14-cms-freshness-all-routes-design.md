# Design: Every CMS-backed route reflects current Strapi content

- **Date:** 2026-10-14
- **Status:** Implemented in an autonomous session on `master` (uncommitted); owner
  reviews the diff, this spec, and the two owner steps below before pushing.
- **Owner:** cschweda
- **Trigger:** `/about/staff` and `/about/oversight` did not show a new Oversight
  Board member after the CMS changed.

## Summary

The ARI site is a static Astro build plus client-side "live islands"
(`src/lib/live/`). Routes with an island refresh from Strapi on load and on tab
focus; routes without one are frozen at the last build. `/about/staff`,
`/about/oversight`, `/about/biographies/<slug>`, `/<section>/<page>`,
`/resources/*`, and `/tags/<slug>` had **no island**, and nothing outside a git
push ever triggered a rebuild. This design (1) gives every ARI-CMS route a live
island following the existing surface patterns, (2) extends the 404 live-render
host to the two record types whose lists now link to not-yet-built detail pages
(biographies, resources), and (3) adds a nightly rebuild backstop and documents
the Strapi → Netlify build-hook webhook so new records also get real static pages,
a fresh Pagefind index and sitemap, and optimized images within minutes.

## Root cause (evidence)

| Time (CDT, 2026-10-14) | Event |
|---|---|
| 13:11 | Board member `magdalena-campos` created in Strapi (`createdAt` 18:11:45Z). |
| 13:43 | Manual deploy from the Netlify UI (deploy of commit `8b8d418`, empty title). |
| 13:44 | Build hook `manual_build` created on the Netlify site. |
| 13:48 | README push → production build `c3fe0ea`; `/about/oversight` now lists 16/16. |

- `src/pages/about/staff.astro` and `oversight.astro` read `getCollection('biographies')`
  and `getEntry('pages', …)` from the build snapshot only — no `liveEntry`/`liveCollection`.
- `scripts/strapi-query.mjs` did not even fetch `updatedAt` for biographies, so no
  change signal existed to baseline an island on.
- No publish → rebuild mechanism: the design docs from June/July list a Strapi
  webhook + Netlify build hook as an "owner step", never configured. Deploy history
  shows only git-push and Dependabot builds.

Deployed HTML now matches the CMS for both routes; the symptom was the window
between a CMS edit and the next unrelated push.

## Locked-in decisions

| Decision | Choice |
|---|---|
| Change signal | `updatedAt` (bumps on every save; `isPublished` flips add/remove rows). Biographies now fetch `createdAt updatedAt` at build so the baseline signature matches live. |
| Lists (staff, board) | `liveEntry` surfaces whose "view" is the selected row array; signature = `stableSignature(rows, ['slug','updatedAt'])`; `applyTo` lazy-imports the manifest-aware image lookup + markdown renderer and re-renders `[data-live="list"]`. The same render functions drive the static `set:html`, so static and live markup cannot diverge. |
| Headshots on a live change | Manifest lookup first (same WebP variants as the build); unmanifested (new) images fall back to the raw Strapi URL, which CSP `img-src` already allows. |
| Page bodies (`/<section>/<page>`, staff/oversight intro) | One generic `pageDetail` entry surface (`PAGE_BY_SLUG`, `where` passed as JSON incl. `section.slug`); `applyPageDetail` fills `title` / `summary` / `body` hooks that exist. |
| Detail pages (bio, resource) | `bioDetail` / `resourceDetail` entry surfaces with shared shells (`BioDetailShell.astro`, `ResourceDetailShell.astro`) used by the static page and the 404 host. |
| Index tables (`/resources`, `/resources/<cat>`) | `xfor` collections via the existing `ListingTable` `live` prop (`resourcesIndex`, `resourcesCategory`). |
| Tag pages | `innerHTML` collection `tagPage` with `params: { tag }`; `liveCollection` now forwards `params` to `select` (the type already allowed it). |
| New slugs | 404 host gains `/about/biographies/<slug>` and `/resources/<cat>/<slug>` bootstrap rules. Section sub-pages are only reachable through the (static) nav, so no fallback rule. |
| Rebuild backstop | Reuse the existing `manual_build` hook. Nightly scheduled function `netlify/functions/nightly-rebuild.mjs` POSTs `NETLIFY_BUILD_HOOK_URL` (Netlify env var, Functions scope, secret, production) at `0 5 * * *` UTC — the flagship icjia.illinois.gov schedule, env-var name, and `NIGHTLY_REBUILD_DISABLED` kill switch, on Netlify's current function API. Strapi webhook is an owner step (below). |
| Not live (rebuild path only) | `/apps` + homepage "ICJIA Publications" (researchhub backend, inline-base64 images processed at build), Pagefind index, sitemap, nav menu items, `/programs` clickable-county set. |

## Surfaces added

| Route | Surface | Kind | Query | Refreshes |
|---|---|---|---|---|
| `/about/staff` | `staffList` + `pageDetail` | entry | `BIOS_LIST_FULL`, `PAGE_BY_SLUG` | member list (names, titles, bios, headshots), intro |
| `/about/oversight` | `boardList` + `pageDetail` | entry | `BIOS_LIST`, `PAGE_BY_SLUG` | member grid, intro |
| `/about/biographies/<slug>` | `bioDetail` (+404 host) | entry | `BIO_BY_SLUG` | name, badge, headshot, title, membership, body |
| `/<section>/<page>` | `pageDetail` | entry | `PAGE_BY_SLUG` | title, summary, body |
| `/resources` | `resourcesIndex` | xfor | `RESOURCES_BRIEF` | rows |
| `/resources/<cat>` | `resourcesCategory` | xfor | `RESOURCES_BRIEF` | rows |
| `/resources/<cat>/<slug>` | `resourceDetail` (+404 host) | entry | `RESOURCE_BY_SLUG` | title, badge, date, summary, body, downloads, links, tags |
| `/tags/<slug>` | `tagPage` | innerHTML | `TAGGED_ITEMS` | grouped lists |

## Owner steps (cannot be done from this repo)

1. **Strapi webhook** (ari.icjia-api.cloud admin → Settings → Webhooks → Add):
   URL `https://api.netlify.com/build_hooks/6acfcd721007daaefa0f1d5c` (the
   `manual_build` hook), events: Entry create / update / delete / publish /
   unpublish (+ Media create/update/delete). Every save triggers a ~1.5 min build;
   Netlify queues them. The same hook can be added to the researchhub Strapi so
   `/apps` and the homepage publications refresh on publish too.
2. **Review and push** this change set; the nightly function and its env var only
   take effect on the next production deploy.

## Testing

- vitest: select/sort parity, HTML escaping, image fallback, class-constant parity,
  config wiring (variables / select / signature), fallback detection.
- `npm run build` green; `astro check` unchanged (3 pre-existing `formats` errors).
- Browser (preview build): islands fetch 200 and **do not swap** on an unchanged
  view; forcing a stale signature re-renders markup equal to the static markup;
  404 host renders a real bio / resource slug and shows the genuine 404 for a bad slug;
  axe clean on changed pages.

## Assumptions made without the owner

- Live islands remain the preferred mechanism over SSR (per README / checklist).
- A nightly rebuild (~1 build/day on the Pro quota) is acceptable; it is a backstop
  the webhook makes mostly redundant and can be deleted by removing the function.
- Reusing the owner-created `manual_build` hook is intended; a separate hook can be
  substituted by changing the `NETLIFY_BUILD_HOOK_URL` env var.
- Legacy `<span class="heavy">` wrappers in CMS titles are stripped on the bio
  detail page too (the list pages already did this).
