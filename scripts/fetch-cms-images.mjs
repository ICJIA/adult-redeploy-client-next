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

async function main() {
  const data = JSON.parse(await fs.readFile(DATA_PATH, 'utf8'));
  const urls = new Set();
  collectUrls(data, urls);
  console.log(`[cms-img] found ${urls.size} unique image URL(s)`);

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(CACHE_DIR, { recursive: true });

  const manifest = {};
  let downloaded = 0, cached = 0, skipped = 0;
  const t0 = Date.now();

  for (const url of [...urls].sort()) {
    const hash = hashKey(url);
    const cachePath = path.join(CACHE_DIR, hash);
    const hadCache = await fs.stat(cachePath).then(() => true).catch(() => false);
    const buffer = await loadCached(url, hash);
    if (!buffer) { skipped++; continue; }
    if (hadCache) cached++; else downloaded++;

    let meta;
    try {
      meta = await sharp(buffer).metadata();
    } catch (err) {
      console.warn(`[cms-img] sharp failed on ${url}: ${err.message}`);
      skipped++;
      continue;
    }
    const origW = meta.width ?? 0;
    const origH = meta.height ?? 0;
    if (!origW || !origH) { skipped++; continue; }

    // Choose widths: filter targets that are < original, then add original
    // so we always have an at-least-original WebP. Dedupe + sort.
    const widths = [...new Set(
      [...TARGET_WIDTHS.filter((w) => w < origW), origW]
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
        console.warn(`[cms-img] sharp resize failed: ${err.message}`);
        continue;
      }
      variants.push({ w, src: `/_cms-img/${fname}` });
    }
    if (!variants.length) { skipped++; continue; }

    manifest[url] = {
      width: origW,
      height: origH,
      variants,
      // The largest variant is the safest default `src` for old browsers
      // / no-JS contexts.
      largest: variants[variants.length - 1].src,
    };
  }

  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  const totalKB = Object.values(manifest)
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
    + `total ${((await totalKB) / 1024).toFixed(0)} KiB on disk, `
    + `${Date.now() - t0}ms`,
  );
}

main();
