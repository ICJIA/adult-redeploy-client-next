import { describe, it, expect } from 'vitest';
import { renderHomeMeetings, HOME_MTG_CLASSES, type MeetingRow } from './home-meetings';
import { formatDate } from '../../dates';

const ctx = { endpoint: '', basePath: '/adultredeploy' };
const row: MeetingRow = {
  slug: 'otac-0605',
  title: 'OTAC Meeting & <stuff>',
  summary: 'Via "WebEx"',
  scheduledDate: '2026-06-05T10:00:00.000Z',
  category: 'outreach',
};

describe('renderHomeMeetings', () => {
  it('renders the empty state (no <ul>) when there are no rows', () => {
    const html = renderHomeMeetings([], ctx);
    expect(html).toContain('No meetings scheduled');
    expect(html).not.toContain('<ul');
  });
  it('maps the category enum to its route slug in the href', () => {
    expect(renderHomeMeetings([row], ctx))
      .toContain('/adultredeploy/about/meetings/outreach/otac-0605');
  });
  it('maps the regular enum to the regular-oversight slug', () => {
    expect(renderHomeMeetings([{ ...row, category: 'regular' }], ctx))
      .toContain('/about/meetings/regular-oversight/');
  });
  it('escapes title and summary (XSS-safe)', () => {
    const html = renderHomeMeetings([row], ctx);
    expect(html).toContain('OTAC Meeting &amp; &lt;stuff&gt;');
    expect(html).toContain('Via &quot;WebEx&quot;');
  });
  it('formats the scheduled date', () => {
    expect(renderHomeMeetings([row], ctx)).toContain(formatDate(row.scheduledDate));
  });
  it('uses the shared list class (parity)', () => {
    expect(renderHomeMeetings([row], ctx)).toContain(`class="${HOME_MTG_CLASSES.ul}"`);
  });
});
