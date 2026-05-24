# Changelog

## [2.0.3] - 2026-05-24

### Date column no longer wraps in listing tables

- `src/components/alpine/ListingTable.astro` — Added `whitespace-nowrap` to `<th>` and `<td>` cells whose column has `format: 'date'`. On `/resources`, `/news`, `/about/meetings`, and `/about/meetings/<category>`, dates like "November 17, 2025" were wrapping into two narrow lines on desktop because the browser was sizing the date column against the bare digits "30" instead of the full formatted date. The date column now holds the full date on one line and the title / category columns absorb the freed space.
- `package.json` — Bumped to `2.0.3`.

## [2.0.2] - 2026-05-24

### FAQ rendering + footer logo polish

- `src/lib/markdown.ts` — Pass `{ stripIgnoreTagBody: ['script', 'style'] }` to `xss()`. CMS authors had embedded an inline `<style>` block at the top of the FAQs body to control `<details>/<summary>` spacing; default xss behavior stripped the tag but escaped its body, leaking the CSS source onto the page as visible text. Now the whole `<style>` block is dropped (same for any `<script>`); spacing comes from our own `.prose` rules.
- `src/styles/global.css` — Added `.prose details / summary` styling: `1.25em` vertical margin between FAQ items, light border + rounded corners on each `<details>`, bold summary with focus-visible outline, `0.75em` gap between the summary and the answer body. Matches the spacing the CMS `<style>` block was attempting.
- `src/components/AppFooter.astro` — Dropped the white background pill behind the footer ICJIA logo. The logo's own light frame already separates it from the dark teal footer; the extra `bg-white rounded p-3` made it look like a sticker.
- `package.json` — Bumped to `2.0.2`.

## [2.0.1] - 2026-05-24

### Post-cutover polish

Round of fixes from first prod usage of the Astro build.

- `src/styles/global.css` — Added explicit `.prose` rules (paragraph spacing, list bullets, headings, links, blockquote, code, table). Tailwind 4 ships no Typography plugin so the `prose` class on `<Markdown />` output was a no-op; news / meeting / biography detail pages collapsed into wall-of-text with no visible bullets. Paragraphs now get `margin-bottom: 1em` and `line-height: 1.7`; `<ul>` / `<ol>` get disc / decimal markers and `padding-left: 1.5em`.
- `src/components/SiteIllinois.astro` — Active counties on the `/programs` map now render with a light-teal fill at rest (`color-mix(in srgb, var(--color-brand-secondary) 35%, white)`); hover / focus darkens to full brand-secondary. Previously every county was white and users couldn't tell which were clickable until they happened to hover one.
- `src/components/alpine/ListingTable.astro` — Whole row is clickable on every listing table (`/news`, `/about/meetings`, `/about/meetings/<category>`, `/sites`, `/apps`, `/resources/<category>`, `/about/biographies`, `/search`). Real `<a>` stays on the title cell so keyboard / screen-reader users still get a labeled link. Row click is suppressed when the click target is itself a link / button / input, or when the user has text selected (avoids hijacking copy-text drags).
- `src/components/AppFooter.astro` — Replaced the placeholder inline ICJIA SVG with the same `public/img/icjia-logo.png` the header uses, wrapped in a white rounded pill so the colored logo reads against the dark teal footer background.
- `README.md` — Rewritten to describe the live production state instead of the obsolete "astro-rewrite branch, WIP" language from the rewrite phase.
- Vue / Vuetify references stripped from active source comments (`src/styles/global.css`, `src/components/HomeArticles.astro`, `scripts/build-svg.mjs`). `docs/superpowers/` plans / specs and the historical Vue-era CHANGELOG entries (0.3.7 and earlier) kept as-is — they are the record of the migration.
- `package.json` — Bumped from `2.0.0-dev` to `2.0.1`.

## [2.0.0] - 2026-05-23

### Full Astro 5 + Tailwind 4 + Alpine.js rewrite

