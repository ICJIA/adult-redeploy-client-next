// src/lib/meetings.ts
// Category metadata for ARI Oversight Board committees. The raw array and the
// enum→route-slug map live in ./live/data/meeting-cats.mjs (plain ESM) so the
// Node build scripts (scripts/*.mjs) and the browser/Astro code share ONE
// definition and can never drift. This module adds the TS types and the
// slug→category lookup used by the Astro pages.
import { MEETING_CATEGORIES } from './live/data/meeting-cats.mjs';
import type { MeetingCategory } from './live/data/meeting-cats.mjs';

export { MEETING_CATEGORIES, MEETING_ENUM_TO_SLUG as enumToSlug } from './live/data/meeting-cats.mjs';
export type { MeetingCategory } from './live/data/meeting-cats.mjs';
export type MeetingCategoryEnum = MeetingCategory['enum'];

export const slugToCategory = Object.fromEntries(
  MEETING_CATEGORIES.map((c) => [c.slug, c]),
) as Record<string, MeetingCategory>;
