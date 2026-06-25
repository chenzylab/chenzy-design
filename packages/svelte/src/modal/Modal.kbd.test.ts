// Modal 键盘 e2e（browser project / 真实 chromium）。
// 测 focus-trap 的真实焦点行为——jsdom 完全测不了（焦点模型不完整）：
//   1. 打开 Modal 后焦点进入对话框内（首个可聚焦元素）。
//   2. Tab 循环被困在 Modal 内：Tab 到最后一个可聚焦元素后再 Tab 回到第一个；
//      Shift+Tab 从第一个回到最后一个。
//   3. 关闭后焦点归还触发元素（trigger 按钮）。
//
// 真实焦点断言用 page locator 的 .toHaveFocus()（对真实 document.activeElement 重试断言）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import ModalKbdFixture from './ModalKbdFixture.svelte';

// 把任意 DOM 元素包成可断言焦点的 locator。
function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Modal 键盘 e2e（focus trap）', () => {
  it('打开后焦点进入对话框；Tab 循环困在 Modal 内；关闭后焦点归还 trigger', async () => {
    const { baseElement } = renderKbdFixture(ModalKbdFixture);

    // 先聚焦 trigger，再点击打开（点击会先聚焦该按钮，作为归还焦点的锚点）。
    const trigger = baseElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    await userEvent.click(trigger);

    // Modal portal 到 body —— 在 document 范围查询对话框。
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();

    // 1. 焦点进入对话框内（首个可聚焦元素，焦点陷阱 activate 时聚焦它）。
    await expect.element(loc(dialog)).toBeInTheDocument();
    // activeElement 落在对话框内部（而非 trigger 或 body）。
    expect(dialog.contains(document.activeElement)).toBe(true);

    // 收集对话框内所有可聚焦元素，按 DOM 顺序（焦点陷阱用同一选择器循环）。
    const focusables = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null);
    expect(focusables.length).toBeGreaterThan(1);
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;

    // 2a. 把焦点移到最后一个可聚焦元素，再 Tab → 焦点循环回第一个（被困住，不逃出 Modal）。
    last.focus();
    await expect.element(loc(last)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(first)).toHaveFocus();
    // 焦点没逃到 trigger（仍在对话框内）。
    expect(dialog.contains(document.activeElement)).toBe(true);

    // 2b. Shift+Tab 从第一个 → 循环回最后一个。
    await userEvent.tab({ shift: true });
    await expect.element(loc(last)).toHaveFocus();
    expect(dialog.contains(document.activeElement)).toBe(true);

    // 3. Esc 关闭（keyboard=true 默认）—— focus-trap deactivate 把焦点归还 trigger。
    await userEvent.keyboard('{Escape}');
    const triggerLoc = baseElement.querySelector('[data-testid="trigger"]') as HTMLElement;
    await expect.element(loc(triggerLoc)).toHaveFocus();
  });
});
