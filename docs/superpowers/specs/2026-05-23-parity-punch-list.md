# Prod parity punch list — Astro rewrite

- **Date:** 2026-05-23
- **Method:** viewcap fold-screenshots of `icjia.illinois.gov/adultredeploy/<route>` (prod) vs `localhost:4173/adultredeploy/<route>` (astro-rewrite preview), 15 representative routes.
- **Source PNGs:** `/tmp/ari-compare/prod/*.png` and `/tmp/ari-compare/astro/*.png`

The list is grouped by reusable component first (biggest impact), then per-route specifics. Each item has a severity tag:

- **[A]** — clearly visible, affects every page → top priority
- **[B]** — visible on the affected page → second priority
- **[C]** — subtle / cosmetic → optional polish

---

## Shared chrome

### Header

- **[A] Nav items use Title Case ("About", "Approach", "Grants").** Prod uses ALL CAPS ("ABOUT", "APPROACH", "PROGRAMS", "GRANTS", "NEWS", "RESOURCES", "APPS"). Fix: `text-transform: uppercase` on the nav button labels.
- **[A] Only About / Approach / Grants render in my header.** Prod shows 7 items (About, Approach, Programs, Grants, News, Resources, Apps). My filter in `AppHeader.astro` keeps only sections with displayNav-able sub-pages, so Programs / Grants / News / Resources / Apps are dropped. Fix: include every section in the nav; render as a real `<a>` when it has no sub-pages, dropdown only when it does. Add a corresponding link for "Sites" if it isn't in the Strapi sections collection.
- **[B] Title is the full "ADULT REDEPLOY ILLINOIS" string.** Prod renders just "ADUL..." (truncated by CSS) because the header is denser. Mine is acceptable but reads bigger. Lower priority — possibly leave as-is.
- **[B] Header search input is always visible.** Prod hides the inline input and uses just a magnifier icon that opens `/search`. Fix: drop the inline `<input>` from the header, keep only the magnifier link to `/search`. (My header form is more visible/usable, but parity points to the icon-only design.)

### Footer

- **[A] Footer layout is completely different.** Prod is a dark-teal full-width block with: (1) a horizontal nav strip of all section links in caps (ABOUT, APPROACH, PROGRAMS, GRANTS, NEWS, RESOURCES, SITES, APPS, SEARCH) with the current section highlighted; (2) centered ICJIA logo; (3) Facebook + Twitter icons; (4) a small attribution line "2026 Illinois Criminal Justice Information Authority | ICJIA Document Archive | Site Status | Github". Mine is a 3-column layout with my own ARI/Contact/Resources columns and a one-line bottom strip. Fix: replace `AppFooter.astro` with the prod layout.

### Article container

- **[A] Article pages on prod render inside a white card with shadow.** Title is in a darker banner band at the top of the card with all-caps title text. Mine uses plain page background. Fix: wrap article content (news single, meeting single, resource single, biography single, generic page) in a `Card` element with a styled title-bar header.

### Listing table

- **[B] Prod table has the expand-chevron column + Posted-before-Title column order + larger row spacing.** I dropped the chevron pattern intentionally (per spec) but should at least match the column order and row spacing for visual parity.
- **[B] Table is rendered with stronger Material-style row dividers and zebra stripe on prod.** Mine has thinner borders, no zebra.

---

## Per-page

### / (Home)

- **[A] HomeBoxes section** — fixed in commit `bb764c5` (solid teal + icons).
- **[B] Hero overlay banner** — prod's banner is wider on the image and the buttons are smaller. Mine is close.
- **[A] "ABOUT ADULT REDEPLOY ILLINOIS" section heading** — prod uses a large, dark, all-caps heading with an underline rule. Mine uses small grey title-case + small underline. Fix the typography of `text-page-title` for in-page section headers.
- **[A] HomeNews 2-column section** — prod shows "ARI News" (left) and "ICJIA Publications" (right, externally fetched articles). My home shows only the news column; the ICJIA publications column is omitted. Fix: add a `HomeArticles.astro` component that pulls from researchhub (`applications`) — or whatever feed prod uses for publications.
- **[C] Programs / Grants / Resources box descriptions** — already aligned exactly with prod copy.

### /about

- **[A] Prod /about is a "section landing"** that shows the section header + a list of cards for each child page (Contact / Overview / Meetings / FAQs / Oversight / Staff). Mine produces a similar list but the styling differs: prod uses outlined cards with the title in dark teal + a short description; mine is closer but the wrapper styling is different.
- **[A] Prod shows a spinner first** — the section loads asynchronously. Mine renders instantly (better — keep that).

### /about/contact

- **[B] Contact page** — should compare more carefully. Likely the Strapi content renders cleanly in both, mostly the surrounding chrome differs.

### /news (News archive)

- **[A] H1 reads "NEWS ARCHIVE"** in all caps with an underline rule. Mine reads "News" plus a subtitle.
- **[B] Column order: Posted | Title** (prod) vs Title | Posted (mine). Fix column order in `src/pages/news/index.astro`.
- **[B] No subtitle below the H1 on prod.** Mine has "Updates, announcements, and stories…" — looks fine, but drop if strict parity.

