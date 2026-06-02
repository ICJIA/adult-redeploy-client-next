// src/lib/live/config.ts
// ARI-specific configuration — the per-site seam. Everything else under
// src/lib/live/ is generic and can be lifted into a shared package; a consuming
// site supplies its own config.ts (+ render/ functions) like this one.

import type { LiveConfig } from './types';
import { NEWS_LATEST, MEETINGS_BRIEF } from './data/queries';
import { renderHomeNews, NEWS_SIG_KEYS, type NewsRow } from './render/home-news';
import { renderHomeMeetings, HOME_MTG_SIG_KEYS, type MeetingRow } from './render/home-meetings';
import { renderMeetingsSplash, SPLASH_SIG_KEYS } from './render/meetings-splash';
import {
  newsIndexRows, meetingsIndexRows, NEWS_INDEX_SIG_KEYS, MTG_INDEX_SIG_KEYS,
} from './render/listing-rows';

const env = import.meta.env as unknown as Record<string, string | undefined>;
const endpoint = env.PUBLIC_STRAPI_ENDPOINT ?? 'https://ari.icjia-api.cloud/graphql';
const basePath = env.BASE_URL || '/adultredeploy';

// Future meetings (scheduledDate > now), soonest first — mirrors the .astro
// transforms. `now` is evaluated per fetch so the list self-corrects by date.
function upcoming(data: any, limit: number): MeetingRow[] {
  const now = new Date().toISOString();
  return ((data?.meetings ?? []) as MeetingRow[])
    .filter((m) => m.scheduledDate && m.scheduledDate > now)
    .sort((a, b) => ((a.scheduledDate ?? '') < (b.scheduledDate ?? '') ? -1 : 1))
    .slice(0, limit);
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
        meetingsIndexRows(data?.meetings ?? [], ctx, params as { enum: string; slug: string }),
      signatureKeys: MTG_INDEX_SIG_KEYS,
      mode: 'xfor',
      announceLabel: 'Meetings list',
    },
  },
  entries: {},
};
