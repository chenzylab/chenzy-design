// SideSheet 键盘 e2e（browser project / 真实 chromium）。
// SideSheet 严格对齐 Semi，不做 focus trap（与 Semi 一致）。测真实键盘行为：
//   1. 打开后对话框 [role=dialog] 挂到 document（Portal 到 body）。
//   2. Esc 关闭（closeOnEsc=true）：面板从 document 移除。
//   3. footer 的 close() 关闭：点 Apply 后面板移除。
//
// SideSheet portal 到 body（与 Modal 同构），故在 document 范围查 [role=dialog]。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import SideSheetKbdFixture from './SideSheetKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('SideSheet 键盘 e2e', () => {
  it('打开后对话框在 document；Esc 关闭移除面板', async () => {
    const { baseElement } = renderKbdFixture(SideSheetKbdFixture);

    const trigger = baseElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    await userEvent.click(trigger);

    // 1. SideSheet portal 到 body —— 在 document 范围查询对话框。
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    await expect.element(loc(dialog)).toBeInTheDocument();

    // 2. Esc 关闭（closeOnEsc=true）：受控回写后面板从 document 移除。
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('footer close() 关闭面板', async () => {
    const { baseElement } = renderKbdFixture(SideSheetKbdFixture);

    const trigger = baseElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    await userEvent.click(trigger);

    const apply = document.querySelector('[data-testid="footer-apply"]') as HTMLButtonElement;
    expect(apply).not.toBeNull();
    await userEvent.click(apply);
    await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
  });
});
