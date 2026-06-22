// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { useLiveAnnouncer, __resetLiveAnnouncer } from './live-announcer.js';

afterEach(() => {
  __resetLiveAnnouncer();
});

function regions() {
  return Array.from(document.querySelectorAll<HTMLElement>('.cd-live-region'));
}

describe('useLiveAnnouncer', () => {
  it('lazily mounts a pair of polite + assertive regions on first announce', () => {
    expect(regions()).toHaveLength(0);
    const a = useLiveAnnouncer();
    a.announce('hello');
    const els = regions();
    expect(els).toHaveLength(2);
    const polite = els.find((e) => e.getAttribute('aria-live') === 'polite');
    const assertive = els.find((e) => e.getAttribute('aria-live') === 'assertive');
    expect(polite).toBeTruthy();
    expect(assertive).toBeTruthy();
    expect(polite!.getAttribute('role')).toBe('status');
    expect(assertive!.getAttribute('role')).toBe('alert');
    expect(polite!.getAttribute('aria-atomic')).toBe('true');
  });

  it('reuses the same singleton region across multiple useLiveAnnouncer() calls', () => {
    useLiveAnnouncer().announce('a');
    useLiveAnnouncer().announce('b');
    expect(regions()).toHaveLength(2);
  });

  it('defaults to polite and writes the message into the polite region', () => {
    const a = useLiveAnnouncer();
    a.announce('sorted by name');
    const polite = regions().find((e) => e.getAttribute('aria-live') === 'polite')!;
    const assertive = regions().find((e) => e.getAttribute('aria-live') === 'assertive')!;
    expect(polite.textContent).toBe('sorted by name');
    expect(assertive.textContent).toBe('');
  });

  it('routes assertive announcements to the assertive region', () => {
    const a = useLiveAnnouncer();
    a.announce('submit failed', 'assertive');
    const polite = regions().find((e) => e.getAttribute('aria-live') === 'polite')!;
    const assertive = regions().find((e) => e.getAttribute('aria-live') === 'assertive')!;
    expect(assertive.textContent).toBe('submit failed');
    expect(polite.textContent).toBe('');
  });

  it('re-announces identical consecutive messages by clearing first', () => {
    const a = useLiveAnnouncer();
    const polite = () =>
      regions().find((e) => e.getAttribute('aria-live') === 'polite')!;
    a.announce('page 2');
    expect(polite().textContent).toBe('page 2');
    // simulate AT reading + DOM still holding the text, then same message again
    a.announce('page 2');
    expect(polite().textContent).toBe('page 2');
  });

  it('is a no-op for empty messages and does not mount regions', () => {
    const a = useLiveAnnouncer();
    a.announce('');
    expect(regions()).toHaveLength(0);
  });

  it('__resetLiveAnnouncer removes the regions and resets the singleton', () => {
    useLiveAnnouncer().announce('x');
    expect(regions()).toHaveLength(2);
    __resetLiveAnnouncer();
    expect(regions()).toHaveLength(0);
    // a fresh announce re-mounts
    useLiveAnnouncer().announce('y');
    expect(regions()).toHaveLength(2);
  });
});
