// src/lib/live/render/shared.ts
// Tiny helpers shared by the client render functions (the PRESENTATION layer).
// These mirror the Astro markup, so all dynamic text MUST be escaped.

const ENT: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

export function escapeHtml(s: string | null | undefined): string {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ENT[c]);
}

/** Find a live-update hook within a detail page's root, e.g. [data-live="body"]. */
export function liveEl(root: HTMLElement, key: string): HTMLElement | null {
  return root.querySelector<HTMLElement>(`[data-live="${key}"]`);
}
