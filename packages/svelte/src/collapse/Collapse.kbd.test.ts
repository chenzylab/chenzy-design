// Collapse 键盘 e2e（browser project / 真实 chromium）。
// APG Accordion：Header 组为单一 Tab 停靠点，roving（真实焦点）。
// 测真实焦点移动 + Enter/Space 展开——jsdom 测不了（命令式 focus() 不可靠）：
//   1. roving 单停靠点：Tab 进入只停在一个 Header（其余 tabindex=-1，默认首个）。
//   2. ↑↓ 真实移动焦点到相邻 Header（无 wrap：clamp，源码 nextRovingIndex(...,false)）。
//   3. Home/End 跳首/末 Header。
//   4. Enter / Space 展开当前焦点 Header（aria-expanded=true）。
//
// 真实焦点断言用 page locator 的 .toHaveFocus()。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import CollapseKbdFixture from './CollapseKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Collapse 键盘 e2e（accordion header roving，真实焦点）', () => {
  it('Tab 单停靠点 + ↑↓ 移动焦点（clamp）+ Home/End', async () => {
    const { baseElement } = renderKbdFixture(CollapseKbdFixture);

    const headers = Array.from(
      baseElement.querySelectorAll<HTMLElement>('.cd-collapse__header[data-collapse-key]'),
    );
    expect(headers.length).toBe(3);
    const [h1, h2, h3] = headers as [HTMLElement, HTMLElement, HTMLElement];

    // 1. roving 单停靠点：默认首个 Header 为 tabindex=0，其余 -1。
    expect(headers.filter((el) => el.tabIndex === 0).length).toBe(1);
    expect(h1.tabIndex).toBe(0);

    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(h1)).toHaveFocus();

    // 2. ↓ 移动焦点到下一 Header（真实焦点 + 停靠点同步）。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(h2)).toHaveFocus();
    expect(h2.tabIndex).toBe(0);
    expect(h1.tabIndex).toBe(-1);

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(h3)).toHaveFocus();

    // 无 wrap：末项再 ↓ 停在末项（clamp）。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(h3)).toHaveFocus();

    // ↑ 回退；首项再 ↑ 停在首项（clamp）。
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(h2)).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(h1)).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(h1)).toHaveFocus();

    // 3. Home/End 跳首/末。
    await userEvent.keyboard('{End}');
    await expect.element(loc(h3)).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect.element(loc(h1)).toHaveFocus();
  });

  it('Enter / Space 展开当前焦点 Header（aria-expanded）', async () => {
    const { baseElement } = renderKbdFixture(CollapseKbdFixture);

    const headers = Array.from(
      baseElement.querySelectorAll<HTMLElement>('.cd-collapse__header[data-collapse-key]'),
    );
    const [h1, h2] = headers as [HTMLElement, HTMLElement];

    h1.focus();
    await expect.element(loc(h1)).toHaveFocus();
    expect(h1.getAttribute('aria-expanded')).toBe('false');

    // Enter 展开当前 Header（原生 button 触发 onclick → toggle）。
    await userEvent.keyboard('{Enter}');
    await expect.element(loc(h1)).toHaveAttribute('aria-expanded', 'true');

    // 移到下一 Header，Space 展开（非 accordion，可同时展开）。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(h2)).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect.element(loc(h2)).toHaveAttribute('aria-expanded', 'true');
  });
});
