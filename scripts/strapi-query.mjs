// scripts/strapi-query.mjs
// Single GraphQL query against the ARI Strapi backend.
// Field shape verified against the live schema (https://ari.icjia-api.cloud/graphql).

export const QUERY = /* GraphQL */ `{
  pages(where: { isPublished: true }) {
    slug title summary content searchMeta isPublished
    createdAt updatedAt
    section { title slug summary searchMeta }
    tags { name slug }
  }
  posts: posts(sort: "createdAt:desc", where: { isPublished: true }) {
    slug title summary content searchMeta isPublished publicationDate
    createdAt updatedAt
    tags { name slug }
  }
  meetings(sort: "scheduledDate:desc", where: { isPublished: true }) {
    slug title summary content searchMeta isPublished
    scheduledDate category createdAt updatedAt
    meetingMaterial { name summary file { name url hash } }
    tags { name slug }
  }
  sites {
    id slug title summary content searchMeta siteType
    createdAt updatedAt
  }
  biographies(where: { isPublished: true }) {
    slug firstName middleName lastName prefix suffix title
    membership category alphabetizeBy order content isPublished
    headshot { url name }
  }
  resources(sort: "publicationDate:desc", where: { isPublished: true }) {
    slug title summary content searchMeta category
    publicationDate createdAt updatedAt
    mediaMaterial { name summary file { name url hash } }
    externalMediaMaterial { name url summary }
    tags { name slug }
  }
  sections(where: { isPublished: true }) {
    slug title summary content searchMeta
    createdAt updatedAt
    pages { slug title summary displayNav addDivider isPublished }
  }
  tags { name slug searchMeta }
}`;
