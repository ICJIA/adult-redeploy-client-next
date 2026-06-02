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

export const PAGE_HOME = /* GraphQL */ `
  query PageHome {
    pages(where: { isPublished: true, slug: "home" }) {
      slug title content updatedAt
    }
  }`;
