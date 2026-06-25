// TimePicker 键盘 e2e（browser project / 真实 chromium）。
// 时间列用真实焦点 roving（APG listbox）：每列单一 Tab 停靠点（选中项 tabindex=0，
// 其余 -1），列内 ↑↓ 命令式移动 DOM 焦点（循环）、Home/End 跳首末，列间用 Tab。
// 故断言真实 .toHaveFocus()（先读源码 onColKeydown 确认是命令式 focus，非 activedescendant）。
//   1. 打开后焦点落进小时列选中项（value=08:30:45 → 小时 08）。
//   2. 列内 ↓↑ 移动焦点（相邻项），Home/End 跳首末项。
//   3. Tab 进入下一列（分钟列）的停靠点（选中项 30）。
//   4. Esc 关闭面板。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import TimePickerKbdFixture from './TimePickerKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('TimePicker 键盘 e2e（列内 roving 真实焦点）', () => {
  it('小时列 ↓↑ + Home/End 移动焦点；Tab 进分钟列；Esc 关闭', async () => {
    const { baseElement } = renderKbdFixture(TimePickerKbdFixture);

    const trigger = baseElement.querySelector('[data-testid="before"]') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    await userEvent.click(trigger);

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    const cols = Array.from(dialog.querySelectorAll<HTMLElement>('[role="listbox"]'));
    expect(cols.length).toBe(3); // 时/分/秒
    const [hourCol, minuteCol] = cols as [HTMLElement, HTMLElement, HTMLElement];

    const hourOptions = Array.from(hourCol.querySelectorAll<HTMLElement>('[role="option"]'));
    // value=08:30:45 → 小时列选中项 08（文本 '08'）。
    const hour08 = hourOptions.find((el) => el.textContent?.trim() === '08')!;
    const hour09 = hourOptions.find((el) => el.textContent?.trim() === '09')!;
    const hour07 = hourOptions.find((el) => el.textContent?.trim() === '07')!;

    // 1. 打开后焦点落进小时列选中项（08）。
    await expect.element(loc(hour08)).toHaveFocus();
    expect(hour08.tabIndex).toBe(0);

    // 2a. ↓ → 下一项（09），真实焦点跟随、停靠点收敛。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(hour09)).toHaveFocus();
    expect(hour09.tabIndex).toBe(0);
    expect(hour08.tabIndex).toBe(-1);

    // 2b. ↑↑ → 回到 08 再到 07。
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(hour08)).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(hour07)).toHaveFocus();

    // 2c. Home/End → 列首（00）/列末（23）。
    await userEvent.keyboard('{Home}');
    await expect.element(loc(hourOptions[0]!)).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect.element(loc(hourOptions[hourOptions.length - 1]!)).toHaveFocus();

    // 3. Tab → 进入分钟列的停靠点（选中项 30）。
    const minuteOptions = Array.from(minuteCol.querySelectorAll<HTMLElement>('[role="option"]'));
    const minute30 = minuteOptions.find((el) => el.textContent?.trim() === '30')!;
    await userEvent.tab();
    await expect.element(loc(minute30)).toHaveFocus();

    // 4. Esc 关闭面板（useDismiss escape）。
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
  });
});
