import { describe, it, expect } from 'vitest';
import { formatDate } from './dates';

describe('formatDate', () => {
  it('formats by the stored date part — no timezone day-shift', () => {
    // Midnight-UTC date-only values must show the date as entered, not a day
    // earlier for viewers behind UTC (the original bug).
    expect(formatDate('2026-06-05T00:00:00.000Z')).toBe('June 5, 2026');
    expect(formatDate('2026-01-01T00:00:00.000Z')).toBe('January 1, 2026');
    expect(formatDate('2026-12-31T00:00:00.000Z')).toBe('December 31, 2026');
  });
  it('ignores the time component entirely (date-only)', () => {
    expect(formatDate('2026-06-10T14:30:00.000Z')).toBe('June 10, 2026');
  });
  it('handles a bare date and empty values', () => {
    expect(formatDate('2026-07-04')).toBe('July 4, 2026');
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });
});
