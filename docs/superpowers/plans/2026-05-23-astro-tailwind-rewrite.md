# Astro/Tailwind Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Vue 2 + Vuetify 2 build of the ARI site with a static Astro 5 + Tailwind 4 + Alpine.js build, on the `astro-rewrite` branch, with visual parity and 100/100 a11y.

**Architecture:** Pure SSG. One Strapi GraphQL fetch at build, content lands in a JSON, Astro reads it via Zod-typed content collections and generates static HTML per route. Tailwind 4 (CSS-first `@theme` tokens) via `@tailwindcss/vite`. Alpine.js + `@alpinejs/focus` handle the few interactive bits (drawer, dropdown menus, listing tables, the Illinois county map). Pagefind crawls the built HTML for search. Base path `/adultredeploy/` preserved.

**Tech Stack:** Astro 5, Tailwind CSS 4, Alpine.js 3, Pagefind, markdown-it, xss, graphql-request, zod, vitest, Netlify.

**Spec:** `docs/superpowers/specs/2026-05-23-astro-tailwind-rewrite-design.md`

**Working dir:** `/Volumes/satechi/webdev/adult-redeploy-client-next`. Currently on branch `astro-rewrite` with Vue source still present.

---

## Phase 0 — Branch cleanup

### Task 0.1: Delete every Vue/Vuetify/Vue-CLI artifact

**Files:**
- Delete: `src/`, `public/`, `dist/`, `vue.config.js`, `babel.config.js`, `postcss.config.js`, `jest.config.js`, `buildSearchIndex.js`, `buildSitemap.js`, `buildFilemap.js`, `buildConfig.js`, `generateBuildInfo.js`, `healthcheck.js`, `axe-audit.mjs`, `axe-audit-report.json`, `.audit/`, `.browserslistrc`, `test-*.js`, `testxss.js`, `tests/`, `.eslintrc.js`, `package-lock.json`, `node_modules/`
- Rewrite: `package.json`, `README.md`, `netlify.toml`, `.env.sample`
- Update: `.gitignore` (add `src/content/_data.json`, `node_modules/`, `dist/`, `.env`)

- [ ] **Step 1: Confirm clean working tree**

```bash
git status
git rev-parse --abbrev-ref HEAD  # expect: astro-rewrite
```

- [ ] **Step 2: Delete top-level Vue artifacts**

```bash
git rm -r src/ public/ vue.config.js babel.config.js postcss.config.js \
  jest.config.js buildSearchIndex.js buildSitemap.js buildFilemap.js \
  buildConfig.js generateBuildInfo.js healthcheck.js axe-audit.mjs \
  axe-audit-report.json .audit .browserslistrc testxss.js tests/ \
  .eslintrc.js package-lock.json
git rm -f test-cache.js test-content-service.js test-external.js test-gata.js
rm -rf dist/ node_modules/
```

- [ ] **Step 3: Replace package.json with a fresh Astro shell**

Overwrite `package.json`:

```json
{
  "name": "adult-redeploy-client-next",
  "version": "2.0.0-dev",
  "description": "Adult Redeploy Illinois — Astro/Tailwind rewrite",
  "private": true,
  "type": "module",
  "scripts": {
    "fetch": "node scripts/fetch-content.mjs",
    "dev": "npm run fetch && astro dev",
    "build": "npm run fetch && astro build && pagefind --site dist/adultredeploy",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "audit:axe": "node scripts/audit-axe.mjs",
    "audit:lh":  "node scripts/audit-lighthouse.mjs",
    "audit": "npm run audit:axe && npm run audit:lh"
  },
  "author": {
    "name": "Illinois Criminal Justice Information Authority",
    "email": "christopher.schweda@illinois.gov"
  },
  "license": "MIT",
  "homepage": "https://icjia.illinois.gov/adultredeploy"
}
```

(Dependencies added per phase in subsequent tasks — start empty so each phase explicitly declares what it needs.)

- [ ] **Step 4: Replace README with a stub describing the rewrite branch**

Overwrite `README.md`:

```markdown
# Adult Redeploy Illinois — site

Astro + Tailwind + Alpine.js static rebuild of the ARI site. Replaces the
prior Vue 2 + Vuetify 2 build.

- Branch: `astro-rewrite` (work in progress; not yet merged to `master`)
- Design spec: `docs/superpowers/specs/2026-05-23-astro-tailwind-rewrite-design.md`
- Implementation plan: `docs/superpowers/plans/2026-05-23-astro-tailwind-rewrite.md`

## Local dev

    nvm use            # Node 22
    cp .env.sample .env
    npm install
    npm run dev        # fetches Strapi, then astro dev

## Build

    npm run build      # fetches Strapi, builds, indexes with Pagefind

Output: `dist/`

## Deployment

Netlify deploys this branch as a preview. Production stays on `master`
(current Vue build) until the cutover described in the spec.
```

- [ ] **Step 5: Replace netlify.toml with the Astro version**

Overwrite `netlify.toml`:

```toml
[build]
  Command = "npm run build"
  Publish = "dist"

[build.environment]
  NODE_VERSION = "22"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://plausible.icjia.cloud; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://ari.icjia-api.cloud https://image.icjia.cloud https://archive.icjia.cloud https://plausible.icjia.cloud; frame-ancestors 'self'"
```

- [ ] **Step 6: Refresh .env.sample**

Overwrite `.env.sample`:

```
# Strapi GraphQL endpoint (used by scripts/fetch-content.mjs at build time)
STRAPI_ENDPOINT=https://ari.icjia-api.cloud/graphql

# Plausible analytics domain (used in BaseLayout's analytics tag)
PLAUSIBLE_DOMAIN=icjia.illinois.gov/adultredeploy
```

- [ ] **Step 7: Update .gitignore**

Replace existing `.gitignore` content with:

```
node_modules/
dist/
.env
.env.local
.astro/
src/content/_data.json
.DS_Store
*.log
```

- [ ] **Step 8: Verify no Vue artifacts remain (excluding .git/, node_modules/, package-lock.json)**

```bash
grep -rEi 'vue|vuetify|vue-cli' \
  --exclude-dir=.git --exclude-dir=node_modules \
  --exclude=package-lock.json --exclude-dir=docs . || echo "Clean"
```

Expected: `Clean`

- [ ] **Step 9: Commit the cleanup**

```bash
git add -A
git status --short
git commit -m "$(cat <<'EOF'
chore(astro-rewrite): remove all Vue/Vuetify/Vue-CLI artifacts

Phase 0 of the Astro/Tailwind rewrite. Deletes the entire Vue source
tree, build scripts, configs, and tests. Rewrites package.json,
README.md, netlify.toml, and .env.sample for the new stack.

Working tree is now Vue-free; subsequent phases scaffold Astro fresh.
EOF
)"
```

---

## Phase 1 — Astro scaffold + design tokens

### Task 1.1: Install Astro + Tailwind 4 + Alpine deps

**Files:**
- Modify: `package.json` (devDependencies, dependencies)

- [ ] **Step 1: Install runtime + dev deps in one shot**

```bash
npm install --save \
  astro@^5 \
  tailwindcss@^4 \
  @tailwindcss/vite@^4 \
  alpinejs@^3 \
  @alpinejs/focus@^3
npm install --save-dev \
  @astrojs/check \
  typescript \
  vitest \
  zod
```

- [ ] **Step 2: Verify versions**

```bash
node -e "const p=require('./package.json'); console.log(JSON.stringify(p.dependencies, null, 2))"
```

Expect each dep with a real version, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Astro 5, Tailwind 4, Alpine.js, vitest, zod"
```

### Task 1.2: Create astro.config.mjs with base path + Vite Tailwind plugin

**Files:**
- Create: `astro.config.mjs`

- [ ] **Step 1: Write the config**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://icjia.illinois.gov',
  base: '/adultredeploy',
  trailingSlash: 'never',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 2: Run `astro check` to confirm config parses**

```bash
npx astro check
```

Expect: no errors, may report 0 files to check.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "feat(astro): add astro.config.mjs with /adultredeploy base"
```

### Task 1.3: Create src/styles/global.css with Tailwind import + @theme tokens

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Write the stylesheet**

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* Brand palette — sampled from the current Vuetify site */
  --color-brand-primary:   #043e3f;
  --color-brand-secondary: #05797a;
  --color-brand-accent:    #B158C2;
  --color-brand-ink:       #222222;
  --color-brand-muted:     #aaaaaa;

  --color-surface:         #ffffff;
  --color-surface-subtle:  #fafafa;
  --color-surface-shaded:  #eeeeee;

  --font-sans:    "Lato", "Roboto", system-ui, sans-serif;
  --font-heading: "Roboto", "Lato", system-ui, sans-serif;

  --shadow-elev1: 0 1px 3px rgb(0 0 0 / 0.12),
                  0 1px 2px rgb(0 0 0 / 0.24);
  --shadow-elev3: 0 3px 6px rgb(0 0 0 / 0.16),
                  0 3px 6px rgb(0 0 0 / 0.23);
}

