import { describe, it, expect } from 'vitest';
import { liveConfig } from './config';
import { stableSignature } from './behavior/signature';
import { BIO_LIST_SIG_KEYS } from './render/bio-list';

const ctx = liveConfig.ctx;
const staff = { slug: 's', category: 'staff', order: 0, updatedAt: '2026-01-01T00:00:00.000Z' };
const board = { slug: 'b', category: 'board', alphabetizeBy: 'b', updatedAt: '2026-01-02T00:00:00.000Z' };

describe('staffList / boardList entry surfaces', () => {
  it('are registered as entry surfaces with a limit variable', () => {
    expect(liveConfig.entries.staffList.variables!('staff')).toEqual({ limit: 300 });
    expect(liveConfig.entries.boardList.variables!('board')).toEqual({ limit: 300 });
  });
  it('select the matching category rows (sorted) and ignore the other', () => {
    expect(liveConfig.entries.staffList.select({ biographies: [board, staff] }, ctx)).toEqual([staff]);
    expect(liveConfig.entries.boardList.select({ biographies: [board, staff] }, ctx)).toEqual([board]);
  });
  it('return an EMPTY list when every member is unpublished (list must empty, not go stale)', () => {
    expect(liveConfig.entries.staffList.select({ biographies: [board] }, ctx)).toEqual([]);
  });
  it('return null on a shape mismatch so liveEntry keeps the static DOM', () => {
    expect(liveConfig.entries.staffList.select({}, ctx)).toBeNull();
    expect(liveConfig.entries.boardList.select({ biographies: 'nope' }, ctx)).toBeNull();
  });
  it('sign the rows with the shared slug+updatedAt keys (matches the build baseline)', () => {
    const rows = [staff];
    expect(liveConfig.entries.staffList.signature(rows)).toBe(stableSignature(rows, BIO_LIST_SIG_KEYS));
    expect(liveConfig.entries.boardList.signature([board])).toBe(stableSignature([board], BIO_LIST_SIG_KEYS));
  });
});

describe('resourcesIndex / resourcesCategory xfor surfaces', () => {
  const data = { resources: [
    { slug: 'a', title: 'A', publicationDate: '2024-01-01T00:00:00Z', category: 'annualReport' },
    { slug: 'b', title: 'B', publicationDate: '2026-01-01T00:00:00Z', category: 'summit' },
  ] };
  it('resourcesIndex returns every resource as a table row, newest first', () => {
    const s = liveConfig.collections.resourcesIndex;
    expect(s.mode).toBe('xfor');
    expect(s.select(data, ctx).map((r: any) => r.title)).toEqual(['B', 'A']);
  });
  it('resourcesCategory filters by the enum passed in params', () => {
    const s = liveConfig.collections.resourcesCategory;
    expect(s.mode).toBe('xfor');
    // Explicit basePath: under vitest import.meta.env.BASE_URL is "/".
    const prod = { endpoint: '', basePath: '/adultredeploy' };
    expect(s.select(data, prod, { enum: 'summit', slug: 'summits' }).map((r: any) => r.href))
      .toEqual(['/adultredeploy/resources/summits/b']);
  });
});
