// Feedback 键盘 e2e（browser project / 真实 chromium）。
// 对齐 Semi 后 emoji 评分行是裸 span（无 radiogroup/方向键 roving）；本库补
// role=button + tabindex=0 + Enter/Space 触发，保证键盘可达。jsdom 焦点/键盘合成
// 不可靠，故在真浏览器验证：Tab 聚焦 emoji、Enter/Space 触发选择。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import FeedbackKbdFixture from './FeedbackKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Feedback emoji 键盘 e2e（裸 span + Enter/Space 触发）', () => {
  it('聚焦 emoji + Enter/Space 触发选择，选中项加 -selected', async () => {
    // Feedback portal 到 document.body；直接在全局查询 emoji 项。
    renderKbdFixture(FeedbackKbdFixture);

    const items = Array.from(document.querySelectorAll('.cd-feedback-emoji-item')) as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
    expect(items.length).toBe(3);

    // 每项 role=button + tabindex=0，键盘可聚焦。
    for (const item of items) {
      expect(item.getAttribute('role')).toBe('button');
      expect(item.getAttribute('tabindex')).toBe('0');
    }

    // 聚焦第 2 项（😐）并按 Enter → 选中。
    items[1].focus();
    await expect.element(loc(items[1])).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(loc(items[1])).toHaveClass('cd-feedback-emoji-item-selected');

    // 聚焦第 3 项（😃）并按 Space → 选中，切换选中态。
    items[2].focus();
    await userEvent.keyboard(' ');
    await expect.element(loc(items[2])).toHaveClass('cd-feedback-emoji-item-selected');
    await expect.element(loc(items[1])).not.toHaveClass('cd-feedback-emoji-item-selected');
  });
});