/* Visually-hidden utility (carried over from the Vue version) */
.visually-hidden {
  position: absolute !important;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* Print: hide navigation chrome */
@media print {
  .noprint { display: none !important; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(tailwind): add global.css with @theme brand tokens"
```

### Task 1.4: Create a hello-world index page that loads the stylesheet

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Write the page**

```astro
---
// src/pages/index.astro
import '../styles/global.css';
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>ARI | Adult Redeploy Illinois</title>
  </head>
  <body class="font-sans bg-surface-subtle text-brand-ink">
    <main class="max-w-4xl mx-auto p-8">
      <h1 class="text-4xl font-black text-brand-primary">
        Adult Redeploy Illinois — Astro rewrite in progress
      </h1>
      <p class="mt-4">Phase 1 scaffold is live.</p>
    </main>
  </body>
</html>
```

- [ ] **Step 2: Run dev server and confirm it loads**

```bash
npx astro dev --port 4321 &
sleep 5
curl -sf http://localhost:4321/adultredeploy/ | grep -q "Phase 1 scaffold is live" && echo "OK"
kill %1
```

Expect: `OK`. (If `curl` returns redirect, follow `/adultredeploy/` exactly — Astro's dev server respects `base`.)

- [ ] **Step 3: Run a production build to confirm it compiles**

```bash
npx astro build
ls dist/adultredeploy/index.html
```

Expect file exists.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add hello-world index page proving scaffold works"
```

### Task 1.5: Wire the static server to verify the prod build over /adultredeploy/

**Files:**
- Use existing: `/tmp/ari-audit-server.js` (still serves `dist/` at `/adultredeploy/`)

- [ ] **Step 1: Restart the audit server pointing at the new dist**

The server reads from `/Volumes/satechi/webdev/adult-redeploy-client-next/dist`. After `astro build` it has new content; no restart needed unless the process died.

```bash
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:4173/adultredeploy/
```

Expect: `200`.

- [ ] **Step 2: Confirm the new page is served**

```bash
curl -s http://localhost:4173/adultredeploy/ | grep -q "Phase 1 scaffold is live" && echo OK
```

Expect: `OK`. Phase 1 done.

---

## Phase 2 — Content pipeline

### Task 2.1: Install graphql-request and markdown-it / xss for build-time content processing

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
npm install --save graphql-request markdown-it markdown-it-attrs markdown-it-named-headers xss
npm install --save-dev @types/markdown-it
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add graphql-request, markdown-it, xss for build-time content"
```

### Task 2.2: Write the GraphQL query as a module

**Files:**
- Create: `scripts/strapi-query.mjs`

- [ ] **Step 1: Write the query module**

```js
// scripts/strapi-query.mjs
export const QUERY = /* GraphQL */ `{
  pages(where: { isPublished: true }) {
    slug title summary content searchMeta isPublished
    createdAt updatedAt
    section { title slug summary searchMeta }
    tags { name slug }
  }
  posts: posts(sort: "createdAt:desc", where: { isPublished: true }) {
    slug title summary content searchMeta isPublished publicationDate
    createdAt updatedAt
    tags { name slug }
  }
  meetings(sort: "scheduledDate:desc", where: { isPublished: true }) {
    slug title summary content searchMeta isPublished
    scheduledDate category createdAt updatedAt
    mediaMaterial { name url file { name url hash } summary }
    externalMediaMaterial { name url summary }
    meetingMaterial { name file { name url hash } summary }
    tags { name slug }
  }
  sites {
    id slug title summary content searchMeta siteType
    counties: countyEnums
  }
  biographies(where: { isPublished: true }) {
    slug firstName middleName lastName prefix suffix title
    membership category alphabetizeBy order content isPublished
    headshot { url name }
  }
  resources(sort: "publicationDate:desc", where: { isPublished: true }) {
    slug title summary content searchMeta category
    publicationDate createdAt updatedAt
    mediaMaterial { name url file { name url hash } summary }
    externalMediaMaterial { name url summary }
    tags { name slug }
  }
  sections(where: { isPublished: true }) {
    slug title summary searchMeta
    createdAt updatedAt
    pages { slug title summary displayNav addDivider isPublished }
  }
  tags { name slug searchMeta }
}`;
```

(Note: `countyEnums` is the field name to verify against the live Strapi schema; if it differs, adjust in Task 2.4 when the first fetch surfaces the mismatch.)

- [ ] **Step 2: Commit**

```bash
git add scripts/strapi-query.mjs
git commit -m "feat(content): add Strapi GraphQL query module"
```

### Task 2.3: Write scripts/fetch-content.mjs

**Files:**
- Create: `scripts/fetch-content.mjs`

- [ ] **Step 1: Write the script**

```js
// scripts/fetch-content.mjs
import { request } from 'graphql-request';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { QUERY } from './strapi-query.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src/content/_data.json');

const ENDPOINT = process.env.STRAPI_ENDPOINT
              ?? 'https://ari.icjia-api.cloud/graphql';

async function main() {
  console.log(`[fetch] querying ${ENDPOINT}`);
  const t0 = Date.now();
  let data;
  try {
    data = await request(ENDPOINT, QUERY);
  } catch (err) {
    console.error('[fetch] GraphQL request failed');
    console.error(err.message ?? err);
    process.exit(1);
  }

  // Normalize: prefer `news` over `posts` everywhere downstream.
  if (data.posts && !data.news) data.news = data.posts;
  delete data.posts;

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(data, null, 2));
  const sizeKB = ((await fs.stat(OUT)).size / 1024).toFixed(0);

  const counts = Object.fromEntries(
    Object.entries(data).map(([k, v]) =>
      [k, Array.isArray(v) ? v.length : 0]),
  );
  console.log(`[fetch] wrote ${OUT} (${sizeKB} KiB) in ${Date.now() - t0}ms`);
  console.log(`[fetch] counts: ${JSON.stringify(counts)}`);
}

main();
```

- [ ] **Step 2: Run it locally and verify**

```bash
cp .env.sample .env
node scripts/fetch-content.mjs
ls -lh src/content/_data.json
```

Expect: file written, counts logged. If Strapi field names differ, fix in `strapi-query.mjs` and retry.

- [ ] **Step 3: Commit**

```bash
git add scripts/fetch-content.mjs
git commit -m "feat(content): add fetch-content.mjs Strapi build-time loader"
```

### Task 2.4: Write the Zod schemas + Astro content collection config

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: Write the config**

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import data from './_data.json';

const tag = z.object({ name: z.string(), slug: z.string() });

const news = defineCollection({
  loader: () => (data.news ?? []).map((d: any) => ({
    id: d.slug, ...d,
  })),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    publicationDate: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    tags: z.array(tag).nullable().optional(),
    searchMeta: z.string().nullable().optional(),
  }),
});

const meetings = defineCollection({
  loader: () => (data.meetings ?? []).map((d: any) => ({
    id: d.slug, ...d,
  })),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    scheduledDate: z.string().nullable().optional(),
    category: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    mediaMaterial: z.array(z.any()).nullable().optional(),
    externalMediaMaterial: z.array(z.any()).nullable().optional(),
    meetingMaterial: z.array(z.any()).nullable().optional(),
    tags: z.array(tag).nullable().optional(),
  }),
});

const sites = defineCollection({
  loader: () => (data.sites ?? []).map((d: any) => ({
    id: d.slug, ...d,
  })),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    siteType: z.string().nullable().optional(),
    counties: z.array(z.string()).nullable().optional(),
  }),
});

const biographies = defineCollection({
  loader: () => (data.biographies ?? []).map((d: any) => ({
    id: d.slug, ...d,
  })),
  schema: z.object({
    slug: z.string(),
    firstName: z.string().nullable().optional(),
    middleName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    prefix: z.string().nullable().optional(),
    suffix: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    membership: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    alphabetizeBy: z.string().nullable().optional(),
    order: z.number().nullable().optional(),
    content: z.string().nullable().optional(),
    headshot: z.object({
      url: z.string(), name: z.string().nullable().optional(),
    }).nullable().optional(),
  }),
});

const resources = defineCollection({
  loader: () => (data.resources ?? []).map((d: any) => ({
    id: d.slug, ...d,
  })),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    category: z.string(),
    publicationDate: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    mediaMaterial: z.array(z.any()).nullable().optional(),
    externalMediaMaterial: z.array(z.any()).nullable().optional(),
    tags: z.array(tag).nullable().optional(),
  }),
});

const pages = defineCollection({
  loader: () => (data.pages ?? []).map((d: any) => ({
    id: `${d.section?.slug ?? 'orphan'}/${d.slug}`, ...d,
  })),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    section: z.object({
      slug: z.string(), title: z.string(),
      summary: z.string().nullable().optional(),
    }).nullable().optional(),
    tags: z.array(tag).nullable().optional(),
  }),
});

const sections = defineCollection({
  loader: () => (data.sections ?? []).map((d: any) => ({
    id: d.slug, ...d,
  })),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    pages: z.array(z.object({
      slug: z.string(), title: z.string(),
      summary: z.string().nullable().optional(),
      displayNav: z.boolean().nullable().optional(),
      addDivider: z.boolean().nullable().optional(),
    })).nullable().optional(),
  }),
});

const tags = defineCollection({
  loader: () => (data.tags ?? []).map((d: any) => ({
    id: d.slug, ...d,
  })),
  schema: z.object({
    name: z.string(), slug: z.string(),
    searchMeta: z.string().nullable().optional(),
  }),
});

export const collections = {
  news, meetings, sites, biographies, resources, pages, sections, tags,
};
```

- [ ] **Step 2: Run astro check to confirm schemas validate against the live data**

```bash
npx astro check
```

Expect: 0 errors. If a Zod validation fails, loosen the field in `config.ts` (e.g., `.nullable()` or `.optional()`) and re-run.

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat(content): add Zod-typed Astro content collections"
```

### Task 2.5: Vitest smoke test for fetch-content (mocked GraphQL)

**Files:**
- Create: `scripts/fetch-content.test.mjs`
- Create: `vitest.config.ts`

- [ ] **Step 1: Add vitest config**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['scripts/**/*.test.mjs', 'src/**/*.test.{ts,js,mjs}'],
    environment: 'node',
  },
});
```

- [ ] **Step 2: Write the test**

```js
// scripts/fetch-content.test.mjs
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';

vi.mock('graphql-request', () => ({
  request: vi.fn(async () => ({
    pages: [], posts: [{ slug: 'x', title: 'X',
      createdAt: '2026-01-01', updatedAt: '2026-01-01' }],
    meetings: [], sites: [], biographies: [], resources: [],
    sections: [], tags: [],
  })),
}));

describe('fetch-content', () => {
  beforeEach(async () => {
    process.env.STRAPI_ENDPOINT = 'https://mocked/graphql';
    const outDir = path.resolve('src/content');
    await fs.mkdir(outDir, { recursive: true });
    await fs.rm(path.join(outDir, '_data.json'), { force: true });
  });

  it('writes _data.json with posts mapped to news', async () => {
    await import('./fetch-content.mjs');
    const raw = await fs.readFile('src/content/_data.json', 'utf8');
    const data = JSON.parse(raw);
    expect(data.news).toBeDefined();
    expect(data.posts).toBeUndefined();
    expect(data.news[0].slug).toBe('x');
  });
});
```

- [ ] **Step 3: Run vitest**

```bash
npx vitest run scripts/fetch-content.test.mjs
```

Expect: 1 pass.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts scripts/fetch-content.test.mjs
git commit -m "test(content): smoke test for fetch-content posts→news mapping"
```

### Task 2.6: Add lib/ helpers — markdown, dates, slug

**Files:**
- Create: `src/lib/markdown.ts`
- Create: `src/lib/dates.ts`
- Create: `src/lib/markdown.test.ts`

- [ ] **Step 1: Write markdown helper**

```ts
// src/lib/markdown.ts
import MarkdownIt from 'markdown-it';
import xss from 'xss';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
  langPrefix: 'language-',
});

const xssOpts = {
  whiteList: undefined, // use default
  stripIgnoreTag: true,
};

export function renderMarkdown(src: string | null | undefined): string {
  if (!src) return '';
  const html = md.render(src);
  return xss(html);
}
```

- [ ] **Step 2: Write date helper**

```ts
// src/lib/dates.ts
const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function isoDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}
```

- [ ] **Step 3: Write markdown test**

```ts
// src/lib/markdown.test.ts
import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown.js';

describe('renderMarkdown', () => {
  it('renders headings', () => {
    expect(renderMarkdown('# hi')).toContain('<h1>hi</h1>');
  });
  it('renders links', () => {
    expect(renderMarkdown('[a](https://x)')).toContain(
      '<a href="https://x">a</a>');
  });
  it('strips dangerous tags', () => {
    expect(renderMarkdown('<script>alert(1)</script>'))
      .not.toContain('<script>');
  });
  it('handles null/empty', () => {
    expect(renderMarkdown(null)).toBe('');
    expect(renderMarkdown(undefined)).toBe('');
    expect(renderMarkdown('')).toBe('');
  });
});
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/lib/markdown.test.ts
```

Expect: 4 pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/markdown.ts src/lib/dates.ts src/lib/markdown.test.ts
git commit -m "feat(lib): add markdown + date helpers with XSS sanitization"
```

---

## Phase 3 — Layout shell

### Task 3.1: BaseLayout.astro

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Write the layout**

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
import AppHeader from '../components/AppHeader.astro';
import AppFooter from '../components/AppFooter.astro';
import DrawerNav from '../components/alpine/DrawerNav.astro';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}
const { title, description, ogImage } = Astro.props;
const canonical = `${Astro.site}${Astro.url.pathname}`.replace(/\/$/, '');
const plausibleDomain = import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN
  ?? 'icjia.illinois.gov/adultredeploy';
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>ARI | {title}</title>
    {description && <meta name="description" content={description} />}
    <link rel="canonical" href={canonical} />
    <meta name="robots" content="index, follow" />
    {ogImage && <meta property="og:image" content={ogImage} />}
    <link rel="icon" href={`${Astro.url.host ? '' : ''}/adultredeploy/favicon.ico`} />
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Lato:wght@300;400;700;900&display=swap" />
    <script defer data-domain={plausibleDomain}
            src="https://plausible.icjia.cloud/js/script.file-downloads.outbound-links.js"></script>
  </head>
  <body class="font-sans bg-surface-subtle text-brand-ink min-h-screen flex flex-col">
    <a href="#content-top"
       class="visually-hidden focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-brand-primary focus:text-white focus:px-4 focus:py-2 focus:rounded">
      Skip to main content
    </a>
    <AppHeader />
    <DrawerNav />
    <main id="content-top" tabindex="-1" class="flex-1 outline-none">
      <slot />
    </main>
    <AppFooter />
    <script>
      import Alpine from 'alpinejs';
      import focus from '@alpinejs/focus';
      Alpine.plugin(focus);
      Alpine.store('drawer', { open: false });
      Alpine.start();
    </script>
  </body>
</html>
```

- [ ] **Step 2: Commit (will fail compile until AppHeader/DrawerNav/AppFooter exist — that's fine, we add them next)**

Don't commit yet. The remaining tasks of Phase 3 build out the imports.

### Task 3.2: AppHeader.astro

**Files:**
- Create: `src/components/AppHeader.astro`

- [ ] **Step 1: Fetch sections from Strapi (for nav menu) — already in _data.json**

The header reads `sections` synchronously from the content collection.

- [ ] **Step 2: Write the header**

```astro
---
// src/components/AppHeader.astro
import { getCollection } from 'astro:content';
import DropdownMenu from './alpine/DropdownMenu.astro';

const sectionEntries = await getCollection('sections');
const sections = sectionEntries
  .map(e => e.data)
  .filter(s => (s.pages ?? []).some(p => p.displayNav));
