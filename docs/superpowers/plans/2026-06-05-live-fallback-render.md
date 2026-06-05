# Live Fallback Render (Not-Yet-Built News Detail Pages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a news article is published to Strapi after the last build, render its detail page client-side on the 404 host (instead of a dead 404) so authors can review and tweak it without waiting for a rebuild.

**Architecture:** ARI stays `output: 'static'`. The existing `404.astro` becomes a content-aware live-render host: a pre-paint `is:inline` script detects an unbuilt `/news/<slug>`, and the existing `liveEntry` Alpine island — extended with a **bootstrap** mode — fetches the article from Strapi and paints it into a shared news-detail skeleton using the existing isomorphic `markdown-it` renderer. Genuine 404s fall through to the normal 404 UI at 404 status.

**Tech Stack:** Astro 5 (static), Alpine.js 3, TypeScript, `markdown-it` + `xss` (isomorphic `renderMarkdown`), Strapi v3 GraphQL (`ari.icjia-api.cloud`), Vitest (node env), Netlify.

**Spec:** `docs/superpowers/specs/2026-06-05-live-fallback-render-design.md`

---

## File Structure

**Create:**
- `src/lib/live/fallback/detect.ts` — pure URL → `{surface, slug}` matcher (+ the surface map). Mirrored by the 404 inline script.
- `src/lib/live/fallback/detect.test.ts` — unit tests for `detectSurface`.
- `src/lib/live/behavior/bootstrap.ts` — pure `bootstrapEffect` reducer (when to fire `onHit`/`onMiss`).
- `src/lib/live/behavior/bootstrap.test.ts` — unit tests.
- `src/lib/live/render/news-detail.test.ts` — unit tests for `renderTags`.
- `src/components/NewsDetailShell.astro` — single source of the news-detail body markup (filled when given `item`, empty `data-live` hooks otherwise).

**Modify:**
- `src/lib/live/render/news-detail.ts` — add pure `renderTags()`; have `applyNewsDetail` inject tags (and take `ctx`).
- `src/lib/live/behavior/liveEntry.ts` — add `bootstrap`/`onHit`/`onMiss` options + `_rendered` tracking, wired through `bootstrapEffect`.
- `src/pages/news/[slug].astro` — render via `<NewsDetailShell item={item} />` (behavior unchanged).
- `src/pages/404.astro` — add the inline detect script, the live-render host, and the `[data-nf-state]` CSS state machine.
- `CHANGELOG.md` — feature entry.

**Unchanged (verified, reused as-is):** `src/lib/live/config.ts` (the `newsDetail` entry surface already exists), `register.ts` (`liveEntry` already registered), `data/queries.ts` (`NEWS_BY_SLUG` already returns `tags`), `data/endpoint.ts` (`gqlFetch`), `public/_headers` + `netlify.toml` (CSP already allows inline scripts + the Strapi `connect-src`).

---

## Task 1: Pure surface detection (`detectSurface`)

**Files:**
- Create: `src/lib/live/fallback/detect.ts`
- Test: `src/lib/live/fallback/detect.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/live/fallback/detect.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { detectSurface } from './detect';

const BASE = '/adultredeploy';

describe('detectSurface', () => {
  it('matches a news slug on the proxied (base-stripped) path', () => {
    expect(detectSurface('/news/my-article', BASE)).toEqual({ surface: 'newsDetail', slug: 'my-article' });
  });
  it('matches a news slug on the raw host (base-prefixed) path', () => {
    expect(detectSurface('/adultredeploy/news/my-article', BASE)).toEqual({ surface: 'newsDetail', slug: 'my-article' });
  });
  it('strips a trailing slash from the slug', () => {
    expect(detectSurface('/news/my-article/', BASE)).toEqual({ surface: 'newsDetail', slug: 'my-article' });
  });
  it('returns null for the bare /news index (no slug)', () => {
    expect(detectSurface('/news', BASE)).toBeNull();
    expect(detectSurface('/news/', BASE)).toBeNull();
  });
  it('returns null for nested paths under /news', () => {
    expect(detectSurface('/news/a/b', BASE)).toBeNull();
  });
  it('returns null for unrelated paths', () => {
    expect(detectSurface('/about', BASE)).toBeNull();
    expect(detectSurface('/adultredeploy/about', BASE)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/live/fallback/detect.test.ts`
