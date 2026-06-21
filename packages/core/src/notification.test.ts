import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createNotificationStore } from './notification.js';

describe('createNotificationStore', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('opens a notification and returns its id', () => {
    const s = createNotificationStore();
    const id = s.open({ title: 'Done', content: 'Saved', duration: 0 });
    expect(typeof id).toBe('string');
    expect(s.getItems()[0]?.title).toBe('Done');
    s.destroy();
  });

  it('auto-dismisses after duration (default 4.5s)', () => {
    const s = createNotificationStore();
    s.open({ title: 'x' });
    vi.advanceTimersByTime(4499);
    expect(s.getItems().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(s.getItems().length).toBe(0);
    s.destroy();
  });

  it('duration 0 persists', () => {
    const s = createNotificationStore();
    s.open({ title: 'stay', duration: 0 });
    vi.advanceTimersByTime(100000);
    expect(s.getItems().length).toBe(1);
    s.destroy();
  });

  it('id dedup updates in place', () => {
    const s = createNotificationStore();
    const id = s.open({ title: 'v1', duration: 0 });
    s.open({ id, title: 'v2', duration: 0 });
    expect(s.getItems().length).toBe(1);
    expect(s.getItems()[0]?.title).toBe('v2');
    s.destroy();
  });

  it('FIFO is per-placement', () => {
    const s = createNotificationStore({ maxCount: 2 });
    s.open({ title: 'a', placement: 'topRight', duration: 0 });
    s.open({ title: 'b', placement: 'topRight', duration: 0 });
    s.open({ title: 'c', placement: 'topRight', duration: 0 });
    // topRight evicts oldest 'a'
    const tr = s.getItems().filter((t) => t.placement === 'topRight');
    expect(tr.map((t) => t.title)).toEqual(['b', 'c']);
    // a different placement is unaffected
    s.open({ title: 'd', placement: 'bottomLeft', duration: 0 });
    expect(s.getItems().filter((t) => t.placement === 'bottomLeft').length).toBe(1);
    s.destroy();
  });

  it('close and destroyAll (optionally by placement)', () => {
    const s = createNotificationStore();
    const a = s.open({ title: 'a', placement: 'topRight', duration: 0 });
    s.open({ title: 'b', placement: 'bottomLeft', duration: 0 });
    s.close(a);
    expect(s.getItems().map((t) => t.title)).toEqual(['b']);
    s.open({ title: 'c', placement: 'topRight', duration: 0 });
    s.destroyAll('topRight'); // only topRight cleared
    expect(s.getItems().map((t) => t.title)).toEqual(['b']);
    s.destroyAll(); // all cleared
    expect(s.getItems().length).toBe(0);
    s.destroy();
  });

  it('pause/resume preserves remaining time', () => {
    const s = createNotificationStore();
    const id = s.open({ title: 'x', duration: 4 });
    vi.advanceTimersByTime(1000);
    s.pause(id);
    vi.advanceTimersByTime(10000);
    expect(s.getItems().length).toBe(1);
    s.resume(id);
    vi.advanceTimersByTime(3000);
    expect(s.getItems().length).toBe(0);
    s.destroy();
  });

  it('default type and placement', () => {
    const s = createNotificationStore();
    s.open({ title: 'x', duration: 0 });
    const item = s.getItems()[0]!;
    expect(item.type).toBe('default');
    expect(item.placement).toBe('topRight');
    s.destroy();
  });

  it('showProgress/theme/footer default to off/light/undefined', () => {
    const s = createNotificationStore();
    s.open({ title: 'x', duration: 0 });
    const item = s.getItems()[0]!;
    expect(item.showProgress).toBe(false);
    expect(item.theme).toBe('light');
    expect(item.footer).toBeUndefined();
    s.destroy();
  });

  it('carries showProgress/theme/footer through to the item', () => {
    const s = createNotificationStore();
    const footer = { __snippet: true };
    s.open({ title: 'x', duration: 0, showProgress: true, theme: 'dark', footer });
    const item = s.getItems()[0]!;
    expect(item.showProgress).toBe(true);
    expect(item.theme).toBe('dark');
    expect(item.footer).toBe(footer);
    s.destroy();
  });
});