---
<header class="noprint sticky top-0 z-30 bg-surface shadow-elev1 h-[90px]">
  <nav aria-label="Main navigation"
       class="max-w-7xl mx-auto h-full flex items-center gap-3 px-4">
    <button type="button"
            class="md:hidden p-2 -ml-2"
            x-data
            @click="$store.drawer.open = true"
            :aria-expanded="$store.drawer.open"
            aria-controls="nav-drawer">
      <span class="sr-only">Open navigation menu</span>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" aria-hidden="true">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
    <a href="/adultredeploy/" class="flex items-center gap-3 hover:opacity-80">
      <img src="/adultredeploy/img/icjia-logo.png"
           alt="Illinois Criminal Justice Information Authority"
           width="90" height="63" class="w-[50px] md:w-[90px] h-auto" />
      <span class="font-heading font-black text-lg md:text-xl">
        ADULT REDEPLOY ILLINOIS
      </span>
    </a>
    <div class="flex-1" />
    <ul class="hidden md:flex items-center gap-1">
      {sections.map(s => (
        <li>
          <DropdownMenu label={s.title} basePath={s.slug}
                        items={s.pages?.filter(p => p.displayNav) ?? []} />
        </li>
      ))}
      <li>
        <a href="/adultredeploy/search"
           class="p-2 rounded hover:bg-surface-shaded"
           aria-label="Search">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </a>
      </li>
    </ul>
  </nav>
</header>
```

- [ ] **Step 3: Commit (along with the rest of layout shell — defer)**

### Task 3.3: DropdownMenu.astro (Alpine)

**Files:**
- Create: `src/components/alpine/DropdownMenu.astro`

- [ ] **Step 1: Write the dropdown**

```astro
---
// src/components/alpine/DropdownMenu.astro
interface Item {
  slug: string;
  title: string;
  addDivider?: boolean | null;
}
interface Props { label: string; basePath: string; items: Item[]; }
const { label, basePath, items } = Astro.props;
---
<div x-data="{ open: false }" class="relative">
  <button type="button" x-ref="btn"
          class="px-3 h-12 font-bold text-sm hover:bg-surface-shaded rounded"
          @click="open = !open"
          :aria-expanded="open"
          aria-haspopup="true">
    {label}
    <svg class="inline-block ml-1 -mt-0.5" width="14" height="14"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  </button>
  <ul x-show="open"
      x-transition.opacity
      @click.outside="open = false"
      @keydown.escape.window="if (open) { open = false; $refs.btn.focus(); }"
      role="menu"
      class="absolute right-0 mt-1 min-w-[220px] bg-surface
             shadow-elev3 rounded py-2 z-40"
      style="display: none">
    {items.map(item => (
      <li role="none">
        {item.addDivider && (
          <hr class="my-1 border-brand-muted/30" />
        )}
        <a role="menuitem"
           href={`/adultredeploy/${basePath}/${item.slug}`}
           class="block px-4 py-2 text-sm font-bold hover:bg-surface-shaded
                  focus:bg-surface-shaded focus:outline-none">
          {item.title}
        </a>
      </li>
    ))}
  </ul>
</div>
```

### Task 3.4: DrawerNav.astro (Alpine)

**Files:**
- Create: `src/components/alpine/DrawerNav.astro`

- [ ] **Step 1: Write the drawer**

```astro
---
// src/components/alpine/DrawerNav.astro
import { getCollection } from 'astro:content';

const sectionEntries = await getCollection('sections');
const sections = sectionEntries
  .map(e => e.data)
  .filter(s => (s.pages ?? []).some(p => p.displayNav));
---
<div id="nav-drawer"
     role="dialog"
     aria-modal="true"
     aria-label="Site navigation"
     class="noprint fixed inset-0 z-40"
     x-data
     x-show="$store.drawer.open"
     x-transition.opacity
     x-trap.noscroll.inert="$store.drawer.open"
     @keydown.escape.window="$store.drawer.open = false"
     style="display: none">
  <div class="absolute inset-0 bg-black/50"
       @click="$store.drawer.open = false"></div>
  <nav class="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-surface
              shadow-elev3 overflow-y-auto p-4 flex flex-col gap-2">
    <div class="flex items-center justify-between mb-4">
      <span class="font-heading font-black text-lg">
        ADULT REDEPLOY ILLINOIS
      </span>
      <button type="button"
              class="p-2 -mr-2"
              @click="$store.drawer.open = false">
        <span class="sr-only">Close navigation</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <a href="/adultredeploy/" class="px-3 py-2 font-bold hover:bg-surface-shaded rounded">Home</a>
    {sections.map(s => (
      <details class="group">
        <summary class="px-3 py-2 font-bold hover:bg-surface-shaded rounded cursor-pointer">
          {s.title}
        </summary>
        <ul class="ml-4 mt-1 flex flex-col gap-1">
          {(s.pages ?? []).filter(p => p.displayNav).map(p => (
            <li>
              <a href={`/adultredeploy/${s.slug}/${p.slug}`}
                 class="block px-3 py-1.5 text-sm hover:bg-surface-shaded rounded">
                {p.title}
              </a>
            </li>
          ))}
        </ul>
      </details>
    ))}
    <a href="/adultredeploy/search"
       class="mt-2 px-3 py-2 font-bold hover:bg-surface-shaded rounded">
      Search
    </a>
  </nav>
</div>
```

### Task 3.5: AppFooter.astro

**Files:**
- Create: `src/components/AppFooter.astro`

- [ ] **Step 1: Write the footer**

```astro
---
// src/components/AppFooter.astro
const year = new Date().getFullYear();
---
<footer class="noprint bg-brand-primary text-white mt-12 print:hidden"
        aria-label="Site footer">
  <div class="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">
    <div>
      <h2 class="font-heading font-black text-lg mb-3">
        Adult Redeploy Illinois
      </h2>
      <p class="text-sm leading-relaxed">
        ARI provides financial incentives to local jurisdictions for
        community-based alternatives to incarceration.
      </p>
    </div>
    <div>
      <h2 class="font-heading font-black text-lg mb-3">Contact</h2>
      <p class="text-sm">
        Illinois Criminal Justice Information Authority<br/>
        60 E. Van Buren St., Suite 650<br/>
        Chicago, IL 60605
      </p>
    </div>
    <div>
      <h2 class="font-heading font-black text-lg mb-3">Resources</h2>
      <ul class="text-sm space-y-1">
        <li>
          <a href="/adultredeploy/about/contact"
             class="footer-link underline hover:no-underline">Contact us</a>
        </li>
        <li>
          <a href="/adultredeploy/news"
             class="footer-link underline hover:no-underline">News</a>
        </li>
        <li>
          <a href="https://icjia.illinois.gov"
             class="footer-link underline hover:no-underline">ICJIA home</a>
        </li>
      </ul>
    </div>
  </div>
  <div class="border-t border-white/20">
    <div class="max-w-7xl mx-auto px-6 py-4 text-xs flex flex-wrap gap-4">
      <span>© {year} State of Illinois</span>
      <span>•</span>
      <a href="https://www.illinois.gov/about/accessibility"
         class="underline hover:no-underline">Accessibility</a>
    </div>
  </div>
</footer>
```

### Task 3.6: Breadcrumb component

**Files:**
- Create: `src/components/ui/Breadcrumb.astro`

- [ ] **Step 1: Write the component**

```astro
---
// src/components/ui/Breadcrumb.astro
interface Crumb { label: string; href?: string; }
interface Props { items: Crumb[]; }
const { items } = Astro.props;
---
<nav aria-label="Breadcrumb" class="text-sm">
  <ol class="flex flex-wrap items-center gap-1">
    {items.map((c, i) => (
      <li class="flex items-center gap-1">
        {i > 0 && <span aria-hidden="true" class="text-brand-muted">/</span>}
        {c.href && i < items.length - 1 ? (
          <a href={c.href}
             class="text-brand-primary underline hover:no-underline">
            {c.label}
          </a>
        ) : (
          <span aria-current={i === items.length - 1 ? 'page' : undefined}>
            {c.label}
          </span>
        )}
      </li>
    ))}
  </ol>
</nav>
```

### Task 3.7: Card, Button, Tag UI components

**Files:**
- Create: `src/components/ui/Card.astro`
- Create: `src/components/ui/Button.astro`
- Create: `src/components/ui/Tag.astro`

- [ ] **Step 1: Write Card**

```astro
---
// src/components/ui/Card.astro
interface Props {
  variant?: 'elevated' | 'outlined';
  href?: string;
  class?: string;
}
const { variant = 'elevated', href, class: cls = '' } = Astro.props;
const base = 'block bg-surface rounded p-4 ' +
             (variant === 'outlined'
               ? 'border border-brand-muted/40'
               : 'shadow-elev1');
const hoverable = href
  ? ' hover:shadow-elev3 focus-visible:outline focus-visible:outline-2 ' +
    'focus-visible:outline-brand-primary focus-visible:outline-offset-2'
  : '';
const Tag = href ? 'a' : 'div';
---
<Tag href={href} class={`${base}${hoverable} ${cls}`}>
  <slot />
</Tag>
```

- [ ] **Step 2: Write Button**

```astro
---
// src/components/ui/Button.astro
interface Props {
  variant?: 'solid' | 'outlined' | 'text';
  href?: string;
  type?: 'button' | 'submit';
  class?: string;
  ariaLabel?: string;
}
const {
  variant = 'solid', href, type = 'button',
  class: cls = '', ariaLabel,
} = Astro.props;
const styles = {
  solid:    'bg-brand-primary text-white hover:bg-brand-primary/90',
  outlined: 'border border-brand-primary text-brand-primary hover:bg-brand-primary/10',
  text:     'text-brand-primary hover:bg-brand-primary/10',
}[variant];
const base = 'inline-flex items-center gap-2 px-4 py-2 rounded font-bold ' +
             'text-sm uppercase ' +
             'focus-visible:outline focus-visible:outline-2 ' +
             'focus-visible:outline-brand-primary focus-visible:outline-offset-2 ' +
             styles;
const Tag = href ? 'a' : 'button';
---
<Tag href={href} type={!href ? type : undefined}
     aria-label={ariaLabel} class={`${base} ${cls}`}>
  <slot />
</Tag>
```

- [ ] **Step 3: Write Tag**

```astro
---
// src/components/ui/Tag.astro
interface Props { label: string; href?: string; }
const { label, href } = Astro.props;
const base = 'inline-block px-2 py-0.5 text-xs font-bold rounded ' +
             'bg-brand-secondary text-white';
---
{href
  ? <a href={href} class={`${base} hover:bg-brand-secondary/90`}>{label}</a>
  : <span class={base}>{label}</span>}
```

### Task 3.8: Markdown component for build-time rendered Strapi content

**Files:**
- Create: `src/components/Markdown.astro`

- [ ] **Step 1: Write it**

```astro
---
// src/components/Markdown.astro
import { renderMarkdown } from '../lib/markdown.ts';
interface Props { content?: string | null; class?: string; }
const { content, class: cls = '' } = Astro.props;
const html = renderMarkdown(content ?? '');
---
<div class={`prose max-w-none ${cls}`} set:html={html} />
```

### Task 3.9: Add public/ assets (logo, favicon) from current site

**Files:**
- Copy in: `public/favicon.ico`, `public/img/icjia-logo.png`, `public/img/state-seal-default.png`, `public/robots.txt`

- [ ] **Step 1: Restore the static assets we need**

Pull them out of the previous master state since they were deleted in Phase 0. The git history has them on `master`.

```bash
mkdir -p public/img
git show master:public/favicon.ico > public/favicon.ico
git show master:public/img/icjia-logo.png > public/img/icjia-logo.png
git show master:public/robots.txt > public/robots.txt
```

If any of those paths differ on master (e.g., logo lives under `src/assets/`), `git log master -- '**/icjia-logo.png'` finds the right path; restore with the same `git show` pattern.

### Task 3.10: Build + visually verify the shell

**Files:**
- (no new files; verifies prior tasks)

- [ ] **Step 1: Replace index.astro with a layout-using page**

Overwrite `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Adult Redeploy Illinois"
            description="Adult Redeploy Illinois provides financial incentives to local jurisdictions for community-based alternatives to incarceration.">
  <div class="max-w-4xl mx-auto p-8">
    <h1 class="text-page-title text-brand-primary">
      Adult Redeploy Illinois
    </h1>
    <p class="mt-4">Layout shell live. Phase 3 complete.</p>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Build**

```bash
npm run fetch
npx astro build
```

Expect: clean build, no errors.

- [ ] **Step 3: Verify on the audit server**

```bash
curl -sf http://localhost:4173/adultredeploy/ | grep -q "Phase 3 complete" && echo OK
```

- [ ] **Step 4: Run axecap on the shell page**

(Use the lightcap/axecap MCP tools — same as the May 2026 audit.)

Run `axecap audit_url http://localhost:4173/adultredeploy/ desktop aa main`.
Expect: 0 violations.

- [ ] **Step 5: Commit Phase 3 in one batch**

```bash
git add src/layouts/ src/components/ src/pages/index.astro public/
git commit -m "feat(layout): add BaseLayout, header, drawer, footer, breadcrumb, UI primitives"
```

---

## Phase 4 — Static pages

### Task 4.1: Home page

