// scripts/build-og-image.mjs
// Render an OpenGraph / SEO image (1200×630) using the site's brand palette.
// Dark mode: primary teal background with an accent-purple → secondary-teal
// gradient corner. Emits both the SVG source and a PNG via Sharp.
//
// Outputs:
//   public/img/og-image.svg
//   public/img/og-image.png

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(ROOT, 'public/img');
const SVG_PATH = path.join(OUT_DIR, 'og-image.svg');
const PNG_PATH = path.join(OUT_DIR, 'og-image.png');

const WIDTH = 1200;
const HEIGHT = 630;

// Brand palette (from src/styles/global.css @theme)
const PRIMARY = '#043e3f';   // dark teal
const SECONDARY = '#05797a'; // mid teal
const ACCENT = '#b158c2';    // purple

const svg = `<svg xmlns="http://www.w3.org/2000/svg"
     width="${WIDTH}" height="${HEIGHT}"
     viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="corner" cx="100%" cy="100%" r="90%">
      <stop offset="0%"   stop-color="${ACCENT}"    stop-opacity="0.85" />
      <stop offset="45%"  stop-color="${SECONDARY}" stop-opacity="0.45" />
      <stop offset="100%" stop-color="${PRIMARY}"   stop-opacity="0" />
    </radialGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#02282a" />
      <stop offset="100%" stop-color="${PRIMARY}" />
    </linearGradient>
  </defs>

  <!-- background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#edge)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#corner)" />

  <!-- accent bar, top-left -->
  <rect x="80" y="80" width="120" height="6" fill="${ACCENT}" />

  <!-- title -->
  <text x="80" y="220"
        font-family="Roboto, 'Helvetica Neue', Arial, sans-serif"
        font-weight="900"
        font-size="92"
        fill="#ffffff"
        letter-spacing="-1">ADULT REDEPLOY</text>
  <text x="80" y="320"
        font-family="Roboto, 'Helvetica Neue', Arial, sans-serif"
        font-weight="900"
        font-size="92"
        fill="#ffffff"
        letter-spacing="-1">ILLINOIS</text>

  <!-- tagline -->
  <text x="80" y="410"
        font-family="Lato, 'Helvetica Neue', Arial, sans-serif"
        font-weight="400"
        font-size="28"
        fill="#ffffff"
        opacity="0.85">Community-based alternatives to incarceration.</text>
  <text x="80" y="450"
        font-family="Lato, 'Helvetica Neue', Arial, sans-serif"
        font-weight="400"
        font-size="28"
        fill="#ffffff"
        opacity="0.85">An ICJIA program.</text>

  <!-- footer URL -->
  <text x="80" y="565"
        font-family="Lato, 'Helvetica Neue', Arial, sans-serif"
        font-weight="700"
        font-size="22"
        fill="#ffffff"
        opacity="0.6"
        letter-spacing="0.8">icjia.illinois.gov/adultredeploy</text>

  <!-- accent dots, bottom-right corner -->
  <circle cx="1080" cy="540" r="8"  fill="${ACCENT}"    opacity="0.9" />
  <circle cx="1110" cy="540" r="8"  fill="${SECONDARY}" opacity="0.9" />
  <circle cx="1140" cy="540" r="8"  fill="#ffffff"      opacity="0.85" />
</svg>
`;

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.writeFile(SVG_PATH, svg);

await sharp(Buffer.from(svg))
  .png({ quality: 90, compressionLevel: 9 })
  .toFile(PNG_PATH);

const pngStat = await fs.stat(PNG_PATH);
console.log(
  `[og-image] wrote ${path.relative(ROOT, SVG_PATH)} `
  + `(${svg.length} B) and ${path.relative(ROOT, PNG_PATH)} `
  + `(${(pngStat.size / 1024).toFixed(1)} KiB)`,
);
