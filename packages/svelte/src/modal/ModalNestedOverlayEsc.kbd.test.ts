// 嵌套浮层 Escape e2e（browser project / 真实 chromium）。
// 复现并验证修复：Modal 内嵌 DatePicker，两者各自独立调用 useDismiss（各挂一个
// document keydown 监听器，互不知道彼此存在）。修复前按一次 Escape 会同时触发
// DatePicker 面板关闭和 Modal 关闭；修复后 useDismiss 的全局 Escape 栈只让后挂载
// （逻辑上更内层，此处是打开面板的 DatePicker）响应，Modal 保持打开——面板关闭后
// 再按一次 Escape 才轮到 Modal 响应。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import ModalNestedOverlayEscFixture from './ModalNestedOverlayEscFixture.svelte';

describe('嵌套浮层 Escape（Modal 内 DatePicker）', () => {
  it('DatePicker 面板打开时按 Escape 只关面板，Modal 保持打开；再按一次才关 Modal', async () => {
    const { baseElement } = renderKbdFixture(ModalNestedOverlayEscFixture);

    const trigger = baseElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    await userEvent.click(trigger);

    const dialog = page.getByRole('dialog');
    await expect.element(dialog).toBeInTheDocument();

    // 打开 DatePicker 面板（点击 combobox 触发器）。
    const combobox = page.getByRole('combobox');
    await userEvent.click(combobox);
    await expect.element(combobox).toHaveAttribute('aria-expanded', 'true');

    // 第一次 Escape：只应关闭 DatePicker 面板，Modal（dialog）仍应在文档中。
    await userEvent.keyboard('{Escape}');
    await expect.element(combobox).toHaveAttribute('aria-expanded', 'false');
    await expect.element(dialog).toBeInTheDocument();

    // 第二次 Escape：面板已关闭，轮到 Modal 响应并关闭。
    await userEvent.keyboard('{Escape}');
    await expect.element(dialog).not.toBeInTheDocument();
  });
});