**Files:**
- Modify: `src/pages/index.astro` (replace shell)
- Create: `src/components/HomeBoxes.astro`
- Create: `src/components/HomeMeetings.astro`
- Create: `src/components/HomeNews.astro`

- [ ] **Step 1: HomeBoxes** — 3 navigation tiles (Programs / Grants / Resources)

```astro
---
// src/components/HomeBoxes.astro
const boxes = [
  { href: '/adultredeploy/programs', title: 'Programs', icon: 'users',
    text: 'ARI is based on local control and design because communities know best how to protect public safety and reduce recidivism.' },
  { href: '/adultredeploy/grants',   title: 'Grants',   icon: 'dollar',
    text: 'ARI uses "performance incentive funding" to support local investment in more effective alternatives to incarceration.' },
  { href: '/adultredeploy/resources', title: 'Resources', icon: 'cogs',
    text: 'ARI provides training and technical assistance, collects and analyzes data, and fosters a statewide learning community.' },
];
---
<div class="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto px-6 -mt-8 relative z-10">
  {boxes.map(b => (
    <a href={b.href}
       class="block bg-surface shadow-elev3 rounded-lg p-6 text-center
              hover:shadow-elev1 transition
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-brand-primary focus-visible:outline-offset-2">
      <h2 class="font-heading font-black text-2xl text-brand-primary mb-2">
        {b.title}
      </h2>
      <p class="text-sm leading-relaxed">{b.text}</p>
    </a>
  ))}
</div>
```

- [ ] **Step 2: HomeMeetings** — list upcoming meetings (scheduledDate > today)

```astro
---
// src/components/HomeMeetings.astro
import { getCollection } from 'astro:content';
import { formatDate } from '../lib/dates.ts';

const meetingEntries = await getCollection('meetings');
const today = new Date().toISOString();
const upcoming = meetingEntries
  .map(e => e.data)
  .filter(m => m.scheduledDate && m.scheduledDate > today)
  .sort((a, b) => (a.scheduledDate! < b.scheduledDate! ? -1 : 1))
  .slice(0, 4);

// Map category enum to URL slug
const catSlug: Record<string,string> = {
  adHoc: 'ad-hoc', outreach: 'outreach', performance: 'performance',
  regular: 'regular-oversight', siteSelection: 'site-selection',
};
---
<section>
  <h2 class="text-page-title">
    <a href="/adultredeploy/about/meetings"
       class="text-brand-ink hover:text-brand-muted underline-offset-4 hover:underline">
      UPCOMING MEETINGS
    </a>
  </h2>
  {upcoming.length === 0 ? (
    <p class="mt-6 text-center"><em>No meetings scheduled.</em></p>
  ) : (
    <ul class="mt-6 space-y-4">
      {upcoming.map(m => (
        <li>
          <a href={`/adultredeploy/about/meetings/${catSlug[m.category] ?? m.category}/${m.slug}`}
             class="block border border-brand-muted/40 rounded p-4
                    hover:shadow-elev1
                    focus-visible:outline focus-visible:outline-2
                    focus-visible:outline-brand-primary focus-visible:outline-offset-2">
            <div class="text-xs font-bold text-brand-secondary uppercase">
              Scheduled: {formatDate(m.scheduledDate)}
            </div>
            <div class="mt-1 font-bold text-lg">{m.title}</div>
            {m.summary && <div class="mt-2 text-sm">{m.summary}</div>}
          </a>
        </li>
      ))}
    </ul>
  )}
</section>
```

- [ ] **Step 3: HomeNews** — front-page news (most recent 4)

```astro
---
// src/components/HomeNews.astro
import { getCollection } from 'astro:content';
import { formatDate } from '../lib/dates.ts';

const newsEntries = await getCollection('news');
const items = newsEntries
  .map(e => e.data)
  .filter(n => n.publicationDate)
  .sort((a, b) => (a.publicationDate! < b.publicationDate! ? 1 : -1))
  .slice(0, 4);
---
<section>
  <h2 class="text-page-title">
    <a href="/adultredeploy/news"
       class="text-brand-ink hover:text-brand-muted underline-offset-4 hover:underline">
      ARI NEWS
    </a>
  </h2>
  <ul class="mt-6 space-y-4">
    {items.map(item => (
      <li class="border-b border-brand-muted/30 pb-4">
        <div class="text-xs uppercase">
          Posted: {formatDate(item.publicationDate)}
        </div>
        <h3 class="mt-1 font-heading font-bold text-xl">
          <a href={`/adultredeploy/news/${item.slug}`}
             class="text-brand-primary underline-offset-4 hover:underline">
            {item.title}
          </a>
        </h3>
        {item.summary && <p class="mt-2 text-sm">{item.summary}</p>}
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 4: Replace src/pages/index.astro**

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import HomeBoxes from '../components/HomeBoxes.astro';
import HomeMeetings from '../components/HomeMeetings.astro';
import HomeNews from '../components/HomeNews.astro';
import Markdown from '../components/Markdown.astro';
import { getEntry } from 'astro:content';

// Pull the "home" page from Strapi's pages collection
const homePage = await getEntry('pages', 'orphan/home').catch(() => null);
---
<BaseLayout title="Home"
            description="Adult Redeploy Illinois — community-based alternatives to incarceration.">
  <div class="bg-brand-primary text-white py-16">
    <div class="max-w-6xl mx-auto px-6">
      <h1 class="text-4xl md:text-5xl font-black">Adult Redeploy Illinois</h1>
      <p class="mt-3 text-lg max-w-3xl">
        Established by the Crime Reduction Act, ARI provides financial
        incentives to local jurisdictions for programs that allow
        diversion of individuals from state prisons through
        community-based services.
      </p>
    </div>
  </div>
  <HomeBoxes />
  <div class="max-w-6xl mx-auto px-6 mt-12 grid gap-8 md:grid-cols-3">
    <div class="md:col-span-2">
      <h2 class="text-page-title">
        <a href="/adultredeploy/about/overview"
           class="text-brand-ink hover:text-brand-muted underline-offset-4 hover:underline">
          ABOUT ADULT REDEPLOY ILLINOIS
        </a>
      </h2>
      {homePage && <Markdown content={homePage.data.content} class="mt-6" />}
    </div>
    <aside>
      <HomeMeetings />
    </aside>
  </div>
  <div class="max-w-6xl mx-auto px-6 mt-16 grid gap-8 md:grid-cols-2">
    <HomeNews />
  </div>
</BaseLayout>
```

- [ ] **Step 5: Build + verify**

```bash
npm run build
curl -sf http://localhost:4173/adultredeploy/ | grep -q "UPCOMING MEETINGS" && echo OK
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro src/components/Home*.astro
git commit -m "feat(home): build home page with hero, boxes, meetings, news"
```

### Task 4.2: Generic [section] and [section]/[slug] pages

**Files:**
- Create: `src/pages/[section]/index.astro`
- Create: `src/pages/[section]/[slug].astro`

- [ ] **Step 1: Section landing page**

```astro
---
// src/pages/[section]/index.astro
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Markdown from '../../components/Markdown.astro';
import Breadcrumb from '../../components/ui/Breadcrumb.astro';

export async function getStaticPaths() {
  const sections = await getCollection('sections');
  return sections.map(s => ({
    params: { section: s.data.slug },
    props: { section: s.data },
  }));
}
const { section } = Astro.props;
---
<BaseLayout title={section.title} description={section.summary ?? undefined}>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home', href: '/adultredeploy/' },
      { label: section.title },
    ]} />
    <h1 class="text-page-title mt-4">{section.title}</h1>
    {section.summary && <p class="mt-3 text-lg">{section.summary}</p>}
    {section.pages && section.pages.length > 0 && (
      <ul class="mt-8 space-y-3">
        {section.pages.filter(p => p.displayNav).map(p => (
          <li>
            <a href={`/adultredeploy/${section.slug}/${p.slug}`}
               class="block p-4 border border-brand-muted/40 rounded
                      hover:shadow-elev1
                      focus-visible:outline focus-visible:outline-2
                      focus-visible:outline-brand-primary focus-visible:outline-offset-2">
              <div class="font-bold text-brand-primary">{p.title}</div>
              {p.summary && <div class="text-sm mt-1">{p.summary}</div>}
            </a>
          </li>
        ))}
      </ul>
    )}
  </div>
</BaseLayout>
```

- [ ] **Step 2: Section/slug page**

```astro
---
// src/pages/[section]/[slug].astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Markdown from '../../components/Markdown.astro';
import Breadcrumb from '../../components/ui/Breadcrumb.astro';

export async function getStaticPaths() {
  const pages = await getCollection('pages');
  return pages
    .filter(p => p.data.section?.slug)
    .map(p => ({
      params: { section: p.data.section!.slug, slug: p.data.slug },
      props: { page: p.data },
    }));
}
const { page } = Astro.props;
---
<BaseLayout title={page.title} description={page.summary ?? undefined}>
  <article data-pagefind-body
           data-pagefind-meta={`type:page`}
           class="max-w-4xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home', href: '/adultredeploy/' },
      { label: page.section!.title, href: `/adultredeploy/${page.section!.slug}` },
      { label: page.title },
    ]} />
    <h1 class="text-page-title mt-4">{page.title}</h1>
    {page.summary && <p class="mt-3 text-lg">{page.summary}</p>}
    <Markdown content={page.content} class="mt-8" />
  </article>
</BaseLayout>
```

- [ ] **Step 3: Build, verify a couple of routes**

```bash
npm run build
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:4173/adultredeploy/approach
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:4173/adultredeploy/approach/ebps
```

Expect: 200 each.

- [ ] **Step 4: Commit**

```bash
git add src/pages/'[section]'/
git commit -m "feat(routing): add generic section + section/slug pages"
```

### Task 4.3: 404 page

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Write**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Page not found">
  <div class="max-w-2xl mx-auto px-6 py-16 text-center">
    <h1 class="text-page-title">Page not found</h1>
    <p class="mt-4">We couldn't find the page you were looking for.</p>
    <p class="mt-6">
      <a href="/adultredeploy/"
         class="text-brand-primary underline hover:no-underline font-bold">
        Return home
      </a>
    </p>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: add 404 page"
```

### Task 4.4: Apps page (research-hub listing)

**Files:**
- Create: `src/pages/apps.astro`

(Note: the Vue version fetches a separate `getApplications` query from researchhub.icjia-api.cloud. For simplicity v1 of the rewrite uses the same approach: a separate fetch inside `fetch-content.mjs`. Add to the query module and config.)

- [ ] **Step 1: Extend the GraphQL fetcher to include apps**

In `scripts/fetch-content.mjs`, add a second query against the researchhub endpoint:

```js
// after the main request:
const RH_QUERY = `{ applications(where:{isPublished:true}) {
  slug title summary description url splash isPublished } }`;
try {
  const rh = await request('https://researchhub.icjia-api.cloud/graphql',
                            RH_QUERY);
  data.applications = rh.applications;
} catch (err) {
  console.warn('[fetch] researchhub fetch failed, apps will be empty');
  data.applications = [];
}
```

- [ ] **Step 2: Define the apps collection in config.ts (append)**

```ts
const applications = defineCollection({
  loader: () => (data.applications ?? []).map((d: any) => ({
    id: d.slug, ...d,
  })),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    url: z.string(),
    splash: z.string().nullable().optional(),
  }),
});
// add to the export:
export const collections = { /* ...all of the above..., */ applications };
```

- [ ] **Step 3: Apps page**

```astro
---
// src/pages/apps.astro
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import Markdown from '../components/Markdown.astro';
import Card from '../components/ui/Card.astro';
import Breadcrumb from '../components/ui/Breadcrumb.astro';

const page = await getEntry('pages', 'orphan/apps').catch(() => null);
const appsEntries = await getCollection('applications');
const apps = appsEntries.map(e => e.data);
---
<BaseLayout title="Apps">
  <div class="max-w-5xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home', href: '/adultredeploy/' },
      { label: 'Apps' },
    ]} />
    <h1 class="text-page-title mt-4">Apps</h1>
    {page && <Markdown content={page.data.content} class="mt-4" />}
    <div class="grid gap-4 md:grid-cols-3 mt-8">
      {apps.map(app => (
        <Card variant="elevated" href={app.url}>
          {app.splash && (
            <img src={app.splash} alt="" class="w-full h-40 object-cover rounded mb-3" />
          )}
          <h2 class="font-bold text-lg">{app.title}</h2>
          {app.summary && <p class="text-sm mt-2">{app.summary}</p>}
        </Card>
      ))}
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Build + verify**

