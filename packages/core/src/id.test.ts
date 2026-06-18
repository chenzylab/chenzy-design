import { describe, expect, it, beforeEach } from 'vitest';
import { useId, __resetIdCounter } from './id.js';

describe('useId', () => {
  beforeEach(() => __resetIdCounter());

  it('generates unique incrementing ids', () => {
    expect(useId()).toBe('cd-1');
    expect(useId()).toBe('cd-2');
  });

  it('honors a custom prefix', () => {
    expect(useId('modal')).toBe('modal-1');
  });
});
