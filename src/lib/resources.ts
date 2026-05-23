export const RESOURCE_CATEGORIES = [
  { enum: 'annualReport',   slug: 'annual-report',   title: 'Annual Reports',   short: 'Annual Reports' },
  { enum: 'evaluation',     slug: 'evaluation',      title: 'Evaluation Reports', short: 'Evaluation' },
  { enum: 'factSheet',      slug: 'fact-sheet',      title: 'Fact Sheets',      short: 'Fact Sheets' },
  { enum: 'other',          slug: 'other',           title: 'Other',            short: 'Other' },
  { enum: 'researchReport', slug: 'research-report', title: 'Research Reports', short: 'Research' },
  { enum: 'summit',         slug: 'summits',         title: 'Summits',          short: 'Summits' },
  { enum: 'template',       slug: 'template',        title: 'Templates',        short: 'Templates' },
  { enum: 'toolkit',        slug: 'toolkit',         title: 'Toolkits',         short: 'Toolkits' },
  { enum: 'webinar',        slug: 'webinar',         title: 'Webinars',         short: 'Webinars' },
] as const;

export type ResourceCategory = typeof RESOURCE_CATEGORIES[number];
export type ResourceCategoryEnum = ResourceCategory['enum'];

export const resEnumToSlug = Object.fromEntries(
  RESOURCE_CATEGORIES.map((c) => [c.enum, c.slug]),
) as Record<string, string>;

export const resSlugToCategory = Object.fromEntries(
  RESOURCE_CATEGORIES.map((c) => [c.slug, c]),
) as Record<string, ResourceCategory>;