```bash
npm run build
curl -sf http://localhost:4173/adultredeploy/apps | grep -q "Apps" && echo OK
```

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-content.mjs src/content/config.ts src/pages/apps.astro
git commit -m "feat(apps): add /apps page with researchhub apps listing"
```

---

## Phase 5 — Listings + details

### Task 5.1: ListingTable component (Alpine — search + sort + row links)

**Files:**
- Create: `src/components/alpine/ListingTable.astro`

- [ ] **Step 1: Write the component**

```astro
---
// src/components/alpine/ListingTable.astro
interface Column { key: string; label: string; format?: 'date' | 'text'; }
interface Row { [k: string]: any; href: string; }
interface Props { columns: Column[]; rows: Row[]; ariaLabel: string; }
const { columns, rows, ariaLabel } = Astro.props;
const initial = JSON.stringify(rows);
---
<div x-data={`listingTable(${initial})`} class="bg-surface rounded shadow-elev1 p-4">
  <div class="flex justify-end mb-4">
    <label class="sr-only" for={`flt-${ariaLabel}`}>Filter</label>
    <input id={`flt-${ariaLabel}`} type="search" x-model="q"
           placeholder="Search…"
           class="w-full md:w-64 border border-brand-muted/40 rounded px-3 py-2
                  focus-visible:outline focus-visible:outline-2
                  focus-visible:outline-brand-primary focus-visible:outline-offset-2" />
  </div>
  <table class="w-full border-collapse" aria-label={ariaLabel}>
    <thead class="border-b border-brand-muted/40">
      <tr>
        {columns.map(c => (
          <th scope="col" class="text-left p-2 font-bold text-sm"
              :aria-sort={`sortKey === '${c.key}'
                           ? (sortDir === 'asc' ? 'ascending' : 'descending')
                           : 'none'`}>
            <button type="button"
                    class="inline-flex items-center gap-1
                           focus-visible:outline focus-visible:outline-2
                           focus-visible:outline-brand-primary focus-visible:outline-offset-2"
                    @click={`sortBy('${c.key}')`}>
              {c.label}
              <span aria-hidden="true"
                    x-text={`sortKey === '${c.key}'
                             ? (sortDir === 'asc' ? '↑' : '↓') : ''`}></span>
            </button>
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      <template x-for="row in filtered" :key="row.href">
        <tr class="border-b border-brand-muted/20 hover:bg-surface-subtle">
          {columns.map((c, i) => (
            <td class="p-2 text-sm">
              {i === 0 ? (
                <a :href="row.href" x-text={`fmt(row['${c.key}'], '${c.format ?? 'text'}')`}
                   class="text-brand-primary font-bold underline-offset-4 hover:underline
                          focus-visible:outline focus-visible:outline-2
                          focus-visible:outline-brand-primary focus-visible:outline-offset-2"></a>
              ) : (
                <span x-text={`fmt(row['${c.key}'], '${c.format ?? 'text'}')`}></span>
              )}
            </td>
          ))}
        </tr>
      </template>
    </tbody>
  </table>
  <p x-show="filtered.length === 0" class="text-center py-8 italic"
     style="display: none">No results.</p>
</div>

<script is:inline>
function listingTable(rows) {
  return {
    items: rows, q: '', sortKey: null, sortDir: 'asc',
    get filtered() {
      let r = this.items;
      if (this.q) {
        const q = this.q.toLowerCase();
        r = r.filter(x => Object.values(x).some(
          v => typeof v === 'string' && v.toLowerCase().includes(q)));
      }
      if (this.sortKey) {
        const k = this.sortKey, dir = this.sortDir === 'asc' ? 1 : -1;
        r = [...r].sort((a, b) =>
          (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * dir);
      }
      return r;
    },
    sortBy(k) {
      if (this.sortKey === k) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      } else { this.sortKey = k; this.sortDir = 'asc'; }
    },
    fmt(v, kind) {
      if (v == null) return '';
      if (kind === 'date') {
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return v;
        const months = ['January','February','March','April','May','June',
          'July','August','September','October','November','December'];
        return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
      }
      return String(v);
    },
  };
}
</script>
```

### Task 5.2: News routes — listing + detail

**Files:**
- Create: `src/pages/news/index.astro`
- Create: `src/pages/news/[slug].astro`

- [ ] **Step 1: Listing page**

```astro
---
// src/pages/news/index.astro
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumb from '../../components/ui/Breadcrumb.astro';
import ListingTable from '../../components/alpine/ListingTable.astro';
import Markdown from '../../components/Markdown.astro';

const page = await getEntry('pages', 'orphan/news').catch(() => null);
const entries = await getCollection('news');
const rows = entries
  .map(e => e.data)
  .sort((a, b) => (a.publicationDate ?? '') < (b.publicationDate ?? '') ? 1 : -1)
  .map(n => ({
    title: n.title,
    publicationDate: n.publicationDate ?? '',
    href: `/adultredeploy/news/${n.slug}`,
  }));
---
<BaseLayout title="News">
  <div class="max-w-6xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home', href: '/adultredeploy/' },
      { label: 'News' },
    ]} />
    <h1 class="text-page-title mt-4">News</h1>
    {page && <Markdown content={page.data.content} class="mt-4" />}
    <div class="mt-8">
      <ListingTable
        ariaLabel="news"
        columns={[
          { key: 'title',           label: 'Title' },
          { key: 'publicationDate', label: 'Posted', format: 'date' },
        ]}
        rows={rows}
      />
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Detail page**

```astro
---
// src/pages/news/[slug].astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumb from '../../components/ui/Breadcrumb.astro';
import Markdown from '../../components/Markdown.astro';
import Tag from '../../components/ui/Tag.astro';
import { formatDate } from '../../lib/dates.ts';

export async function getStaticPaths() {
  const items = await getCollection('news');
  return items.map(item => ({
    params: { slug: item.data.slug },
    props: { item: item.data },
  }));
}
const { item } = Astro.props;
---
<BaseLayout title={item.title} description={item.summary ?? undefined}>
  <article data-pagefind-body
           data-pagefind-meta={`type:news`}
           data-pagefind-meta={`date:${item.publicationDate ?? ''}`}
           class="max-w-3xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home', href: '/adultredeploy/' },
      { label: 'News',  href: '/adultredeploy/news' },
      { label: item.title },
    ]} />
    <p class="mt-4 text-sm text-brand-muted">
      Posted: {formatDate(item.publicationDate)}
    </p>
    <h1 class="text-page-title mt-2">{item.title}</h1>
    {item.summary && <p class="mt-3 text-lg italic">{item.summary}</p>}
    <Markdown content={item.content} class="mt-8" />
    {item.tags && item.tags.length > 0 && (
      <div class="mt-8 flex flex-wrap gap-2">
        {item.tags.map(t => (
          <Tag label={t.name} href={`/adultredeploy/tags/${t.slug}`} />
        ))}
      </div>
    )}
  </article>
</BaseLayout>
```

- [ ] **Step 3: Build + verify**

```bash
npm run build
curl -sf http://localhost:4173/adultredeploy/news | grep -q "News" && echo OK
ls dist/adultredeploy/news/ | head -5
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/news/ src/components/alpine/ListingTable.astro
git commit -m "feat(news): listing + detail pages with ListingTable"
```

### Task 5.3: Meetings — index, by-category, single

**Files:**
- Create: `src/pages/about/meetings/index.astro`
- Create: `src/pages/about/meetings/[category]/index.astro`
- Create: `src/pages/about/meetings/[category]/[slug].astro`
- Create: `src/lib/meetings.ts` (category enum lookup)

- [ ] **Step 1: Meetings category lookup**

```ts
// src/lib/meetings.ts
export const MEETING_CATEGORIES = [
  { enum: 'adHoc',         slug: 'ad-hoc',           title: 'Ad Hoc Committee',           short: 'Ad Hoc' },
  { enum: 'outreach',      slug: 'outreach',         title: 'Outreach, Technical Assistance & Communication Committee', short: 'Outreach' },
  { enum: 'performance',   slug: 'performance',      title: 'Performance Measurement Committee', short: 'Performance Measurement' },
  { enum: 'regular',       slug: 'regular-oversight',title: 'Regular Oversight Meeting',   short: 'Regular Oversight' },
  { enum: 'siteSelection', slug: 'site-selection',   title: 'Site Selection & Monitoring Committee', short: 'Site Selection' },
] as const;
export type MeetingCategoryEnum = typeof MEETING_CATEGORIES[number]['enum'];
export const enumToSlug = Object.fromEntries(
  MEETING_CATEGORIES.map(c => [c.enum, c.slug])) as Record<string,string>;
export const slugToCategory = Object.fromEntries(
  MEETING_CATEGORIES.map(c => [c.slug, c])) as Record<string, typeof MEETING_CATEGORIES[number]>;
```

- [ ] **Step 2: Meetings index**

```astro
---
// src/pages/about/meetings/index.astro
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Breadcrumb from '../../../components/ui/Breadcrumb.astro';
import ListingTable from '../../../components/alpine/ListingTable.astro';
import Markdown from '../../../components/Markdown.astro';
import { MEETING_CATEGORIES, enumToSlug } from '../../../lib/meetings.ts';

const page = await getEntry('pages', 'about/meetings').catch(() => null);
const allEntries = await getCollection('meetings');
const all = allEntries.map(e => e.data);
const rows = all
  .sort((a, b) => (a.scheduledDate ?? '') < (b.scheduledDate ?? '') ? 1 : -1)
  .map(m => ({
    title: m.title,
    scheduledDate: m.scheduledDate ?? '',
    category: MEETING_CATEGORIES.find(c => c.enum === m.category)?.short ?? m.category,
    href: `/adultredeploy/about/meetings/${enumToSlug[m.category] ?? m.category}/${m.slug}`,
  }));
---
<BaseLayout title="Meetings">
  <div class="max-w-6xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home',    href: '/adultredeploy/' },
      { label: 'About',   href: '/adultredeploy/about' },
      { label: 'Meetings' },
    ]} />
    <h1 class="text-page-title mt-4">Meetings</h1>
    {page && <Markdown content={page.data.content} class="mt-4" />}
    <div class="mt-8">
      <ListingTable ariaLabel="meetings"
        columns={[
          { key: 'title',         label: 'Meeting Title' },
          { key: 'scheduledDate', label: 'Scheduled', format: 'date' },
          { key: 'category',      label: 'Category' },
        ]} rows={rows} />
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 3: By-category listing**

```astro
---
// src/pages/about/meetings/[category]/index.astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../../../layouts/BaseLayout.astro';
import Breadcrumb from '../../../../components/ui/Breadcrumb.astro';
import ListingTable from '../../../../components/alpine/ListingTable.astro';
import { MEETING_CATEGORIES, slugToCategory } from '../../../../lib/meetings.ts';

export async function getStaticPaths() {
  return MEETING_CATEGORIES.map(c => ({
    params: { category: c.slug },
    props: { category: c },
  }));
}
const { category } = Astro.props;
const entries = await getCollection('meetings');
const rows = entries
  .map(e => e.data)
  .filter(m => m.category === category.enum)
  .sort((a, b) => (a.scheduledDate ?? '') < (b.scheduledDate ?? '') ? 1 : -1)
  .map(m => ({
    title: m.title,
    scheduledDate: m.scheduledDate ?? '',
    href: `/adultredeploy/about/meetings/${category.slug}/${m.slug}`,
  }));
---
<BaseLayout title={category.title}>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home',     href: '/adultredeploy/' },
      { label: 'About',    href: '/adultredeploy/about' },
      { label: 'Meetings', href: '/adultredeploy/about/meetings' },
      { label: category.short },
    ]} />
    <h1 class="text-page-title mt-4">{category.title}</h1>
    <div class="mt-8">
      <ListingTable ariaLabel={category.slug}
        columns={[
          { key: 'title',         label: 'Meeting Title' },
          { key: 'scheduledDate', label: 'Scheduled', format: 'date' },
        ]} rows={rows} />
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Meeting single**

