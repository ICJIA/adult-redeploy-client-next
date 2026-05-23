// scripts/build-counties.mjs
// Parses the legacy usiljsconfig.js into a JSON keyed by path id.
// Run once: node scripts/build-counties.mjs

import fs from 'node:fs/promises';
import path from 'node:path';

const SRC = '/tmp/usiljs-config.js';
const OUT = 'src/lib/counties-data.json';

const raw = await fs.readFile(SRC, 'utf8');

// The file is `const usiljsconfig = { ... };` followed by an export.
// Walk braces to find the object's matching close, ignoring any later ones.
const start = raw.indexOf('const usiljsconfig');
const open = raw.indexOf('{', raw.indexOf('=', start));
let depth = 0;
let close = -1;
for (let i = open; i < raw.length; i++) {
  if (raw[i] === '{') depth++;
  else if (raw[i] === '}') {
    depth--;
    if (depth === 0) { close = i; break; }
  }
}
if (close < 0) throw new Error('could not find matching close brace');
const objText = raw.slice(open, close + 1);

const obj = new Function(`return (${objText})`)();

const entries = Object.entries(obj)
  .filter(([id]) => id !== 'general')
  .map(([id, c]) => ({
    pathId: id,
    hover: c.hover,
    active: !!c.active,
    slug: c.slug ?? null,
    name: c.name ?? c.hover,
    circuit: c.circuit ?? null,
  }));

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(entries, null, 2));
console.log(`Wrote ${OUT} — ${entries.length} paths, ` +
            `${entries.filter((e) => e.active).length} active`);
