import { describe, it, expect } from 'vitest';
import { stableSignature } from './signature';

describe('stableSignature', () => {
  it('is stable for identical rows + keys', () => {
    const rows = [{ slug: 'a', title: 'A' }, { slug: 'b', title: 'B' }];
    expect(stableSignature(rows, ['slug', 'title']))
      .toBe(stableSignature(rows, ['slug', 'title']));
  });
  it('changes when a tracked field changes', () => {
    expect(stableSignature([{ slug: 'a', title: 'A' }], ['slug', 'title']))
      .not.toBe(stableSignature([{ slug: 'a', title: 'B' }], ['slug', 'title']));
  });
  it('ignores untracked fields', () => {
    expect(stableSignature([{ slug: 'a', title: 'A', n: 1 }], ['slug', 'title']))
      .toBe(stableSignature([{ slug: 'a', title: 'A', n: 9 }], ['slug', 'title']));
  });
  it('is order-sensitive', () => {
    expect(stableSignature([{ slug: 'a' }, { slug: 'b' }], ['slug']))
      .not.toBe(stableSignature([{ slug: 'b' }, { slug: 'a' }], ['slug']));
  });
  it('does not collide across field boundaries', () => {
    expect(stableSignature([{ slug: 'ab', title: 'c' }], ['slug', 'title']))
      .not.toBe(stableSignature([{ slug: 'a', title: 'bc' }], ['slug', 'title']));
  });
  it('treats null/undefined fields equivalently', () => {
    expect(stableSignature([{ slug: 'a', title: null }], ['slug', 'title']))
      .toBe(stableSignature([{ slug: 'a', title: undefined }], ['slug', 'title']));
  });
});
