// scripts/fetch-cms-images.mjs
//
// Scan the fetched Strapi data for ari.icjia-api.cloud image URLs, download
// each one, generate WebP variants at responsive widths, and write a manifest
// that the markdown renderer + page templates use to swap in optimized URLs +
// intrinsic dimensions.
//
// Outputs:
//   public/_cms-img/<hash>-<width>.webp   — served at /adultredeploy/_cms-img/
//   src/lib/cms-image-manifest.json       — keyed by original Strapi URL
//
// Downloads are cached under .cache/cms-img/<hash> so re-builds skip the
// network when nothing changed.

import sharp from 'sharp';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.resolve(ROOT, 'src/content/_data.json');
const OUT_DIR = path.resolve(ROOT, 'public/_cms-img');
const CACHE_DIR = path.resolve(ROOT, '.cache/cms-img');
const MANIFEST = path.resolve(ROOT, 'src/lib/cms-image-manifest.json');

const STRAPI_ORIGIN = 'https://ari.icjia-api.cloud';
const URL_RX = new RegExp(
  `https?:\\/\\/ari\\.icjia-api\\.cloud\\/uploads\\/[^"'\\s\\)<>]+\\.(?:jpg|jpeg|png|gif|webp)`,
  'gi',
);

// Widths we generate. Smaller than the original is skipped; original is
// always included so we have a non-downscaled WebP available.
const TARGET_WIDTHS = [640, 960, 1280];

function hashKey(url) {
  return crypto.createHash('sha1').update(url).digest('hex').slice(0, 10);
}

const IMAGE_EXT_RX = /\.(jpg|jpeg|png|gif|webp)$/i;
const DATA_URI_RX = /^data:image\/(jpe?g|png|webp|gif);base64,/i;

function collectUrls(node, out) {
  if (node == null) return;
  if (typeof node === 'string') {
    for (const m of node.matchAll(URL_RX)) out.add(m[0]);
    return;
  }
  if (Array.isArray(node)) {
    for (const v of node) collectUrls(v, out);
    return;
  }
  if (typeof node === 'object') {
    // Strapi nests image objects as { url: "/uploads/foo.jpg", width, height, ... }
    // but also PDFs and other attachments — only consider image extensions.
    if (typeof node.url === 'string'
        && node.url.startsWith('/uploads/')
        && IMAGE_EXT_RX.test(node.url)) {
      out.add(STRAPI_ORIGIN + node.url);
    }
    for (const v of Object.values(node)) collectUrls(v, out);
  }
}

// Find every base64 data-URI image embedded in the dataset (researchhub
// returns `image`, `splash`, `thumbnail` etc. as inline data URIs that can
// be 500+ KB each). Returns the parent objects plus the field names so we
// can rewrite them back to a small key string after processing.
const BASE64_FIELDS = ['image', 'splash', 'thumbnail'];

function collectBase64Refs(node, out) {
  if (node == null || typeof node !== 'object') return;
  if (Array.isArray(node)) { for (const v of node) collectBase64Refs(v, out); return; }
  for (const key of Object.keys(node)) {
    const v = node[key];
    if (BASE64_FIELDS.includes(key)
        && typeof v === 'string'
        && DATA_URI_RX.test(v)) {
      out.push({ parent: node, field: key, dataUri: v });
    } else if (v && typeof v === 'object') {
      collectBase64Refs(v, out);
    }
  }
}