Replaced the Vue 2 + Vuetify 2 build with a static Astro site at the same `/adultredeploy` base path. Same visual design and routes (290 static pages); content fetched from Strapi at build time so there are no runtime API calls. Lighthouse mobile Performance moved 54 → 96-99; A11y 100/100; axe-core 0 violations across all pages. Cutover deployed to `icjia.illinois.gov/adultredeploy`; the last Vue commit is tagged `v1-final` for rollback.

- Stack: Astro 5, Tailwind 4 via `@tailwindcss/vite` with CSS-first `@theme` brand tokens (no Tailwind 3 PostCSS plugin), Alpine.js 3 + `@alpinejs/focus` for drawer / dropdown / map / pagination interactions, Pagefind for static search, `@astrojs/sitemap` for sitemap generation.
- Content: Zod-typed Astro content collections backed by `src/content/_data.json`. `scripts/fetch-content.mjs` issues a single GraphQL query to `ari.icjia-api.cloud` plus an apps + articles query to `researchhub.icjia-api.cloud` (limit 100) at build time.
- Illinois map: `scripts/build-svg.mjs` transforms `scripts/illinois-svg.html` into a static SVG partial with `data-county`, `tabindex`, `role`, and `aria-label` on each active county path; Alpine wires click / keyboard handlers at runtime. County metadata derived from the legacy `usiljs-config.js` via `scripts/build-counties.mjs`.
- CSP: `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.icjia.cloud` — Alpine evaluates `x-*` expressions via `new Function()` and requires `'unsafe-eval'`. `connect-src` extended to include `researchhub.icjia-api.cloud`.
- Home page: hero splash image restored, three teal feature tiles, ICJIA Publications panel paginating researchhub `/articles/` (not `/apps/`) with 2 cards per page and an ellipsis paginator matching the prior Vue UI. Splash / thumbnail base64 fields stripped from the rendered cards — embedding 100 of them would have shipped ~30 MB per home-page visit.
- Build: `npm run build` runs `fetch → build:svg → astro build → pagefind --site dist`. Build ~3.5s on the build container.
- Hosting: Netlify site `adultredeploy` (`siteId: a1e29cf9-84eb-406a-b78d-7fa4c82646d1`), Node 22, deploys from `master`.

## [0.3.7] - 2026-04-16

### LCP image priority; drop unused babel-polyfill

Prod deploy of 0.3.6 improved desktop FCP by ~2.3s but LCP was unchanged (25.2s → 28.6s, within noise). Root cause: the LCP element is the Illinois State Seal image inside home's About section, which waits for the Strapi content fetch, markdown parse, and then the PNG request — none of which the App.vue render-gate fix touched.

- `public/index.html` — Added `<link rel="preload" as="image" fetchpriority="high">` for the state-seal PNG so the browser starts the image request in parallel with JS bundle download instead of waiting for Strapi + markdown parse. Added `<link rel="preconnect">` for `ari.icjia-api.cloud` since it's the content host.
- `src/components/HomeAbout.vue` — After markdown renders, the first `#about` image gets `fetchpriority="high"`, `loading="eager"`, `decoding="async"` so it reuses the preloaded fetch.
- `package.json` — Removed `babel-polyfill@6.26.0` dep. Import was already deleted in 0.3.3 but the dep stayed in `package.json`; this drops it from the lockfile too.

Skipped from the earlier recommendations list:
- **Font-display swap**: the 90ms lightcap savings is coming from FontAwesome's CDN `@font-face` declarations. Google Fonts already has `display=swap`; we don't control FA's CSS. Not worth the invasive fix (local-host FA or swap for a different icon lib).
- **Prerender About content**: biggest possible LCP win, but requires vue-cli prerender plugin + a markdown-rendered snapshot at build time. Too risky to rush before the 2026-04-24 deadline; queue for the post-deadline framework refresh.

## [0.3.6] - 2026-04-16

### Remove unused Netlify Functions; pin build Node version

Netlify build log was warning about deprecated Node 16 functions runtime. Investigation showed the only deployed function was a `"Hello, World"` stub that nothing in the app calls. Removed the functions plumbing entirely rather than upgrading the runtime for code that serves no purpose.

