// src/lib/live/data/meeting-cats.mjs
// SINGLE source of truth for ARI Oversight Board committee categories and the
// enum → route-slug mapping. Plain ESM (no TS) so BOTH the Node build scripts
// (scripts/*.mjs) and the browser/Astro TS code import the exact same data and
// can never drift. TS types live in the sibling meeting-cats.d.mts.
export const MEETING_CATEGORIES = [
  { enum: 'adHoc',         slug: 'ad-hoc',
    title: 'Ad Hoc Committee',
    short: 'Ad Hoc' },
  { enum: 'outreach',      slug: 'outreach',
    title: 'Outreach, Technical Assistance & Communication Committee',
    short: 'Outreach' },
  { enum: 'performance',   slug: 'performance',
    title: 'Performance Measurement Committee',
    short: 'Performance Measurement' },
  { enum: 'regular',       slug: 'regular-oversight',
    title: 'Regular Oversight Meeting',
    short: 'Regular Oversight' },
  { enum: 'siteSelection', slug: 'site-selection',
    title: 'Site Selection & Monitoring Committee',
    short: 'Site Selection' },
];

export const MEETING_ENUM_TO_SLUG = Object.fromEntries(
  MEETING_CATEGORIES.map((c) => [c.enum, c.slug]),
);
