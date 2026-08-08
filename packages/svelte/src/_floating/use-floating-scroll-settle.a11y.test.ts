// @vitest-environment jsdom
// useFloating：单次 scroll 事件后应持续追帧重定位，直到 trigger rect 稳定，
// 而非只重定位一次就停。
//
// 真机 bug（TimePicker PR #695 后续报告）：浮层打开时用触发器/惯性滚动页面，
// 浏览器把整段惯性滚动（trackpad fling）合并/节流成极少数 scroll 事件——事件
// 触发时滚动动画还没走完，position() 用了滚动中途的 triggerRect 快照定位，
// 此后再没有 scroll 事件纠正它，浮层就停在与触发器脱节的错误位置。
// 修复：schedule() 触发后连续多帧重新读 triggerRect，直到连续 2 帧不再变化
// （即滚动真正停稳）才停止追帧，而不是收到一次 scroll 就只算一帧。
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useFloating } from './use-floating.js';

let rafCbs: FrameRequestCallback[] = [];

// computePosition 读的是 DOMRect 的 .x/.y（非 .top/.left），真实 DOMRect 里 x===left、
// y===top 恒成立；这里显式派生，避免只传 top/left 时 .x/.y 停在默认 0 误判位置。
function stubRect(el: HTMLElement, rect: Partial<DOMRect>): void {
  const merged = {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    ...rect,
  };
  if (rect.left !== undefined) merged.x = rect.left;
  if (rect.top !== undefined) merged.y = rect.top;
  el.getBoundingClientRect = () => ({ ...merged, toJSON: () => ({}) }) as DOMRect;
}

describe('useFloating 滚动惯性追帧重定位', () => {
  beforeEach(() => {
    rafCbs = [];
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

  /** 逐帧 flush：每次只跑当前已入队的回调，让回调内部再入队的下一帧被下一轮捕获。 */
  function flushOneFrame(): void {
    const cbs = rafCbs;
    rafCbs = [];
    for (const cb of cbs) cb(0);
  }

  it('单次 scroll 事件后，triggerRect 持续变化多帧，追帧应跟到最终稳定位置才停', () => {
    const trigger = document.createElement('button');
    const popup = document.createElement('div');
    document.body.appendChild(trigger);
    stubRect(trigger, { top: 300, left: 100, width: 50, height: 20, bottom: 320, right: 150 });
    stubRect(popup, { width: 80, height: 30 });

    const handle = useFloating(trigger, popup, { placement: 'bottom', offset: 8 });

    // 模拟原生惯性滚动：只派发一次 scroll 事件，但触发器在接下来若干帧里持续
    // 移动（浏览器仍在做动量滚动，只是不再派发新的 scroll 事件）。
    const positions = [300, 260, 220, 190, 170, 160, 160, 160]; // 最后两帧稳定在 160
    let i = 0;
    stubRect(trigger, {
      top: positions[0]!,
      left: 100,
      width: 50,
      height: 20,
      bottom: positions[0]! + 20,
      right: 150,
    });
    window.dispatchEvent(new Event('scroll'));

    // 逐帧推进：每一帧都让 trigger 移动到 positions 的下一个值，模拟持续的
    // 惯性滚动；一旦追帧提前停止，后续 rAF 队列会空掉，trigger 位置更新也
    // 不会再被读取，最终 transform 就会停在某个中途值而非最终 160。
    while (rafCbs.length > 0 && i < positions.length - 1) {
      i++;
      stubRect(trigger, {
        top: positions[i]!,
        left: 100,
        width: 50,
        height: 20,
        bottom: positions[i]! + 20,
        right: 150,
      });
      flushOneFrame();
    }
    // 再多推进几帧让"连续 2 帧不变"的稳定判定生效（trigger 已不再移动）。
    let guard = 0;
    while (rafCbs.length > 0 && guard < 10) {
      flushOneFrame();
      guard++;
    }

    // 最终 popup 的 y 应反映 trigger 稳定后的最终位置（top=160 + height 20 + offset 8 = 188），
    // 而不是滚动中途某一帧的快照。
    const transform = popup.style.transform;
    const y = Number(transform.match(/translate\(\d+px, (\d+)px\)/)?.[1] ?? '-1');
    expect(y).toBe(188);

    handle.destroy();
  });

  it('追帧最终停止（不会无限占用 rAF）：trigger 稳定后 2 帧内不再入队新 rAF', () => {
    const trigger = document.createElement('button');
    const popup = document.createElement('div');
    document.body.appendChild(trigger);
    stubRect(trigger, { top: 100, left: 100, width: 50, height: 20, bottom: 120, right: 150 });
    stubRect(popup, { width: 80, height: 30 });

    const handle = useFloating(trigger, popup, { placement: 'bottom', offset: 8 });
    window.dispatchEvent(new Event('scroll'));

    // trigger 从一开始就不再移动（滚动已经停稳），追帧应在 2 帧内收敛并停止。
    let guard = 0;
    while (rafCbs.length > 0 && guard < 10) {
      flushOneFrame();
      guard++;
    }
    expect(guard).toBeLessThan(10);
    expect(rafCbs.length).toBe(0);

    handle.destroy();
  });
});
