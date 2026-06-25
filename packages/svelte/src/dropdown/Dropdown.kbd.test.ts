// Dropdown 键盘 e2e（browser project / 真实 chromium）。
// 测真实焦点 roving + Esc 关闭——浮层菜单 portal 到 body，role=menu/menuitem：
//   1. 触发器（role=button）按 ArrowDown 打开菜单并把真实焦点送到首个 menuitem。
//   2. ↑↓ 真实移动焦点到相邻 menuitem（环绕）。
//   3. Esc 关闭菜单（destroyOnClose → 浮层从 document 移除），aria-expanded 复位。
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

    const trigger = baseElement.querySelector('[role="button"]') as HTMLElement;
    expect(trigger).not.toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    // 1. 聚焦触发器并按 ArrowDown：打开菜单 + 把真实焦点送到首个 menuitem（rAF 后就绪）。
    trigger.focus();
    await expect.element(loc(trigger)).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');

    // 菜单 portal 到 body —— 在 document 范围查询。
    await expect.element(page.getByRole('menu')).toBeInTheDocument();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

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

    // 3. Esc 关闭：destroyOnClose → 菜单从 document 移除；trigger aria-expanded 复位。
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