```astro
---
// src/pages/about/meetings/[category]/[slug].astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../../../layouts/BaseLayout.astro';
import Breadcrumb from '../../../../components/ui/Breadcrumb.astro';
import Markdown from '../../../../components/Markdown.astro';
import Tag from '../../../../components/ui/Tag.astro';
import { formatDate } from '../../../../lib/dates.ts';
import { MEETING_CATEGORIES, enumToSlug } from '../../../../lib/meetings.ts';

export async function getStaticPaths() {
  const items = await getCollection('meetings');
  return items
    .filter(m => enumToSlug[m.data.category])
    .map(m => ({
      params: {
        category: enumToSlug[m.data.category],
        slug: m.data.slug,
      },
      props: { item: m.data },
    }));
}
const { item } = Astro.props;
const category = MEETING_CATEGORIES.find(c => c.enum === item.category)!;
const STRAPI_BASE = 'https://ari.icjia-api.cloud';
---
<BaseLayout title={item.title} description={item.summary ?? undefined}>
  <article data-pagefind-body
           data-pagefind-meta={`type:meeting`}
           data-pagefind-meta={`date:${item.scheduledDate ?? ''}`}
           class="max-w-3xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home',     href: '/adultredeploy/' },
      { label: 'About',    href: '/adultredeploy/about' },
      { label: 'Meetings', href: '/adultredeploy/about/meetings' },
      { label: category.short, href: `/adultredeploy/about/meetings/${category.slug}` },
      { label: item.title },
    ]} />
    <p class="mt-4 text-sm font-bold text-brand-secondary uppercase">
      Scheduled: {formatDate(item.scheduledDate)}
    </p>
    <h1 class="text-page-title mt-1">{item.title}</h1>
    <Markdown content={item.content} class="mt-6" />

    {item.mediaMaterial && item.mediaMaterial.length > 0 && (
      <div class="mt-8 bg-surface-shaded p-6 rounded">
        <h2 class="font-bold mb-3">Downloads</h2>
        <ul class="space-y-2">
          {item.mediaMaterial.filter((i: any) => i.file).map((i: any) => (
            <li>
              <a href={`${STRAPI_BASE}${i.file.url}`}
                 target="_blank" rel="noopener"
                 class="text-brand-primary font-bold underline hover:no-underline">
                {i.name}
              </a>
              {i.summary && <p class="text-sm mt-1">{i.summary}</p>}
            </li>
          ))}
        </ul>
      </div>
    )}

    {item.externalMediaMaterial && item.externalMediaMaterial.length > 0 && (
      <div class="mt-6 bg-surface-shaded p-6 rounded">
        <h2 class="font-bold mb-3">External Links</h2>
        <ul class="space-y-2">
          {item.externalMediaMaterial.filter((i: any) => i.url).map((i: any) => (
            <li>
              <a href={i.url} target="_blank" rel="noopener"
                 class="text-brand-primary font-bold underline hover:no-underline">
                {i.name}
              </a>
              {i.summary && <p class="text-sm mt-1">{i.summary}</p>}
            </li>
          ))}
        </ul>
      </div>
    )}

    {item.meetingMaterial && item.meetingMaterial.length > 0 && (
      <div class="mt-6 bg-surface-shaded p-6 rounded">
        <h2 class="font-bold mb-3">Meeting Materials</h2>
        <ul class="space-y-2">
          {item.meetingMaterial.filter((i: any) => i.file).map((i: any) => (
            <li>
              <a href={`${STRAPI_BASE}${i.file.url}`}
                 target="_blank" rel="noopener"
                 class="text-brand-primary font-bold underline hover:no-underline">
                {i.name}
              </a>
              {i.summary && <p class="text-sm mt-1">{i.summary}</p>}
            </li>
          ))}
        </ul>
      </div>
    )}

    {item.tags && item.tags.length > 0 && (
      <div class="mt-8 flex flex-wrap gap-2">
        {item.tags.map((t: any) => (
          <Tag label={t.name} href={`/adultredeploy/tags/${t.slug}`} />
        ))}
      </div>
    )}
  </article>
</BaseLayout>
```

- [ ] **Step 5: Build + verify**

```bash
npm run build
curl -sf http://localhost:4173/adultredeploy/about/meetings | grep -q "Meetings" && echo OK
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/about/meetings/ src/lib/meetings.ts
git commit -m "feat(meetings): listing, category listing, and single pages"
```

### Task 5.4: Resources — index, by-category, single

**Files:**
- Create: `src/pages/resources/index.astro`
- Create: `src/pages/resources/[category]/index.astro`
- Create: `src/pages/resources/[category]/[slug].astro`
- Create: `src/lib/resources.ts`

- [ ] **Step 1: Resource categories lookup**

```ts
// src/lib/resources.ts
export const RESOURCE_CATEGORIES = [
  { enum: 'annualReport',   slug: 'annual-report',   title: 'Annual Reports',   short: 'Annual Reports' },
  { enum: 'evaluation',     slug: 'evaluation',      title: 'Evaluation Reports', short: 'Evaluation' },
  { enum: 'factSheet',      slug: 'fact-sheet',      title: 'Fact Sheets',      short: 'Fact Sheets' },
  { enum: 'other',          slug: 'other',           title: 'Other',            short: 'Other' },
  { enum: 'researchReport', slug: 'research-report', title: 'Research Reports', short: 'Research' },
  { enum: 'summit',         slug: 'summits',         title: 'Summits',          short: 'Summits' },
  { enum: 'template',       slug: 'template',        title: 'Templates',        short: 'Templates' },
  { enum: 'toolkit',        slug: 'toolkit',         title: 'Toolkits',         short: 'Toolkits' },
  { enum: 'webinar',        slug: 'webinar',         title: 'Webinars',         short: 'Webinars' },
] as const;
export const resEnumToSlug = Object.fromEntries(
  RESOURCE_CATEGORIES.map(c => [c.enum, c.slug])) as Record<string,string>;
export const resSlugToCategory = Object.fromEntries(
  RESOURCE_CATEGORIES.map(c => [c.slug, c])) as Record<string, typeof RESOURCE_CATEGORIES[number]>;
```

- [ ] **Step 2: Resources index** — parallel to meetings index, swap collection + lookup.

```astro
---
// src/pages/resources/index.astro
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumb from '../../components/ui/Breadcrumb.astro';
import ListingTable from '../../components/alpine/ListingTable.astro';
import Markdown from '../../components/Markdown.astro';
import { RESOURCE_CATEGORIES, resEnumToSlug } from '../../lib/resources.ts';

const page = await getEntry('pages', 'orphan/resources').catch(() => null);
const entries = await getCollection('resources');
const rows = entries
  .map(e => e.data)
  .sort((a, b) => (a.publicationDate ?? '') < (b.publicationDate ?? '') ? 1 : -1)
  .map(r => ({
    title: r.title,
    publicationDate: r.publicationDate ?? '',
    category: RESOURCE_CATEGORIES.find(c => c.enum === r.category)?.short ?? r.category,
    href: `/adultredeploy/resources/${resEnumToSlug[r.category] ?? r.category}/${r.slug}`,
  }));
---
<BaseLayout title="Resources">
  <div class="max-w-6xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home', href: '/adultredeploy/' },
      { label: 'Resources' },
    ]} />
    <h1 class="text-page-title mt-4">Resources</h1>
    {page && <Markdown content={page.data.content} class="mt-4" />}
    <div class="mt-8">
      <ListingTable ariaLabel="resources"
        columns={[
          { key: 'title',           label: 'Title' },
          { key: 'category',        label: 'Category' },
          { key: 'publicationDate', label: 'Published', format: 'date' },
        ]} rows={rows} />
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 3: By-category — same pattern as meetings, swap lookups**

```astro
---
// src/pages/resources/[category]/index.astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Breadcrumb from '../../../components/ui/Breadcrumb.astro';
import ListingTable from '../../../components/alpine/ListingTable.astro';
import { RESOURCE_CATEGORIES } from '../../../lib/resources.ts';

export async function getStaticPaths() {
  return RESOURCE_CATEGORIES.map(c => ({
    params: { category: c.slug },
    props: { category: c },
  }));
}
const { category } = Astro.props;
const entries = await getCollection('resources');
const rows = entries.map(e => e.data)
  .filter(r => r.category === category.enum)
  .sort((a, b) => (a.publicationDate ?? '') < (b.publicationDate ?? '') ? 1 : -1)
  .map(r => ({
    title: r.title,
    publicationDate: r.publicationDate ?? '',
    href: `/adultredeploy/resources/${category.slug}/${r.slug}`,
  }));
---
<BaseLayout title={category.title}>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home', href: '/adultredeploy/' },
      { label: 'Resources', href: '/adultredeploy/resources' },
      { label: category.short },
    ]} />
    <h1 class="text-page-title mt-4">{category.title}</h1>
    <div class="mt-8">
      <ListingTable ariaLabel={category.slug}
        columns={[
          { key: 'title',           label: 'Title' },
          { key: 'publicationDate', label: 'Published', format: 'date' },
        ]} rows={rows} />
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Resource single**

```astro
---
// src/pages/resources/[category]/[slug].astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Breadcrumb from '../../../components/ui/Breadcrumb.astro';
import Markdown from '../../../components/Markdown.astro';
import Tag from '../../../components/ui/Tag.astro';
import { formatDate } from '../../../lib/dates.ts';
import { RESOURCE_CATEGORIES, resEnumToSlug } from '../../../lib/resources.ts';

export async function getStaticPaths() {
  const items = await getCollection('resources');
  return items
    .filter(r => resEnumToSlug[r.data.category])
    .map(r => ({
      params: { category: resEnumToSlug[r.data.category], slug: r.data.slug },
      props: { item: r.data },
    }));
}
const { item } = Astro.props;
const category = RESOURCE_CATEGORIES.find(c => c.enum === item.category)!;
const STRAPI_BASE = 'https://ari.icjia-api.cloud';
---
<BaseLayout title={item.title} description={item.summary ?? undefined}>
  <article data-pagefind-body
           data-pagefind-meta={`type:resource`}
           data-pagefind-meta={`category:${category.short}`}
           class="max-w-3xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home', href: '/adultredeploy/' },
      { label: 'Resources', href: '/adultredeploy/resources' },
      { label: category.short, href: `/adultredeploy/resources/${category.slug}` },
      { label: item.title },
    ]} />
    <p class="mt-4 text-sm">Published: {formatDate(item.publicationDate)}</p>
    <h1 class="text-page-title mt-1">{item.title}</h1>
    {item.summary && <p class="mt-3 text-lg italic">{item.summary}</p>}
    <Markdown content={item.content} class="mt-6" />

    {item.mediaMaterial && item.mediaMaterial.length > 0 && (
      <div class="mt-8 bg-surface-shaded p-6 rounded">
        <h2 class="font-bold mb-3">Downloads</h2>
        <ul class="space-y-2">
          {item.mediaMaterial.filter((i: any) => i.file).map((i: any) => (
            <li>
              <a href={`${STRAPI_BASE}${i.file.url}`}
                 target="_blank" rel="noopener"
                 class="text-brand-primary font-bold underline hover:no-underline">
                {i.name}
              </a>
              {i.summary && <p class="text-sm mt-1">{i.summary}</p>}
            </li>
          ))}
        </ul>
      </div>
    )}

    {item.externalMediaMaterial && item.externalMediaMaterial.length > 0 && (
      <div class="mt-6 bg-surface-shaded p-6 rounded">
        <h2 class="font-bold mb-3">External Links</h2>
        <ul class="space-y-2">
          {item.externalMediaMaterial.filter((i: any) => i.url).map((i: any) => (
            <li>
              <a href={i.url} target="_blank" rel="noopener"
                 class="text-brand-primary font-bold underline hover:no-underline">
                {i.name}
              </a>
              {i.summary && <p class="text-sm mt-1">{i.summary}</p>}
            </li>
          ))}
        </ul>
      </div>
    )}

    {item.tags && item.tags.length > 0 && (
      <div class="mt-8 flex flex-wrap gap-2">
        {item.tags.map((t: any) => (
          <Tag label={t.name} href={`/adultredeploy/tags/${t.slug}`} />
        ))}
      </div>
    )}
  </article>
</BaseLayout>
```

- [ ] **Step 5: Build + verify**

```bash
npm run build
curl -sf http://localhost:4173/adultredeploy/resources | grep -q "Resources" && echo OK
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/resources/ src/lib/resources.ts
git commit -m "feat(resources): listing, category, and single pages"
```

### Task 5.5: Sites — listing + detail

**Files:**
- Create: `src/pages/sites/index.astro`
- Create: `src/pages/sites/[slug].astro`

- [ ] **Step 1: Listing**

```astro
---
// src/pages/sites/index.astro
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumb from '../../components/ui/Breadcrumb.astro';
import ListingTable from '../../components/alpine/ListingTable.astro';
import Markdown from '../../components/Markdown.astro';

const page = await getEntry('pages', 'orphan/sites').catch(() => null);
const entries = await getCollection('sites');
const rows = entries.map(e => e.data)
  .sort((a, b) => a.title.localeCompare(b.title))
  .map(s => ({
    title: s.title,
    siteType: s.siteType ?? '',
    href: `/adultredeploy/sites/${s.slug}`,
  }));
---
<BaseLayout title="Sites">
  <div class="max-w-6xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home', href: '/adultredeploy/' },
      { label: 'Sites' },
    ]} />
    <h1 class="text-page-title mt-4">Sites</h1>
    {page && <Markdown content={page.data.content} class="mt-4" />}
    <div class="mt-8">
      <ListingTable ariaLabel="sites"
        columns={[
          { key: 'title',    label: 'Site' },
          { key: 'siteType', label: 'Type' },
        ]} rows={rows} />
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Detail**

```astro
---
// src/pages/sites/[slug].astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumb from '../../components/ui/Breadcrumb.astro';
import Markdown from '../../components/Markdown.astro';

