// Tabs 键盘 e2e（browser project / 真实 chromium），horizontal tablist roving。
// 对齐 Semi 的手动激活模型：方向键仅移动焦点（不改激活态），Enter/Space 才激活对应面板。
// jsdom 测不了（焦点模型不完整、命令式 focus() 不可靠）：
//   1. roving 单停靠点：选中 tab 的 tabindex=0，其余 -1；Tab 从 before 进入只停在选中 tab。
//   2. ←→ 真实移动焦点到相邻 tab（环绕）——但不激活；Enter/Space 才激活。
//   3. Home/End 跳首/末 tab。
//   4. Tab 离开 tablist 后落到 after 按钮（单停靠点，不困在 tablist 里）。
//
// 真实焦点断言用 page locator 的 .toHaveFocus()（对真实 document.activeElement 重试断言）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import TabsKbdFixture from './TabsKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Tabs 键盘 e2e（horizontal roving + 手动激活，对齐 Semi）', () => {
  it('roving 单停靠点 + ←→ 移动焦点 + Enter/Space 激活 + Home/End 跳首末', async () => {
    const { baseElement } = renderKbdFixture(TabsKbdFixture);

    const tabs = Array.from(baseElement.querySelectorAll<HTMLElement>('[role="tab"]'));
    expect(tabs.length).toBe(3);
    const [overview, details, history] = tabs as [HTMLElement, HTMLElement, HTMLElement];

    // 1. roving 单停靠点：默认选中首个 tab（defaultActiveKey='overview'），其 tabindex=0，其余 -1。
    expect(tabs.filter((el) => el.tabIndex === 0).length).toBe(1);
    expect(overview.tabIndex).toBe(0);
    expect(overview.getAttribute('aria-selected')).toBe('true');

    // 从 before 按钮 Tab 进入：只停靠在选中 tab，不逐个进入。
    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(overview)).toHaveFocus();

    // 2. → 移动焦点到下一 tab，但对齐 Semi 手动激活：焦点移动不改变激活态。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(details)).toHaveFocus();
    expect(details.getAttribute('aria-selected')).toBe('false');
    expect(overview.getAttribute('aria-selected')).toBe('true');

    // Enter 激活当前聚焦 tab（aria-selected + 停靠点同步切换）。
    await userEvent.keyboard('{Enter}');
    expect(details.getAttribute('aria-selected')).toBe('true');
    expect(details.tabIndex).toBe(0);
    expect(overview.tabIndex).toBe(-1);

    // → 到末项后 Space 激活。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(history)).toHaveFocus();
    expect(history.getAttribute('aria-selected')).toBe('false');
    await userEvent.keyboard(' ');
    expect(history.getAttribute('aria-selected')).toBe('true');

    // 环绕：末项 → 回到首项（仅焦点）。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(overview)).toHaveFocus();

    // ← 环绕到末项。
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(loc(history)).toHaveFocus();

    // 3. Home/End 跳首/末（仅焦点，不激活）。
    await userEvent.keyboard('{Home}');
    await expect.element(loc(overview)).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect.element(loc(history)).toHaveFocus();

    // 4. Tab 离开 tablist：单停靠点 → 焦点先到选中面板（history 已激活），再 Tab 到 after 按钮。
    await userEvent.keyboard('{Enter}');
    const panel = baseElement.querySelector('[role="tabpanel"]:not([hidden])') as HTMLElement;
    await userEvent.tab();
    await expect.element(loc(panel)).toHaveFocus();
    const after = baseElement.querySelector('[data-testid="after"]') as HTMLElement;
    await userEvent.tab();
    await expect.element(loc(after)).toHaveFocus();
  });
});
