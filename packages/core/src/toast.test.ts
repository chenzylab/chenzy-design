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

  it('auto-dismisses after duration (marks leaving; finalize removes)', () => {
    // 两段式（对齐 Semi）：到期 → remove 标记 leaving（仍在列表触发离场动画），
    // 渲染层动画结束调 finalizeRemove 才真删。
    const s = createToastStore();
    const id = s.add({ content: 'bye', duration: 2 });
    expect(s.getToasts().length).toBe(1);
    vi.advanceTimersByTime(1999);
    expect(s.getToasts()[0]!.leaving).toBe(false);
    vi.advanceTimersByTime(1);
    // 到期后仍在列表，但已标记离场
    expect(s.getToasts().length).toBe(1);
    expect(s.getToasts()[0]!.leaving).toBe(true);
    s.finalizeRemove(id);
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
    expect(s.getToasts()[0]!.leaving).toBe(false);
    vi.advanceTimersByTime(1000);
    // 到期标记离场（未真删），finalize 后清空
    expect(s.getToasts()[0]!.leaving).toBe(true);
    s.finalizeRemove(id);
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

  it('has() reflects presence (leaving item still present until finalize)', () => {
    const s = createToastStore();
    const id = s.add({ content: 'a', duration: 0 });
    expect(s.has(id)).toBe(true);
    expect(s.has('nope')).toBe(false);
    s.remove(id); // 标记离场，项仍在列表
    expect(s.has(id)).toBe(true);
    s.finalizeRemove(id); // 动画结束真删
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

  it('manual remove and removeAll (two-phase: mark leaving then finalize)', () => {
    const s = createToastStore();
    const a = s.add({ content: 'a', duration: 0 });
    const b = s.add({ content: 'b', duration: 0 });
    s.remove(a); // 标记 a 离场，仍在列表
    expect(s.getToasts().map((t) => t.content)).toEqual(['a', 'b']);
    expect(s.getToasts().find((t) => t.id === a)!.leaving).toBe(true);
    expect(s.getToasts().find((t) => t.id === b)!.leaving).toBe(false);
    s.finalizeRemove(a); // 真删 a
    expect(s.getToasts().map((t) => t.content)).toEqual(['b']);
    s.removeAll(); // 标记全部离场
    expect(s.getToasts().every((t) => t.leaving)).toBe(true);
    s.finalizeRemove(b);
    expect(s.getToasts().length).toBe(0);
    s.destroy();
  });

  it('pause clears timer; resume restarts full duration (对齐 Semi)', () => {
    const s = createToastStore();
    const id = s.add({ content: 'x', duration: 4 });
    vi.advanceTimersByTime(1000);
    s.pause(id);
    vi.advanceTimersByTime(10000); // paused, no dismiss
    expect(s.getToasts()[0]!.leaving).toBe(false);
    s.resume(id); // restart full 4s
    vi.advanceTimersByTime(3999);
    expect(s.getToasts()[0]!.leaving).toBe(false);
    vi.advanceTimersByTime(1);
    // 到期标记离场（两段式，未真删）
    expect(s.getToasts()[0]!.leaving).toBe(true);
    s.finalizeRemove(id);
    expect(s.getToasts().length).toBe(0);
    s.destroy();
  });

  it('onClose fires on finalizeRemove, not on remove (对齐 Semi onAnimationEnd)', () => {
    const s = createToastStore();
    const calls: unknown[][] = [];
    const id = s.add({
      content: 'x',
      duration: 0,
      onClose: (...args: unknown[]) => calls.push(args),
    });
    s.remove(id); // 仅标记离场，onClose 不触发
    expect(calls).toEqual([]);
    s.finalizeRemove(id); // 动画结束才触发 onClose（无参数）
    expect(calls).toEqual([[]]);
    s.destroy();
  });

  it('finalizeRemove is guarded: no-op when item is not leaving (reopened)', () => {
    const s = createToastStore();
    const calls: unknown[][] = [];
    const id = s.add({ content: 'x', duration: 0, onClose: () => calls.push([]) });
    s.remove(id); // leaving = true
    s.add({ id, content: 'x2', duration: 0 }); // reopen 清 leaving
    s.finalizeRemove(id); // 守卫：非 leaving 不处理
    expect(s.has(id)).toBe(true);
    expect(calls).toEqual([]);
    s.destroy();
  });

  it('subscribers are notified on changes', () => {
    const s = createToastStore();
    const counts: number[] = [];
    s.subscribe((t) => counts.push(t.length));
    const id = s.add({ content: 'a', duration: 0 });
    s.remove(id); // 标记离场也 emit（列表长度不变）
    s.finalizeRemove(id); // 真删
    expect(counts).toEqual([1, 1, 0]);
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
