// Tooltip 键盘 e2e（browser project / 真实 chromium）。
// closeOnEsc 默认 false（对齐 Semi Tooltip defaultProps；Popover/Popconfirm 默认 true）：
//   1. 默认情况下聚焦显示浮层后按 Esc，浮层不关闭（对齐 Semi 默认行为）。
//   2. 显式传 closeOnEsc={true} 时，useDismiss(escape:true) 真实 Esc 关闭浮层——
//      浮层 portal 到 body，role=tooltip，焦点仍在触发按钮上（Esc 不移动焦点）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import TooltipKbdFixture from './TooltipKbdFixture.svelte';
import TooltipDefaultEscFixture from './TooltipDefaultEscFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Tooltip 键盘 e2e（Esc 关闭）', () => {
  it('closeOnEsc 默认 false：聚焦显示浮层后按 Esc 不关闭', async () => {
    const { baseElement } = renderKbdFixture(TooltipDefaultEscFixture);

    const trigger = baseElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    expect(trigger).not.toBeNull();

    trigger.focus();
    await expect.element(loc(trigger)).toHaveFocus();
    const tip = page.getByRole('tooltip');
    await expect.element(tip).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    // closeOnEsc 默认 false：浮层仍在（对齐 Semi）。
    await expect.element(tip).toBeInTheDocument();
  });

  it('closeOnEsc={true}：聚焦显示浮层；Esc 关闭浮层且焦点留在触发器', async () => {
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
