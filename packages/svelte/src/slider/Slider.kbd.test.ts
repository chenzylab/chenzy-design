// Slider 键盘 e2e（browser project / 真实 chromium）。
// 焦点落在 role=slider 手柄本身（tabindex=0）：方向键 ←↓ 减、→↑ 增，
// Home/End 跳 min/max，aria-valuenow 真实变化。range 双手柄各自可聚焦、各自调值。
// jsdom 焦点模型不完整、方向键步进的真实焦点不可靠，故在真浏览器里测。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import SliderKbdFixture from './SliderKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Slider 键盘 e2e（role=slider 方向键调值）', () => {
  it('单值：Tab 聚焦手柄 + ←→ 步进 + Home/End 到 min/max', async () => {
    const { baseElement } = renderKbdFixture(SliderKbdFixture);

    const single = baseElement.querySelector('[data-testid="single"]') as HTMLElement;
    const thumb = single.querySelector('[role="slider"]') as HTMLElement;
    expect(thumb).not.toBeNull();
    expect(thumb.getAttribute('aria-valuenow')).toBe('50');

    // Tab 从 before 进入，焦点落到手柄本身。
    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(thumb)).toHaveFocus();

    // → 增一步（51），← 减两步（49）。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(thumb)).toHaveAttribute('aria-valuenow', '51');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect.element(loc(thumb)).toHaveAttribute('aria-valuenow', '49');

    // ↑ 增（50），↓ 减（49）——竖直方向键也步进（APG：Up 增 Down 减）。
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(thumb)).toHaveAttribute('aria-valuenow', '50');
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(thumb)).toHaveAttribute('aria-valuenow', '49');

    // Home → min(0)，End → max(100)。
    await userEvent.keyboard('{Home}');
    await expect.element(loc(thumb)).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{End}');
    await expect.element(loc(thumb)).toHaveAttribute('aria-valuenow', '100');
  });

  it('range：两手柄各自可聚焦并各自调值', async () => {
    const { baseElement } = renderKbdFixture(SliderKbdFixture);

    const range = baseElement.querySelector('[data-testid="range"]') as HTMLElement;
    const thumbs = Array.from(range.querySelectorAll<HTMLElement>('[role="slider"]'));
    expect(thumbs.length).toBe(2);
    const [low, high] = thumbs as [HTMLElement, HTMLElement];
    expect(low.getAttribute('aria-valuenow')).toBe('20');
    expect(high.getAttribute('aria-valuenow')).toBe('60');

    // 低位手柄聚焦后 → 增（21）。
    low.focus();
    await expect.element(loc(low)).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(low)).toHaveAttribute('aria-valuenow', '21');
    // 高位手柄未受影响。
    expect(high.getAttribute('aria-valuenow')).toBe('60');

    // 高位手柄聚焦后 ← 减（59）。
    high.focus();
    await expect.element(loc(high)).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(loc(high)).toHaveAttribute('aria-valuenow', '59');
    expect(low.getAttribute('aria-valuenow')).toBe('21');
  });
});
