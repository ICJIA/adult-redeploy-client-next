// src/lib/live/config.ts
// ARI-specific configuration — the per-site seam. Everything else under
// src/lib/live/ is generic and can be lifted into a shared package; a consuming
// site supplies its own config.ts (+ render/ functions) like this one.

import type { LiveConfig } from './types';
import { NEWS_LATEST } from './data/queries';
import { renderHomeNews, NEWS_SIG_KEYS, type NewsRow } from './render/home-news';

const env = import.meta.env as unknown as Record<string, string | undefined>;
const endpoint = env.PUBLIC_STRAPI_ENDPOINT ?? 'https://ari.icjia-api.cloud/graphql';
const basePath = env.BASE_URL || '/adultredeploy';

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
  },
  entries: {},
};
