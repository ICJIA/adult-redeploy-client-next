import { describe, it, expect } from 'vitest';
import {
  selectStaff, selectBoard, fullName, stripTags,
  renderStaffList, renderBoardList,
  BIO_LIST_SIG_KEYS, STAFF_CLASSES, BOARD_CLASSES,
  type BioRow, type BioRenderDeps,
} from './bio-list';

const ctx = { endpoint: 'https://x/graphql', basePath: '/adultredeploy' };

const manifestHit = {
  src: '/adultredeploy/_cms-img/abc-640.webp',
  srcset: '/adultredeploy/_cms-img/abc-640.webp 640w',
  width: 640, height: 800,
};
const deps: BioRenderDeps = {
  image: (url) => (url && url.includes('known') ? manifestHit : null),
  markdown: (src) => (src ? `<p>${src}</p>` : ''),
};

const staffA: BioRow = {
  slug: 'ann-a', firstName: 'Ann', lastName: 'Able', category: 'staff', order: 0,
  title: '<span class="heavy">Program Director</span>', membership: 'ICJIA',
  content: 'Ann bio', updatedAt: '2026-01-01T00:00:00.000Z',
  headshot: { url: '/uploads/known-ann.jpg' },
};
const staffB: BioRow = {
  slug: 'bob-b ', firstName: 'Bob <b>', lastName: 'Baker', category: 'staff', order: 1000,
  title: 'Policy & Project Coordinator', content: null, updatedAt: '2026-02-01T00:00:00.000Z',
  headshot: { url: '/uploads/new-bob.jpg' },
};
const staffC: BioRow = {
  slug: 'cat-c', firstName: 'Cat', lastName: 'Adams', category: 'staff', order: null,
  updatedAt: '2026-03-01T00:00:00.000Z', headshot: null,
};
const boardZ: BioRow = {
  slug: 'zed-z', prefix: 'Hon.', firstName: 'Zed', middleName: 'Q.', lastName: 'Zulu',
  suffix: 'Jr.', category: 'board', alphabetizeBy: 'zulu', title: 'Retired Judge',
  updatedAt: '2026-04-01T00:00:00.000Z', headshot: { url: '/uploads/known-zed.jpg' },
};
const boardM: BioRow = {
  slug: 'mia-m', firstName: 'Mia', lastName: 'Mu', category: 'board', alphabetizeBy: null,
  membership: 'Co-chair', updatedAt: '2026-05-01T00:00:00.000Z',
};
const all = [boardZ, staffB, staffC, boardM, staffA];

describe('selectStaff', () => {
  it('keeps only staff, sorted by order then lastName (null order sorts last)', () => {
    expect(selectStaff(all).map((b) => b.slug)).toEqual(['ann-a', 'cat-c', 'bob-b ']);
  });
});

describe('selectBoard', () => {
  it('keeps only board members, alphabetized by alphabetizeBy falling back to lastName', () => {
    expect(selectBoard(all).map((b) => b.slug)).toEqual(['mia-m', 'zed-z']);
  });
});

describe('fullName / stripTags', () => {
  it('joins prefix, names and suffix, skipping empties', () => {
    expect(fullName(boardZ)).toBe('Hon. Zed Q. Zulu Jr.');
    expect(fullName({ slug: 'x', firstName: ' Solo ', lastName: null })).toBe('Solo');
  });
  it('strips legacy span wrappers from CMS titles', () => {
    expect(stripTags(staffA.title)).toBe('Program Director');
    expect(stripTags(null)).toBe('');
  });
});

describe('renderStaffList', () => {
  const html = renderStaffList(selectStaff(all), ctx, deps);
  it('links each member to the bio detail under basePath, trimming stray slug whitespace', () => {
    expect(html).toContain('href="/adultredeploy/about/biographies/ann-a"');
    expect(html).toContain('href="/adultredeploy/about/biographies/bob-b"');
  });
  it('escapes interpolated text and strips title tags (XSS-safe, no literal <span>)', () => {
    expect(html).toContain('Bob &lt;b&gt; Baker');
    expect(html).not.toContain('<b>');
    expect(html).toContain('Policy &amp; Project Coordinator');
    expect(html).toContain('>Program Director</p>');
    expect(html).not.toContain('heavy');
  });
  it('uses the manifest variants when the resolver knows the headshot', () => {
    expect(html).toContain(`src="${manifestHit.src}"`);
    expect(html).toContain(`srcset="${manifestHit.srcset}"`);
    expect(html).toContain('width="640" height="800"');
  });
  it('falls back to the raw Strapi URL for an unmanifested (new) headshot', () => {
    expect(html).toContain('src="https://ari.icjia-api.cloud/uploads/new-bob.jpg"');
  });
  it('omits the <img> entirely when there is no headshot', () => {
    const only = renderStaffList([staffC], ctx, deps);
    expect(only).not.toContain('<img');
  });
  it('renders the bio body through the injected markdown renderer, omitted when empty', () => {
    expect(html).toContain('<div class="prose max-w-none mt-3 text-sm"><p>Ann bio</p></div>');
    expect(renderStaffList([staffB], ctx, deps)).not.toContain('prose');
  });
  it('reuses the shared class constants (parity with staff.astro)', () => {
    expect(html).toContain(`<li class="${STAFF_CLASSES.li}">`);
    expect(html).toContain(`class="${STAFF_CLASSES.link}"`);
  });
});

describe('renderBoardList', () => {
  const html = renderBoardList(selectBoard(all), ctx, deps);
  it('renders a linked card per member with name, stripped title and membership', () => {
    expect(html).toContain('href="/adultredeploy/about/biographies/zed-z"');
    expect(html).toContain('>Hon. Zed Q. Zulu Jr.<');
    expect(html).toContain('>Retired Judge<');
    expect(html).toContain('>Co-chair<');
  });
  it('never renders a bio body (that lives on the detail page)', () => {
    expect(html).not.toContain('prose');
  });
  it('uses the 80px headshot variant classes from the shared constants', () => {
    expect(html).toContain(`class="${BOARD_CLASSES.img}"`);
    expect(html).toContain('sizes="80px"');
    expect(html).toContain(`<a href="/adultredeploy/about/biographies/zed-z" class="${BOARD_CLASSES.link}">`);
  });
});

describe('BIO_LIST_SIG_KEYS', () => {
  it('signs on slug + updatedAt only (any CMS save bumps updatedAt)', () => {
    expect(BIO_LIST_SIG_KEYS).toEqual(['slug', 'updatedAt']);
  });
});
