// src/lib/live/config.ts
// ARI-specific configuration — the per-site seam. Everything else under
// src/lib/live/ is generic and can be lifted into a shared package; a consuming
// site supplies its own config.ts (+ render/ functions) like this one.

import type { LiveConfig } from './types';
import {
  NEWS_LATEST, MEETINGS_BRIEF, SITES_BRIEF,
  NEWS_BY_SLUG, MEETING_BY_SLUG, SITE_BY_SLUG, PAGE_HOME,
  SECTION_BY_SLUG,
} from './data/queries';
import { renderHomeNews, NEWS_SIG_KEYS, type NewsRow } from './render/home-news';
import { renderHomeMeetings, HOME_MTG_SIG_KEYS, selectUpcoming, type MeetingRow } from './render/home-meetings';
import { renderMeetingsSplash, SPLASH_SIG_KEYS } from './render/meetings-splash';
import {
  newsIndexRows, meetingsIndexRows, sitesIndexRows,
  NEWS_INDEX_SIG_KEYS, MTG_INDEX_SIG_KEYS, SITES_INDEX_SIG_KEYS,
} from './render/listing-rows';
import { applyNewsDetail, NEWS_DETAIL_SIG } from './render/news-detail';
import { applyMeetingDetail, MTG_DETAIL_SIG } from './render/meeting-detail';
import { applySiteDetail, SITE_DETAIL_SIG } from './render/site-detail';
import { applyHomeAbout, ABOUT_SIG } from './render/home-about';
import { applyPageBody, PAGE_BODY_SIG } from './render/page-body';

const env = import.meta.env as unknown as Record<string, string | undefined>;
const endpoint = env.PUBLIC_STRAPI_ENDPOINT ?? 'https://ari.icjia-api.cloud/graphql';
const basePath = env.BASE_URL || '/adultredeploy';

// Meetings dated today-or-later (date-only, Chicago day), soonest first.
// Delegates to the shared selectUpcoming so the homepage list, the splash, and
// the live islands all agree. See render/home-meetings.
function upcoming(data: any, limit: number): MeetingRow[] {
  return selectUpcoming((data?.meetings ?? []) as MeetingRow[], limit);
}

export const liveConfig: LiveConfig = {
  ctx: { endpoint, basePath },
  collections: {
    // Homepage "ARI NEWS" — latest 4 by publicationDate (mirrors HomeNews.astro).
    homeNews: {
      query: NEWS_LATEST,
      variables: { limit: 20 },
      select: (data) =>
        ((data?.posts ?? []) as NewsRow[])
          .filter((p) => p.publicationDate)
          .sort((a, b) => ((a.publicationDate ?? '') < (b.publicationDate ?? '') ? 1 : -1))
          .slice(0, 4),
      render: (rows, ctx) => renderHomeNews(rows as NewsRow[], ctx),
      signatureKeys: NEWS_SIG_KEYS,
      mode: 'innerHTML',
      announceLabel: 'ARI news',
    },
    // Homepage "UPCOMING MEETINGS" — next 4 future meetings (mirrors HomeMeetings).
    homeMeetings: {
      query: MEETINGS_BRIEF,
      variables: { limit: 300 },
      select: (data) => upcoming(data, 4),
      render: (rows, ctx) => renderHomeMeetings(rows as MeetingRow[], ctx),
      signatureKeys: HOME_MTG_SIG_KEYS,
      mode: 'innerHTML',
      announceLabel: 'Upcoming meetings',
    },
    // /about/meetings feature splash — the single next upcoming meeting, or none.
    meetingsSplash: {
      query: MEETINGS_BRIEF,
      variables: { limit: 300 },
      select: (data) => upcoming(data, 1),
      render: (rows, ctx) => renderMeetingsSplash(rows as MeetingRow[], ctx),
      signatureKeys: SPLASH_SIG_KEYS,
      mode: 'innerHTML',
      announceLabel: 'Next meeting',
    },
    // News archive table — all news as {publicationDate,title,href} rows (x-for).
    newsIndex: {
      query: NEWS_LATEST,
      variables: { limit: 300 },
      select: (data, ctx) => newsIndexRows(data?.posts ?? [], ctx),
      signatureKeys: NEWS_INDEX_SIG_KEYS,
      mode: 'xfor',
      announceLabel: 'News list',
    },
    // Meetings index — per-committee recent rows; the committee arrives via params.
    meetingsIndex: {
      query: MEETINGS_BRIEF,
      variables: { limit: 300 },
      select: (data, ctx, params) =>
        meetingsIndexRows(data?.meetings ?? [], ctx, params as { enum: string; slug: string },
          (params as { limit?: number })?.limit),
      signatureKeys: MTG_INDEX_SIG_KEYS,
      mode: 'xfor',
      announceLabel: 'Meetings list',
    },
    // /sites table — all funded sites as {title,siteType,href} rows, A→Z (x-for).
    sitesIndex: {
      query: SITES_BRIEF,
      variables: { limit: 300 },
      select: (data, ctx) => sitesIndexRows(data?.sites ?? [], ctx),
      signatureKeys: SITES_INDEX_SIG_KEYS,
      mode: 'xfor',
      announceLabel: 'Sites list',
    },
  },
  entries: {
    // News detail — full body; markdown re-rendered client-side only on change.
    newsDetail: {
      query: NEWS_BY_SLUG,
      variables: (slug) => ({ where: { isPublished: true, slug } }),
      select: (data) => (data?.posts ?? [])[0] ?? null,
      applyTo: applyNewsDetail,
      signature: NEWS_DETAIL_SIG,
      announceLabel: 'Article',
    },
    // Meeting detail — body + Meeting Materials list.
    meetingDetail: {
      query: MEETING_BY_SLUG,
      variables: (slug) => ({ where: { isPublished: true, slug } }),
      select: (data) => (data?.meetings ?? [])[0] ?? null,
      applyTo: applyMeetingDetail,
      signature: MTG_DETAIL_SIG,
      announceLabel: 'Meeting',
    },
    // Site detail — summary + body; markdown re-rendered client-side only on change.
    siteDetail: {
      query: SITE_BY_SLUG,
      variables: (slug) => ({ where: { slug } }),
      select: (data) => (data?.sites ?? [])[0] ?? null,
      applyTo: applySiteDetail,
      signature: SITE_DETAIL_SIG,
      announceLabel: 'Site',
    },
    // Homepage About — the CMS `home` page body.
    homeAbout: {
      query: PAGE_HOME,
      variables: () => ({}),
      select: (data) => (data?.pages ?? [])[0] ?? null,
      applyTo: applyHomeAbout,
      signature: ABOUT_SIG,
      announceLabel: 'Page',
    },
    // Section landing pages — the shared [section]/index.astro body
    // (/grants, /about, /approach). Reuses the generic page-body surface;
    // updatedAt is the change signal (publishedAt intentionally omitted).
    sectionDetail: {
      query: SECTION_BY_SLUG,
      variables: (slug) => ({ where: { isPublished: true, slug } }),
      select: (data) => (data?.sections ?? [])[0] ?? null,
      applyTo: applyPageBody,
      signature: PAGE_BODY_SIG,
      announceLabel: 'Page',
    },
  },
};
