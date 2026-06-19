import { describe, expect, it } from 'vitest';
import { resolveBannerRole } from './banner.js';

describe('resolveBannerRole', () => {
  it('static banners use region (no live noise)', () => {
    expect(resolveBannerRole('info')).toEqual({ role: 'region' });
    expect(resolveBannerRole('danger')).toEqual({ role: 'region' });
  });

  it('dynamic danger/warning announce assertively', () => {
    expect(resolveBannerRole('danger', true)).toEqual({
      role: 'alert',
      'aria-live': 'assertive',
    });
    expect(resolveBannerRole('warning', true)).toEqual({
      role: 'alert',
      'aria-live': 'assertive',
    });
  });

  it('dynamic info/success announce politely', () => {
    expect(resolveBannerRole('info', true)).toEqual({
      role: 'status',
      'aria-live': 'polite',
    });
    expect(resolveBannerRole('success', true)).toEqual({
      role: 'status',
      'aria-live': 'polite',
    });
  });
});
