// SideSheet 键盘 e2e（browser project / 真实 chromium）。
// 测 focus-trap 的真实焦点行为——jsdom 完全测不了（焦点模型不完整）：
//   1. 打开 SideSheet 后焦点进入对话框内（首个可聚焦元素）。
//   2. Tab 循环被困在内：Tab 到最后一个再 Tab 回第一个；Shift+Tab 反向。
//   3. Esc 关闭后焦点归还触发元素（trigger 按钮）。
//
// SideSheet portal 到 body（与 Modal/Drawer 同构），故在 document 范围查 [role=dialog]。
// 仅 mask=true（默认）启用 focus trap；fixture 用 motionDisabled 关动效稳住时序。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import SideSheetKbdFixture from './SideSheetKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

function focusablesIn(dialog: HTMLElement) {
  return Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null);
}

describe('SideSheet 键盘 e2e（focus trap）', () => {
  it('打开后焦点进入对话框；Tab 循环困在内；Esc 关闭后焦点归还 trigger', async () => {
    const { baseElement } = renderKbdFixture(SideSheetKbdFixture);

    const trigger = baseElement.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    await userEvent.click(trigger);

    // SideSheet portal 到 body —— 在 document 范围查询对话框。
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    await expect.element(loc(dialog)).toBeInTheDocument();

    // 1. 焦点进入对话框内（focus-trap activate 聚焦首个可聚焦元素）。
    expect(dialog.contains(document.activeElement)).toBe(true);

    const focusables = focusablesIn(dialog);
    expect(focusables.length).toBeGreaterThan(1);
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;

    // 2a. 焦点移到最后一个，再 Tab → 循环回第一个（被困住）。
    last.focus();
    await expect.element(loc(last)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(first)).toHaveFocus();
    expect(dialog.contains(document.activeElement)).toBe(true);

    // 2b. Shift+Tab 从第一个 → 循环回最后一个。
    await userEvent.tab({ shift: true });
    await expect.element(loc(last)).toHaveFocus();
    expect(dialog.contains(document.activeElement)).toBe(true);

    // 3. Esc 关闭（closeOnEsc 默认 true）—— focus-trap deactivate 归还焦点 trigger。
    await userEvent.keyboard('{Escape}');
    await expect.element(loc(trigger)).toHaveFocus();
  });
});
