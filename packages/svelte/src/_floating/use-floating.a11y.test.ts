// @vitest-environment jsdom
// useFloating：ResizeObserver 驱动的尺寸感知重定位（对标 Semi tooltip）。
// jsdom 无原生 RO/layout；用可控桩记录 observe 目标并手动 fire callback，
// 断言：observe 了 trigger + popup；trigger 尺寸变化经 rAF schedule 后重定位。
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useFloating } from './use-floating.js';

// 可控 ResizeObserver 桩：记录 observe 目标，暴露 trigger() 手动派发回调。
class MockRO {
  static instances: MockRO[] = [];
  cb: ResizeObserverCallback;
  observed: Element[] = [];
  disconnected = false;
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
    MockRO.instances.push(this);
  }
  observe(el: Element): void {
    this.observed.push(el);
  }
  unobserve(): void {}
  disconnect(): void {
    this.disconnected = true;
  }
  fire(): void {
    this.cb([] as unknown as ResizeObserverEntry[], this as unknown as ResizeObserver);
  }
}

let rafCbs: FrameRequestCallback[] = [];

function stubRect(el: HTMLElement, rect: Partial<DOMRect>): void {
  el.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      toJSON: () => ({}),
      ...rect,
    }) as DOMRect;
}

describe('useFloating ResizeObserver 尺寸感知重定位', () => {
  beforeEach(() => {
    MockRO.instances = [];
    rafCbs = [];
    vi.stubGlobal('ResizeObserver', MockRO);
    // 让 rAF 同步收集，测试手动 flush。
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCbs.push(cb);
      return rafCbs.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  function flushRaf(): void {
    const cbs = rafCbs;
    rafCbs = [];
    for (const cb of cbs) cb(0);
  }

  it('observe 了 trigger 与 popup 两个元素', () => {
    const trigger = document.createElement('button');
    const popup = document.createElement('div');
    document.body.appendChild(trigger);
    stubRect(trigger, { top: 100, left: 100, width: 50, height: 20, bottom: 120, right: 150 });
    stubRect(popup, { width: 80, height: 30 });

    const handle = useFloating(trigger, popup, { placement: 'bottom' });
    expect(MockRO.instances.length).toBe(1);
    const ro = MockRO.instances[0]!;
    expect(ro.observed).toContain(trigger);
    expect(ro.observed).toContain(popup);
    handle.destroy();
  });

  it('尺寸变化 → RO 回调 → schedule(rAF) → 重定位（transform 更新）', () => {
    const trigger = document.createElement('button');
    const popup = document.createElement('div');
    document.body.appendChild(trigger);
    stubRect(trigger, { top: 100, left: 100, width: 50, height: 20, bottom: 120, right: 150 });
    stubRect(popup, { width: 80, height: 30 });

    const handle = useFloating(trigger, popup, { placement: 'bottom', offset: 8 });
    const initialTransform = popup.style.transform;
    expect(initialTransform).toMatch(/translate/);

    const ro = MockRO.instances[0]!;
    // 首帧 RO 回调被 primed 吞掉（不重定位）。
    ro.fire();
    expect(rafCbs.length).toBe(0);

    // 模拟 trigger 变高/移动：改 rect，再 fire。
    stubRect(trigger, { top: 200, left: 100, width: 50, height: 40, bottom: 240, right: 150 });
    ro.fire();
    // 第二次 fire 应 schedule 一个 rAF。
    expect(rafCbs.length).toBe(1);
    flushRaf();
    // 重定位后 transform 反映新的 trigger 位置（初始 trigger 在 y≈100，移到 y≈200，
    // 故 popup 的 translate y 相应变化）。核心断言：尺寸/位置变化确实触发了重定位。
    const newTransform = popup.style.transform;
    expect(newTransform).not.toBe(initialTransform);
    expect(newTransform).toMatch(/translate\(\d+px, \d+px\)/);
    // y 坐标应随 trigger 下移而变（bottom 放置：popup 贴 trigger 底边）。
    const initY = Number(initialTransform.match(/translate\(\d+px, (\d+)px\)/)?.[1] ?? '0');
    const newY = Number(newTransform.match(/translate\(\d+px, (\d+)px\)/)?.[1] ?? '0');
    expect(newY).toBeGreaterThan(initY);

    handle.destroy();
  });

  it('destroy 时 disconnect observer', () => {
    const trigger = document.createElement('button');
    const popup = document.createElement('div');
    document.body.appendChild(trigger);
    stubRect(trigger, { top: 0, left: 0, width: 10, height: 10 });
    stubRect(popup, { width: 10, height: 10 });

    const handle = useFloating(trigger, popup, { placement: 'top' });
    const ro = MockRO.instances[0]!;
    handle.destroy();
    expect(ro.disconnected).toBe(true);
  });
});