async function loadCached(url, hash) {
  const cacheFile = path.join(CACHE_DIR, hash);
  try {
    return await fs.readFile(cacheFile);
  } catch {
    const res = await fetch(url, {
      headers: {
        'user-agent': 'ARI-build/2.1 (+icjia.illinois.gov/adultredeploy)',
      },
    });
    if (!res.ok) {
      console.warn(`[cms-img] HTTP ${res.status} ${url}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(cacheFile, buffer);
    return buffer;
  }
}

async function processBuffer(buffer, hash, manifestKey) {
  let meta;
  try {
    meta = await sharp(buffer).metadata();
  } catch (err) {
    console.warn(`[cms-img] sharp metadata failed (${hash}): ${err.message}`);
    return null;
  }
  const origW = meta.width ?? 0;
  const origH = meta.height ?? 0;
  if (!origW || !origH) return null;

  // Cap the largest generated variant at MAX_CMS_WIDTH. Some Strapi uploads are
  // 3000–6700px wide; appending the raw origW produced multi-megabyte variants
  // (e.g. a 6720px / 1.4 MB WebP). Worse, that largest variant is what
  // getCmsImage() uses as the <img src> fallback (entry.largest) — so it became
  // the desktop LCP element and dragged Lighthouse Performance to 56. 1600px
  // covers every on-page display size; the full-bleed hero uses a separate
  // local-asset pipeline, so nothing on the site needs a wider CMS variant.
  const MAX_CMS_WIDTH = 1600;
  const capW = Math.min(origW, MAX_CMS_WIDTH);
  const widths = [...new Set(
    [...TARGET_WIDTHS.filter((w) => w < capW), capW]
  )].sort((a, b) => a - b);

  const variants = [];
  for (const w of widths) {
    const fname = `${hash}-${w}.webp`;
    const outPath = path.join(OUT_DIR, fname);
    try {
      await sharp(buffer)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outPath);
    } catch (err) {
      console.warn(`[cms-img] sharp resize failed (${hash}): ${err.message}`);
      continue;
    }
    variants.push({ w, src: `/_cms-img/${fname}` });
  }
  if (!variants.length) return null;

  return {
    key: manifestKey,
    entry: {
      width: origW,
      height: origH,
      variants,
      largest: variants[variants.length - 1].src,
    },
  };
}

async function main() {
  const data = JSON.parse(await fs.readFile(DATA_PATH, 'utf8'));
  const urls = new Set();
  collectUrls(data, urls);

  const base64Refs = [];
  collectBase64Refs(data, base64Refs);

  console.log(
    `[cms-img] found ${urls.size} unique URL(s), `
    + `${base64Refs.length} inline base64 image(s)`,
  );

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(CACHE_DIR, { recursive: true });

  const manifest = {};
  let downloaded = 0, cached = 0, skipped = 0;
  let base64Processed = 0, base64Skipped = 0;
  const t0 = Date.now();

  // --- 1. Strapi-hosted images by URL --------------------------------------
  for (const url of [...urls].sort()) {
    const hash = hashKey(url);
    const cachePath = path.join(CACHE_DIR, hash);
    const hadCache = await fs.stat(cachePath).then(() => true).catch(() => false);
    const buffer = await loadCached(url, hash);
    if (!buffer) { skipped++; continue; }
    if (hadCache) cached++; else downloaded++;

    const res = await processBuffer(buffer, hash, url);
    if (!res) { skipped++; continue; }
    manifest[res.key] = res.entry;
  }

  // --- 2. Inline base64 images (researchhub apps/articles) ----------------
  // Hash the base64 payload so identical images dedupe; rewrite the parent
  // object's field to a small `cms-base64:<hash>` key so _data.json doesn't
  // ship the full 500 KB string into every page render.
  for (const ref of base64Refs) {
    const commaIdx = ref.dataUri.indexOf(',');
    if (commaIdx < 0) { base64Skipped++; continue; }
    const b64 = ref.dataUri.slice(commaIdx + 1);
    const hash = crypto.createHash('sha1').update(b64).digest('hex').slice(0, 10);
    const manifestKey = `cms-base64:${hash}`;

    if (!manifest[manifestKey]) {
      const buffer = Buffer.from(b64, 'base64');
      const res = await processBuffer(buffer, hash, manifestKey);
      if (!res) { base64Skipped++; ref.parent[ref.field] = null; continue; }
      manifest[res.key] = res.entry;
      base64Processed++;
    }
    // Rewrite the field so consumers look up via the same helper.
    ref.parent[ref.field] = manifestKey;
  }

  // Persist the rewritten data so subsequent build steps don't see the base64.
  if (base64Refs.length) {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
  }

  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  const totalKB = await Object.values(manifest)
    .flatMap((m) => m.variants)
    .map((v) => v.src)
    .reduce(async (accP, s) => {
      const acc = await accP;
      const stat = await fs.stat(path.join(ROOT, 'public', s)).catch(() => null);
      return acc + (stat ? stat.size : 0);
    }, Promise.resolve(0));
  console.log(
    `[cms-img] wrote ${Object.keys(manifest).length} entries, `
    + `${downloaded} downloaded / ${cached} cached / ${skipped} skipped, `
    + `${base64Processed} inline / ${base64Skipped} inline-skipped, `
    + `total ${(totalKB / 1024).toFixed(0)} KiB on disk, `
    + `${Date.now() - t0}ms`,
  );
}

main();
