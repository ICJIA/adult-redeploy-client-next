// src/lib/live/behavior/signature.ts
// Compact, order-sensitive content signature for a list of rows. Compared
// against the baseline signature serialized into the page at build time; equal
// → no swap. Returns a short FNV-1a hash so the embedded baseline stays tiny
// even for large index tables (~200 rows). JSON encoding before hashing keeps
// it collision-free at the field level (values are quoted/delimited, so
// {slug:'ab',title:'c'} can't match {slug:'a',title:'bc'}).

function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

export function stableSignature(rows: any[], keys?: string[]): string {
  const pick = (r: any) => (keys ? keys.map((k) => r?.[k] ?? null) : r);
  return fnv1a(JSON.stringify(rows.map(pick)));
}
