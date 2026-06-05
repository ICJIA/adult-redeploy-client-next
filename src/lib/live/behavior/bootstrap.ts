// src/lib/live/behavior/bootstrap.ts
// Pure decision for the liveEntry "bootstrap" mode (used by the 404 fallback
// host). Bootstrap renders a record from nothing (no build baseline), so the
// host needs to know when the FIRST paint succeeded (hide "Loading…") vs when
// there's nothing to show yet (revert to the real 404). Kept pure so it
// unit-tests in node; liveEntry calls it and fires the host's onHit/onMiss.

export type RefreshOutcome = 'view' | 'null' | 'error';

/**
 * - Only meaningful in bootstrap mode and only before the first successful
 *   render (`rendered === false`).
 * - 'hit'  → a record was applied (host: state = "rendered", hide Loading).
 * - 'miss' → no record / fetch failed before any paint (host: revert to 404).
 * - 'none' → not bootstrap, or already rendered (later failures keep the DOM).
 */
export function bootstrapEffect(
  bootstrap: boolean | undefined,
  rendered: boolean,
  outcome: RefreshOutcome,
): 'hit' | 'miss' | 'none' {
  if (!bootstrap || rendered) return 'none';
  return outcome === 'view' ? 'hit' : 'miss';
}
