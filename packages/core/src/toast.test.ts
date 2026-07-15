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

  it('update() merges in place and restarts timer', () => {
    const s = createToastStore();
    const id = s.add({ content: 'v1', duration: 3 });
    vi.advanceTimersByTime(2000);
    s.update(id, { content: 'v2', type: 'success' }); // update, restart 3s (default duration)
    const [t] = s.getToasts();
    expect(t!.content).toBe('v2');
    expect(t!.type).toBe('success');
    expect(s.getToasts().length).toBe(1);
    vi.advanceTimersByTime(2000); // only 2s since update
    expect(s.getToasts().length).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(s.getToasts().length).toBe(0);
    s.destroy();
  });

  it('add() with existing id replaces in place', () => {
    const s = createToastStore();
    const id = s.add({ content: 'v1', duration: 0 });
    s.add({ id, content: 'v2', duration: 0 });
    expect(s.getToasts().map((t) => t.content)).toEqual(['v2']);
    expect(s.getToasts().length).toBe(1);
    s.destroy();
  });

  it('has() reflects presence', () => {
    const s = createToastStore();
    const id = s.add({ content: 'a', duration: 0 });
    expect(s.has(id)).toBe(true);
    expect(s.has('nope')).toBe(false);
    s.remove(id);
    expect(s.has(id)).toBe(false);
    s.destroy();
  });

  it('does not evict — Semi keeps all toasts', () => {
    const s = createToastStore();
    s.add({ content: 'a', duration: 0 });
    s.add({ content: 'b', duration: 0 });
    s.add({ content: 'c', duration: 0 });
    expect(s.getToasts().map((t) => t.content)).toEqual(['a', 'b', 'c']);
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

  it('pause clears timer; resume restarts full duration (对齐 Semi)', () => {
    const s = createToastStore();
    const id = s.add({ content: 'x', duration: 4 });
    vi.advanceTimersByTime(1000);
    s.pause(id);
    vi.advanceTimersByTime(10000); // paused, no dismiss
    expect(s.getToasts().length).toBe(1);
    s.resume(id); // restart full 4s
    vi.advanceTimersByTime(3999);
    expect(s.getToasts().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(s.getToasts().length).toBe(0);
    s.destroy();
  });

  it('onClose fires with no argument (对齐 Semi () => void)', () => {
    const s = createToastStore();
    const calls: unknown[][] = [];
    const id = s.add({
      content: 'x',
      duration: 0,
      onClose: (...args: unknown[]) => calls.push(args),
    });
    s.remove(id);
    expect(calls).toEqual([[]]);
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

  it('defaults type to default and theme to normal', () => {
    const s = createToastStore();
    s.add({ content: 'x', duration: 0 });
    const [t] = s.getToasts();
    expect(t!.type).toBe('default');
    expect(t!.theme).toBe('normal');
    expect(t!.showClose).toBe(true);
    expect(t!.textMaxWidth).toBe(450);
    expect(t!.stack).toBe(false);
    s.destroy();
  });

  it('carries type/theme/stack/direction through', () => {
    const s = createToastStore();
    s.add({
      content: 'a',
      duration: 0,
      type: 'error',
      theme: 'light',
      stack: true,
      direction: 'rtl',
    });
    const [t] = s.getToasts();
    expect(t!.type).toBe('error');
    expect(t!.theme).toBe('light');
    expect(t!.stack).toBe(true);
    expect(t!.direction).toBe('rtl');
    s.destroy();
  });

  it('config defaults (defaultDuration/defaultTheme/defaultDirection)', () => {
    const s = createToastStore({ defaultDuration: 5, defaultTheme: 'light', defaultDirection: 'rtl' });
    s.add({ content: 'x' });
    const [t] = s.getToasts();
    expect(t!.duration).toBe(5);
    expect(t!.theme).toBe('light');
    expect(t!.direction).toBe('rtl');
    s.destroy();
  });
});
