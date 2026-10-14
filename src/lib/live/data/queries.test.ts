import { describe, it, expect } from 'vitest';
import {
  BIOS_LIST, BIOS_LIST_FULL, BIO_BY_SLUG, PAGE_BY_SLUG,
  RESOURCES_BRIEF, RESOURCE_BY_SLUG, TAGGED_ITEMS,
} from './queries';

const fields = (q: string, want: string[]) => { for (const f of want) expect(q).toContain(f); };

describe('biography queries', () => {
  it('BIOS_LIST fetches the card fields + updatedAt but NOT the bio body', () => {
    fields(BIOS_LIST, ['biographies(', 'limit: $limit', 'isPublished: true', 'slug', 'firstName',
      'lastName', 'title', 'membership', 'category', 'alphabetizeBy', 'order', 'updatedAt', 'headshot { url']);
    expect(BIOS_LIST).not.toMatch(/\bcontent\b/);
  });
  it('BIOS_LIST_FULL additionally fetches content (the staff page renders bios inline)', () => {
    fields(BIOS_LIST_FULL, ['biographies(', 'content', 'updatedAt', 'headshot { url']);
  });
  it('BIO_BY_SLUG takes the whole where as a JSON variable (Strapi-3 gotcha)', () => {
    fields(BIO_BY_SLUG, ['biographies(where: $where)', 'content', 'updatedAt', 'headshot { url']);
  });
});

describe('PAGE_BY_SLUG', () => {
  it('selects pages by JSON where and fetches title/summary/body + updatedAt', () => {
    fields(PAGE_BY_SLUG, ['pages(where: $where)', 'slug', 'title', 'summary', 'content', 'updatedAt']);
    expect(PAGE_BY_SLUG).not.toContain('publishedAt');
  });
});

describe('resource queries', () => {
  it('RESOURCES_BRIEF omits content; carries the table + signature fields', () => {
    fields(RESOURCES_BRIEF, ['resources(', 'limit: $limit', 'isPublished: true', 'slug', 'title',
      'publicationDate', 'category', 'createdAt', 'updatedAt']);
    expect(RESOURCES_BRIEF).not.toMatch(/\bcontent\b/);
  });
  it('RESOURCE_BY_SLUG fetches body, materials, external links and tags', () => {
    fields(RESOURCE_BY_SLUG, ['resources(where: $where)', 'content', 'updatedAt',
      'mediaMaterial { name summary file { name url hash } }',
      'externalMediaMaterial { name url summary }', 'tags { name slug }']);
  });
});

describe('TAGGED_ITEMS', () => {
  it('fetches posts, meetings and resources with their tag slugs and no bodies', () => {
    fields(TAGGED_ITEMS, ['posts(', 'meetings(', 'resources(', 'tags { slug }', 'category']);
    expect(TAGGED_ITEMS).not.toMatch(/\bcontent\b/);
  });
});
