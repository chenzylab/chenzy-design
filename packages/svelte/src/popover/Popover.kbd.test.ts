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
import PopoverArrowKeyFixture from './PopoverArrowKeyFixture.svelte';

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

  // ArrowDown/ArrowUp 移焦（对齐 Semi）：hover 打开后焦点仍在触发器，
  // ⬇️ 焦点移入浮层首个可交互元素、⬆️ 移到最后一个。
  it('hover 打开后 ArrowDown 焦点进首元素、ArrowUp 进末元素', async () => {
    const { baseElement } = renderKbdFixture(PopoverArrowKeyFixture);

    const trigger = baseElement.querySelector('[data-testid="trigger"]') as HTMLElement;
    expect(trigger).not.toBeNull();

    // 聚焦触发器（focus 也会触发 hover trigger 显示，与 Semi 一致），等浮层进场稳定。
    trigger.focus();
    await expect.poll(() => document.querySelector('[data-testid="first"]') !== null).toBe(true);
    await new Promise((r) => setTimeout(r, 300));

    // 焦点在触发器上发 ArrowDown → 焦点进浮层首元素。
    // 直接向触发器派发 keydown（userEvent 的 ArrowDown 默认滚动会把焦点弹出测试 iframe；
    // dispatchEvent 贴近键盘落到触发器的真实路径：冒泡至包裹 span 的 onkeydown 监听）。
    const first = document.querySelector('[data-testid="first"]') as HTMLElement;
    const last = document.querySelector('[data-testid="last"]') as HTMLElement;
    trigger.focus();
    const downEv = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    trigger.dispatchEvent(downEv);
    // handler 命中：preventDefault（阻止默认滚动）+ 焦点落到首元素。
    expect(downEv.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);

    // 回触发器发 ArrowUp → 末元素。
    trigger.focus();
    const upEv = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
    trigger.dispatchEvent(upEv);
    expect(upEv.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(last);
  });

  // onEscKeyDown 回调独立于 closeOnEsc：closeOnEsc=false 时按 Esc 仍触发回调但不关闭。
  it('closeOnEsc=false 时 Esc 触发 onEscKeyDown 回调且浮层不关闭', async () => {
    const { baseElement } = renderKbdFixture(PopoverArrowKeyFixture);

    const trigger = baseElement.querySelector('[data-testid="trigger"]') as HTMLElement;
    trigger.focus();
    await expect.poll(() => document.querySelector('[role="tooltip"]') !== null).toBe(true);

    await userEvent.keyboard('{Escape}');

    // 回调触发（计数 +1）。
    const count = baseElement.querySelector('[data-testid="esc-count"]');
    await expect.poll(() => count?.textContent).toBe('1');
    // closeOnEsc=false → 浮层仍在。
    expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  });
});
