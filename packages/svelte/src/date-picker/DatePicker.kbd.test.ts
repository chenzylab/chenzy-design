// DatePicker 键盘 e2e（browser project / 真实 chromium）。
// DatePicker 日历用 WAI-ARIA grid 的 aria-activedescendant 模型：焦点停在
// role=grid 容器（tabindex=0），方向键不移动真实 DOM 焦点，而是改变容器的
// aria-activedescendant 指向当前高亮日期格的 id。故断言 activedescendant 变化，
// 而非真实 .toHaveFocus()（这点先读源码 onGridKeydown + activeCellId 确认）。
//   1. 打开后焦点落在 grid 容器，aria-activedescendant 指向初始高亮（value=2024-03-15）。
//   2. ArrowRight/ArrowDown/Home/PageUp 改变 aria-activedescendant 指向的日期格。
//   3. Esc 关闭面板，焦点归还 trigger。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import DatePickerKbdFixture from './DatePickerKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

// 读取 grid 容器当前 aria-activedescendant 指向的日期格的 id 后缀（-YYYY-M-D）。
function activeSuffix(grid: HTMLElement): string {
  const id = grid.getAttribute('aria-activedescendant') ?? '';
  // id 形如 cd-date-picker-grid-x-2024-2-15；取末三段（年-月-日）。
  const parts = id.split('-');
  return parts.slice(-3).join('-');
}

describe('DatePicker 键盘 e2e（网格 aria-activedescendant）', () => {
  it('方向键 + Home + PageUp 改变 aria-activedescendant；Esc 归还 trigger', async () => {
    const { baseElement } = renderKbdFixture(DatePickerKbdFixture);

    const trigger = baseElement.querySelector('[data-testid="before"]') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    await userEvent.click(trigger);

    // 面板 portal 进 root 子树（非 body portal）：查 role=dialog + 日期网格。
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    const grid = dialog.querySelector('[role="grid"]') as HTMLElement;
    expect(grid).not.toBeNull();

    // 1. 焦点落在网格容器（aria-activedescendant 模型：焦点在容器，非单格）。
    await expect.element(loc(grid)).toHaveFocus();
    // 初始高亮对齐 value=2024-03-15。
    expect(activeSuffix(grid)).toBe('2024-2-15');

    // 2a. ArrowRight → 次日（16）。
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => activeSuffix(grid)).toBe('2024-2-16');
    // 真实 DOM 焦点仍在网格容器（未移到具体格）。
    expect(document.activeElement).toBe(grid);

    // 2b. ArrowDown → +1 周（16 → 23）。
    await userEvent.keyboard('{ArrowDown}');
    await expect.poll(() => activeSuffix(grid)).toBe('2024-2-23');

    // 2c. ArrowLeft → 前一日（22）。
    await userEvent.keyboard('{ArrowLeft}');
    await expect.poll(() => activeSuffix(grid)).toBe('2024-2-22');

    // 2d. Home → 本周首日（3/22 是周五，所在周以周日起 → 3/17）。
    await userEvent.keyboard('{Home}');
    await expect.poll(() => activeSuffix(grid)).toBe('2024-2-17');

    // 2e. PageUp → 前一月（2/17）；游标随动翻页，网格仍存在。
    await userEvent.keyboard('{PageUp}');
    await expect.poll(() => activeSuffix(grid)).toBe('2024-1-17');

    // 3. Esc 关闭面板，焦点归还 trigger（focus trap returnFocus）。
    await userEvent.keyboard('{Escape}');
    await expect.element(loc(trigger)).toHaveFocus();
  });
});
