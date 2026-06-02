import { describe, it, expect } from 'vitest';
import { renderMeetingsSplash } from './meetings-splash';
import type { MeetingRow } from './home-meetings';
import { formatDate } from '../../dates';

const ctx = { endpoint: '', basePath: '/adultredeploy' };
const row: MeetingRow = {
  slug: 'otac-0605',
  title: 'OTAC Meeting',
  summary: 'Coming up soon',
  scheduledDate: '2026-06-05T10:00:00.000Z',
  category: 'outreach',
};

describe('renderMeetingsSplash', () => {
  it('returns an empty string when there is no upcoming meeting (splash hidden)', () => {
    expect(renderMeetingsSplash([], ctx)).toBe('');
  });
  it('features a single meeting with label, link, and date', () => {
    const html = renderMeetingsSplash([row], ctx);
    expect(html).toContain('Next upcoming meeting');
    expect(html).toContain('/adultredeploy/about/meetings/outreach/otac-0605');
    expect(html).toContain(formatDate(row.scheduledDate));
    expect(html).toContain('OTAC Meeting');
  });
  it('only renders the first row even if given more', () => {
    const html = renderMeetingsSplash([row, { ...row, slug: 'second', title: 'Second' }], ctx);
    expect(html).toContain('OTAC Meeting');
    expect(html).not.toContain('Second');
  });
});