### /news/:slug (news detail)

- **[A] Title band** — prod shows a dark teal band with the full title in all caps at the top of the card.
- **[B] "Adult Redeploy Illinois News" pill** — prod has a small magenta/purple pill near the title.
- **[B] Breadcrumb** — prod doesn't render one on detail pages (uses the title band instead). Mine has Home / News / [title]. Either drop the breadcrumb on detail pages or accept the difference.
- **[C] No italic summary** on prod. Mine renders the Strapi `summary` as an italic lead paragraph. Decide: keep (mine) for context, or drop for parity.

### /about/meetings (meeting listing)

- **[A] Same as /news**: column order, H1 style, table density.
- **[A] "By Category" / "By Date" toggle** — prod has a toggle that lets users switch between two views (a table or grouped by category with sub-tables). Mine only has the flat table. Fix: add the toggle.

### /about/meetings/:cat/:slug (meeting detail)

- **[A] Card-wrapped layout with title banner** — same shared-chrome fix above.
- **[B] Category pill** ("Regular Oversight Meeting") top-right.
- **[B] "Posted: a year ago" / "Last updated: a year ago"** at bottom of the card (relative time). Mine doesn't show these.
- **[A] Meeting Materials section uses cloud-download icon + teal-bold link**, prod styles it more prominently than mine.

### /resources

- **[A] Prod groups by category** with sub-heading per category + a sub-table — uses the same "By Category / By Publication Date" toggle as meetings. Mine shows one flat table.
- **[B] H1 typography + "NEW!" badges** on recently-published items (per the original `displayNewLabel` logic).

### /resources/:cat/:slug (resource detail)

- **[A] Same shared-chrome fix** (card + title banner).
- **[B] Downloads + External Links** sections styled the same as meetings.

### /sites (sites listing)

- Probably similar styling differences as other listings. Less visible because there are only 24 rows.

### /sites/:slug (site detail)

- **[B] Title banner + card**.

### /about/staff

- **[A] Prod renders a 2-column grid of bio cards** with headshots; the card design has a more polished hover state. Mine is close — review when card style is updated.

### /about/oversight

- Same as staff.

### /about/biographies/:slug

- **[A] Title banner + card** (shared chrome fix).
- **[B] Headshot left, content right** — same as mine.

### /programs

- **[A] Programs page loads with content above the map.** Mine shows just the map. Prod has paragraph text + map + site description sidebar that updates on county click.
- **[A] Side panel default state** — prod shows the "general programs" description by default; mine shows "Select a county" prompt only. Either is fine; document the choice.

### /apps

- **[A] Card design** — prod's apps cards have larger image headers and more prominent typography. Mine is functional but plainer.

### /search

- **[A] Search page** — prod is fuse.js-driven UI with custom result cards. Mine uses Pagefind's default UI styled with Tailwind. They look completely different. Fix: style Pagefind UI more aggressively to look like the prod result cards, OR accept the difference (Pagefind UI is more accessible by default).

### /tags/:slug

- Compare side-by-side; prod groups by content type. Mine also does. Should be close.

### 404

- Not compared; both should be simple "page not found" — likely close.

---

## Recommended fix order (to maximize visual impact / minimize effort)

1. **Footer redesign** (huge visual presence on every page) — half a day.
2. **Header redesign** (all sections in nav, all caps, drop inline search input) — 1-2 hours.
3. **Article-card chrome** (title banner + card wrapping for all detail templates: news, meeting, resource, biography, generic page) — half a day; one shared `<ArticleCard>` layout drives most pages.
4. **Listing-table column order + density** — 1 hour.
5. **HomeArticles (ICJIA publications)** — 1-2 hours; reuse the researchhub `applications` data.
6. **Page-title typography** (large dark all-caps with underline rule for in-page section headers) — 1 hour.
7. **By Category / By Date toggle** on meetings + resources — half a day.
8. **App card styling** — 1 hour.
9. **Search-results card styling** — 1-2 hours.

**Total: roughly 2-3 days of focused work** to close the largest visible gaps. Pixel-perfect Vuetify mimicry would add another 1-2 days of micro-tweaks.

---

## Recommended NOT to fix (intentional improvements over prod)

- **Keyboard accessibility on the map** — Vue version had none; the rewrite has full keyboard + screen-reader support. Don't roll back.
- **No expand-to-preview rows on listing tables** — the spec decided one-click navigation is better UX and easier to audit; prod has it but we don't, and that should stay.
- **Static SSG instead of client-side fetch+spinner** — every prod page first shows a spinner. The rewrite renders instantly. Faster + better.
- **CLS 0 on listing pages** — fixed in Phase 8 commit `b628426` via reserved row heights.
- **Lighthouse perf 96+ mobile** — major upgrade over Vue's 54.

These are wins we explicitly want to keep, even though they make the rewrite *not* pixel-identical to prod.
