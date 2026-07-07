# Section Landing-Page Live Refresh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the shared section landing template (`/grants`, `/about`, `/approach`) refresh its Markdown body from Strapi client-side — on idle and on tab focus — so CMS body edits appear without a rebuild.

**Architecture:** Add one `sectionDetail` **entry** surface to the existing live layer that reuses the generic `page-body` island (the same one behind the homepage About block and `/programs`). The section route mounts a `liveEntry` island over the server-rendered body and swaps it in only when the section's `updatedAt` changed. Static output is untouched — the island is additive.

**Tech Stack:** Astro 5 (`output: 'static'`), Alpine.js islands, Strapi 3 GraphQL, Vitest 4, TypeScript.

**Reference spec:** `docs/superpowers/specs/2026-07-07-section-live-refresh-design.md`

## Global Constraints

*Every task's requirements implicitly include this section.*

- **Reuse** `applyPageBody` / `PAGE_BODY_SIG` from `src/lib/live/render/page-body.ts` — do NOT write a new body-render module.
- **Change signal is `updatedAt`.** Do NOT add `publishedAt` to the query, the signature, or the filter.
- **Visibility filter stays the custom boolean:** `where: { isPublished: true, slug }`.
- **Scope = all section index pages** via the shared `src/pages/[section]/index.astro`; NO per-slug guard.
- **Body only** — do NOT live-rebuild the sub-page `<ul>`.
- **No CSP / header change** — `connect-src` already allows `https://ari.icjia-api.cloud` (`netlify.toml`, `public/_headers`).
- **`data-live="body"` sits on `<Markdown>`'s `.prose` div** — pass `dataLive="body"` to the component (matches `homeAbout`; `Markdown.astro:8` forwards it).
- **Offline verification:** use `npx astro build` (already-present `src/content/_data.json`). Do NOT run `npm run build` — its `npm run fetch` step hits the network.
- **Commits:** Conventional Commits style. **NEVER** add a `Co-Authored-By: Claude` line or any AI-authorship trailer to any commit (user global rule).

---

### Task 1: `sectionDetail` live surface — query + config entry

Registers the new entry surface: a runtime GraphQL query for a single section by slug, and a `config.ts` entry that wires it to the reused `page-body` renderer. No user-visible change yet (nothing mounts it until Task 2), but the surface is testable in isolation.

**Files:**
- Modify: `src/lib/live/data/queries.ts` (append `SECTION_BY_SLUG`)
- Modify: `src/lib/live/config.ts` (add import + `entries.sectionDetail`)
- Test: `src/lib/live/section-detail.test.ts` (create)

**Interfaces:**
- Consumes (existing): `applyPageBody`, `PAGE_BODY_SIG` from `./render/page-body`; the `EntrySurface` shape from `./types` (`query`, `variables?: (slug) => object`, `select: (data, ctx) => object|null`, `applyTo`, `signature: (view) => string`, `announceLabel`).
- Produces: `SECTION_BY_SLUG: string` (export from `data/queries.ts`); `liveConfig.entries.sectionDetail` under the surface key `'sectionDetail'`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/live/section-detail.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { liveConfig } from './config';
import { SECTION_BY_SLUG } from './data/queries';
import { applyPageBody, PAGE_BODY_SIG } from './render/page-body';

describe('SECTION_BY_SLUG query', () => {
  it('selects sections by a JSON where-variable and fetches body + updatedAt', () => {
    expect(SECTION_BY_SLUG).toContain('sections(where: $where)');
    for (const field of ['slug', 'title', 'summary', 'content', 'updatedAt']) {
      expect(SECTION_BY_SLUG).toContain(field);
    }
    // updatedAt is the change signal; publishedAt is intentionally NOT fetched.
    expect(SECTION_BY_SLUG).not.toContain('publishedAt');
  });
});

