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
] as const;

export type MeetingCategory = typeof MEETING_CATEGORIES[number];
export type MeetingCategoryEnum = MeetingCategory['enum'];

export const enumToSlug = Object.fromEntries(
  MEETING_CATEGORIES.map((c) => [c.enum, c.slug]),
) as Record<string, string>;

export const slugToCategory = Object.fromEntries(
  MEETING_CATEGORIES.map((c) => [c.slug, c]),
) as Record<string, MeetingCategory>;
