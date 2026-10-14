import { describe, it, expect } from 'vitest';
import { QUERY } from './strapi-query.mjs';

// The live bio islands baseline their signature on updatedAt; the build fetch
// must carry it or every first load would spuriously re-render + announce.
describe('build QUERY biographies block', () => {
  const block = /biographies\(where: \{ isPublished: true \}\) \{([\s\S]*?)\}\s*\n\s*resources/.exec(QUERY)?.[1] ?? '';
  it('fetches createdAt + updatedAt for biographies', () => {
    expect(block).toContain('updatedAt');
    expect(block).toContain('createdAt');
  });
});