describe('liveConfig.entries.sectionDetail', () => {
  const surface = liveConfig.entries.sectionDetail;

  it('is registered as an entry surface', () => {
    expect(surface).toBeDefined();
  });

  it('builds a published-only where clause from the slug', () => {
    expect(surface.variables!('grants')).toEqual({
      where: { isPublished: true, slug: 'grants' },
    });
  });

  it('selects the first section row, or null when absent', () => {
    const row = { slug: 'grants', content: 'body', updatedAt: '2026-05-20T21:09:21.039Z' };
    expect(surface.select({ sections: [row] }, liveConfig.ctx)).toBe(row);
    expect(surface.select({ sections: [] }, liveConfig.ctx)).toBeNull();
    expect(surface.select({}, liveConfig.ctx)).toBeNull();
  });

  it('reuses the generic page-body renderer + updatedAt signature', () => {
    expect(surface.applyTo).toBe(applyPageBody);
    expect(surface.signature).toBe(PAGE_BODY_SIG);
    expect(surface.signature({ updatedAt: '2026-05-20T21:09:21.039Z' }))
      .toBe('2026-05-20T21:09:21.039Z');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- section-detail`
Expected: FAIL — `SECTION_BY_SLUG` is `undefined` (`.toContain` throws) and `liveConfig.entries.sectionDetail` is `undefined` (`surface.variables!` / `.select` throw).

- [ ] **Step 3: Add the `SECTION_BY_SLUG` query**

Append to `src/lib/live/data/queries.ts` (after `PAGE_HOME`, at end of file):

```ts
// Section landing-page body — the shared [section]/index.astro live surface
// (/grants, /about, /approach). Body-only; `updatedAt` is the change signal.
// `where` is passed as a whole JSON variable (Strapi-3 scalar gotcha, above).
export const SECTION_BY_SLUG = /* GraphQL */ `
  query SectionBySlug($where: JSON) {
    sections(where: $where) {
      slug title summary content updatedAt
    }
  }`;
```

- [ ] **Step 4: Wire the `sectionDetail` entry in `config.ts`**

In `src/lib/live/config.ts`, add `SECTION_BY_SLUG` to the queries import:

```ts
import {
  NEWS_LATEST, MEETINGS_BRIEF, SITES_BRIEF,
  NEWS_BY_SLUG, MEETING_BY_SLUG, SITE_BY_SLUG, PAGE_HOME,
  SECTION_BY_SLUG,
} from './data/queries';
```

Add a direct import of the reused renderer (place next to the other `render/*` imports, e.g. after the `home-about` import):

```ts
import { applyPageBody, PAGE_BODY_SIG } from './render/page-body';
```

Add the entry to the `entries` object, immediately after the `homeAbout` entry (before the closing `}` of `entries`):

```ts
    // Section landing pages — the shared [section]/index.astro body
    // (/grants, /about, /approach). Reuses the generic page-body surface;
    // updatedAt is the change signal (see spec: publishedAt intentionally omitted).
    sectionDetail: {
      query: SECTION_BY_SLUG,
      variables: (slug) => ({ where: { isPublished: true, slug } }),
      select: (data) => (data?.sections ?? [])[0] ?? null,
      applyTo: applyPageBody,
      signature: PAGE_BODY_SIG,
      announceLabel: 'Page',
    },
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test -- section-detail`
Expected: PASS (all specs in `section-detail.test.ts`).

Then run the full suite to confirm no regressions:

Run: `npm run test`
Expected: PASS (all existing suites still green).

- [ ] **Step 6: Commit**

```bash
git add src/lib/live/data/queries.ts src/lib/live/config.ts src/lib/live/section-detail.test.ts
git commit -m "feat(live): add sectionDetail entry surface

Register a sectionDetail live surface (SECTION_BY_SLUG + config entry)
that reuses the generic page-body renderer and keys off updatedAt.
Not yet mounted; the [section] template wires it next."
```

---

### Task 2: Mount the island on the shared section template + document

Wraps the body region of `[section]/index.astro` in the `liveEntry` island and passes `dataLive="body"` to `<Markdown>`. Because the template is shared, `/grants`, `/about`, and `/approach` all become live in this one edit. Also records the feature in the changelog.

**Files:**
- Modify: `src/pages/[section]/index.astro` (frontmatter import + `x-data` const; body region)
- Modify: `CHANGELOG.md` (prepend an Unreleased block)

**Interfaces:**
- Consumes (existing): `PAGE_BODY_SIG` from `src/lib/live/render/page-body.ts`; the `'sectionDetail'` surface registered in Task 1; the `liveEntry` Alpine component (already registered in `src/lib/live/register.ts`); the `Markdown.astro` `dataLive` prop (`Markdown.astro:4,8`).
- Produces: nothing downstream (terminal wiring).

- [ ] **Step 1: Add the frontmatter import**

In `src/pages/[section]/index.astro`, after the `Markdown` import:

```astro
import Markdown from '../../components/Markdown.astro';
import { PAGE_BODY_SIG } from '../../lib/live/render/page-body';
```

- [ ] **Step 2: Build the `x-data` string in the frontmatter**

Insert the `sectionXData` const between the `base` const and the `pages` const. Replace:

```astro
const base = import.meta.env.BASE_URL || '/adultredeploy';
const pages = (section.pages ?? [])
```

with:

```astro
const base = import.meta.env.BASE_URL || '/adultredeploy';
const sectionXData = `liveEntry({ surface: 'sectionDetail', slug: ${JSON.stringify(section.slug)}, sig: ${JSON.stringify(PAGE_BODY_SIG(section))} })`;
const pages = (section.pages ?? [])
```

- [ ] **Step 3: Wrap the body region in the island**

In the template, replace the body block:

```astro
    {section.content
      ? <Markdown content={section.content} class="mt-6" />
      : section.summary && <p class="mt-3 text-lg">{section.summary}</p>}
```

with:

```astro
    <div x-data={sectionXData}>
      <Markdown content={section.content ?? ''} class="mt-6" dataLive="body" />
      {!section.content && section.summary && <p class="mt-3 text-lg">{section.summary}</p>}
    </div>
```

Leave the `<h1>` title and the `{pages.length > 0 && (…<ul>…)}` sub-page list exactly as they are — both stay outside the island.

- [ ] **Step 4: Build the site offline**

Run: `npx astro build`
Expected: build completes with no errors; section pages emitted (look for `/grants`, `/about`, `/approach` in the build output).

- [ ] **Step 5: Verify the island is present in the built HTML for all three section pages**

Run:

```bash
for s in grants about approach; do
  f=$(find dist -path "*/$s/index.html" | head -1)
  echo "== $s -> $f =="
  grep -o "surface: 'sectionDetail'" "$f" | head -1
  grep -o 'data-live="body"' "$f" | head -1
done
```

Expected: for each section, both `grep -o` lines echo their matched snippet — `surface: 'sectionDetail'` and `data-live="body"` — confirming the island wraps the body. (Single quotes inside the double-quoted `x-data` attribute survive HTML serialization verbatim; the slug is `&quot;`-escaped but we don't match on it.)

- [ ] **Step 6: Confirm the unit suite is still green**

Run: `npm run test`
Expected: PASS (Task 1 specs + all existing suites).

- [ ] **Step 7: Record the feature in the changelog**

In `CHANGELOG.md`, prepend a new block. Replace:

```markdown
# Changelog

## [Unreleased] — a11y: 404 section-heading contrast
```

with:

```markdown
# Changelog

## [Unreleased] — live refresh for section landing pages

### Added

Section landing pages (`/grants`, `/about`, `/approach`) now refresh their
body from Strapi client-side — on idle and again on tab focus — instead of
showing build-time content until the next rebuild. Adds a `sectionDetail`
**entry** surface that reuses the generic `page-body` island (the same one
behind the homepage About block and `/programs`); the body fades in only when
the section's `updatedAt` changed. Static output, SEO, Pagefind, and no-JS are
unchanged — the island is additive. The sub-page link list stays static (a
rebuild still surfaces newly-published sub-pages).

New: `SECTION_BY_SLUG` query + `sectionDetail` entry under `src/lib/live/`; the
shared `src/pages/[section]/index.astro` passes `dataLive="body"` to
`<Markdown>`. No CSP or header change — the Strapi origin was already in
`connect-src`.

## [Unreleased] — a11y: 404 section-heading contrast
```

- [ ] **Step 8: Commit**

```bash
git add src/pages/[section]/index.astro CHANGELOG.md
git commit -m "feat(sections): live-refresh /grants, /about, /approach bodies

Mount the sectionDetail liveEntry island on the shared [section]/index
template so section bodies refresh from Strapi on idle + tab focus,
matching the homepage About pattern (dataLive=\"body\" on <Markdown>).
Body only; the sub-page list stays static. No CSP change."
```

---

## Manual verification (human, against live Strapi)

Not an automated gate — the build/test steps above cover the wiring. Run once against the live CMS to confirm end-to-end behavior:

1. Serve the build (`npx astro preview`) and open `/grants`. Confirm the body renders identically to today — no flash, no layout shift on load.
2. Edit the Grants section body in Strapi; return to the tab. Expected: the body fades to the new content (opacity only), and a single polite screen-reader announcement fires. Unchanged reloads swap nothing.
3. Repeat on `/about` and `/approach` to confirm the shared template covers all three.
4. With JavaScript disabled, confirm the static body is still present. With `prefers-reduced-motion`, confirm the swap is instant (no fade).

## Self-review notes

- **Spec coverage:** `sectionDetail` surface (Task 1) ✓; all-section scope via shared template (Task 2, Step 3) ✓; `updatedAt` signature / no `publishedAt` (Task 1 query + test) ✓; body-only, `<ul>` static (Task 2, Step 3) ✓; empty-at-build stable target via always-rendered `<Markdown>` (Task 2, Step 3) ✓; no CSP/build-query change (Global Constraints) ✓; changelog per house discipline (Task 2, Step 7) ✓.
- **Type consistency:** `sectionDetail` matches `EntrySurface` (`variables: (slug) => object`, `select: (data, ctx) => object|null`, `applyTo`, `signature`, `announceLabel`); surface key `'sectionDetail'` is identical in the config entry, the test, and the `[section]` `x-data` string.
