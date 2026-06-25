// OverflowList 键盘 e2e（browser project / 真实 chromium），scroll 模式可聚焦滚动容器。
// scroll 模式下可见层（.cd-overflow-list__visible）成为滚动容器，tabindex=0 + role=group +
// aria-label，键盘用户可 Tab 聚焦后用方向键滚动（浏览器对聚焦滚动容器原生支持，WCAG 2.1.1）。
//   Tab 从前置按钮进入 → 焦点落到可滚动可见层（真实焦点 + 可访问名存在）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import OverflowListKbdFixture from './OverflowListKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('OverflowList 键盘 e2e（scroll 模式可聚焦滚动容器）', () => {
  it('Tab 聚焦可滚动可见层（tabindex=0 + 可访问名）', async () => {
    const { baseElement } = renderKbdFixture(OverflowListKbdFixture);

    const scroller = baseElement.querySelector(
      '.cd-overflow-list__visible',
    ) as HTMLElement;
    expect(scroller).not.toBeNull();
    // scroll 模式可见层可聚焦 + 有可访问名 + group 角色。
    expect(scroller.tabIndex).toBe(0);
    expect(scroller.getAttribute('role')).toBe('group');
    expect(scroller.getAttribute('aria-label')).toBe('Tags');

    // Tab 从前置按钮进入 → 焦点落到可滚动可见层（真实焦点）。
    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(scroller)).toHaveFocus();
  });
});
