// Transfer 键盘 e2e（browser project / 真实 chromium），双 listbox roving。
// 测真实焦点移动 + 焦点保留——jsdom 测不了（焦点模型不完整、命令式 focus() 不可靠）：
//   1. 源列（左 listbox）内 ↓ 真实移动焦点到相邻 option（roving，clamp 不环绕）。
//   2. Space 勾选当前行（aria-selected 翻转）。
//   3. Enter 把已勾选项移到对侧：目标列出现该项；焦点保留在源列移动位置附近的 option。
//
// 真实焦点断言用 page locator 的 .toHaveFocus()（对真实 document.activeElement 重试断言）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import TransferKbdFixture from './TransferKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

function leftListbox(base: Element): HTMLElement {
  // 源列为第一个 listbox（左侧）。
  return base.querySelector<HTMLElement>('[role="listbox"]')!;
}

function optsOf(listbox: Element): HTMLElement[] {
  return Array.from(listbox.querySelectorAll<HTMLElement>('[role="option"]'));
}

describe('Transfer 键盘 e2e（双 listbox roving + 焦点保留）', () => {
  it('源列 ↓ 移动焦点 + Space 勾选 + Enter 移项后焦点保留', async () => {
    const { baseElement } = renderKbdFixture(TransferKbdFixture);

    const source = leftListbox(baseElement);
    const opts = optsOf(source);
    expect(opts.length).toBe(4); // Apple/Banana/Cherry/Date
    const [apple, banana] = opts as [HTMLElement, HTMLElement, HTMLElement, HTMLElement];

    // roving 单停靠点：源列恰有一个 option tabindex=0（首行）。
    expect(opts.filter((el) => el.tabIndex === 0).length).toBe(1);
    expect(apple.tabIndex).toBe(0);

    // 1. 聚焦首行，↓ 真实移动焦点到下一 option。
    apple.focus();
    await expect.element(loc(apple)).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(banana)).toHaveFocus();
    expect(banana.tabIndex).toBe(0);
    expect(apple.tabIndex).toBe(-1);

    // 2. Space 勾选当前行（Banana）：aria-selected 翻转为 true。
    expect(banana.getAttribute('aria-selected')).toBe('false');
    await userEvent.keyboard(' ');
    await expect.element(loc(banana)).toHaveAttribute('aria-selected', 'true');

    // 3. Enter 把已勾选项（Banana）移到对侧。
    await userEvent.keyboard('{Enter}');

    // 目标列（第二个 listbox）出现 Banana。
    await expect
      .poll(() => baseElement.querySelectorAll('[role="listbox"]').length)
      .toBe(2);
    const target = baseElement.querySelectorAll<HTMLElement>('[role="listbox"]')[1]!;
    await expect.element(loc(target)).toHaveTextContent('Banana');

    // 源列只剩 Apple/Cherry/Date（Banana 已移走）。
    const sourceAfter = leftListbox(baseElement);
    const srcAfter = optsOf(sourceAfter);
    expect(srcAfter.map((el) => el.getAttribute('data-transfer-key'))).toEqual(['a', 'c', 'd']);
    // 焦点保留（spec §6）：移项后焦点未丢到 body，仍落在源列内某个 option 上，
    // 且该 option 是源列唯一 roving 停靠点（tabindex=0）。
    await expect
      .poll(() => sourceAfter.contains(document.activeElement))
      .toBe(true);
    const focused = document.activeElement as HTMLElement;
    expect(focused.getAttribute('role')).toBe('option');
    expect(focused.tabIndex).toBe(0);
  });
});
