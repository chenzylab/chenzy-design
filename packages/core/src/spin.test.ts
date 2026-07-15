import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createSpinController } from './spin.js';

describe('createSpinController', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows immediately with no delay', () => {
    const c = createSpinController({ spinning: true });
    expect(c.getEffective()).toBe(true);
    c.destroy();
  });

  it('starts hidden when not spinning', () => {
    const c = createSpinController({ spinning: false });
    expect(c.getEffective()).toBe(false);
    c.destroy();
  });

  it('delays showing by `delay` ms', () => {
    const c = createSpinController({ delay: 200 });
    c.setSpinning(true);
    expect(c.getEffective()).toBe(false);
    vi.advanceTimersByTime(199);
    expect(c.getEffective()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(c.getEffective()).toBe(true);
    c.destroy();
  });

  it('cancels a pending show if spinning turns off within the delay (never shown)', () => {
    const seen: boolean[] = [];
    const c = createSpinController({ delay: 200 });
    c.subscribe((e) => seen.push(e));
    c.setSpinning(true);
    vi.advanceTimersByTime(100);
    c.setSpinning(false); // cancel before delay elapses
    vi.advanceTimersByTime(500);
    expect(c.getEffective()).toBe(false);
    expect(seen).toEqual([]); // never flipped to true → no announcement noise
    c.destroy();
  });

  it('hides immediately when spinning turns off (no minShowTime — Semi has none)', () => {
    const c = createSpinController({ spinning: true });
    expect(c.getEffective()).toBe(true);
    c.setSpinning(false);
    expect(c.getEffective()).toBe(false);
    c.destroy();
  });

  it('notifies subscribers on effective change', () => {
    const seen: boolean[] = [];
    const c = createSpinController({ delay: 100 });
    c.subscribe((e) => seen.push(e));
    c.setSpinning(true);
    vi.advanceTimersByTime(100);
    c.setSpinning(false);
    expect(seen).toEqual([true, false]);
    c.destroy();
  });
});
