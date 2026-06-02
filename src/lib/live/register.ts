// src/lib/live/register.ts
// App wiring: register the live Alpine data components on the shared Alpine
// instance (called from BaseLayout BEFORE Alpine.start()), and expose the config
// on window.__live for the is:inline listingTable bridge (added in Phase 2).

import { liveConfig } from './config';
import { makeLiveCollection } from './behavior/liveCollection';

// Structural type — only the .data() method we use, to avoid coupling to
// Alpine's full type surface.
interface AlpineLike {
  data(name: string, callback: (...args: any[]) => object): void;
}

export function registerLive(alpine: AlpineLike): void {
  alpine.data('liveCollection', makeLiveCollection(liveConfig));
  // alpine.data('liveEntry', ...) added in Phase 3.
  (window as unknown as { __live?: unknown }).__live = { config: liveConfig };
}