- Deleted `src/lambda/` (source) and `netlify/` (webpack-4 bundled output).
- `package.json` — Removed `netlify-lambda` dependency; removed `build:lambda` and `start:lambda` scripts; dropped `build:lambda` step from the `deploy` script.
- `netlify.toml` — Removed `Functions = "netlify"`. Added `[build.environment]` block with `NODE_VERSION = "22"` so the build container is explicit instead of relying on `.nvmrc` detection.
- `src/config.json` — Removed the `status` object that referenced a `/.netlify/functions/status` endpoint that never existed in this repo.
- `src/store.js` — Removed dead `buildStatusUrl`/`fetchData` helpers, the `setApiStatus` action (whose body was commented out with a hardcoded 200 bypass), the `SET_API_STATUS` mutation, the `apiStatus` state, and the unused `isApiReady` getter. Net: 58 lines of dead code gone.
- `src/App.vue` — Removed the `setApiStatus` dispatch call.

Lint clean. Dev-server smoke test: `http://localhost:8080` Lighthouse A11y 100, Perf 82, LCP 3.2s. No functional change expected in prod beyond the Netlify warning clearing.

## [0.3.5] - 2026-04-16

### Performance and hygiene pass

Addresses Lighthouse prod results (desktop Perf 55, LCP 25.2s) by removing the root-level render-blocking gate. Dev Perf moved from 78 → 93 on the same URL after the change; real prod impact TBD after deploy.

- `src/App.vue` — Removed the global `loading` loader gate that blocked first paint until `getAllSections`, `setApiStatus`, `getAppCount`, and `getArticleCount` all resolved serially. Shell and route view now render immediately; config and searchIndex load synchronously from bundled JSON; sections/appCount/articleCount fire as background promises and populate the nav/footer when ready. Dropped the `Loader` component import and associated template branch.
- `vue.config.js` — Added `configureWebpack` hook that enables Terser `drop_console: true` for production builds, stripping the 104 `console.log` calls across the source tree from prod bundles without touching development builds.
- `src/router.js` — Wrapped the `/sandbox` route in a `NODE_ENV !== "production"` conditional spread so the `Sandbox` chunk is excluded from production builds entirely.
- `src/services/Content.js` — Fixed `getGATAFunding` missing `await` on `getGATAFundingQuery()` (was returning an unresolved Promise). Now awaits and returns `.data` consistent with sibling functions.

### Known follow-ups surfaced during the pass

- `v-data-table` views (`/news`, `/resources`, `/about/meetings`) trigger axe `td-has-header` (WCAG 1.3.1) — cells not associated with column headers. Lighthouse a11y still scores 100 but a thorough audit will flag it.
- `store.js` retains dead `fetchData`/`buildStatusUrl` block and hard-coded `SET_API_STATUS(200)` bypass.
- Image pipeline still ships ~109 KiB of unoptimized assets (seal, nav/footer logos); `image.icjia.cloud` responsive variants would address it.
- 167 npm vulns (18 critical, 39 high); Vue 2 / Vuetify 2 / Vue CLI 4 stack is EOL.

## [0.3.4] - 2026-04-15

### Siteimprove A11y Fix — "All roles are invalid"

Removed redundant `role` attributes from semantic HTML5 elements that already carry the implicit role. Resolves Siteimprove WCAG 2.1 SC 4.1.2 occurrences across `/`, `/programs`, `/grants`, `/news`, `/apps`, `/resources`, and `/search`.

