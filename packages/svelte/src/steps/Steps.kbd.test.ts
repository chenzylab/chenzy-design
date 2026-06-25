// Steps 键盘 e2e（browser project / 真实 chromium）。
// type="nav"（→ clickable）启用 roving，可点击步骤组为单一 Tab 停靠点。
// 测真实焦点移动——jsdom 测不了（命令式 focus() 不可靠）：
//   1. roving 单停靠点：Tab 进入只停在一个 step button（其余 tabindex=-1）。
//   2. ↑↓/←→ 真实移动焦点到相邻步骤（无 wrap：clamp 在两端，源码 nextRovingIndex(...,false)）。
//   3. Home/End 跳首/末步。
//
// 真实焦点断言用 page locator 的 .toHaveFocus()。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import StepsKbdFixture from './StepsKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Steps 键盘 e2e（nav/clickable roving，真实焦点）', () => {
  it('Tab 单停靠点 + 方向键移动焦点（clamp）+ Home/End 跳首末', async () => {
    const { baseElement } = renderKbdFixture(StepsKbdFixture);

    const buttons = Array.from(
      baseElement.querySelectorAll<HTMLElement>('button[data-step-index]'),
    );
    expect(buttons.length).toBe(3);
    const [first, second, third] = buttons as [HTMLElement, HTMLElement, HTMLElement];

    // 1. roving 单停靠点：恰一个 tabindex=0（默认收敛到 activeIndex=0 首步）。
    expect(buttons.filter((el) => el.tabIndex === 0).length).toBe(1);
    expect(first.tabIndex).toBe(0);

    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(first)).toHaveFocus();

    // 2. → / ↓ 移动焦点到下一步（真实焦点 + 停靠点同步）。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(second)).toHaveFocus();
    expect(second.tabIndex).toBe(0);
    expect(first.tabIndex).toBe(-1);

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(third)).toHaveFocus();

    // 无 wrap：末步再 → 停在末步（clamp）。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(third)).toHaveFocus();

    // ← / ↑ 回退。
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(loc(second)).toHaveFocus();

    // 首步再 ← 停在首步（clamp）。
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(first)).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(first)).toHaveFocus();

    // 3. Home/End 跳首/末。
    await userEvent.keyboard('{End}');
    await expect.element(loc(third)).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect.element(loc(first)).toHaveFocus();

    // Tab 离开步骤组 → after 按钮（单停靠点，不困在组内）。
    const after = baseElement.querySelector('[data-testid="after"]') as HTMLElement;
    await userEvent.keyboard('{End}');
    await userEvent.tab();
    await expect.element(loc(after)).toHaveFocus();
  });
});
