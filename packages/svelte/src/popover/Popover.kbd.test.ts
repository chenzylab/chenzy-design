// Popover 键盘 e2e（browser project / 真实 chromium），dialog（click）模式。
// click 触发：触发器 span 承载 role=button + tabindex=0，trapFocus 默认随 click。
// 打开后焦点进入浮层（useFocusTrap），Esc（useDismiss escape）关闭并把焦点归还触发器。
// jsdom 测不了真实焦点进入/归还，故这里在真浏览器断 .toHaveFocus()。
//   1. 聚焦触发器并 Enter 打开 → 焦点进入浮层（dialog）。
//   2. Esc 关闭 → 焦点归还触发器。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import PopoverKbdFixture from './PopoverKbdFixture.svelte';
import PopoverStopPropFixture from './PopoverStopPropFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Popover 键盘 e2e（dialog Esc 关闭 + 焦点归还）', () => {
  it('Enter 打开焦点进浮层；Esc 关闭归还触发器', async () => {
    const { baseElement } = renderKbdFixture(PopoverKbdFixture);

    // dialog 模式触发器 = role=button + tabindex=0 的 span。
    const trigger = baseElement.querySelector('.cd-tooltip__trigger') as HTMLElement;
    expect(trigger).not.toBeNull();
    expect(trigger.getAttribute('role')).toBe('button');

    // 1. 聚焦触发器，Enter 打开（onTriggerKeydown）。
    trigger.focus();
    await expect.element(loc(trigger)).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    // 浮层 portal 到 body：查 role=dialog。
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    await expect.element(loc(dialog)).toBeInTheDocument();
    // 焦点进入浮层（focus trap activate）。
    await expect.poll(() => dialog.contains(document.activeElement)).toBe(true);

    // 2. Esc 关闭，焦点归还触发器（focus trap returnFocus + useDismiss escape）。
    await userEvent.keyboard('{Escape}');
    await expect.element(loc(trigger)).toHaveFocus();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  // 回归：click 绑在触发器元素本身（对齐 Semi cloneElement 绑 children），
  // 故 children 内部子元素 stopPropagation 不影响浮层打开（曾因 click 挂最外层靠冒泡而被截断）。
  it('children 子元素 stopPropagation 时，点击仍打开浮层且不连带冒泡到外层', async () => {
    const { baseElement } = renderKbdFixture(PopoverStopPropFixture);

    const moreBtn = baseElement.querySelector('[data-testid="more"]') as HTMLElement;
    expect(moreBtn).not.toBeNull();

    const trigger = baseElement.querySelector('.cd-tooltip__trigger') as HTMLElement;

    // 点击带 stopPropagation 的 children 子元素。
    await userEvent.click(moreBtn);

    // 浮层打开（trigger 上的 onClick 触发，未被子元素 stopPropagation 截断）。
    await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('true');
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();

    // stopPropagation 生效：外层容器未收到该 click（未误触发外层 onclick）。
    const outerClicks = baseElement.querySelector('[data-testid="outer-clicks"]');
    expect(outerClicks?.textContent).toBe('0');
  });
});
