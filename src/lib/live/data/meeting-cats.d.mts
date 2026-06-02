// Types for meeting-cats.mjs (shared, plain-ESM data module).
export interface MeetingCategory {
  enum: 'adHoc' | 'outreach' | 'performance' | 'regular' | 'siteSelection';
  slug: string;
  title: string;
  short: string;
}
export declare const MEETING_CATEGORIES: readonly MeetingCategory[];
export declare const MEETING_ENUM_TO_SLUG: Record<string, string>;
