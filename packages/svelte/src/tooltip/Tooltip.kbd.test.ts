// Tooltip 键盘 e2e（browser project / 真实 chromium）。
// 测 useDismiss(escape:true) 的真实 Esc 关闭——浮层 portal 到 body，role=tooltip：
//   1. 聚焦触发按钮（trigger='focus'）→ focusin 显示浮层（document 范围查 role=tooltip）。
//   2. 按 Esc → useDismiss 关闭浮层；焦点仍在触发按钮上（Esc 不移动焦点）。
//
// WCAG 1.4.13（Content on Hover or Focus）：focus 浮层须可由 Esc 关闭。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import TooltipKbdFixture from './TooltipKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Tooltip 键盘 e2e（Esc 关闭）', () => {
  it('聚焦显示浮层；Esc 关闭浮层且焦点留在触发器', async () => {
    const { baseElement } = renderKbdFixture(TooltipKbdFixture);

    const trigger = baseElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    expect(trigger).not.toBeNull();

    // 1. 聚焦触发按钮 → focusin 打开浮层。浮层 portal 到 body，在 document 范围查询。
    trigger.focus();
    await expect.element(loc(trigger)).toHaveFocus();
    const tip = page.getByRole('tooltip');
    await expect.element(tip).toBeInTheDocument();
    await expect.element(tip).toHaveTextContent('More info');

    // 2. Esc 关闭浮层（useDismiss escape:true 对 focus 触发亦生效）。
    await userEvent.keyboard('{Escape}');
    await expect.element(tip).not.toBeInTheDocument();

    // Esc 不移动焦点：焦点仍在触发按钮上。
    await expect.element(loc(trigger)).toHaveFocus();
  });
});