Expected: FAIL — `Failed to resolve import "./detect"` / `detectSurface is not a function`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/live/fallback/detect.ts`:

```ts
// src/lib/live/fallback/detect.ts
// Pure URL → live-surface matcher for the 404 fallback host. Given a request
// path it returns the surface + slug to live-render, or null. Kept PURE (no
// window/DOM) so it unit-tests in the node vitest env; the 404 page's
// is:inline script MIRRORS this logic (it can't import). KEEP THE TWO IN SYNC.

export interface FallbackSurface {
  /** Path prefix that identifies the surface, e.g. "/news/". */
  prefix: string;
  /** The liveConfig.entries key to bootstrap, e.g. "newsDetail". */
  surface: string;
}

export interface FallbackMatch {
  surface: string;
  slug: string;
}

// v1: news only. Add one entry per CMS detail surface later (meetings carry a
// category segment, so they need their own rule — see the spec's "future").
export const FALLBACK_SURFACES: FallbackSurface[] = [
  { prefix: '/news/', surface: 'newsDetail' },
];

/**
 * Match a request path to a fallback surface + slug, or null.
 * - Strips an optional leading `base` (proxied prod sees "/news/x"; the raw
 *   *.netlify.app host sees "/adultredeploy/news/x").
 * - Requires a single non-empty path segment after the prefix, so "/news/"
 *   and "/news/a/b" do NOT match.
 */
