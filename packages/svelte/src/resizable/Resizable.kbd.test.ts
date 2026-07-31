// Resizable 拖拽行为 e2e（browser project / 真实 chromium）。
//
// 该组件此前**完全没有测试**——拖拽是它的核心能力，却只能靠人肉真机点。
// 拖拽依赖真实布局尺寸与指针事件，jsdom 无布局量不到宽度变化，故必须放这里。
//
// 覆盖两条主链路（对齐 Semi single/resizable 与 group）：
//   1. 单体：拖右边缘把手 → 宽度按位移增加，且受 maxWidth 约束；
//   2. 分栏：拖 ResizeHandler → 两侧面板此消彼长。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture } from '../test-utils/kbd.js';
import ResizableKbdFixture from './ResizableKbdFixture.svelte';

/** 派发完整指针序列模拟一次水平拖拽。 */
function dragX(handle: Element, deltaX: number): void {
  const r = handle.getBoundingClientRect();
  const sx = r.left + r.width / 2;
  const sy = r.top + r.height / 2;
  const fire = (type: string, x: number, target: EventTarget) => {
    const Ctor = type.startsWith('pointer') ? PointerEvent : MouseEvent;
    target.dispatchEvent(
      new Ctor(type, { bubbles: true, cancelable: true, clientX: x, clientY: sy, button: 0 }),
    );
  };
  fire('pointerdown', sx, handle);
  fire('mousedown', sx, handle);
  const steps = 8;
  for (let i = 1; i <= steps; i += 1) {
    const x = sx + (deltaX * i) / steps;
    fire('pointermove', x, document);
    fire('mousemove', x, document);
  }
  fire('pointerup', sx + deltaX, document);
  fire('mouseup', sx + deltaX, document);
}

describe('Resizable 拖拽', () => {
  it('单体：拖右边缘把手按位移增宽，并受 maxWidth 约束', async () => {
    renderKbdFixture(ResizableKbdFixture);

    const box = document
      .querySelector('[data-testid="single-content"]')!
      .closest('.cd-resizable-resizable') as HTMLElement;
    const handle = box.querySelector('.cd-resizable-resizableHandler-right')!;
    expect(handle).not.toBeNull();

    const before = Math.round(box.getBoundingClientRect().width);
    expect(before).toBe(240); // defaultSize

    dragX(handle, 120);
    await expect.poll(() => Math.round(box.getBoundingClientRect().width)).toBe(360);

    // 继续拖超过 maxWidth(480) 应被 clamp
    dragX(box.querySelector('.cd-resizable-resizableHandler-right')!, 400);
    await expect.poll(() => Math.round(box.getBoundingClientRect().width)).toBe(480);
  });

  it('分栏：拖把手时两侧面板此消彼长', async () => {
    renderKbdFixture(ResizableKbdFixture);

    const group = document.querySelector('.cd-resizable-group') as HTMLElement;
    const items = [...group.querySelectorAll('.cd-resizable-item')] as HTMLElement[];
    expect(items.length).toBe(2);
    const handle = group.querySelector('.cd-resizable-handler')!;

    // ResizeGroup 在 onMount 后延后一帧才测量并分配 flex-basis，
    // 直接读会拿到未分配前的塌陷宽度（实测 12px），故先等初始布局落定。
    await expect.poll(() => items[0]!.getBoundingClientRect().width > 100).toBe(true);

    const beforeA = items[0]!.getBoundingClientRect().width;
    const beforeB = items[1]!.getBoundingClientRect().width;

    dragX(handle, 80);

    await expect.poll(() => items[0]!.getBoundingClientRect().width > beforeA).toBe(true);
    expect(items[1]!.getBoundingClientRect().width).toBeLessThan(beforeB);
  });
});
