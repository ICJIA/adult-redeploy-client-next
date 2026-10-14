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

// ---- Biographies (staff + Oversight Board) --------------------------------
// BIOS_LIST feeds the /about/oversight grid (cards only, ~8 KB); BIOS_LIST_FULL
// adds `content` for /about/staff, which renders each bio body inline (~34 KB).
// updatedAt is the change signal (any CMS save bumps it).
const BIO_CARD_FIELDS = `slug firstName middleName lastName prefix suffix title
      membership category alphabetizeBy order updatedAt
      headshot { url name }`;

export const BIOS_LIST = /* GraphQL */ `
  query BiosList($limit: Int) {
    biographies(limit: $limit, where: { isPublished: true }) {
      ${BIO_CARD_FIELDS}
    }
  }`;

export const BIOS_LIST_FULL = /* GraphQL */ `
  query BiosListFull($limit: Int) {
    biographies(limit: $limit, where: { isPublished: true }) {
      ${BIO_CARD_FIELDS}
      content
    }
  }`;

export const BIO_BY_SLUG = /* GraphQL */ `
  query BioBySlug($where: JSON) {
    biographies(where: $where) {
      ${BIO_CARD_FIELDS}
      content
    }
  }`;

// ---- CMS pages (/<section>/<page>, the staff + oversight intros) ----------
// `where` carries { isPublished, slug, section: { slug } } as one JSON variable;
// the nested relation filter is honored by Strapi 3 (verified: a wrong section
// returns []). publishedAt intentionally omitted (see sectionDetail).
export const PAGE_BY_SLUG = /* GraphQL */ `
  query PageBySlug($where: JSON) {
    pages(where: $where) {
      slug title summary content updatedAt
      section { slug title }
    }
  }`;

// ---- Resources ------------------------------------------------------------
export const RESOURCES_BRIEF = /* GraphQL */ `
  query ResourcesBrief($limit: Int) {
    resources(sort: "publicationDate:desc", limit: $limit, where: { isPublished: true }) {
      slug title publicationDate category createdAt updatedAt
    }
  }`;

export const RESOURCE_BY_SLUG = /* GraphQL */ `
  query ResourceBySlug($where: JSON) {
    resources(where: $where) {
      slug title summary content category publicationDate createdAt updatedAt
      mediaMaterial { name summary file { name url hash } }
      externalMediaMaterial { name url summary }
      tags { name slug }
    }
  }`;

// ---- Tag pages ------------------------------------------------------------
// One round trip for the three tagged collections (no bodies, ~30 KB); the
// tagPage surface filters client-side by tag slug, exactly like the build.
export const TAGGED_ITEMS = /* GraphQL */ `
  query TaggedItems($limit: Int) {
    posts(limit: $limit, where: { isPublished: true }) {
      slug title tags { slug }
    }
    meetings(limit: $limit, where: { isPublished: true }) {
      slug title category tags { slug }
    }
    resources(limit: $limit, where: { isPublished: true }) {
      slug title category tags { slug }
    }
  }`;
