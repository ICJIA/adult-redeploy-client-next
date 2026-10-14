import { describe, it, expect } from 'vitest';
import { runNightlyRebuild, config, CRON } from './functions/nightly-rebuild.mjs';

const hook = 'https://api.netlify.com/build_hooks/abc';

describe('runNightlyRebuild', () => {
  it('POSTs the build hook and reports the status', async () => {
    const calls = [];
    const fetchImpl = async (url, init) => { calls.push({ url, init }); return { status: 200, ok: true }; };
    const result = await runNightlyRebuild({ hook, fetchImpl });
    expect(calls).toEqual([{ url: hook, init: { method: 'POST' } }]);
    expect(result).toEqual({ skipped: false, status: 200 });
  });
  it('skips without a request when the hook URL is not configured', async () => {
    let called = false;
    const result = await runNightlyRebuild({ hook: undefined, fetchImpl: async () => { called = true; } });
    expect(called).toBe(false);
    expect(result).toEqual({ skipped: 'no-hook', status: null });
  });
  it('honours the NIGHTLY_REBUILD_DISABLED kill switch (same switch as the flagship site)', async () => {
    let called = false;
    const result = await runNightlyRebuild({ hook, disabled: '1', fetchImpl: async () => { called = true; } });
    expect(called).toBe(false);
    expect(result).toEqual({ skipped: 'disabled', status: null });
  });
  it('never throws on a network failure (a missed night is harmless; Netlify keeps the last deploy)', async () => {
    const result = await runNightlyRebuild({ hook, fetchImpl: async () => { throw new Error('ECONNRESET'); } });
    expect(result).toEqual({ skipped: false, status: null, error: 'Error: ECONNRESET' });
  });
});

describe('schedule', () => {
  it('runs nightly at 05:00 UTC ≈ midnight US Central, matching icjia.illinois.gov', () => {
    expect(CRON).toBe('0 5 * * *');
    expect(config).toEqual({ schedule: CRON });
  });
});
