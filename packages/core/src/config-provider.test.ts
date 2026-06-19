import { describe, expect, it } from 'vitest';
import { mergeConfig, DEFAULT_CONFIG } from './config-provider.js';

describe('mergeConfig', () => {
  it('returns parent values when child provides nothing', () => {
    expect(mergeConfig(DEFAULT_CONFIG, {})).toEqual(DEFAULT_CONFIG);
  });

  it('overrides only explicitly-provided fields', () => {
    const merged = mergeConfig(DEFAULT_CONFIG, { theme: 'dark' });
    expect(merged.theme).toBe('dark');
    expect(merged.dir).toBe('ltr'); // inherited
    expect(merged.size).toBe('default'); // inherited
  });

  it('omitted fields inherit the parent (not overwritten)', () => {
    const parent = { ...DEFAULT_CONFIG, theme: 'dark' as const, size: 'large' as const };
    // child omits theme/size entirely → they inherit
    const merged = mergeConfig(parent, { dir: 'rtl' });
    expect(merged.theme).toBe('dark'); // inherited
    expect(merged.dir).toBe('rtl'); // overridden
    expect(merged.size).toBe('large'); // inherited
  });

  it('nested merge: inner only overrides dir, keeps outer theme/locale-adjacent fields', () => {
    const outer = mergeConfig(DEFAULT_CONFIG, { theme: 'dark', size: 'small' });
    const inner = mergeConfig(outer, { dir: 'rtl' });
    expect(inner).toEqual({
      theme: 'dark',
      dir: 'rtl',
      size: 'small',
      zIndexBase: 1000,
      transition: true,
    });
  });

  it('merges numeric and boolean fields', () => {
    const merged = mergeConfig(DEFAULT_CONFIG, { zIndexBase: 2000, transition: false });
    expect(merged.zIndexBase).toBe(2000);
    expect(merged.transition).toBe(false);
    // transition:false must override (not be treated as "missing" by ??)
    expect(mergeConfig({ ...DEFAULT_CONFIG, transition: false }, {}).transition).toBe(false);
  });
});
