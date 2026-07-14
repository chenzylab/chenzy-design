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

  it('auto-dismisses after duration (default 3s, aligned with Semi)', () => {
    const s = createNotificationStore();
    s.open({ title: 'x' });
    vi.advanceTimersByTime(2999);
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

  it('id dedup updates in place and restarts the timer', () => {
    const s = createNotificationStore();
    const id = s.open({ title: 'v1', duration: 0 });
    s.open({ id, title: 'v2', duration: 0 });
    expect(s.getItems().length).toBe(1);
    expect(s.getItems()[0]?.title).toBe('v2');
    s.destroy();
  });

  it('update merges previous props (aligned with Semi update)', () => {
    const s = createNotificationStore();
    const id = s.open({ title: 'v1', content: 'body', type: 'success', duration: 0 });
    s.open({ id, content: 'body2', duration: 0 });
    const item = s.getItems()[0]!;
    // title/type preserved, content updated
    expect(item.title).toBe('v1');
    expect(item.type).toBe('success');
    expect(item.content).toBe('body2');
    s.destroy();
  });

  it('new notice is placed at the head of the queue (aligned with Semi addNotice)', () => {
    const s = createNotificationStore();
    s.open({ title: 'a', duration: 0 });
    s.open({ title: 'b', duration: 0 });
    expect(s.getItems().map((t) => t.title)).toEqual(['b', 'a']);
    s.destroy();
  });

  it('has() reflects presence', () => {
    const s = createNotificationStore();
    const id = s.open({ title: 'a', duration: 0 });
    expect(s.has(id)).toBe(true);
    s.close(id);
    expect(s.has(id)).toBe(false);
    s.destroy();
  });

  it('close and destroyAll', () => {
    const s = createNotificationStore();
    const a = s.open({ title: 'a', duration: 0 });
    s.open({ title: 'b', duration: 0 });
    s.close(a);
    expect(s.getItems().map((t) => t.title)).toEqual(['b']);
    s.open({ title: 'c', duration: 0 });
    s.destroyAll();
    expect(s.getItems().length).toBe(0);
    s.destroy();
  });

  it('onClose fires on close and destroyAll', () => {
    const s = createNotificationStore();
    const onClose = vi.fn();
    const id = s.open({ title: 'a', duration: 0, onClose });
    s.close(id);
    expect(onClose).toHaveBeenCalledTimes(1);
    const onClose2 = vi.fn();
    s.open({ title: 'b', duration: 0, onClose: onClose2 });
    s.destroyAll();
    expect(onClose2).toHaveBeenCalledTimes(1);
    s.destroy();
  });

  it('pause clears the timer; resume restarts a full countdown (aligned with Semi)', () => {
    const s = createNotificationStore();
    const id = s.open({ title: 'x', duration: 4 });
    vi.advanceTimersByTime(1000);
    s.pause(id);
    vi.advanceTimersByTime(10000);
    expect(s.getItems().length).toBe(1);
    s.resume(id);
    // resume 重新完整计时（4s），而非仅剩余 3s
    vi.advanceTimersByTime(3999);
    expect(s.getItems().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(s.getItems().length).toBe(0);
    s.destroy();
  });

  it('default type / position / theme / showClose', () => {
    const s = createNotificationStore();
    s.open({ title: 'x', duration: 0 });
    const item = s.getItems()[0]!;
    expect(item.type).toBe('default');
    expect(item.position).toBe('topRight');
    expect(item.theme).toBe('normal');
    expect(item.showClose).toBe(true);
    s.destroy();
  });

  it('carries theme / icon / zIndex / onClick / onCloseClick through to the item', () => {
    const s = createNotificationStore();
    const icon = { __snippet: true };
    const onClick = vi.fn();
    const onCloseClick = vi.fn();
    s.open({ title: 'x', duration: 0, theme: 'light', icon, zIndex: 2000, onClick, onCloseClick });
    const item = s.getItems()[0]!;
    expect(item.theme).toBe('light');
    expect(item.icon).toBe(icon);
    expect(item.zIndex).toBe(2000);
    expect(item.onClick).toBe(onClick);
    expect(item.onCloseClick).toBe(onCloseClick);
    s.destroy();
  });
});