export function detectSurface(
  pathname: string,
  base: string,
  surfaces: FallbackSurface[] = FALLBACK_SURFACES,
): FallbackMatch | null {
  let path = pathname;
  if (base && path.indexOf(base) === 0) path = path.slice(base.length) || '/';
  for (const e of surfaces) {
    if (path.indexOf(e.prefix) === 0) {
      const slug = path.slice(e.prefix.length).replace(/\/+$/, '');
      if (slug && !slug.includes('/')) return { surface: e.surface, slug };
      return null;
    }
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/live/fallback/detect.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/live/fallback/detect.ts src/lib/live/fallback/detect.test.ts
git commit -m "feat(live): pure detectSurface for the 404 fallback host"
```

---

## Task 2: Pure tag renderer (`renderTags`)

**Files:**
- Modify: `src/lib/live/render/news-detail.ts`
- Test: `src/lib/live/render/news-detail.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/live/render/news-detail.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { renderTags } from './news-detail';

const ctx = { endpoint: '', basePath: '/adultredeploy' };

describe('renderTags', () => {
  it('returns empty string for no tags', () => {
    expect(renderTags([], ctx)).toBe('');
    expect(renderTags(null, ctx)).toBe('');
  });
  it('skips tags missing a name or slug', () => {
    expect(renderTags([{ name: 'X' }, { slug: 'y' }], ctx)).toBe('');
  });
  it('builds base-pathed tag links and escapes the name', () => {
    const html = renderTags([{ name: 'Drug Court & <Mental>', slug: 'drug-court' }], ctx);
    expect(html).toContain('href="/adultredeploy/tags/drug-court"');
    expect(html).toContain('Drug Court &amp; &lt;Mental&gt;');
    expect(html).toContain('bg-brand-secondary');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/live/render/news-detail.test.ts`
Expected: FAIL — `renderTags is not a function` (not yet exported).

- [ ] **Step 3: Write minimal implementation**

In `src/lib/live/render/news-detail.ts`, change the `shared` import to also pull in `escapeHtml`:

```ts
import { liveEl, escapeHtml } from './shared';
```

Then add, immediately after the `NEWS_DETAIL_SIG` line (before `applyNewsDetail`):

```ts
// Tag pills, shared by the static build (set:html) and applyNewsDetail's live
// swap so they can't diverge. Mirrors components/ui/Tag.astro's linked variant.
const TAG_CLASS = 'inline-block px-2 py-0.5 text-xs font-bold rounded '
  + 'bg-brand-secondary text-white hover:bg-brand-secondary/90 '
  + 'focus-visible:outline focus-visible:outline-2 '
  + 'focus-visible:outline-brand-primary focus-visible:outline-offset-2';

export function renderTags(
  tags: Array<{ name?: string; slug?: string }> | null | undefined,
  ctx: LiveContext,
): string {
  const list = (tags ?? []).filter((t) => t?.name && t?.slug);
  if (!list.length) return '';
  return list
    .map((t) =>
      `<a href="${escapeHtml(ctx.basePath)}/tags/${escapeHtml(t.slug)}" class="${TAG_CLASS}">${escapeHtml(t.name)}</a>`)
    .join('');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/live/render/news-detail.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/live/render/news-detail.ts src/lib/live/render/news-detail.test.ts
git commit -m "feat(live): renderTags shared tag-pill renderer for news detail"
```

---

## Task 3: Pure bootstrap reducer (`bootstrapEffect`)

**Files:**
- Create: `src/lib/live/behavior/bootstrap.ts`
- Test: `src/lib/live/behavior/bootstrap.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/live/behavior/bootstrap.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { bootstrapEffect } from './bootstrap';

describe('bootstrapEffect', () => {
  it('is a no-op when not in bootstrap mode', () => {
    expect(bootstrapEffect(false, false, 'view')).toBe('none');
    expect(bootstrapEffect(undefined, false, 'null')).toBe('none');
  });
  it('hits on the first view', () => {
    expect(bootstrapEffect(true, false, 'view')).toBe('hit');
  });
  it('misses on null or error before the first render', () => {
    expect(bootstrapEffect(true, false, 'null')).toBe('miss');
    expect(bootstrapEffect(true, false, 'error')).toBe('miss');
  });
  it('is a no-op once already rendered (later failures keep the DOM)', () => {
    expect(bootstrapEffect(true, true, 'null')).toBe('none');
    expect(bootstrapEffect(true, true, 'error')).toBe('none');
    expect(bootstrapEffect(true, true, 'view')).toBe('none');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/live/behavior/bootstrap.test.ts`
Expected: FAIL — `Failed to resolve import "./bootstrap"`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/live/behavior/bootstrap.ts`:

```ts
// src/lib/live/behavior/bootstrap.ts
// Pure decision for the liveEntry "bootstrap" mode (used by the 404 fallback
// host). Bootstrap renders a record from nothing (no build baseline), so the
// host needs to know when the FIRST paint succeeded (hide "Loading…") vs when
// there's nothing to show yet (revert to the real 404). Kept pure so it
// unit-tests in node; liveEntry calls it and fires the host's onHit/onMiss.

export type RefreshOutcome = 'view' | 'null' | 'error';

/**
 * - Only meaningful in bootstrap mode and only before the first successful
 *   render (`rendered === false`).
 * - 'hit'  → a record was applied (host: state = "rendered", hide Loading).
 * - 'miss' → no record / fetch failed before any paint (host: revert to 404).
 * - 'none' → not bootstrap, or already rendered (later failures keep the DOM).
 */
export function bootstrapEffect(
  bootstrap: boolean | undefined,
  rendered: boolean,
  outcome: RefreshOutcome,
): 'hit' | 'miss' | 'none' {
  if (!bootstrap || rendered) return 'none';
  return outcome === 'view' ? 'hit' : 'miss';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/live/behavior/bootstrap.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/live/behavior/bootstrap.ts src/lib/live/behavior/bootstrap.test.ts
git commit -m "feat(live): bootstrapEffect reducer for liveEntry bootstrap mode"
```

---

## Task 4: Add bootstrap mode to `liveEntry`

**Files:**
- Modify: `src/lib/live/behavior/liveEntry.ts`

No node unit test: `liveEntry.refresh()` is coupled to `window`/DOM (`gqlFetch`, `progress`, `announce`, `applyTo`) and the repo's vitest runs in `environment: 'node'` (it tests only pure helpers — the decision is already covered by Task 3's `bootstrapEffect` tests). Behavior is verified in the browser in Task 8. Type-checked here via `npm run check`.

- [ ] **Step 1: Add the import**

In `src/lib/live/behavior/liveEntry.ts`, add the `bootstrap` import beside the existing behavior imports:

```ts
import { onVisible } from './focus-refetch';
import { bootstrapEffect } from './bootstrap';
import type { LiveConfig } from '../types';
```

- [ ] **Step 2: Track `_rendered` on the state interface**

Add `_rendered` to the `EntryState` interface:

```ts
interface EntryState {
  _sig: string;
  _rendered: boolean;
  _ctrl: AbortController | null;
  _stop: (() => void) | null;
  $root: HTMLElement;
  refresh(): Promise<void>;
}
```

- [ ] **Step 3: Extend the factory options + initial state**

Replace the factory signature and the start of the returned object:

```ts
export function makeLiveEntry(config: LiveConfig) {
  return (opts: {
    surface: string;
    slug: string;
    sig: string;
    bootstrap?: boolean;
    onHit?: () => void;
    onMiss?: () => void;
  }) => ({
    _sig: opts.sig,
    _rendered: false,
    _ctrl: null as AbortController | null,
    _stop: null as (() => void) | null,
```

(The rest of `init`/`destroy` are unchanged.)

- [ ] **Step 4: Wire the bootstrap effects into `refresh`**

Replace the body of the `try { … } catch { … }` in `refresh` (from `const view = …` through the `catch` block) with:

```ts
      const view = surface.select(data, config.ctx);
      if (!view) {                             // not found / shape mismatch → keep static
        if (bootstrapEffect(opts.bootstrap, this._rendered, 'null') === 'miss') opts.onMiss?.();
        return;
      }
      const sig = surface.signature(view);
      if (sig === this._sig) return;           // unchanged → no markdown import, no swap
      this._sig = sig;
      await surface.applyTo(this.$root, view, config.ctx);
      if (bootstrapEffect(opts.bootstrap, this._rendered, 'view') === 'hit') {
        this._rendered = true;
        opts.onHit?.();
      }
      announce(`${surface.announceLabel} updated`);
    } catch {
      if (bootstrapEffect(opts.bootstrap, this._rendered, 'error') === 'miss') opts.onMiss?.();
      /* keep the static / last-good DOM */
    } finally {
```

- [ ] **Step 5: Type-check**

Run: `npm run check`
Expected: PASS — `0 errors` (astro check reports no type errors). The existing `liveEntry({surface, slug, sig})` call sites still satisfy the widened options (new fields optional).

- [ ] **Step 6: Confirm the full unit suite still passes**

Run: `npm test`
Expected: PASS — all existing tests plus Tasks 1–3 (`detect`, `renderTags`, `bootstrapEffect`).

- [ ] **Step 7: Commit**

```bash
git add src/lib/live/behavior/liveEntry.ts
git commit -m "feat(live): liveEntry bootstrap mode (sig-from-empty + onHit/onMiss)"
```

---

## Task 5: Inject tags in `applyNewsDetail`

**Files:**
- Modify: `src/lib/live/render/news-detail.ts`

Verified by the build + browser (Task 8); the markup is unit-covered by Task 2's `renderTags` tests.

- [ ] **Step 1: Take `ctx` and inject tags**

In `applyNewsDetail`, rename the unused `_ctx` parameter to `ctx` and append a tags block after the body block. The function becomes:

```ts
export async function applyNewsDetail(root: HTMLElement, view: any, ctx: LiveContext): Promise<void> {
  const title = liveEl(root, 'title');
  if (title) title.textContent = view.title ?? '';

  const posted = liveEl(root, 'posted');
  if (posted) posted.textContent = `Posted: ${formatDate(view.publicationDate ?? view.createdAt)}`;

  const summary = liveEl(root, 'summary');
  if (summary) {
    summary.textContent = view.summary ?? '';
    summary.style.display = view.summary ? '' : 'none';
  }

  const body = liveEl(root, 'body');
  if (body) {
    const { renderMarkdown } = await import('../../markdown/core');
    fadeSwap(body, () => { body.innerHTML = renderMarkdown(view.content ?? ''); });
  }

  const tags = liveEl(root, 'tags');
  if (tags) {
    const html = renderTags(view.tags, ctx);
    tags.innerHTML = html;
    tags.style.display = html ? '' : 'none';
  }
}
```

- [ ] **Step 2: Type-check + tests**

Run: `npm run check && npm test`
Expected: PASS — 0 type errors; all tests green.

- [ ] **Step 3: Commit**

```bash
git add src/lib/live/render/news-detail.ts
git commit -m "feat(live): applyNewsDetail refreshes tags (and bootstrap can paint them)"
```

---

## Task 6: Extract `NewsDetailShell.astro` and use it in the detail page

**Files:**
- Create: `src/components/NewsDetailShell.astro`
- Modify: `src/pages/news/[slug].astro`

- [ ] **Step 1: Create the shared shell component**

Create `src/components/NewsDetailShell.astro`:

```astro
---
// src/components/NewsDetailShell.astro
// Single source of the news-detail body markup, used BOTH by the static
// /news/[slug] page (item provided → filled + data-live hooks) AND by the 404
// live-fallback host (no item → empty data-live hooks that applyNewsDetail
// fills from Strapi). One component so static + live render can't drift.
import ArticleCard from './ArticleCard.astro';
import Markdown from './Markdown.astro';
import { formatDate } from '../lib/dates';
import { renderTags } from '../lib/live/render/news-detail';
import type { CollectionEntry } from 'astro:content';

type News = CollectionEntry<'news'>['data'];
interface Props { item?: News | null; }
const { item = null } = Astro.props;

const base = import.meta.env.BASE_URL || '/adultredeploy';
const ctx = { endpoint: '', basePath: base };
const posted = item ? (item.publicationDate ?? item.createdAt) : null;
const hasTags = !!(item && item.tags && item.tags.length > 0);
const tagsHtml = item ? renderTags(item.tags, ctx) : '';
---
<ArticleCard title={item?.title ?? ''}
             badge="Adult Redeploy Illinois News"
             pagefindMeta={item && posted ? { type: 'news', date: posted } : undefined}>
  <p class="text-sm text-gray-700 mb-4" data-live="posted">
    {item ? `Posted: ${formatDate(posted)}` : ''}
  </p>
  <p class="text-lg italic mb-6" data-live="summary"
     style={item?.summary ? undefined : 'display:none'}>{item?.summary}</p>
  {item
    ? <Markdown content={item.content} dataLive="body" />
    : <div class="prose max-w-none" data-live="body"></div>}
  <div class="mt-8 flex flex-wrap gap-2" data-live="tags"
       style={hasTags ? undefined : 'display:none'} set:html={tagsHtml}></div>
</ArticleCard>
```

- [ ] **Step 2: Point the detail page at the shell**

Replace the entire contents of `src/pages/news/[slug].astro` with:

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import NewsDetailShell from '../../components/NewsDetailShell.astro';
import { NEWS_DETAIL_SIG } from '../../lib/live/render/news-detail';
import { newsArticle } from '../../lib/jsonld';

type News = CollectionEntry<'news'>['data'];

export async function getStaticPaths() {
  const items = await getCollection('news');
  return items.map((item) => ({
    params: { slug: item.data.slug },
    props: { item: item.data },
  }));
}
const { item } = Astro.props as { item: News };
const base = import.meta.env.BASE_URL || '/adultredeploy';
const posted = item.publicationDate ?? item.createdAt;
const xData = `liveEntry({ surface: 'newsDetail', slug: ${JSON.stringify(item.slug)}, sig: ${JSON.stringify(NEWS_DETAIL_SIG(item))} })`;
const articleJsonLd = newsArticle({
  url: `https://icjia.illinois.gov${base}/news/${item.slug}`,
  headline: item.title,
  description: item.summary,
  datePublished: posted,
  dateModified: item.updatedAt,
});
---
<BaseLayout title={item.title} description={item.summary ?? undefined}
            ogType="article" jsonLd={articleJsonLd}
            published={posted} modified={item.updatedAt}>
  <div x-data={xData}>
    <NewsDetailShell item={item} />
  </div>
</BaseLayout>
```

- [ ] **Step 3: Type-check + build**

Run: `npm run check && npx astro build`
Expected: PASS — 0 type errors; build completes; `dist/news/<slug>/index.html` files emitted as before. (`npx astro build` reuses the existing `src/content/_data.json`; no Strapi fetch needed for this check.)

- [ ] **Step 4: Verify static parity of a built article**

Pick any built article slug and confirm the rendered detail markup is unchanged (title, summary, body, and tag links/classes identical to before).

Run: `grep -o 'href="[^"]*\/tags\/[^"]*"[^>]*class="inline-block[^"]*"' dist/news/*/index.html | head -3`
Expected: tag anchors with `class="inline-block px-2 py-0.5 text-xs font-bold rounded bg-brand-secondary text-white …"` and `href` under `/adultredeploy/tags/…` — i.e. byte-equivalent to the pre-refactor `<Tag>` output.

- [ ] **Step 5: Commit**

```bash
git add src/components/NewsDetailShell.astro src/pages/news/\[slug\].astro
git commit -m "refactor(news): extract NewsDetailShell (shared by detail page + fallback)"
```

---

## Task 7: Wire `404.astro` as the live-render host

**Files:**
- Modify: `src/pages/404.astro`

- [ ] **Step 1: Replace `404.astro` with the host version**

Replace the entire contents of `src/pages/404.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import NewsDetailShell from '../components/NewsDetailShell.astro';
import { FALLBACK_SURFACES } from '../lib/live/fallback/detect';
const base = import.meta.env.BASE_URL || '/adultredeploy';
const sections = [
  { href: `${base}/about`,           label: 'About' },
  { href: `${base}/approach`,        label: 'Approach' },
  { href: `${base}/programs`,        label: 'Programs' },
  { href: `${base}/grants`,          label: 'Grants' },
  { href: `${base}/news`,            label: 'News' },
  { href: `${base}/resources`,       label: 'Resources' },
  { href: `${base}/about/meetings`,  label: 'Meetings' },
  { href: `${base}/apps`,            label: 'Apps' },
];
---
<BaseLayout title="Page not found"
            description="The requested Adult Redeploy Illinois page could not be found.">
  {/* Pre-paint: if the path is a not-yet-built CMS detail slug (e.g. a news
      article published since the last build), switch to the live render host
      BEFORE first paint so there's no 404 flash. CSP allows inline scripts
      ('unsafe-inline'). Detection MIRRORS src/lib/live/fallback/detect.ts —
      keep the two in sync. */}
  <script is:inline define:vars={{ base, map: FALLBACK_SURFACES }}>
    (function () {
      window.__nfState = function (s) {
        document.documentElement.setAttribute('data-nf-state', s);
      };
      var path = location.pathname;
      if (base && path.indexOf(base) === 0) path = path.slice(base.length) || '/';
      for (var i = 0; i < map.length; i++) {
        var e = map[i];
        if (path.indexOf(e.prefix) === 0) {
          var slug = path.slice(e.prefix.length).replace(/\/+$/, '');
          if (slug && slug.indexOf('/') === -1) {
            window.__nf = { surface: e.surface, slug: slug };
            window.__nfState('checking');
            // Safety net: if the island never resolves (e.g. Alpine failed to
            // load), don't strand the visitor on "Loading…" — revert to 404.
            window.setTimeout(function () {
              if (document.documentElement.getAttribute('data-nf-state') === 'checking') {
                window.__nfState('default');
              }
            }, 8000);
          }
          break;
        }
      }
    })();
  </script>

  {/* Live render host — hidden unless the inline script promoted us to
      "checking". Reuses the shared news-detail markup + liveEntry bootstrap. */}
  <div class="nf-live">
    <p class="nf-loading max-w-3xl mx-auto px-6 py-24 text-center text-lg text-brand-ink/70">
      Loading…
    </p>
    <div class="nf-shell"
         x-data="liveEntry({ surface: window.__nf && window.__nf.surface, slug: window.__nf && window.__nf.slug, sig: '', bootstrap: true, onHit: () => window.__nfState('rendered'), onMiss: () => window.__nfState('default') })">
      <NewsDetailShell />
    </div>
  </div>

  <section class="nf-fallback max-w-3xl mx-auto px-6 py-20 sm:py-28 text-center">
    <p aria-hidden="true"
       class="font-heading font-black text-brand-secondary tracking-tight
              text-7xl sm:text-8xl leading-none select-none">404</p>
    <h1 class="mt-4 font-heading font-black uppercase tracking-tight
               text-2xl sm:text-3xl text-brand-primary">
      Page not found
    </h1>
    <p class="mt-4 text-lg text-brand-ink/80">
      The page you're looking for may have moved, been renamed, or no longer exists.
    </p>

    <div class="mt-8 flex flex-wrap gap-3 justify-center">
      <a href={`${base}/`}
         class="inline-flex items-center bg-brand-primary text-white font-bold uppercase
                text-sm px-6 py-3 rounded hover:bg-brand-primary/90 transition
                focus-visible:outline focus-visible:outline-2
                focus-visible:outline-brand-primary focus-visible:outline-offset-2">
        Return home
      </a>
      <a href={`${base}/search`}
         class="inline-flex items-center border border-brand-muted/50 font-bold uppercase
                text-sm px-6 py-3 rounded hover:bg-surface-shaded transition
                focus-visible:outline focus-visible:outline-2
                focus-visible:outline-brand-primary focus-visible:outline-offset-2">
        Search the site
      </a>
    </div>

    <nav aria-label="Site sections" class="mt-14">
      <h2 class="text-sm font-bold uppercase tracking-wider text-brand-ink/60">
        Or jump to a section
      </h2>
      <ul class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {sections.map((s) => (
          <li>
            <a href={s.href}
               class="block rounded border border-brand-muted/40 px-4 py-3 text-sm font-bold
                      text-brand-primary hover:bg-surface-shaded hover:shadow-elev1 transition
                      focus-visible:outline focus-visible:outline-2
                      focus-visible:outline-brand-primary focus-visible:outline-offset-2">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </section>
</BaseLayout>

<style>
  /* Live fallback host starts hidden; the inline detect script flips
     <html data-nf-state> BEFORE paint, so there's no 404 flash. No-JS and
     genuine 404s keep the .nf-fallback baseline (and the 404 HTTP status). */
  .nf-live { display: none; }
  .nf-shell { display: none; }
  :root[data-nf-state="checking"] .nf-fallback,
  :root[data-nf-state="rendered"] .nf-fallback { display: none; }
  :root[data-nf-state="checking"] .nf-live,
  :root[data-nf-state="rendered"] .nf-live { display: block; }
  :root[data-nf-state="rendered"] .nf-loading { display: none; }
  :root[data-nf-state="rendered"] .nf-shell { display: block; }
</style>
```

- [ ] **Step 2: Type-check + build**

Run: `npm run check && npx astro build`
Expected: PASS — 0 type errors; `dist/404.html` emitted containing the inline detect script, the `.nf-live` host, the `.nf-fallback` section, and the `[data-nf-state]` styles.

- [ ] **Step 3: Sanity-check the built 404**

Run: `grep -c "data-nf-state\|__nf\|nf-live\|nf-fallback" dist/404.html`
Expected: a non-zero count (the host markup + state hooks are present in the built file).

- [ ] **Step 4: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat(404): live-render host for not-yet-built news detail slugs"
```

---

## Task 8: End-to-end verification, CHANGELOG, and backstop docs

**Files:**
- Modify: `CHANGELOG.md`
- (Docs only) `docs/superpowers/specs/2026-06-05-live-fallback-render-design.md` already documents backstop A.

- [ ] **Step 1: Full unit suite + type check + production build**

Run: `npm test && npm run check && npm run build`
Expected: all tests PASS (incl. `detect`, `renderTags`, `bootstrapEffect`); 0 type errors; the full build (`fetch` → `astro build` → `pagefind`) completes and emits `dist/404.html` + `dist/news/<slug>/index.html`.

- [ ] **Step 2: Browser verification on a deploy preview (the author loop)**

Push the branch and open the Netlify branch-deploy preview (or serve the built `dist/` with `npm run preview`). Using the `viewcap` + `axecap`/`contrastcap` MCP tools, verify on the **deploy/preview, not `astro dev`** (dev ships unminified JS + the Astro toolbar → unrepresentative; checklist lessons #7/#21):

  1. **Existing article (parity + refresh):** open a built `/news/<existing-slug>`. It looks identical to before. Edit that article's body in Strapi, return to the tab → the body (and tags) refresh on focus (no rebuild).
  2. **Unbuilt article (the fix):** with an article that exists in Strapi but is newer than the last build (publish a throwaway if needed — owner step), open `/news/<that-slug>`. Expected: brief "Loading…" → the article renders (title, posted date, summary, markdown body, tags). `document`-visible content matches what a rebuild would produce. (HTTP status is 404 — expected and acceptable.)
  3. **Genuine 404:** open `/news/zzz-does-not-exist`. Expected: brief "checking" → reverts to the normal 404 UI (Return home / Search / section grid). A non-`/news` path (e.g. `/totally-bogus`) shows the 404 UI immediately (no flash).
  4. **a11y:** run axe on the rendered fallback state → **0** AA violations; confirm one polite "Article updated" announcement on the paint and no layout shift (fade-in only).

Record the results (screenshots + axe summary) in the PR / branch notes.

- [ ] **Step 3: Update the CHANGELOG**

Add an entry at the top of `CHANGELOG.md` (match the existing entry style; per the changelog-discipline convention):

```markdown
## [Unreleased]

### Added
- **Live fallback render for not-yet-built news articles.** A news article
  published to Strapi after the last build now renders client-side on the 404
  host (`404.astro`) via the existing `liveEntry` island in a new bootstrap
  mode, instead of returning a dead 404 until the next rebuild — so authors can
  review and tweak new posts immediately. Genuine 404s are unchanged (normal
  404 UI, 404 status). Tags now also refresh live on existing detail pages.
  New: `src/lib/live/fallback/detect.ts`, `src/lib/live/behavior/bootstrap.ts`,
  `src/components/NewsDetailShell.astro`. No CSP/header change (the Strapi
  origin was already in `connect-src`).
```

- [ ] **Step 4: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: changelog for live fallback render of new news articles"
```

- [ ] **Step 5: Backstop A — record the owner steps (no code)**

The fallback is the pre-rebuild bridge; the rebuilt static page (SEO, JSON-LD, Pagefind, no-JS) is authoritative. To shrink the window and remove the manual rebuild, the site owner (not this plan) configures:
  1. A **Netlify build hook** (Site config → Build & deploy → Build hooks); the URL goes in Netlify/env, never in code.
  2. A **Strapi webhook** on news create/update/publish that POSTs that hook URL.

This is already captured in the spec's "Backstop A" section; no repository change is required. (Optional later: a small debounced/secret-guarded function like the flagship's purge function.)

- [ ] **Step 6 (optional): Append a checklist lesson**

If maintaining the migration playbook, add a short entry to `docs/astro-conversion-checklist-v8.1.md` under the islands section: *"Model 2's blind spot — a NEW detail slug has no page to hydrate; host a `liveEntry` bootstrap render on `404.astro` (status stays 404; pairs with a publish→build-hook backstop)."* Commit separately if added.

---

## Self-Review

**Spec coverage (8 acceptance criteria):**
- AC1 (new article renders, proxied + raw host) → Tasks 1 (detect both paths), 6 (shell), 7 (host); verified Task 8.2. ✔
- AC2 (edit → focus → refresh) → existing `onVisible` focus-refetch + Task 4 bootstrap; verified Task 8.2.1. ✔
- AC3 (bad slug → 404 UI at 404 status) → Tasks 3 (`miss`), 7 (`onMiss` → default, + 8s safety net); verified Task 8.2.3. ✔
- AC4 (existing pages unchanged + tags refresh) → Tasks 5 (tags), 6 (parity); verified Task 8.2.1 + 6.4. ✔
- AC5 (axe AA = 0, invariants) → inherited from the live layer; verified Task 8.2.4. ✔
- AC6 (vitest + build green) → Tasks 1–3 tests; Task 8.1. ✔
- AC7 (no CSP change) → confirmed in File Structure (CSP already allows inline + Strapi `connect-src`); re-verified Task 8.2. ✔
- AC8 (backstop owner steps) → Task 8.5. ✔

**Placeholder scan:** No TBD/TODO; every code step shows complete code; every run step shows the command + expected output. ✔

**Type consistency:** `detectSurface(pathname, base, surfaces?) → FallbackMatch|null`; `FALLBACK_SURFACES: FallbackSurface[]`; `renderTags(tags, ctx) → string`; `bootstrapEffect(bootstrap, rendered, outcome) → 'hit'|'miss'|'none'`; `liveEntry` opts `{surface, slug, sig, bootstrap?, onHit?, onMiss?}` with `_rendered: boolean`; `applyNewsDetail(root, view, ctx)`; `NewsDetailShell` `Props {item?: News|null}`; client globals `window.__nf = {surface, slug}` + `window.__nfState(state)`; CSS states `default`/`checking`/`rendered`. Names align across all tasks. ✔
