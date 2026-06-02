// scripts/fetch-content.mjs
// Build-time Strapi fetcher. Writes a single JSON consumed by content collections.

import { request } from 'graphql-request';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { QUERY } from './strapi-query.mjs';
import { MEETING_ENUM_TO_SLUG } from '../src/lib/live/data/meeting-cats.mjs';

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
    console.error(err?.message ?? err);
    process.exit(1);
  }

  // Normalize: prefer `news` over `posts` everywhere downstream.
  if (data.posts && !data.news) data.news = data.posts;
  delete data.posts;

  // Build canonical meeting URLs from the meetings collection, then rewrite
  // any /about/meetings/<wrong-cat>/<slug> link in news/page bodies to use the
  // correct category slug. CMS authors sometimes put `regular` (the enum)
  // instead of `regular-oversight` (the route slug), or attach an adhoc
  // meeting to the wrong committee URL. Without this, SiteImprove flags
  // 301-redirected URLs as "issues" even though they resolve — better to
  // emit the canonical URL in the rendered HTML in the first place.
  const canonicalCatBySlug = {};
  for (const m of (data.meetings ?? [])) {
    if (!m.slug || !m.category) continue;
    const cat = MEETING_ENUM_TO_SLUG[m.category] ?? m.category;
    canonicalCatBySlug[m.slug] = cat;
  }
  const MEETING_URL_RX = /\/about\/meetings\/([a-z0-9-]+)\/([a-z0-9-]+)/g;
  const rewriteMeetingUrls = (s) => {
    if (typeof s !== 'string') return s;
    return s.replace(MEETING_URL_RX, (match, cat, slug) => {
      const canonical = canonicalCatBySlug[slug];
      return canonical && canonical !== cat
        ? `/about/meetings/${canonical}/${slug}`
        : match;
    });
  };
  let rewrites = 0;
  for (const bucket of ['news', 'pages', 'meetings']) {
    for (const item of (data[bucket] ?? [])) {
      if (typeof item?.content !== 'string') continue;
      const before = item.content;
      item.content = rewriteMeetingUrls(before);
      if (item.content !== before) rewrites++;
    }
  }
  if (rewrites) console.log(`[fetch] rewrote meeting URLs in ${rewrites} item(s)`);

  // Pull apps + recent articles from researchhub (separate Strapi instance).
  const RH = 'https://researchhub.icjia-api.cloud/graphql';
  const RH_QUERY = `{
    apps(sort: "date:desc", where: { status: "published" }) {
      slug title status date description image url contributors
    }
    articles(sort: "date:desc", limit: 100, where: { status: "published" }) {
      slug title status date abstract thumbnail splash authors
    }
  }`;
  try {
    const rh = await request(RH, RH_QUERY);
    data.applications = rh.apps ?? [];
    data.articles = rh.articles ?? [];
    console.log(`[fetch] researchhub apps: ${data.applications.length}, articles: ${data.articles.length}`);
  } catch (err) {
    console.warn('[fetch] researchhub fetch failed, apps and articles will be empty');
    console.warn('  ' + (err?.message ?? err));
    data.applications = [];
    data.articles = [];
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(data, null, 2));
  const stat = await fs.stat(OUT);
  const sizeKB = (stat.size / 1024).toFixed(0);

  const counts = Object.fromEntries(
    Object.entries(data).map(([k, v]) =>
      [k, Array.isArray(v) ? v.length : 0]),
  );
  console.log(`[fetch] wrote ${OUT} (${sizeKB} KiB) in ${Date.now() - t0}ms`);
  console.log(`[fetch] counts: ${JSON.stringify(counts)}`);
}

main();