- `src/components/AppNav.vue` — Removed `role="navigation"` from `<nav>`.
- `src/components/AppDrawer.vue` — Removed `role="navigation"` from `<v-navigation-drawer>` (renders as `<nav>`).
- `src/components/AppFooter.vue` — Removed `role="contentinfo"` from `<v-footer>` (renders as `<footer>`).
- `src/App.vue` — Removed `role="main"` from `<v-content>` (renders as `<main>`).
- `src/components/ListTableResource.vue`, `ListTableNews.vue`, `ListTableMeeting.vue` — Removed `role="cell"` from `<td>` (implicit cell role within native tables).
- `src/App.vue` — Moved the route-change live region (`aria-live="polite"` / `role="status"`) inside `<v-content>` so its announcement text ("Navigated to …") is contained by the `<main>` landmark. Resolves Siteimprove "Text not included in an ARIA landmark".
- `src/App.vue` — Wrapped the skip link and `<app-nav>` in a `<header>` element so the skip-link text sits inside a `banner` landmark on every route. Resolves the same Siteimprove rule for the only remaining text-outside-landmark on every page.
- `src/main.js` — Overrode the NProgress template to drop `role="bar"` and `role="spinner"` (both are not valid WAI-ARIA roles). Used `aria-hidden="true"` on the bar and pinned `barSelector` to the `.bar` class. Resolves Siteimprove "All roles are invalid" for the NProgress loading bar.
- `src/css/app.css`, `src/App.vue` — Replaced the `.sr-only` utility (which Font Awesome's CSS overrides with `overflow: hidden`) with a `.visually-hidden` class using `clip-path: inset(50%)` and no `overflow: hidden`. Switched the route-announcement live region to use it. Resolves Siteimprove "Text is clipped when resized" (WCAG 1.4.4) false-positive on the screen-reader-only announcement.

## [0.3.3] - 2026-04-09

### Lighthouse Audit Fixes

- `src/components/AppFooter.vue` — Changed ICJIA link from `http://` to `https://` to eliminate insecure request.
- `src/App.vue` — Set canonical URL on initial page load with `publicPath` prefix. Unified conflicting `min-height` values (68vh/75vh). Removed debug `console.log`.
- `public/index.html` — Removed deprecated `promise-polyfill` and `fetch-polyfill` scripts (native in all supported browsers). Replaced expired FontAwesome kit with free CDN CSS (`font-awesome/5.15.4`).
- `src/main.js` — Removed deprecated `babel-polyfill` import and IE-era prototype shims. Removed `vue-analytics` (Google Analytics) — replaced with no-op `$ga` stub since site uses Plausible.
- `netlify.toml` — Cleaned up CSP: removed FontAwesome kit and Google Analytics domains.
- `src/components/HomeCarousel.vue` — Added descriptive `aria-label` to "Learn More" button for SEO link-text audit.
- `src/components/HomeMeetings.vue` — Added descriptive `aria-label` to "Read more" buttons.
- `src/components/ListTableNews.vue` — Scoped global `td` styles to `.newsTable` to prevent cross-component CLS. Added `role="cell"` to expanded rows.
- `src/components/ListTableMeeting.vue` — Added `role="cell"` to expanded rows.
- `src/components/ListTableResource.vue` — Scoped global `td` styles to `.meetingTable`. Added `role="cell"` to expanded rows. Removed `console.log`.
- `src/components/AppNav.vue` — Added `height` attribute to nav logo for layout stability.
- `src/components/AppFooter.vue` — Added `height="29"` to footer logo.
- `src/components/HomeCarousel.vue` — Set correct `aspect-ratio`, added `eager` loading and `width` for LCP optimization.
- `public/index.html` — Added `preconnect` hints for Google Fonts and cdnjs. Upgraded Google Fonts to CSS2 API with `display=swap`. Trimmed unused font weights. Deferred animate.css loading.
- `src/App.vue` — Made canonical a computed property based on `$route.path`, so it's immediately available on every page without waiting for store config to load. Removed manual assignments from watcher and `created` hook. Added `vmid` to vue-meta canonical link so it replaces the static fallback without creating duplicates.
- `public/index.html` — Added static canonical with `data-vmid="canonical"` as fallback for Lighthouse (vue-meta replaces it after mount).
- `public/index.html` — Async-loaded all external CSS (Google Fonts, FontAwesome, animate.css) via `media="print" onload` pattern to eliminate render-blocking. Combined 3 Google Font requests into 1.
- `src/components/SiteIllinois.vue` — Replaced all jQuery calls (30 references) with vanilla JS. jQuery was never actually installed as a dependency, causing `ReferenceError` on the map page.
- `src/services/Markdown.js` — Replace generic CMS link text ("here", "click here", etc.) with descriptive text derived from the link URL slug. Allow `aria-label` through XSS filter.
- `src/components/HomeAbout.vue` — Auto-size CMS images missing `height` attribute after render, using natural aspect ratio.
- `src/views/SiteDescriptions.vue` — Fixed `[...item]` spread on non-iterable slot scope object (pre-existing `TypeError` on `/sites` page).

---

## [0.3.2] - 2026-04-03

### WCAG AAA Contrast Compliance

Forced high-contrast color scheme across all elements. AAA `color-contrast-enhanced` violations reduced from 248 to 0.

- `src/plugins/vuetify.js` - Darkened Vuetify theme primary/secondary from `#065f60`/`#067879` to `#043e3f`.
- `src/css/app.css` - Forced all subtitle, table header, overline, label, card text, subheader, and nav button text to `#000`. Added `font-weight: 900` and `font-size: 0.975rem` to app-bar buttons. Replaced all `#aaa` hover states with `#000`.
- `src/components/HomeCarousel.vue` - Darkened banner overlay from `rgba(79, 80, 79, 0.7)` to `rgba(0, 0, 0, 0.8)`.
- `src/components/HomeBoxes.vue` - Unified box backgrounds to `#043e3f` for sufficient white-text contrast.
- `src/components/AppNav.vue` - Bumped nav button font size from 13px to 14px.
- `src/components/AppFooter.vue` - Bumped footer nav font from 12px to 14px.
- `src/views/Home.vue` - Changed section heading color from `#444` to `#000`.
- Updated all teal color references (`#065f60`, `#067879`, `#075e60`, `#068384`) across 10 components to `#043e3f`.

---

## [0.3.1] - 2026-04-03

### Security Hardening (Round 2)

- `src/components/Readmore.vue` - Added `xss()` sanitization on the `content` prop as defense-in-depth for `v-html` rendering.
- `src/components/Corona.vue` - Deleted orphaned component that rendered unsanitized HTML from an external API.
- `public/index.html` - Added Subresource Integrity (SRI) hashes to all CDN scripts and stylesheets (promise-polyfill, fetch-polyfill, NProgress CSS/JS, animate.css).
- `npm audit fix` - Reduced npm vulnerabilities from 202 to 167 (safe patches only).

---

## [0.3.0] - 2026-04-03

### Node 22 Upgrade

- `.nvmrc` - Updated from `v16.20.2` to `v22.22.0` (Node 16 was EOL since Sept 2023).
- `package.json` - Added `NODE_OPTIONS=--openssl-legacy-provider` to `serve`, `build`, and `deploy` scripts for webpack 4 / OpenSSL 3.x compatibility.
- `sass` - Pinned to `1.32.13` to silence Vuetify 2 SCSS `/` division deprecation warnings (Vuetify 2 uses the deprecated slash-division syntax; Dart Sass 1.33+ warns aggressively about it).
- Clean `node_modules` reinstall for Node 22.
- Revert point tagged as `v0.2.1-pre-node22`.

---

## [0.2.1] - 2026-04-03

### Accessibility Best Practices

#### Skip to main content
- `src/App.vue` - Added skip link as first focusable element, targeting `#content-top`.
- `src/css/app.css` - Skip link styled offscreen by default, slides into view on keyboard focus with high-contrast teal/yellow styling.

#### Landmark roles
- `src/components/AppNav.vue` - Wrapped in `<nav role="navigation" aria-label="Main navigation">`.
- `src/components/AppFooter.vue` - Added `role="contentinfo"` and `aria-label="Site footer"`.
- `src/components/AppDrawer.vue` - Added `role="navigation"` and `aria-label="Mobile navigation"`.

#### Focus management on route change
- `src/App.vue` - On every Vue Router navigation, focus moves to `#content-top` (`tabindex="-1"`) so keyboard users start at the top of the new page content.

#### Screen reader route announcements
- `src/App.vue` - Added a visually hidden `aria-live="polite"` region that announces "Navigated to {page title}" on each route change.

#### Visible focus indicators
- `src/css/app.css` - Added global `*:focus-visible` outline (3px solid `#f9a825` yellow) for keyboard navigation. Applied to all interactive elements including Vuetify buttons and links.

#### Reduced motion support
- `src/css/app.css` - Added `@media (prefers-reduced-motion: reduce)` to disable all CSS animations, transitions, and AOS library effects for users with that OS preference.

#### Screen-reader utility class
- `src/css/app.css` - Added `.sr-only` class for visually hidden but screen-reader-accessible content.

---

## [0.2.0] - 2026-04-03

### Accessibility Remediation (WCAG 2.1 AA)

Full axe-core audit performed across 39 pages. All violations resolved.

**Initial audit results:** 4 violation types, 244 affected elements across 39 pages.

#### CRITICAL: `button-name` (39 pages, 181 elements)
Buttons missing discernible text.

**Fixes:**
- `src/components/AppNav.vue` - Added `aria-label="Open navigation menu"` to hamburger nav icon; added `aria-label="Search"` to search icon button.
- `src/components/ListTableResource.vue` - Added dynamic `aria-label` to download, external link, and simple table buttons.
- `src/components/ListTableMeeting.vue` - Added dynamic `aria-label` to meeting link button in simple table view.
- `src/components/ListTableNews.vue` - Added dynamic `aria-label` to news link button; moved click handler from icon to button element.
- `src/components/HomeArticles.vue` - Added `aria-label`, `previous-aria-label`, `next-aria-label` to pagination components; added `updated()` hook to label Vuetify 2 pagination navigation buttons.

#### SERIOUS: `color-contrast` (2 pages, 8 elements)
Insufficient contrast between foreground and background colors.

**Fixes:**
- `src/components/HomeArticles.vue` - Darkened card banner overlay from `rgba(79, 80, 79, 0.5)` to `rgba(0, 0, 0, 0.7)`.
- `src/views/Apps.vue` - Darkened card banner overlay from `rgba(25, 26, 25, 0.3)` to `rgba(0, 0, 0, 0.7)`.
- `src/components/HomeCarousel.vue` - Changed FAQs button from `outlined` (white text on transparent background) to solid white for sufficient contrast.

#### SERIOUS: `avoid-inline-spacing` (17 pages, 30 elements)
Inline text spacing set through style attributes that cannot be adjusted with custom stylesheets.

**Fixes:**
- `src/css/app.css` - Added global CSS rule on `.dynamic-content *` to override CMS inline `line-height`, `letter-spacing`, and `word-spacing` with `inherit !important`.
- `src/components/BiographyCard.vue` - Changed hardcoded `line-height: 20px !important` to relative `line-height: 1.4em`.

#### MODERATE: `page-has-heading-one` (25 pages, 25 elements)
Pages missing a level-one heading.

**Fixes:**
- `src/views/BiographiesSingle.vue` - Added `<h1>` with person's full name via `v-slot:title`.
- `src/views/NewsSingle.vue` - Added `<h1>` with article title via `v-slot:title`.
- `src/views/Search.vue` - Restored `<h1>` heading (was previously commented out).
- `src/views/Home.vue` - Changed three `<span>` section headers ("About Adult Redeploy Illinois", "ARI News", "ICJIA Publications") to semantic `<h2>` elements. (Home page `<h1>` is provided by `HomeCarousel.vue`.)

### Security Hardening

- `netlify.toml` - Added security headers: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, and `Content-Security-Policy`.
- `public/index.html` - Removed unused jQuery dependency; added Subresource Integrity (SRI) hashes to CDN scripts.
- `src/services/Markdown.js` - Added XSS sanitization to markdown rendering output.
- `src/store.js` - Removed unused `jwt` and `userMeta` localStorage references.

### Other

- `.nvmrc` - Updated from `v14.20.1` to `v16.20.2` to match project runtime.
- Added `axe-audit.mjs` script for automated accessibility auditing.
- Added comprehensive test suite (`tests/unit/`).
