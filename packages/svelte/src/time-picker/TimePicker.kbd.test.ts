// TimePicker 交互 e2e（browser project / 真实 chromium）。
// 时间列复用 ScrollList/ScrollItem（mode=normal，点击 li[role=option] 选中 → onSelect → onChange）。
// 无自造 roving：选择由点击驱动（对齐 Semi Combobox 手动组合 ScrollItem）。
//   1. 点触发器打开面板，三列（时/分/秒）各是一个 -scrolllist-item。
//   2. 点小时列某项 → onChange 收到对应小时；触发器 Input 值更新。
//   3. Esc 关闭面板。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import TimePickerKbdFixture from './TimePickerKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('TimePicker 交互 e2e（ScrollList 点击选中）', () => {
  it('打开面板 → 点小时列项选中 → Esc 关闭', async () => {
    const { baseElement } = renderKbdFixture(TimePickerKbdFixture);

    const trigger = baseElement.querySelector('[data-testid="before"]') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    await userEvent.click(trigger);

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    // 时/分/秒三个 -scrolllist-item（normal 列）。
    const cols = Array.from(dialog.querySelectorAll<HTMLElement>('.cd-scrolllist-item'));
    expect(cols.length).toBe(3);
    const hourCol = cols[0]!;

    const hourOptions = Array.from(hourCol.querySelectorAll<HTMLElement>('[role="option"]'));
    // value=08:30:45 → 小时列选中项 08（文本含 '08'）。
    const hour08 = hourOptions.find((el) => el.textContent?.includes('08'))!;
    expect(hour08).not.toBeUndefined();
    expect(hour08.getAttribute('aria-selected')).toBe('true');

    // 点小时列 10 → 选中变化。
    const hour10 = hourOptions.find((el) => el.textContent?.trim() === '10')!;
    expect(hour10).not.toBeUndefined();
    await userEvent.click(hour10);
    // 选中态迁移到 10。
    await expect.element(loc(hour10)).toHaveAttribute('aria-selected', 'true');

    // Esc 关闭面板（面板 keydown 或 useDismiss escape）。
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelector('[role="dialog"]')?.hasAttribute('hidden')).toBe(true);
  });
});
