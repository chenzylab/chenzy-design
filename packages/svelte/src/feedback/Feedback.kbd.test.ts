// Feedback 键盘 e2e（browser project / 真实 chromium）。
// emoji 评分行 role=radiogroup + role=radio 子项，roving tabindex：
// 方向键在 emoji 间移动并选中（首次按 → 从第 0 项开始），aria-checked 真实变化。
// jsdom 焦点/方向键合成不可靠，故在真浏览器里测。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import FeedbackKbdFixture from './FeedbackKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Feedback emoji 键盘 e2e（radiogroup 方向键选择）', () => {
  it('聚焦首项 + 方向键移动 + Home/End，aria-checked 真实变化', async () => {
    // Feedback portal 到 document.body；直接在全局查询 radio 项。
    renderKbdFixture(FeedbackKbdFixture);

    const radios = Array.from(document.querySelectorAll('[role="radio"]')) as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
    expect(radios.length).toBe(5);

    // 未选中时首项 roving tabindex=0，聚焦它。
    radios[0].focus();
    await expect.element(loc(radios[0])).toHaveFocus();

    // → 从未选（-1）落到第 0 项并选中。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(radios[0])).toHaveAttribute('aria-checked', 'true');

    // 再 → 到第 1 项。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(radios[1])).toHaveAttribute('aria-checked', 'true');
    await expect.element(loc(radios[0])).toHaveAttribute('aria-checked', 'false');

    // ← 回到第 0 项。
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(loc(radios[0])).toHaveAttribute('aria-checked', 'true');

    // End → 最后一项，Home → 第 0 项。
    await userEvent.keyboard('{End}');
    await expect.element(loc(radios[4])).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Home}');
    await expect.element(loc(radios[0])).toHaveAttribute('aria-checked', 'true');
  });
});
