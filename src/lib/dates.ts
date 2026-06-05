// src/lib/dates.ts
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  // Meeting/post dates are DATE-ONLY (the CMS stores a date with a throwaway
  // time, as midnight-UTC). Format by the stored Y-M-D so the date shows exactly
  // as entered and is NEVER shifted a day by the viewer's timezone — e.g.
  // 2026-06-05T00:00:00Z must read "June 5, 2026", not "June 4".
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (m) return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function isoDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}
