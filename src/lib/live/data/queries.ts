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

export const NEWS_BY_SLUG = /* GraphQL */ `
  query NewsBySlug($slug: String!) {
    posts(where: { isPublished: true, slug: $slug }) {
      slug title summary content publicationDate createdAt updatedAt
      tags { name slug }
    }
  }`;

export const MEETING_BY_SLUG = /* GraphQL */ `
  query MeetingBySlug($slug: String!) {
    meetings(where: { isPublished: true, slug: $slug }) {
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
