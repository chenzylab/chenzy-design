// Popconfirm 键盘 e2e（browser project / 真实 chromium）。
// click 触发：触发器 div 承载 role=button + tabindex=0，Enter 打开浮层（dialog）。
// 打开后 useFocusTrap 把焦点移入浮层，Esc（useDismiss escape）关闭并归还焦点到触发器。
// jsdom 测不了真实焦点移入/归还，故真浏览器断 .toHaveFocus()。
//   1. 聚焦触发器并 Enter 打开 → 焦点进入浮层（含取消/确认按钮）。
//   2. Esc 关闭 → 焦点归还触发器。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import PopconfirmKbdFixture from './PopconfirmKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Popconfirm 键盘 e2e（浮层焦点 + Esc 归还）', () => {
  it('Enter 打开焦点进浮层；Esc 关闭归还触发器', async () => {
    const { baseElement } = renderKbdFixture(PopconfirmKbdFixture);

    const trigger = baseElement.querySelector('.cd-popconfirm__trigger') as HTMLElement;
    expect(trigger).not.toBeNull();
    expect(trigger.getAttribute('role')).toBe('button');

    // 1. 聚焦触发器，Enter 打开（onTriggerKeydown）。
    trigger.focus();
    await expect.element(loc(trigger)).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    // 浮层 portal 到 body：查 role=dialog。
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    // 焦点进入浮层（focus trap activate；落在首个可聚焦项 = 取消按钮）。
    await expect.poll(() => dialog.contains(document.activeElement)).toBe(true);
    // 浮层内含确认/取消按钮（多个可聚焦点）。
    expect(dialog.querySelectorAll('button').length).toBeGreaterThanOrEqual(2);

    // 2. Esc 关闭，焦点归还触发器（focus trap deactivate returnFocus + useDismiss escape）。
    await userEvent.keyboard('{Escape}');
    await expect.element(loc(trigger)).toHaveFocus();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
