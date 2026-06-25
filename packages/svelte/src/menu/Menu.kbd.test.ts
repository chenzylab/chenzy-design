// Menu 键盘 e2e（browser project / 真实 chromium），vertical 模式 roving 导航。
// 测真实焦点移动——jsdom 测不了（焦点模型不完整、roving 的命令式 focus() 不可靠）：
//   1. roving 单停靠点：Tab 进入菜单只停在一个 menuitem（其余 tabindex=-1）。
//   2. ↑↓ 真实移动焦点到相邻 menuitem（环绕）。
//   3. Home/End 跳首/末项。
//
// 真实焦点断言用 page locator 的 .toHaveFocus()（对真实 document.activeElement 重试断言）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import MenuKbdFixture from './MenuKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Menu 键盘 e2e（vertical roving）', () => {
  it('Tab 单停靠点 + ↑↓ 移动焦点 + Home/End 跳首末', async () => {
    const { baseElement } = renderKbdFixture(MenuKbdFixture);

    const items = Array.from(
      baseElement.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    expect(items.length).toBe(3);
    const [home, profile, settings] = items as [HTMLElement, HTMLElement, HTMLElement];

    // 1. roving 单停靠点：恰有一个 menuitem tabindex=0，其余 -1。
    const stops = items.filter((el) => el.tabIndex === 0);
    expect(stops.length).toBe(1);
    expect(items.filter((el) => el.tabIndex === -1).length).toBe(2);
    // 默认停靠点为首项（未选中时收敛到第一个）。
    expect(home.tabIndex).toBe(0);

    // 从 before 按钮起 Tab，焦点应落到唯一停靠点（首个 menuitem），不会逐个进入。
    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(home)).toHaveFocus();

    // 2. ↓ 移动到下一项（真实焦点 + roving 停靠点同步）。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(profile)).toHaveFocus();
    expect(profile.tabIndex).toBe(0);
    expect(home.tabIndex).toBe(-1);

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(settings)).toHaveFocus();

    // 环绕：末项 ↓ 回到首项。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(home)).toHaveFocus();

    // ↑ 环绕到末项。
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(settings)).toHaveFocus();

    // 3. Home/End 跳首/末。
    await userEvent.keyboard('{Home}');
    await expect.element(loc(home)).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect.element(loc(settings)).toHaveFocus();

    // Tab 后焦点离开菜单（单一停靠点 → 直接到 after 按钮，不困在菜单里）。
    const after = baseElement.querySelector('[data-testid="after"]') as HTMLElement;
    await userEvent.tab();
    await expect.element(loc(after)).toHaveFocus();
  });
});
