// Breadcrumb 键盘 e2e（browser project / 真实 chromium），折叠 … disclosure。
// maxItemCount + moreType='popover' → 中间项折叠为 … 触发器，经 Popover 包裹：
// cd-tooltip__trigger（role=button, tabindex=0）承载 aria-haspopup/aria-expanded，
// Enter/Space 键盘激活展开浮层菜单（role=menu，portal 到 document.body）。
//   1. 折叠触发器真实聚焦，初始 aria-expanded=false。
//   2. Enter 展开：aria-expanded=true，浮层 role=menu 出现在 document。
//   3. Esc 收起：aria-expanded 复位 false。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import BreadcrumbKbdFixture from './BreadcrumbKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Breadcrumb 键盘 e2e（折叠 … disclosure）', () => {
  it('Enter 展开折叠浮层菜单 + aria-expanded 变化 + Esc 收起', async () => {
    const { baseElement } = renderKbdFixture(BreadcrumbKbdFixture);

    // disclosure 触发器：Popover 封装 Tooltip，触发器为 Tooltip 的 role=button 包裹（aria-expanded 宿主）。
    const trigger = baseElement.querySelector(
      '.cd-tooltip__trigger[role="button"]',
    ) as HTMLElement;
    expect(trigger).not.toBeNull();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    // 1. 触发器真实聚焦（可达 tabindex=0）。
    trigger.focus();
    await expect.element(loc(trigger)).toHaveFocus();

    // 2. Enter 展开：浮层菜单 portal 到 body，aria-expanded=true。
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('menu')).toBeInTheDocument();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    // 浮层内为折叠项 menuitem（被收纳的中间项 Library/Data）。
    const menuitems = Array.from(document.querySelectorAll('[role="menuitem"]'));
    expect(menuitems.length).toBeGreaterThanOrEqual(1);

    // 3. Esc 收起：aria-expanded 复位。
    await userEvent.keyboard('{Escape}');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
