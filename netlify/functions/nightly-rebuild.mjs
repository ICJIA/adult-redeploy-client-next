// netlify/functions/nightly-rebuild.mjs
// Nightly full rebuild — mirrors icjia.illinois.gov's nightly-rebuild function:
// POST the site's Netlify build hook once a night so build-time artifacts get
// refreshed WITHOUT a code push. The live islands refresh existing pages in the
// browser and the Strapi publish webhook (owner step, see README) rebuilds on
// every save — but static pages for NEW records, the Pagefind search index, the
// sitemap, optimized CMS images, the nav, and the researchhub-backed /apps +
// homepage publications only refresh on a build. Nothing is ever more than a
// day stale even if the webhook is missing or misses an event.
//
// Differences from the flagship: this uses Netlify's current function API
// (`export default` + `config.schedule`, no @netlify/functions dependency —
// same form as icjia-infonet-astro). Scheduled functions run only on the
// published production deploy and are not reachable over HTTP, so no request
// guard is needed. To fire one by hand: Netlify → Logs → Functions →
// nightly-rebuild → Run now.
//
// NETLIFY_BUILD_HOOK_URL (same name as the flagship) is a Netlify env var —
// Functions scope, secret, production context — never in code: anyone holding a
// build hook URL can trigger builds. NIGHTLY_REBUILD_DISABLED=1 is the kill
// switch. A build hook just enqueues ONE build (no fan-out / loop risk), and a
// failed night is harmless: Netlify keeps serving the last successful deploy.

// 05:00 UTC = 12:00 AM CDT (summer) / 11:00 PM CST (winter) — same as the flagship.
export const CRON = '0 5 * * *';

const env = (name) =>
  (globalThis.Netlify && globalThis.Netlify.env && globalThis.Netlify.env.get(name))
  ?? process.env[name];

export async function runNightlyRebuild({ hook, disabled, fetchImpl = fetch } = {}) {
  if (disabled === '1') {
    console.log('[nightly-rebuild] NIGHTLY_REBUILD_DISABLED=1 — skipping');
    return { skipped: 'disabled', status: null };
  }
  if (!hook) {
    console.warn('[nightly-rebuild] NETLIFY_BUILD_HOOK_URL is not set — skipping');
    return { skipped: 'no-hook', status: null };
  }
  try {
    const res = await fetchImpl(hook, { method: 'POST' });
    console.log(`[nightly-rebuild] POST build hook → ${res.status}`);
    return { skipped: false, status: res.status };
  } catch (e) {
    console.error('[nightly-rebuild] failed to POST build hook:', String(e).slice(0, 160));
    return { skipped: false, status: null, error: String(e) }; // never throw — just log
  }
}

export default async () => {
  await runNightlyRebuild({
    hook: env('NETLIFY_BUILD_HOOK_URL'),
    disabled: env('NIGHTLY_REBUILD_DISABLED'),
  });
};

export const config = { schedule: CRON };
