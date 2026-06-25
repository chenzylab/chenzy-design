// List 键盘 e2e（browser project / 真实 chromium）。
// selectable="single" → role=listbox / 行 role=option，roving 单停靠点（真实焦点）。
// 测真实焦点移动 + Space 选中——jsdom 测不了（命令式 focus() 不可靠）：
//   1. roving 单停靠点：Tab 进入只停在一行（其余 tabindex=-1，默认首行）。
//   2. ↑↓ 真实移动焦点到相邻行（无 wrap：clamp，源码 Math.min/max）。
//   3. Home/End 跳首/末行。
//   4. Space 选中当前焦点行（aria-selected=true）。
//
// 真实焦点断言用 page locator 的 .toHaveFocus()。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import ListKbdFixture from './ListKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('List 键盘 e2e（selectable listbox roving，真实焦点）', () => {
  it('Tab 单停靠点 + ↑↓ 移动焦点（clamp）+ Home/End + Space 选中', async () => {
    const { baseElement } = renderKbdFixture(ListKbdFixture);

    const listbox = baseElement.querySelector('[role="listbox"]') as HTMLElement;
    expect(listbox).toBeTruthy();
    const rows = Array.from(baseElement.querySelectorAll<HTMLElement>('[role="option"]'));
    expect(rows.length).toBe(3);
    const [alpha, bravo, charlie] = rows as [HTMLElement, HTMLElement, HTMLElement];

    // 1. roving 单停靠点：默认首行为 tabindex=0，其余 -1。
    expect(rows.filter((el) => el.tabIndex === 0).length).toBe(1);
    expect(alpha.tabIndex).toBe(0);

    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(alpha)).toHaveFocus();

    // 2. ↓ 移动焦点到下一行（真实焦点 + 停靠点同步）。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(bravo)).toHaveFocus();
    expect(bravo.tabIndex).toBe(0);
    expect(alpha.tabIndex).toBe(-1);

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(charlie)).toHaveFocus();

    // 无 wrap：末行再 ↓ 停在末行（clamp）。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(charlie)).toHaveFocus();

    // ↑ 回退；首行再 ↑ 停在首行（clamp）。
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(bravo)).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(alpha)).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(alpha)).toHaveFocus();

    // 3. Home/End 跳首/末。
    await userEvent.keyboard('{End}');
    await expect.element(loc(charlie)).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect.element(loc(alpha)).toHaveFocus();

    // 4. Space 选中当前焦点行（aria-selected=true）。single 模式互斥。
    expect(alpha.getAttribute('aria-selected')).toBe('false');
    await userEvent.keyboard(' ');
    await expect.element(loc(alpha)).toHaveAttribute('aria-selected', 'true');
  });
});
