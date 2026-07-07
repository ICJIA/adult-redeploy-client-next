// src/lib/live/data/queries.ts
// Narrow runtime GraphQL queries. List queries deliberately OMIT `content`
// (cards/tables don't need bodies); only the *_BY_SLUG detail queries fetch it.
// Field shapes mirror scripts/strapi-query.mjs so live and static agree.

export const NEWS_LATEST = /* GraphQL */ `
  query NewsLatest($limit: Int) {
    posts(sort: "createdAt:desc", limit: $limit, where: { isPublished: true }) {
      slug title summary publicationDate createdAt updatedAt
    }
  }`;

export const MEETINGS_BRIEF = /* GraphQL */ `
  query MeetingsBrief($limit: Int) {
    meetings(sort: "scheduledDate:desc", limit: $limit, where: { isPublished: true }) {
      slug title summary scheduledDate category createdAt updatedAt
    }
  }`;

// Sites carry no `isPublished` flag (the build fetches them all — see
// scripts/strapi-query.mjs), so the live queries don't filter on it either.
// `summary` feeds the /programs map side panel; the /sites index ignores it.
export const SITES_BRIEF = /* GraphQL */ `
  query SitesBrief($limit: Int) {
    sites(sort: "title:asc", limit: $limit) {
      slug title siteType summary
    }
  }`;

// Detail queries pass the whole `where` as a JSON variable. Strapi 3's `where`
// is a JSON scalar, so a variable used INSIDE a where object literal
// (e.g. `slug: $slug`) is silently ignored and returns ALL rows — passing the
// whole object as `$where` is the reliable form.
export const NEWS_BY_SLUG = /* GraphQL */ `
  query NewsBySlug($where: JSON) {
    posts(where: $where) {
      slug title summary content publicationDate createdAt updatedAt
      tags { name slug }
    }
  }`;

export const MEETING_BY_SLUG = /* GraphQL */ `
  query MeetingBySlug($where: JSON) {
    meetings(where: $where) {
      slug title summary content scheduledDate category createdAt updatedAt
      meetingMaterial { name summary file { name url hash } }
      tags { name slug }
    }
  }`;

export const SITE_BY_SLUG = /* GraphQL */ `
  query SiteBySlug($where: JSON) {
    sites(where: $where) {
      slug title summary content siteType updatedAt
    }
  }`;

export const PAGE_HOME = /* GraphQL */ `
  query PageHome {
    pages(where: { isPublished: true, slug: "home" }) {
      slug title content updatedAt
    }
  }`;

// Section landing-page body — the shared [section]/index.astro live surface
// (/grants, /about, /approach). Body-only; `updatedAt` is the change signal
// (publishedAt intentionally omitted). `where` is passed as a whole JSON
// variable per the Strapi-3 scalar gotcha noted above.
export const SECTION_BY_SLUG = /* GraphQL */ `
  query SectionBySlug($where: JSON) {
    sections(where: $where) {
      slug title summary content updatedAt
    }
  }`;
