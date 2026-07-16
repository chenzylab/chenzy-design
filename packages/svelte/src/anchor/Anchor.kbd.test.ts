// Anchor 键盘 e2e（browser project / 真实 chromium）。
// 链接列表为单一 Tab 停靠点，roving（真实焦点）。
// 测真实焦点移动 + Space 激活——jsdom 测不了（命令式 focus() 不可靠）：
//   1. roving 单停靠点：Tab 进入只停在一个链接（其余 tabindex=-1，默认首个）。
//   2. ↑↓/←→ 真实移动焦点到相邻链接（无 wrap：clamp，源码 nextRovingIndex(...,false)）。
//   3. Home/End 跳首/末链接。
//   4. Space 激活当前焦点链接（aria-current=location）。
//
// 真实焦点断言用 page locator 的 .toHaveFocus()。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import AnchorKbdFixture from './AnchorKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Anchor 键盘 e2e（链接 roving，真实焦点）', () => {
  it('Tab 单停靠点 + 方向键移动焦点（clamp）+ Home/End + Space 激活', async () => {
    const { baseElement } = renderKbdFixture(AnchorKbdFixture);

    const links = Array.from(baseElement.querySelectorAll<HTMLElement>('[data-anchor-href]'));
    expect(links.length).toBe(3);
    const [one, two, three] = links as [HTMLElement, HTMLElement, HTMLElement];

    // 1. roving 单停靠点：默认首链接为 tabindex=0，其余 -1。
    expect(links.filter((el) => el.tabIndex === 0).length).toBe(1);
    expect(one.tabIndex).toBe(0);

    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(one)).toHaveFocus();

    // 2. ↓ 移动焦点到下一链接（真实焦点 + 停靠点同步）。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(two)).toHaveFocus();
    expect(two.tabIndex).toBe(0);
    expect(one.tabIndex).toBe(-1);

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(three)).toHaveFocus();

    // 无 wrap：末项再 ↓ 停在末项（clamp）。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(three)).toHaveFocus();

    // ↑ 回退；首项再 ↑ 停在首项（clamp）。
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(two)).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(one)).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(one)).toHaveFocus();

    // 3. Home/End 跳首/末。
    await userEvent.keyboard('{End}');
    await expect.element(loc(three)).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect.element(loc(one)).toHaveFocus();

    // 4. Space 激活当前焦点链接（aria-current=location）。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(two)).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect.element(loc(two)).toHaveAttribute('aria-current', 'location');
  });
});
