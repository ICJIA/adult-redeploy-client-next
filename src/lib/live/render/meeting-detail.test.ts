import { describe, it, expect } from 'vitest';
import { renderMeetingMaterials } from './meeting-detail';

describe('renderMeetingMaterials', () => {
  it('returns empty string when there are no materials', () => {
    expect(renderMeetingMaterials([])).toBe('');
    expect(renderMeetingMaterials(null)).toBe('');
  });
  it('skips items without a file url', () => {
    expect(renderMeetingMaterials([{ name: 'X', summary: '', file: null }])).toBe('');
  });
  it('builds absolute Strapi links and escapes the name', () => {
    const html = renderMeetingMaterials([
      { name: 'Agenda & <notes>', summary: 'PDF', file: { url: '/uploads/a.pdf' } },
    ]);
    expect(html).toContain('href="https://ari.icjia-api.cloud/uploads/a.pdf"');
    expect(html).toContain('Agenda &amp; &lt;notes&gt;');
    expect(html).toContain('Meeting Materials');
  });
});
