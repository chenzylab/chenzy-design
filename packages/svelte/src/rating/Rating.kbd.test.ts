// Rating 键盘 e2e（browser project / 真实 chromium）。
// Rating 根元素是 role=slider（APG slider 模式，tabindex=0），焦点落在根本身：
// ←↓ 减、→↑ 增（minStep=1），数字键 1–9 直接定位，Home→0 / End→count，
// aria-valuenow 真实变化。jsdom 焦点/数字键合成不可靠，故在真浏览器里测。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import RatingKbdFixture from './RatingKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Rating 键盘 e2e（role=slider 方向键 + 数字键）', () => {
  it('Tab 聚焦 + 方向键调分 + 数字键定位 + Home/End', async () => {
    const { baseElement } = renderKbdFixture(RatingKbdFixture);

    const rating = baseElement.querySelector('[role="slider"]') as HTMLElement;
    expect(rating).not.toBeNull();
    expect(rating.getAttribute('aria-valuenow')).toBe('3');

    // Tab 从 before 进入，焦点落在 slider 根。
    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(rating)).toHaveFocus();

    // → 增（4），← 减（3）。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(rating)).toHaveAttribute('aria-valuenow', '4');
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(loc(rating)).toHaveAttribute('aria-valuenow', '3');

    // 数字键 5 直接定位到 5 分。
    await userEvent.keyboard('5');
    await expect.element(loc(rating)).toHaveAttribute('aria-valuenow', '5');
    // 数字键 2 定位到 2 分。
    await userEvent.keyboard('2');
    await expect.element(loc(rating)).toHaveAttribute('aria-valuenow', '2');

    // Home → 0，End → count(5)。
    await userEvent.keyboard('{Home}');
    await expect.element(loc(rating)).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{End}');
    await expect.element(loc(rating)).toHaveAttribute('aria-valuenow', '5');
  });
});
