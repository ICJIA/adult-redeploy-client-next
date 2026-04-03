# Changelog

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