export async function getStaticPaths() {
  const items = await getCollection('sites');
  return items.map(s => ({
    params: { slug: s.data.slug },
    props: { item: s.data },
  }));
}
const { item } = Astro.props;
---
<BaseLayout title={item.title} description={item.summary ?? undefined}>
  <article data-pagefind-body
           data-pagefind-meta={`type:site`}
           class="max-w-3xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home', href: '/adultredeploy/' },
      { label: 'Sites', href: '/adultredeploy/sites' },
      { label: item.title },
    ]} />
    <h1 class="text-page-title mt-4">{item.title}</h1>
    {item.summary && <p class="mt-3 text-lg italic">{item.summary}</p>}
    <Markdown content={item.content} class="mt-6" />
  </article>
</BaseLayout>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/sites/
git commit -m "feat(sites): listing + detail pages"
```

### Task 5.6: Biographies — detail only (no listing route in current site beyond Staff/Oversight)

**Files:**
- Create: `src/pages/about/biographies/[slug].astro`
- Create: `src/pages/about/staff.astro`
- Create: `src/pages/about/oversight.astro`

- [ ] **Step 1: Biography detail**

```astro
---
// src/pages/about/biographies/[slug].astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Breadcrumb from '../../../components/ui/Breadcrumb.astro';
import Markdown from '../../../components/Markdown.astro';

export async function getStaticPaths() {
  const items = await getCollection('biographies');
  return items.map(b => ({
    params: { slug: b.data.slug },
    props: { item: b.data },
  }));
}
const { item } = Astro.props;
const fullName = [item.prefix, item.firstName, item.middleName,
                  item.lastName, item.suffix].filter(Boolean).join(' ');
const STRAPI_BASE = 'https://ari.icjia-api.cloud';
---
<BaseLayout title={fullName}>
  <article data-pagefind-body
           data-pagefind-meta={`type:biography`}
           class="max-w-3xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home',  href: '/adultredeploy/' },
      { label: 'About', href: '/adultredeploy/about' },
      { label: item.category === 'staff' ? 'Staff' : 'Oversight Board',
        href: item.category === 'staff'
          ? '/adultredeploy/about/staff'
          : '/adultredeploy/about/oversight' },
      { label: fullName },
    ]} />
    <div class="mt-6 grid gap-6 md:grid-cols-3">
      {item.headshot && (
        <div class="md:col-span-1">
          <img src={`${STRAPI_BASE}${item.headshot.url}`}
               alt=""
               class="w-full rounded shadow-elev1" />
        </div>
      )}
      <div class={item.headshot ? 'md:col-span-2' : 'md:col-span-3'}>
        <h1 class="text-page-title">{fullName}</h1>
        {item.title && <p class="text-lg italic mt-1">{item.title}</p>}
        {item.membership && <p class="text-sm mt-1">{item.membership}</p>}
        <Markdown content={item.content} class="mt-6" />
      </div>
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Staff listing**

```astro
---
// src/pages/about/staff.astro
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumb from '../../components/ui/Breadcrumb.astro';
import Markdown from '../../components/Markdown.astro';

const page = await getEntry('pages', 'about/staff').catch(() => null);
const STRAPI_BASE = 'https://ari.icjia-api.cloud';
const entries = await getCollection('biographies');
const staff = entries.map(e => e.data)
  .filter(b => b.category === 'staff')
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)
                  || (a.lastName ?? '').localeCompare(b.lastName ?? ''));
---
<BaseLayout title="Staff">
  <div class="max-w-5xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home',  href: '/adultredeploy/' },
      { label: 'About', href: '/adultredeploy/about' },
      { label: 'Staff' },
    ]} />
    <h1 class="text-page-title mt-4">Staff</h1>
    {page && <Markdown content={page.data.content} class="mt-4" />}
    <ul class="mt-8 grid gap-6 md:grid-cols-2">
      {staff.map(b => {
        const name = [b.prefix, b.firstName, b.middleName, b.lastName, b.suffix]
                       .filter(Boolean).join(' ');
        return (
          <li>
            <a href={`/adultredeploy/about/biographies/${b.slug}`}
               class="flex gap-4 p-4 border border-brand-muted/40 rounded
                      hover:shadow-elev1
                      focus-visible:outline focus-visible:outline-2
                      focus-visible:outline-brand-primary focus-visible:outline-offset-2">
              {b.headshot && (
                <img src={`${STRAPI_BASE}${b.headshot.url}`}
                     alt="" class="w-20 h-20 rounded object-cover" />
              )}
              <div>
                <div class="font-bold text-brand-primary">{name}</div>
                {b.title && <div class="text-sm italic">{b.title}</div>}
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Oversight Board listing** — same pattern, filter category === 'oversight'

```astro
---
// src/pages/about/oversight.astro
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumb from '../../components/ui/Breadcrumb.astro';
import Markdown from '../../components/Markdown.astro';

const page = await getEntry('pages', 'about/oversight').catch(() => null);
const STRAPI_BASE = 'https://ari.icjia-api.cloud';
const entries = await getCollection('biographies');
const board = entries.map(e => e.data)
  .filter(b => b.category === 'oversight')
  .sort((a, b) => (a.alphabetizeBy ?? a.lastName ?? '').localeCompare(
                    b.alphabetizeBy ?? b.lastName ?? ''));
