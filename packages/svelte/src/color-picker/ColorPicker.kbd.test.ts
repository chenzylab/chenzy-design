// ColorPicker 键盘 e2e（browser project / 真实 chromium）。
// 测浮层 focus-trap 的真实焦点行为——jsdom 测不了（焦点模型不完整）：
//   1. 点 trigger 打开后焦点进入面板内首个可聚焦控件（饱和度 slider）。
//   2. Tab 循环被困在面板内：Tab 到最后一个再 Tab 回第一个；Shift+Tab 反向。
//   3. Esc 关闭后焦点归还触发元素（trigger）。
//
// ColorPicker 浮层「非 portal」：面板渲染在 .cd-color-picker 根容器内，
// 故在 fixture container 范围内查 [role=dialog]（不在 document 查）。
import { describe, it, expect, vi } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import ColorPickerKbdFixture from './ColorPickerKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

function focusablesIn(panel: HTMLElement) {
  return Array.from(
    panel.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null);
}

describe('ColorPicker 键盘 e2e（focus trap）', () => {
  it('打开后焦点进入面板首控件；Tab 循环困在面板内；Esc 关闭后焦点归还 trigger', async () => {
    const { container } = renderKbdFixture(ColorPickerKbdFixture);

    // trigger 是 ColorPicker 自带按钮（非 portal，在 container 内）。
    // 该按钮尺寸来自 CSS token（测试环境未加载组件 token 样式表，故渲染为 0×0，
    // userEvent.click 的可见性门槛过不去）。改用原生 focus()+click()：先聚焦使其成为
    // 焦点归还锚点（focus-trap activate 时记录的 previouslyFocused），再触发打开。
    const trigger = container.querySelector('.cd-color-picker__trigger') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    trigger.focus();
    await expect.element(loc(trigger)).toHaveFocus();
    trigger.click();

    // 浮层非 portal —— 在 container 范围查面板（role=dialog）。
    // click 触发的 open 状态更新→重渲染是异步的，轮询等面板出现。
    await vi.waitFor(() => {
      const p = container.querySelector('[role="dialog"]');
      expect(p).not.toBeNull();
    });
    const panel = container.querySelector('[role="dialog"]') as HTMLElement;
    await expect.element(loc(panel)).toBeInTheDocument();

    // 1. 焦点进入面板内（focus-trap activate 聚焦首个可聚焦控件）。
    expect(panel.contains(document.activeElement)).toBe(true);

    const focusables = focusablesIn(panel);
    expect(focusables.length).toBeGreaterThan(1);
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;

    // 2a. 焦点移到最后一个，再 Tab → 循环回第一个（被困住，不逃出面板）。
    last.focus();
    await expect.element(loc(last)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(first)).toHaveFocus();
    expect(panel.contains(document.activeElement)).toBe(true);

    // 2b. Shift+Tab 从第一个 → 循环回最后一个。
    await userEvent.tab({ shift: true });
    await expect.element(loc(last)).toHaveFocus();
    expect(panel.contains(document.activeElement)).toBe(true);

    // 3. Esc 关闭 —— focus-trap deactivate 把焦点归还 trigger。
    await userEvent.keyboard('{Escape}');
    await expect.element(loc(trigger)).toHaveFocus();
  });
});
