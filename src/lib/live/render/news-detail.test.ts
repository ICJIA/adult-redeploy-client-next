import { describe, it, expect } from 'vitest';
import { applyNewsDetail } from './news-detail';

function fakeRoot(keys: string[]) {
  const els: Record<string, any> = {};
  for (const k of keys) els[k] = { textContent: '', innerHTML: '', style: {} as Record<string, string> };
  const root = {
    querySelector: (sel: string) => {
      const m = /\[data-live="([^"]+)"\]/.exec(sel);
      return (m && els[m[1]]) || null;
    },
  } as unknown as HTMLElement;
  return { root, els };
}

describe('applyNewsDetail — build-time content patches apply on the live path too', () => {
  const ctx = { endpoint: '', basePath: '/adultredeploy' };
  it('promotes the SFY21 NOFO first heading to h2 exactly like the static page', async () => {
    const { root, els } = fakeRoot(['body']);
    await applyNewsDetail(root, {
      slug: 'ari-nofo-sfy21',
      content: '### Application deadline: March 31, 2020.\n\nBody',
    }, ctx);
    expect(els.body.innerHTML).toContain('<h2');
    expect(els.body.innerHTML).not.toContain('<h3');
  });
});
