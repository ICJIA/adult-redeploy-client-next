// scripts/build-svg.mjs
// Transform the legacy Illinois SVG template into a static partial:
// - Strip Vue template wrapper + directives
// - Add a11y attributes (data-county, tabindex, role, aria-label) to
//   active county paths so the runtime can wire Alpine handlers

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.resolve(__dirname, 'illinois-svg.html');
const COUNTIES = path.resolve(ROOT, 'src/lib/counties-data.json');
const OUT = path.resolve(ROOT, 'src/components/svg/illinois-paths.html');

const [raw, countiesText] = await Promise.all([
  fs.readFile(SRC, 'utf8'),
  fs.readFile(COUNTIES, 'utf8'),
]);
const counties = JSON.parse(countiesText);
const byId = Object.fromEntries(counties.map((c) => [c.pathId, c]));

// Extract just the <svg>...</svg>
const open = raw.indexOf('<svg');
const close = raw.lastIndexOf('</svg>') + '</svg>'.length;
let svg = raw.slice(open, close);

// Strip any Vue directive attributes (defense — should be none here)
svg = svg.replace(/\s+(?::[\w-]+|@[\w.-]+|v-[\w-]+)="[^"]*"/g, '');

// Rewrite each `id="usiljsN" ...` opening attribute set to inject data-county
svg = svg.replace(
  /<path([^>]*?)\bid="(usiljs\d+)"([^>]*?)>/g,
  (_match, pre, id, post) => {
    const meta = byId[id];
    if (!meta || !meta.active || !meta.slug) {
      // Inactive county: keep as static (no interactivity, no a11y attrs)
      return `<path${pre}id="${id}"${post}>`;
    }
    // aria-label: county name + "site" hint (helps screen-reader users
    // know it is an interactive element with a destination).
    const isCircuit = meta.slug.includes('judicial-circuit');
    const label = isCircuit
      ? `${meta.name} County — part of the ${meta.slug.replace(/-/g, ' ')}`
      : `${meta.name} County — Adult Redeploy site`;
    return (
      `<path${pre}id="${id}"${post}` +
      ` data-county="${meta.slug}" data-name="${meta.name}"` +
      ` tabindex="0" role="button" aria-label="${label}">`
    );
  },
);

await fs.writeFile(OUT, svg);
const activeCount = counties.filter((c) => c.active && c.slug).length;
console.log(`Wrote ${OUT} — ${svg.length} bytes, ${activeCount} active counties tagged`);
