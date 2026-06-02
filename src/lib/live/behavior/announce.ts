// src/lib/live/behavior/announce.ts
// Single shared polite live region. Announces only REAL content changes (not
// every poll), so assistive tech isn't spammed on each page load / tab focus.
// Resolves the node rendered by LiveRegion.astro; falls back to creating one so
// the module is drop-in for sites that haven't added the component yet.

let node: HTMLElement | null = null;

function region(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  if (node && document.body.contains(node)) return node;
  node = document.getElementById('live-status');
  if (!node) {
    node = document.createElement('div');
    node.id = 'live-status';
    node.setAttribute('role', 'status');
    node.setAttribute('aria-live', 'polite');
    node.setAttribute('aria-atomic', 'true');
    node.className = 'sr-only';
    document.body.appendChild(node);
  }
  return node;
}

export function announce(message: string): void {
  const el = region();
  if (!el) return;
  // Clear then set on the next tick so repeated identical messages re-announce.
  el.textContent = '';
  window.setTimeout(() => { el.textContent = message; }, 30);
}
