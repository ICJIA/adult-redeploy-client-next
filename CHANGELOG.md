# Changelog

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
