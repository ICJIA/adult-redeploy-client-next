import { describe, it, expect } from 'vitest';
import { renderHomeNews, NEWS_CLASSES, type NewsRow } from './home-news';
import { formatDate } from '../../dates';

const ctx = { endpoint: 'https://x/graphql', basePath: '/adultredeploy' };
const row: NewsRow = {
  slug: 'a-news-item',
  title: 'Big & Bold <News>',
  summary: 'A "quote"',
  publicationDate: '2026-05-22T00:00:00.000Z',
};

describe('renderHomeNews', () => {
  it('links to the detail under basePath', () => {
    expect(renderHomeNews([row], ctx))
      .toContain('href="/adultredeploy/news/a-news-item"');
  });
  it('trims a stray trailing space in the slug (a CMS slip must not break the link)', () => {
    expect(renderHomeNews([{ ...row, slug: 'a-news-item ' }], ctx))
      .toContain('href="/adultredeploy/news/a-news-item"');
  });
  it('escapes interpolated text (XSS-safe)', () => {
    const html = renderHomeNews([row], ctx);
    expect(html).toContain('Big &amp; Bold &lt;News&gt;');
    expect(html).toContain('A &quot;quote&quot;');
    expect(html).not.toContain('<News>');
  });
  it('formats the posted date (timezone-agnostic vs the same formatter)', () => {
    expect(renderHomeNews([row], ctx)).toContain(formatDate(row.publicationDate));
  });
  it('reuses the shared class constants (parity with HomeNews.astro)', () => {
    const html = renderHomeNews([row], ctx);
    expect(html).toContain(`class="${NEWS_CLASSES.li}"`);
    expect(html).toContain(`class="${NEWS_CLASSES.link}"`);
  });
  it('omits the summary paragraph when empty', () => {
    expect(renderHomeNews([{ ...row, summary: null }], ctx))
      .not.toContain(NEWS_CLASSES.summary);
  });
});
