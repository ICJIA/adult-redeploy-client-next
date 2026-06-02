// src/lib/live/register.ts
// App wiring: register the live Alpine data components on the shared Alpine
// instance (called from BaseLayout BEFORE Alpine.start()), and expose helpers on
// window.__live for the is:inline ListingTable, which can't import modules.

import { liveConfig } from './config';
import { makeLiveCollection } from './behavior/liveCollection';
import { makeListMixin } from './behavior/liveList';
import type { LiveListOpts } from './types';

// Structural type — only the .data() method we use, to avoid coupling to
// Alpine's full type surface.
interface AlpineLike {
  data(name: string, callback: (...args: any[]) => object): void;
}

export function registerLive(alpine: AlpineLike): void {
  alpine.data('liveCollection', makeLiveCollection(liveConfig));
  // alpine.data('liveEntry', ...) added in Phase 3.
  (window as unknown as { __live?: unknown }).__live = {
    config: liveConfig,
    // The inline ListingTable Object.assigns this mixin onto its base.
    listMixin: (live: LiveListOpts) => makeListMixin(liveConfig, live),
  };
}
