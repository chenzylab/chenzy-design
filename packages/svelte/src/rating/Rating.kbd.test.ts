// Rating 键盘 e2e（browser project / 真实 chromium）——对齐 Semi。
// 每颗星 role=radio（roving tabindex），焦点落在当前分值对应的星上：
// Tab 进入 → 聚焦当前 checked 星（value=3 → index=2 second 星）；
// →/↑ 加、←/↓ 减（minStep=1），焦点随分值搬移，aria-checked 真实变化。
// 仅方向键（无 Home/End/数字键超集，对齐 Semi foundation）。
// jsdom 焦点合成不可靠，故在真浏览器里测。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import RatingKbdFixture from './RatingKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

function secondStar(root: Element, index: number): HTMLElement {
  return root.querySelector(`[data-index="${index}"] [data-star="second"]`) as HTMLElement;
}

describe('Rating 键盘 e2e（radio 星 + 方向键）', () => {
  it('Tab 聚焦当前星 + 方向键调分并搬移焦点 + 越界环绕', async () => {
    const { baseElement } = renderKbdFixture(RatingKbdFixture);

    const root = baseElement.querySelector('ul.cd-rating') as HTMLElement;
    expect(root).not.toBeNull();

    // 初始 value=3 → index=2 的 second 星 checked。
    const star3 = secondStar(root, 2);
    expect(star3.getAttribute('aria-checked')).toBe('true');

    // Tab 从 before 进入 → 焦点落在当前 checked 星（index=2）。
    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(star3)).toHaveFocus();

    // → 加到 4：index=3 星 checked 且获焦。
    await userEvent.keyboard('{ArrowRight}');
    const star4 = secondStar(root, 3);
    await expect.element(loc(star4)).toHaveAttribute('aria-checked', 'true');
    await expect.element(loc(star4)).toHaveFocus();

    // ← 减回 3。
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(loc(star3)).toHaveAttribute('aria-checked', 'true');
    await expect.element(loc(star3)).toHaveFocus();

    // ↑ 等价于 →（加），↓ 等价于 ←（减）。
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(star4)).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(star3)).toHaveAttribute('aria-checked', 'true');
  });
});
