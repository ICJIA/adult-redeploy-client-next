// scripts/fetch-content.mjs
// Build-time Strapi fetcher. Writes a single JSON consumed by content collections.

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
    console.error(err?.message ?? err);
    process.exit(1);
  }

  // Normalize: prefer `news` over `posts` everywhere downstream.
  if (data.posts && !data.news) data.news = data.posts;
  delete data.posts;

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
