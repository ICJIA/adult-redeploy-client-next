// src/lib/jsonld.ts
// Schema.org JSON-LD builders for AI-readiness + rich results. BaseLayout emits
// the site-wide Organization on every page; pages add per-type schema (WebSite,
// WebPage, NewsArticle, Event) via its `jsonLd` prop. All @id values cross-link
// so crawlers/AI resolve one publisher/author entity.

const SITE = 'https://icjia.illinois.gov';
const ORIGIN = `${SITE}/adultredeploy`;
const ORG_ID = `${ORIGIN}/#org`;
const SITE_ID = `${ORIGIN}/#website`;

// The publisher/author entity, reused everywhere by @id reference.
const ORG = {
  '@type': 'GovernmentOrganization',
  '@id': ORG_ID,
  name: 'Adult Redeploy Illinois',
  alternateName: 'ARI',
  url: ORIGIN,
  logo: `${ORIGIN}/img/og-image.png`,
  parentOrganization: {
    '@type': 'GovernmentOrganization',
    name: 'Illinois Criminal Justice Information Authority',
    alternateName: 'ICJIA',
    url: SITE,
  },
} as const;

export function organization() {
  return { '@context': 'https://schema.org', ...ORG };
}

export function webSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: 'Adult Redeploy Illinois',
    url: ORIGIN,
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${ORIGIN}/search?q={query}` },
      'query-input': 'required name=query',
    },
  };
}

export function webPage(o: { url: string; name: string; description?: string | null; dateModified?: string | null }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: o.url,
    name: o.name,
    isPartOf: { '@id': SITE_ID },
    publisher: { '@id': ORG_ID },
    ...(o.description ? { description: o.description } : {}),
    ...(o.dateModified ? { dateModified: o.dateModified } : {}),
  };
}

export function newsArticle(o: {
  url: string; headline: string; description?: string | null;
  datePublished?: string | null; dateModified?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: { '@type': 'WebPage', '@id': o.url },
    headline: o.headline,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    ...(o.description ? { description: o.description } : {}),
    ...(o.datePublished ? { datePublished: o.datePublished } : {}),
    ...(o.dateModified ? { dateModified: o.dateModified } : {}),
  };
}

export function meetingEvent(o: {
  url: string; name: string; description?: string | null; startDate?: string | null;
}) {
  // ARI committee meetings are held via WebEx → online attendance, no physical
  // address (asserting one would be factually wrong — see checklist lesson #12).
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: o.name,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    organizer: { '@id': ORG_ID },
    location: { '@type': 'VirtualLocation', url: o.url },
    ...(o.description ? { description: o.description } : {}),
    ...(o.startDate ? { startDate: o.startDate } : {}),
  };
}
