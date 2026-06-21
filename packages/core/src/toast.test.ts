import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createToastStore } from './toast.js';

describe('createToastStore', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('adds a toast and returns its id', () => {
    const s = createToastStore();
    const id = s.add({ content: 'hi' });
    expect(typeof id).toBe('string');
    expect(s.getToasts().map((t) => t.content)).toEqual(['hi']);
    s.destroy();
  });

  it('auto-dismisses after duration', () => {
    const s = createToastStore();
    s.add({ content: 'bye', duration: 2 });
    expect(s.getToasts().length).toBe(1);
    vi.advanceTimersByTime(1999);
    expect(s.getToasts().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(s.getToasts().length).toBe(0);
    s.destroy();
  });

  it('duration 0 persists (no auto-dismiss)', () => {
    const s = createToastStore();
    s.add({ content: 'stay', duration: 0 });
    vi.advanceTimersByTime(100000);
    expect(s.getToasts().length).toBe(1);
    s.destroy();
  });

  it('loading defaults to persist', () => {
    const s = createToastStore();
    s.add({ content: 'loading…', type: 'loading' });
    vi.advanceTimersByTime(100000);
    expect(s.getToasts().length).toBe(1);
    s.destroy();
  });

  it('id dedup updates in place and restarts timer', () => {
    const s = createToastStore();
    const id = s.add({ content: 'v1', duration: 3 });
    vi.advanceTimersByTime(2000);
    s.add({ id, content: 'v2', duration: 3 }); // update, restart 3s
    expect(s.getToasts().map((t) => t.content)).toEqual(['v2']);
    expect(s.getToasts().length).toBe(1);
    vi.advanceTimersByTime(2000); // only 2s since update
    expect(s.getToasts().length).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(s.getToasts().length).toBe(0);
    s.destroy();
  });

  it('maxCount evicts the oldest (FIFO)', () => {
    const s = createToastStore({ maxCount: 2 });
    s.add({ content: 'a', duration: 0 });
    s.add({ content: 'b', duration: 0 });
    s.add({ content: 'c', duration: 0 });
    expect(s.getToasts().map((t) => t.content)).toEqual(['b', 'c']);
    s.destroy();
  });

  it('manual remove and removeAll', () => {
    const s = createToastStore();
    const a = s.add({ content: 'a', duration: 0 });
    s.add({ content: 'b', duration: 0 });
    s.remove(a);
    expect(s.getToasts().map((t) => t.content)).toEqual(['b']);
    s.removeAll();
    expect(s.getToasts().length).toBe(0);
    s.destroy();
  });

  it('pause/resume preserves remaining time', () => {
    const s = createToastStore();
    const id = s.add({ content: 'x', duration: 4 });
    vi.advanceTimersByTime(1000); // 3s left
    s.pause(id);
    vi.advanceTimersByTime(10000); // paused, no dismiss
    expect(s.getToasts().length).toBe(1);
    s.resume(id);
    vi.advanceTimersByTime(2999);
    expect(s.getToasts().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(s.getToasts().length).toBe(0);
    s.destroy();
  });

  it('onClose fires with the right reason', () => {
    const s = createToastStore();
    const reasons: string[] = [];
    const id = s.add({ content: 'x', duration: 0, onClose: (_i, r) => reasons.push(r) });
    s.remove(id);
    expect(reasons).toEqual(['manual']);
    s.destroy();
  });

  it('subscribers are notified on changes', () => {
    const s = createToastStore();
    const counts: number[] = [];
    s.subscribe((t) => counts.push(t.length));
    const id = s.add({ content: 'a', duration: 0 });
    s.remove(id);
    expect(counts).toEqual([1, 0]);
    s.destroy();
  });

  it('defaults position to top and theme to light', () => {
    const s = createToastStore();
    s.add({ content: 'x', duration: 0 });
    const [t] = s.getToasts();
    expect(t!.position).toBe('top');
    expect(t!.theme).toBe('light');
    s.destroy();
  });

  it('supports 6 positions and carries theme through', () => {
    const s = createToastStore();
    s.add({ content: 'a', duration: 0, position: 'bottomRight', theme: 'dark' });
    const [t] = s.getToasts();
    expect(t!.position).toBe('bottomRight');
    expect(t!.theme).toBe('dark');
    s.destroy();
  });

  it('maxCount evicts FIFO per position independently', () => {
    const s = createToastStore({ maxCount: 1 });
    s.add({ content: 'top1', duration: 0, position: 'top' });
    s.add({ content: 'bottom1', duration: 0, position: 'bottom' });
    // different positions: neither evicts the other
    expect(s.getToasts().map((t) => t.content)).toEqual(['top1', 'bottom1']);
    // adding a second top evicts only the older top
    s.add({ content: 'top2', duration: 0, position: 'top' });
    expect(s.getToasts().map((t) => t.content)).toEqual(['bottom1', 'top2']);
    s.destroy();
  });
});
