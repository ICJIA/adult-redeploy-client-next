// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const tag = z.object({ name: z.string(), slug: z.string() });

const withId = (key: string, idField: (d: any) => string = (d) => d.slug) =>
  (text: string) => {
    const parsed = JSON.parse(text);
    const list = parsed[key] ?? [];
    return list.map((d: any) => ({ id: idField(d), ...d }));
  };

const DATA = 'src/content/_data.json';

const news = defineCollection({
  loader: file(DATA, { parser: withId('news') }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    publicationDate: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    tags: z.array(tag).nullable().optional(),
    searchMeta: z.string().nullable().optional(),
  }),
});

const meetings = defineCollection({
  loader: file(DATA, { parser: withId('meetings') }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    scheduledDate: z.string().nullable().optional(),
    category: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    meetingMaterial: z.array(z.any()).nullable().optional(),
    tags: z.array(tag).nullable().optional(),
  }),
});

const sites = defineCollection({
  loader: file(DATA, { parser: withId('sites') }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    siteType: z.string().nullable().optional(),
  }),
});

const biographies = defineCollection({
  loader: file(DATA, { parser: withId('biographies') }),
  schema: z.object({
    slug: z.string(),
    firstName: z.string().nullable().optional(),
    middleName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    prefix: z.string().nullable().optional(),
    suffix: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    membership: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    alphabetizeBy: z.string().nullable().optional(),
    order: z.number().nullable().optional(),
    content: z.string().nullable().optional(),
    headshot: z.object({
      url: z.string(),
      name: z.string().nullable().optional(),
    }).nullable().optional(),
  }),
});

const resources = defineCollection({
  loader: file(DATA, { parser: withId('resources') }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    category: z.string(),
    publicationDate: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    mediaMaterial: z.array(z.any()).nullable().optional(),
    externalMediaMaterial: z.array(z.any()).nullable().optional(),
    tags: z.array(tag).nullable().optional(),
  }),
});

const pages = defineCollection({
  loader: file(DATA, {
    parser: (text: string) => {
      const list = (JSON.parse(text).pages ?? []) as any[];
      return list.map((d) => ({
        id: `${d.section?.slug ?? 'orphan'}/${d.slug}`,
        ...d,
      }));
    },
  }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    section: z.object({
      slug: z.string(),
      title: z.string(),
      summary: z.string().nullable().optional(),
      searchMeta: z.string().nullable().optional(),
    }).nullable().optional(),
    searchMeta: z.string().nullable().optional(),
    tags: z.array(tag).nullable().optional(),
  }),
});

const sections = defineCollection({
  loader: file(DATA, { parser: withId('sections') }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    searchMeta: z.string().nullable().optional(),
    pages: z.array(z.object({
      slug: z.string(),
      title: z.string(),
      summary: z.string().nullable().optional(),
      displayNav: z.boolean().nullable().optional(),
      addDivider: z.boolean().nullable().optional(),
      isPublished: z.boolean().nullable().optional(),
    })).nullable().optional(),
  }),
});

const tags = defineCollection({
  loader: file(DATA, { parser: withId('tags', (d) => d.slug) }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    searchMeta: z.string().nullable().optional(),
  }),
});

const applications = defineCollection({
  loader: file(DATA, { parser: withId('applications') }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    status: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    url: z.string(),
    contributors: z.union([z.string(), z.array(z.any())]).nullable().optional(),
  }),
});

export const collections = {
  news, meetings, sites, biographies, resources, pages, sections, tags,
  applications,
};
