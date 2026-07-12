// Dropdown 键盘 e2e（browser project / 真实 chromium）。
// 重写对齐 Semi 后：触发器是用户提供的 children（span.cd-dropdown-trigger，无 role=button），
// 浮层菜单 portal 到 body，ul[role=menu] + li[role=menuitem]。测真实焦点 roving + Esc 关闭：
//   1. 触发器（span.cd-dropdown-trigger）focus 后按 ArrowDown 打开菜单并把真实焦点送到首个 menuitem。
//   2. ↑↓ 真实移动焦点到相邻 menuitem（环绕）。
//   3. Esc 关闭菜单（keepDOM=false → 浮层从 document 移除），aria-expanded 复位。
//
// 真实焦点断言用 page locator 的 .toHaveFocus()（对真实 document.activeElement 重试断言）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import DropdownKbdFixture from './DropdownKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Dropdown 键盘 e2e（菜单 roving + Esc）', () => {
  it('ArrowDown 打开并聚焦首项；↑↓ 移动焦点；Esc 关闭复位 aria-expanded', async () => {
    const { baseElement } = renderKbdFixture(DropdownKbdFixture);

    // 触发器根是 span.cd-dropdown-trigger（ARIA 载体，本身不可聚焦）；
    // 真实焦点落在其内用户提供的 <button>（keydown 冒泡到 span 上的处理器）。
    const trigger = baseElement.querySelector('.cd-dropdown-trigger') as HTMLElement;
    expect(trigger).not.toBeNull();
    // ARIA 写在真实触发器元素（span 内的 <button>）本身，非包裹 span（对齐 Semi）。
    const triggerBtn = trigger.querySelector('[data-testid="trigger-label"]') as HTMLElement;
    expect(triggerBtn).not.toBeNull();
    expect(triggerBtn.getAttribute('aria-expanded')).toBe('false');

    // 1. 聚焦触发器并按 ArrowDown：打开菜单 + 把真实焦点送到首个 menuitem（rAF 后就绪）。
    triggerBtn.focus();
    await expect.element(loc(triggerBtn)).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');

    // 菜单 portal 到 body —— 在 document 范围查询。
    await expect.element(page.getByRole('menu')).toBeInTheDocument();
    expect(triggerBtn.getAttribute('aria-expanded')).toBe('true');

    const items = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    expect(items.length).toBe(3);
    const [edit, dup, del] = items as [HTMLElement, HTMLElement, HTMLElement];

    // 真实焦点已落到首个 menuitem。
    await expect.element(loc(edit)).toHaveFocus();

    // 2. ↓ 移动到下一项；↑ 回上一项；末项 ↓ 环绕回首项。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(dup)).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(del)).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(edit)).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(del)).toHaveFocus();

    // 3. Esc 关闭：keepDOM=false → 菜单从 document 移除；trigger aria-expanded 复位。
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    expect(triggerBtn.getAttribute('aria-expanded')).toBe('false');
  });
});
