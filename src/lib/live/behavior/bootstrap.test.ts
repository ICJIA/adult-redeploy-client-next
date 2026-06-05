import { describe, it, expect } from 'vitest';
import { bootstrapEffect } from './bootstrap';

describe('bootstrapEffect', () => {
  it('is a no-op when not in bootstrap mode', () => {
    expect(bootstrapEffect(false, false, 'view')).toBe('none');
    expect(bootstrapEffect(undefined, false, 'null')).toBe('none');
  });
  it('hits on the first view', () => {
    expect(bootstrapEffect(true, false, 'view')).toBe('hit');
  });
  it('misses on null or error before the first render', () => {
    expect(bootstrapEffect(true, false, 'null')).toBe('miss');
    expect(bootstrapEffect(true, false, 'error')).toBe('miss');
  });
  it('is a no-op once already rendered (later failures keep the DOM)', () => {
    expect(bootstrapEffect(true, true, 'null')).toBe('none');
    expect(bootstrapEffect(true, true, 'error')).toBe('none');
    expect(bootstrapEffect(true, true, 'view')).toBe('none');
  });
});
