// src/lib/live/behavior/liveList.ts
// Live mixin for the ListingTable index surfaces (Mechanism B). ListingTable is
// an is:inline Alpine component that can't import modules, so register.ts
// exposes makeListMixin via window.__live and the inline factory Object.assigns
// the result onto its base. On a confirmed change we just reassign `this.items`,
// which lets Alpine re-render the table while preserving the user's search/sort.

import { gqlFetch } from '../data/endpoint';
import { stableSignature } from './signature';
import { announce } from './announce';
import { progress } from './progress';
import { fadeSwap } from './transition';
import { onVisible } from './focus-refetch';
import type { LiveConfig, LiveListOpts } from '../types';

interface IdleWindow {
  requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => void;
}
interface ListComponent {
  items: unknown[];
  $root?: HTMLElement;
  _liveRefresh(): Promise<void>;
}

export function makeListMixin(config: LiveConfig, live: LiveListOpts) {
  const surface = config.collections[live.surface];
  let sig = live.sig;
  let ctrl: AbortController | null = null;
  let stop: (() => void) | null = null;

  return {
    init(this: ListComponent) {
      if (!surface) return;
      const kick = () => { void this._liveRefresh(); };
      const w = window as unknown as IdleWindow;
      if (typeof w.requestIdleCallback === 'function') {
        w.requestIdleCallback(kick, { timeout: 2000 });
      } else {
        window.setTimeout(kick, 200);
      }
      stop = onVisible(kick);
    },

    destroy() {
      ctrl?.abort();
      stop?.();
    },

    async _liveRefresh(this: ListComponent) {
      if (!surface) return;
      ctrl?.abort();
      const c = new AbortController();
      ctrl = c;
      progress.start();
      try {
        const data = await gqlFetch(
          config.ctx.endpoint, surface.query, surface.variables ?? {}, { signal: c.signal },
        );
        const rows = surface.select(data, config.ctx, live.params);
        const next = stableSignature(rows, surface.signatureKeys);
        if (next === sig) return;                 // unchanged → silent (bar still ran)
        sig = next;
        const el = this.$root;
        if (el && typeof el.animate === 'function') {
          fadeSwap(el, () => { this.items = rows; });
        } else {
          this.items = rows;
        }
        announce(`${surface.announceLabel} updated`);
      } catch {
        /* keep the existing rows on failure */
      } finally {
        progress.done();
        if (ctrl === c) ctrl = null;
      }
    },
  };
}
