// ColorPicker 键盘 e2e（browser project / 真实 chromium，对齐 Semi 重写后）。
// 默认 inline 直接渲染三个 role=slider；测方向键微调经 onChange 回填 ColorValue。
// 焦点陷阱行为在 usePopover 模式由 Popover 承载，已在 Popover 自身测试覆盖，此处不重测。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import ColorPickerKbdFixture from './ColorPickerKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('ColorPicker 键盘 e2e（slider 方向键微调）', () => {
  it('hue slider 聚焦后 ArrowRight 增大 h，Home 归零', async () => {
    const { container } = renderKbdFixture(ColorPickerKbdFixture);

    const sliders = container.querySelectorAll<HTMLElement>('[role="slider"]');
    expect(sliders.length).toBe(3);
    // 第二个 slider 是 hue（saturation / hue / alpha 顺序）。
    const hue = sliders[1]!;
    const hueOut = container.querySelector('[data-testid="hue"]')!;

    const before = Number(hueOut.textContent);
    hue.focus();
    await expect.element(loc(hue)).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => Number(hueOut.textContent)).toBe(before + 1);

    await userEvent.keyboard('{Home}');
    await expect.poll(() => Number(hueOut.textContent)).toBe(0);
  });

  it('saturation slider ArrowRight 改变 hex（经 onChange 回填）', async () => {
    const { container } = renderKbdFixture(ColorPickerKbdFixture);
    const sat = container.querySelector<HTMLElement>('[role="slider"]')!;
    const hexOut = container.querySelector('[data-testid="hex"]')!;
    const before = hexOut.textContent;

    sat.focus();
    await expect.element(loc(sat)).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => hexOut.textContent).not.toBe(before);
  });
});
