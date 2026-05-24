// scripts/check-links.mjs
// Crawl every dist/**/index.html, extract hrefs, classify, and report broken links.
//
// Internal hrefs (/adultredeploy/...) are checked against the filesystem.
// External hrefs (http[s]://...) are HEAD-checked (falls back to GET on 405).
// Anchor-only (#foo) and mailto:/tel: links are skipped.
//
// Usage:  node scripts/check-links.mjs [--external-only] [--internal-only]

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.resolve(ROOT, 'dist');
const BASE = '/adultredeploy';
const CONCURRENCY = 12;
const TIMEOUT_MS = 12_000;

const args = new Set(process.argv.slice(2));
const skipExternal = args.has('--internal-only');
const skipInternal = args.has('--external-only');

// --- 1. Find every HTML file under dist/ ---------------------------------
async function walkHtml(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith('_') || e.name === 'pagefind') continue;
      await walkHtml(p, out);
    } else if (e.name.endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

// --- 2. Extract hrefs from each file -------------------------------------
// Skip <link rel="preconnect|preload|dns-prefetch"> — those are network hints
// not navigable URLs, and root CDN hosts (fonts.gstatic.com) often 404 on /.
const LINK_RX = /<link\b([^>]*)>/gi;
const ANCHOR_RX = /<(a|area)\b([^>]*)>/gi;
const HREF_ATTR = /\bhref=("|')([^"']+)\1/i;
const REL_ATTR = /\brel=("|')([^"']+)\1/i;
const HINT_RELS = new Set(['preconnect', 'preload', 'prefetch', 'dns-prefetch',
                          'modulepreload', 'icon', 'apple-touch-icon', 'manifest']);

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function extractHrefs(file) {
  const html = await fs.readFile(file, 'utf8');
  const hrefs = new Set();
  // <link rel="..."> — only count canonical/alternate, skip network hints
  for (const m of html.matchAll(LINK_RX)) {
    const attrs = m[1];
    const hrefM = attrs.match(HREF_ATTR);
    const relM = attrs.match(REL_ATTR);
    if (!hrefM) continue;
    const rels = relM ? relM[2].split(/\s+/).map((r) => r.toLowerCase()) : [];
    if (rels.some((r) => HINT_RELS.has(r))) continue;
    hrefs.add(decode(hrefM[2]));
  }
  // <a> and <area> hrefs
  for (const m of html.matchAll(ANCHOR_RX)) {
    const hrefM = m[2].match(HREF_ATTR);
    if (hrefM) hrefs.add(decode(hrefM[2]));
  }
  return [...hrefs];
}

// --- 3. Classify hrefs ---------------------------------------------------
// Absolute URLs to our own production host are treated as internal so the
// filesystem check resolves them, instead of HEAD-ing prod for our own pages.
const SELF_ORIGIN = 'https://icjia.illinois.gov';

function classify(href) {
  if (!href || href.startsWith('#')) return { type: 'skip' };
  if (href.startsWith('mailto:') || href.startsWith('tel:')) {
    return { type: 'skip' };
  }
  if (href.startsWith('javascript:')) return { type: 'skip' };
  if (href.startsWith(`${SELF_ORIGIN}${BASE}`)) {
    return { type: 'internal', path: href.slice(SELF_ORIGIN.length) };
  }
  if (/^https?:\/\//i.test(href)) return { type: 'external', url: href };
  if (href.startsWith('//')) return { type: 'external', url: 'https:' + href };
  if (href.startsWith('/')) return { type: 'internal', path: href };
  // relative — treat as internal, but we don't currently emit any
  return { type: 'relative', path: href };
}

// --- 4. Internal-href resolver -------------------------------------------
// Maps "/adultredeploy/news/foo" → "dist/news/foo/index.html" or "dist/news/foo.html"
async function exists(p) {
  try { await fs.stat(p); return true; } catch { return false; }
}

async function checkInternal(hrefPath) {
  // Strip base
  let rel = hrefPath;
  if (rel.startsWith(BASE)) rel = rel.slice(BASE.length) || '/';
  // Drop query / hash
  rel = rel.replace(/[?#].*$/, '');
  if (rel === '' || rel === '/') return exists(path.join(DIST, 'index.html'));
  // Try direct file (favicon.ico, .pdf, .png, etc.)
  const direct = path.join(DIST, rel);
  if (await exists(direct)) return true;
  // Try as directory with index.html
  const asDir = path.join(DIST, rel, 'index.html');
  if (await exists(asDir)) return true;
  // Try with .html extension (e.g. 404.html)
  const asHtml = path.join(DIST, `${rel}.html`);
  if (await exists(asHtml)) return true;
  return false;
}

// --- 5. External-href HEAD checker ---------------------------------------
// Use a real browser UA — many .gov and CDN hosts reject default Node UA.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

async function fetchWithTimeout(url, method) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': UA,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
    });
  } finally {
    clearTimeout(t);
  }
}

async function checkExternal(url) {
  try {
    let res = await fetchWithTimeout(url, 'HEAD');
    // Some hosts reject HEAD. Retry as GET for ambiguous status codes.
    if (!res.ok && [400, 403, 405, 501].includes(res.status)) {
      res = await fetchWithTimeout(url, 'GET');
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err.code || err.message };
  }
}

// --- 6. Main -------------------------------------------------------------
const files = await walkHtml(DIST);
console.log(`Scanning ${files.length} HTML files...`);

// page → list of hrefs
const pageHrefs = new Map();
const allHrefs = new Map(); // href → first page that used it

for (const file of files) {
  const hrefs = await extractHrefs(file);
  pageHrefs.set(file, hrefs);
  for (const h of hrefs) {
    if (!allHrefs.has(h)) allHrefs.set(h, file);
  }
}

// internal: resolved path (already stripped of self-origin) -> first source href
const internal = new Map();
const external = new Set();
for (const [href] of allHrefs) {
  const c = classify(href);
  if (c.type === 'internal') {
    if (!internal.has(c.path)) internal.set(c.path, href);
  }
  if (c.type === 'external') external.add(c.url);
}

console.log(`Found ${allHrefs.size} unique hrefs — ${internal.size} internal, ${external.size} external`);

const brokenInternal = [];
const brokenExternal = [];

// Check internal links
if (!skipInternal) {
  console.log('\nChecking internal links...');
  for (const [resolvedPath, originalHref] of internal) {
    if (!(await checkInternal(resolvedPath))) {
      brokenInternal.push({
        href: originalHref,
        source: allHrefs.get(originalHref),
      });
    }
  }
  console.log(`  ${brokenInternal.length} broken internal link(s)`);
}

// Check external links (concurrent)
if (!skipExternal) {
  console.log(`\nChecking ${external.size} external links (concurrency ${CONCURRENCY})...`);
  const queue = [...external];
  let done = 0;
  async function worker() {
    while (queue.length) {
      const url = queue.shift();
      const res = await checkExternal(url);
      done++;
      if (!res.ok) {
        brokenExternal.push({
          url,
          status: res.status,
          error: res.error,
          source: allHrefs.get(url),
        });
        process.stdout.write(`  [${done}/${external.size}] BROKEN ${res.status || res.error}: ${url}\n`);
      } else if (done % 25 === 0) {
        process.stdout.write(`  [${done}/${external.size}]\n`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`  ${brokenExternal.length} broken external link(s)`);
}

// --- 7. Report -----------------------------------------------------------
const distRel = (p) => path.relative(DIST, p);

console.log('\n========== BROKEN LINK REPORT ==========');
if (brokenInternal.length) {
  console.log(`\nINTERNAL (${brokenInternal.length}):`);
  for (const b of brokenInternal) {
    console.log(`  ${b.href}\n    first seen in dist/${distRel(b.source)}`);
  }
}
if (brokenExternal.length) {
  console.log(`\nEXTERNAL (${brokenExternal.length}):`);
  // Group by error pattern
  const groups = new Map();
  for (const b of brokenExternal) {
    const key = b.status || b.error || 'unknown';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(b);
  }
  for (const [key, items] of [...groups.entries()].sort()) {
    console.log(`\n  [${key}] (${items.length})`);
    for (const b of items.slice(0, 20)) {
      console.log(`    ${b.url}\n      seen in dist/${distRel(b.source)}`);
    }
    if (items.length > 20) {
      console.log(`    ... and ${items.length - 20} more`);
    }
  }
}
if (!brokenInternal.length && !brokenExternal.length) {
  console.log('\nNo broken links detected.');
}

process.exit(brokenInternal.length || brokenExternal.length ? 1 : 0);