---
<BaseLayout title="Oversight Board">
  <div class="max-w-5xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home',  href: '/adultredeploy/' },
      { label: 'About', href: '/adultredeploy/about' },
      { label: 'Oversight Board' },
    ]} />
    <h1 class="text-page-title mt-4">Oversight Board</h1>
    {page && <Markdown content={page.data.content} class="mt-4" />}
    <ul class="mt-8 grid gap-6 md:grid-cols-2">
      {board.map(b => {
        const name = [b.prefix, b.firstName, b.middleName, b.lastName, b.suffix]
                       .filter(Boolean).join(' ');
        return (
          <li>
            <a href={`/adultredeploy/about/biographies/${b.slug}`}
               class="flex gap-4 p-4 border border-brand-muted/40 rounded
                      hover:shadow-elev1
                      focus-visible:outline focus-visible:outline-2
                      focus-visible:outline-brand-primary focus-visible:outline-offset-2">
              {b.headshot && (
                <img src={`${STRAPI_BASE}${b.headshot.url}`}
                     alt="" class="w-20 h-20 rounded object-cover" />
              )}
              <div>
                <div class="font-bold text-brand-primary">{name}</div>
                {b.title && <div class="text-sm italic">{b.title}</div>}
                {b.membership && <div class="text-sm">{b.membership}</div>}
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/about/
git commit -m "feat(about): biographies detail + staff and oversight listings"
```

### Task 5.7: Tags

**Files:**
- Create: `src/pages/tags/[slug].astro`

- [ ] **Step 1: Tag detail — lists everything tagged with this slug**

```astro
---
// src/pages/tags/[slug].astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumb from '../../components/ui/Breadcrumb.astro';
import { enumToSlug } from '../../lib/meetings.ts';
import { resEnumToSlug } from '../../lib/resources.ts';

export async function getStaticPaths() {
  const tags = await getCollection('tags');
  return tags.map(t => ({
    params: { slug: t.data.slug },
    props: { tag: t.data },
  }));
}
const { tag } = Astro.props;

const taggedWith = (slug: string, items: any[]) =>
  items.filter(x => (x.tags ?? []).some((t: any) => t.slug === slug));

const news = taggedWith(tag.slug,
  (await getCollection('news')).map(e => e.data))
  .map(n => ({ title: n.title, href: `/adultredeploy/news/${n.slug}` }));
const meetings = taggedWith(tag.slug,
  (await getCollection('meetings')).map(e => e.data))
  .map(m => ({
    title: m.title,
    href: `/adultredeploy/about/meetings/${enumToSlug[m.category] ?? m.category}/${m.slug}`,
  }));
const resources = taggedWith(tag.slug,
  (await getCollection('resources')).map(e => e.data))
  .map(r => ({
    title: r.title,
    href: `/adultredeploy/resources/${resEnumToSlug[r.category] ?? r.category}/${r.slug}`,
  }));
---
<BaseLayout title={`Tag: ${tag.name}`}>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home', href: '/adultredeploy/' },
      { label: `Tag: ${tag.name}` },
    ]} />
    <h1 class="text-page-title mt-4">{tag.name}</h1>
    {[
      { label: 'News',      items: news },
      { label: 'Meetings',  items: meetings },
      { label: 'Resources', items: resources },
    ].filter(s => s.items.length > 0).map(section => (
      <section class="mt-8">
        <h2 class="font-heading font-bold text-xl mb-3">{section.label}</h2>
        <ul class="space-y-2">
          {section.items.map(i => (
            <li>
              <a href={i.href}
                 class="text-brand-primary underline hover:no-underline">
                {i.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/tags/
git commit -m "feat(tags): tag detail pages aggregating tagged content"
```

---

## Phase 6 — Illinois map port

### Task 6.1: Port the SVG paths into a standalone file

**Files:**
- Create: `src/components/svg/illinois-paths.html` (just the path elements, no wrapper)

- [ ] **Step 1: Extract the path block from the previous Vue file via git history**

```bash
git show master:src/components/SiteIllinois.vue > /tmp/site-illinois.vue
# Manually copy the <svg>...</svg> body block (paths + text labels)
# into src/components/svg/illinois-paths.html. Strip Vue directives
# (@click, :class). Add data-county attributes where the path is a county.
```

(This is a hand-port — the file is large but mechanical. Each `<path id="usiljs...">` becomes `<path data-county="<derived-slug>" tabindex="0" role="button" aria-label="<County name>" ...>`.)

- [ ] **Step 2: Create a county-data lookup keyed by data-county**

```ts
// src/lib/counties.ts
export const COUNTIES = [
  { slug: 'adams',  name: 'Adams County' },
  { slug: 'boone',  name: 'Boone County' },
  // ... full list from the sites collection's `counties` field
] as const;
export const countiesBySlug = Object.fromEntries(
  COUNTIES.map(c => [c.slug, c])) as Record<string, typeof COUNTIES[number]>;
```

(Fill in by running `node -e "const d=require('./src/content/_data.json'); console.log(JSON.stringify(d.sites.flatMap(s => s.counties ?? []).filter((v,i,a)=>a.indexOf(v)===i).sort()))"` once `_data.json` exists.)

### Task 6.2: SiteIllinois.astro component

**Files:**
- Create: `src/components/SiteIllinois.astro`

- [ ] **Step 1: Component**

```astro
---
// src/components/SiteIllinois.astro
import { getCollection } from 'astro:content';

const sites = (await getCollection('sites')).map(e => e.data);
const byCounty: Record<string, { title: string; slug: string; summary?: string | null }> = {};
for (const s of sites) {
  for (const county of (s.counties ?? [])) {
    byCounty[county] = { title: s.title, slug: s.slug, summary: s.summary };
  }
}
const SITE_DATA = JSON.stringify(byCounty);
---
<div x-data={`ilMap(${SITE_DATA})`} class="grid gap-6 md:grid-cols-2">
  <div>
    <svg viewBox="0 0 450 900" role="img" aria-label="Illinois ARI sites"
         class="w-full max-w-md mx-auto">
      <Fragment set:html={`<!-- paths injected from src/components/svg/illinois-paths.html -->`} />
      <slot name="paths" />
    </svg>
  </div>
  <aside aria-live="polite" aria-atomic="true" class="min-h-[200px]">
    <template x-if="selected">
      <div class="p-4 border border-brand-muted/40 rounded bg-surface">
        <h3 class="font-heading font-bold text-xl"
            x-text="selected.title"></h3>
        <p x-show="selected.summary" class="mt-2 text-sm" x-text="selected.summary"></p>
        <a :href="'/adultredeploy/sites/' + selected.slug"
           class="mt-4 inline-block text-brand-primary font-bold underline">
          Visit site page
        </a>
      </div>
    </template>
    <p x-show="!selected" class="italic">
      Select a county on the map for site details.
    </p>
  </aside>
</div>

<script is:inline>
function ilMap(byCounty) {
  return {
    byCounty,
    selected: null,
    select(county) {
      this.selected = this.byCounty[county] ?? null;
    },
  };
}
document.addEventListener('alpine:init', () => {
  // Wire keyboard + click on the SVG paths.
  document.querySelectorAll('svg [data-county]').forEach(el => {
    el.addEventListener('click', () => {
      el.closest('[x-data]').__x?.$data.select(el.dataset.county);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.closest('[x-data]').__x?.$data.select(el.dataset.county);
      }
    });
  });
});
</script>

<style is:global>
  svg [data-county] {
    fill: #ffffff;
    stroke: #aaaaaa;
    transition: fill 120ms ease;
    cursor: pointer;
  }
  svg [data-county]:hover,
  svg [data-county]:focus {
    fill: var(--color-brand-secondary);
    outline: none;
  }
  svg [data-county]:focus-visible {
    stroke: var(--color-brand-primary);
    stroke-width: 2;
  }
</style>
```

### Task 6.3: Wire the map into the programs page

**Files:**
- Create: `src/pages/programs.astro`

- [ ] **Step 1: Programs page**

```astro
---
// src/pages/programs.astro
import { getEntry } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import Breadcrumb from '../components/ui/Breadcrumb.astro';
import Markdown from '../components/Markdown.astro';
import SiteIllinois from '../components/SiteIllinois.astro';

const page = await getEntry('pages', 'orphan/programs').catch(() => null);
const paths = await import('../components/svg/illinois-paths.html?raw');
---
<BaseLayout title="Programs">
  <div class="max-w-6xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home', href: '/adultredeploy/' },
      { label: 'Programs' },
    ]} />
    <h1 class="text-page-title mt-4">Programs</h1>
    {page && <Markdown content={page.data.content} class="mt-4" />}
    <div class="mt-8">
      <SiteIllinois>
        <Fragment slot="paths" set:html={paths.default} />
      </SiteIllinois>
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Commit Phase 6**

```bash
git add src/components/svg/ src/components/SiteIllinois.astro src/lib/counties.ts src/pages/programs.astro
git commit -m "feat(programs): port Illinois county map with keyboard a11y"
```

---

## Phase 7 — Search + sitemap

### Task 7.1: Install Pagefind + Astro sitemap integration

- [ ] **Step 1: Install**

```bash
npm install --save pagefind
npm install --save @astrojs/sitemap
```

- [ ] **Step 2: Update astro.config.mjs to add sitemap integration**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://icjia.illinois.gov',
  base: '/adultredeploy',
  trailingSlash: 'never',
  output: 'static',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs package.json package-lock.json
git commit -m "chore(search): add pagefind + @astrojs/sitemap"
```

### Task 7.2: Search page

**Files:**
- Create: `src/pages/search.astro`

- [ ] **Step 1: Page**

```astro
---
// src/pages/search.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import Breadcrumb from '../components/ui/Breadcrumb.astro';
---
<BaseLayout title="Search">
  <div class="max-w-3xl mx-auto px-6 py-10">
    <Breadcrumb items={[
      { label: 'Home', href: '/adultredeploy/' },
      { label: 'Search' },
    ]} />
    <h1 class="text-page-title mt-4">Search</h1>
    <div id="search" class="mt-6"></div>
  </div>

  <link rel="stylesheet"
        href="/adultredeploy/pagefind/pagefind-ui.css" />
  <script src="/adultredeploy/pagefind/pagefind-ui.js" is:inline></script>
  <script is:inline>
    window.addEventListener('DOMContentLoaded', () => {
      new PagefindUI({
        element: '#search',
        showSubResults: true,
        resetStyles: false,
        showImages: false,
        excerptLength: 30,
      });
    });
  </script>
</BaseLayout>
```

### Task 7.3: Header search box

**Files:**
- Modify: `src/components/AppHeader.astro` (replace search icon link with a form)

- [ ] **Step 1: Replace the search link in the header**

Locate the existing search-icon `<a>` block and replace with a form:

```astro
<li>
  <form action="/adultredeploy/search" method="get" class="flex">
    <label class="sr-only" for="header-q">Search</label>
    <input id="header-q" name="q" type="search" placeholder="Search…"
           class="hidden md:inline-block w-32 lg:w-48 border border-brand-muted/40 rounded px-3 py-1 text-sm
                  focus-visible:outline focus-visible:outline-2
                  focus-visible:outline-brand-primary focus-visible:outline-offset-2" />
    <button type="submit" class="ml-1 p-2 rounded hover:bg-surface-shaded" aria-label="Submit search">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    </button>
  </form>
</li>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/search.astro src/components/AppHeader.astro
git commit -m "feat(search): add search page with Pagefind UI + header search form"
```

### Task 7.4: Build, confirm Pagefind ran, smoke-test search

- [ ] **Step 1: Build**

```bash
npm run build
ls dist/adultredeploy/pagefind/ | head
```

Expect: `pagefind.js`, `pagefind-ui.js`, `pagefind-ui.css`, index chunks.

- [ ] **Step 2: Verify search page loads**

```bash
curl -sf http://localhost:4173/adultredeploy/search | grep -q "id=\"search\"" && echo OK
```

- [ ] **Step 3: Commit (no new files; this is verification only)**

---

## Phase 8 — A11y + Lighthouse hardening

### Task 8.1: Wrap axecap + lightcap MCP calls in scripts that fail the build

**Files:**
- Create: `scripts/audit-axe.mjs`
- Create: `scripts/audit-lighthouse.mjs`

(These scripts shell out to standalone tools. Because the lightcap/axecap MCP servers are an editor convenience and not a CLI, we use the underlying tools directly: `@axe-core/cli` for axe, `lighthouse` CLI for Lighthouse.)

- [ ] **Step 1: Install audit deps**

```bash
npm install --save-dev @axe-core/cli lighthouse playwright-core
```

- [ ] **Step 2: Audit script for axe**

```js
// scripts/audit-axe.mjs
import { chromium } from 'playwright-core';
import { execSync } from 'node:child_process';

const PAGES = [
  '/',
  '/programs', '/sites', '/sites/adams-county',
  '/news', '/news/ari-10-years',
  '/apps', '/about/staff',
  '/about/biographies/brad-bullock',
  '/about/meetings',
  '/about/meetings/regular-oversight/ariob-meeting-2025-1',
  '/resources', '/about/contact', '/search',
];
const BASE = process.env.AUDIT_BASE
          ?? 'http://localhost:4173/adultredeploy';

let failed = 0;
const browser = await chromium.launch({ headless: true });
for (const path of PAGES) {
  for (const viewport of [{w:1366,h:900,name:'desktop'},{w:375,h:812,name:'mobile'}]) {
    const url = `${BASE}${path}`;
    const page = await browser.newPage({ viewport: { width: viewport.w, height: viewport.h }});
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
    const result = await page.evaluate(async () => await window.axe.run(
      document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
    const v = result.violations;
    console.log(`${path} [${viewport.name}] — ${v.length} violations`);
    for (const violation of v) {
      console.log(`  ${violation.id}: ${violation.help} (${violation.nodes.length} el)`);
      for (const n of violation.nodes.slice(0,3)) console.log(`    → ${n.target.join(' ')}`);
    }
    if (v.length) failed++;
    await page.close();
  }
}
await browser.close();
if (failed) {
  console.error(`\n${failed} page/viewport combinations had violations.`);
  process.exit(1);
}
console.log('\nAll pages clean.');
```

- [ ] **Step 3: Lighthouse audit script — shells out to the Lighthouse CLI**

```js
// scripts/audit-lighthouse.mjs
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';

const PAGES = ['/', '/programs', '/sites/adams-county', '/news',
               '/apps', '/about/staff', '/about/meetings', '/resources',
               '/about/contact', '/search'];
const BASE = process.env.AUDIT_BASE
          ?? 'http://localhost:4173/adultredeploy';
const THRESHOLDS = { accessibility: 1.0, 'best-practices': 0.95 };

mkdirSync('.audit/lighthouse', { recursive: true });
let failed = 0;
for (const path of PAGES) {
  for (const preset of ['desktop', 'mobile']) {
    const url = `${BASE}${path}`;
    const out = `.audit/lighthouse/${preset}${path.replace(/\//g,'_') || '_root'}.json`;
    const presetFlag = preset === 'desktop' ? '--preset=desktop' : '';
    execSync(
      `npx lighthouse ${url} --quiet --chrome-flags="--headless=new" ` +
      `${presetFlag} --only-categories=accessibility,best-practices ` +
      `--output=json --output-path=${out}`,
      { stdio: ['ignore', 'inherit', 'inherit'] },
    );
    const report = JSON.parse(readFileSync(out, 'utf8'));
    for (const [k, min] of Object.entries(THRESHOLDS)) {
      const got = report.categories[k]?.score ?? 0;
      const ok = got >= min;
      console.log(`${path} [${preset}] ${k}: ${(got*100).toFixed(0)}` +
                  ` (min ${(min*100).toFixed(0)}) ${ok ? 'OK' : 'FAIL'}`);
      if (!ok) failed++;
    }
  }
}
if (failed) { console.error(`\n${failed} threshold failures.`); process.exit(1); }
console.log('\nAll thresholds met.');
```

This uses the standard `lighthouse` npm package as a CLI (already in devDependencies from Step 1). For interactive ad-hoc audits during development, the lightcap MCP server remains the better tool — it formats output for the editor. This CLI script is for the optional CI gate.

- [ ] **Step 4: Commit**

```bash
git add scripts/audit-*.mjs package.json package-lock.json
git commit -m "feat(audit): add axe + lighthouse audit scripts"
```

### Task 8.2: First-pass audit and fix iteration

- [ ] **Step 1: Start the audit server, run the axe script**

```bash
# audit server should already be running on :4173
npm run audit:axe
```

Expect: 0 violations (this is the target). Any violations → diagnose and fix.

- [ ] **Step 2: For each violation found, fix in-place, rebuild, retry**

Document each fix as its own commit so they're individually reviewable.

- [ ] **Step 3: Run axecap (MCP) on the same page set as a cross-check** (interactive, not in the script)

### Task 8.3: Manual axe DevTools pass

- [ ] **Step 1: Open each representative page in Chrome with the axe DevTools extension, enable best-practices + experimental rules, run scan, save the JSON.**

For each page, target 0 serious findings.

- [ ] **Step 2: Fix each finding; commit per fix**

### Task 8.4: Manual screen-reader + zoom + forced-colors pass

- [ ] **Step 1: VoiceOver pass (Safari)**

Open each representative page, navigate with VO+arrow, note any incorrect announcements. Fix the markup that causes them.

- [ ] **Step 2: 320px viewport check**

Open Chrome DevTools, set viewport to 320×768, scroll every page. No overflow.

- [ ] **Step 3: 200% and 400% zoom**

Chrome zoom controls. No horizontal scroll, no clipped content.

- [ ] **Step 4: Forced colors mode**

Chrome → Rendering panel → "Emulate CSS media feature forced-colors: active". Confirm icons + buttons still legible.

---

## Phase 9 — Cutover

### Task 9.1: Final review checklist (gate to merge)

- [ ] All representative page types: axe 0, lightcap A11y 100/100.
- [ ] Manual axe DevTools pass: 0 serious findings.
- [ ] Manual screen-reader pass complete.
- [ ] Side-by-side review of 5 random Strapi entries per type — content renders correctly.
- [ ] Preview deploy stable on Netlify for ≥ 3 days.

### Task 9.2: Tag last Vue build as v1-final

```bash
git checkout master
git tag -a v1-final -m "Final Vue 2 + Vuetify 2 build before Astro rewrite"
git push origin v1-final     # if remote is set up
git checkout astro-rewrite
```

### Task 9.3: Merge to master

**Option A — Merge (cleanest, default):**

```bash
git checkout master
git merge --no-ff astro-rewrite -m "Merge astro-rewrite: full Astro/Tailwind rewrite"
git push origin master
```

**Option B — Swap branches (if the team wants the old Vue branch preserved as `vue-legacy`):**

```bash
git branch -m master vue-legacy
git branch -m astro-rewrite master
git push origin --delete master       # only after Netlify is repointed
git push origin master vue-legacy
```

### Task 9.4: Update Netlify production branch (only for Option B)

In Netlify UI → site settings → build & deploy → continuous deployment → production branch → set to `master` (the renamed Astro branch).

### Task 9.5: Verify rollback path

- [ ] Confirm `git revert <merge-commit>` (Option A) or repointing Netlify back to `vue-legacy` (Option B) restores the old site cleanly.

---

## Done definition

The plan is complete when:
- The site at `https://icjia.illinois.gov/adultredeploy/` is served from the Astro build.
- `master` HEAD contains zero Vue/Vuetify/Vue-CLI artifacts.
- All representative pages audit clean per the success criteria in the spec.
- Plausible analytics still report page views as before.
- The current production search index (Pagefind) returns reasonable results for "annual report", "ad-hoc", "Bullock".
