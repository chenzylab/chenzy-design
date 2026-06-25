// Calendar 键盘 e2e（browser project / 真实 chromium）。
// Calendar 月视图网格用真实 roving 焦点（≠ DatePicker 的 aria-activedescendant）：
// 活动格 tabindex=0、其余 -1，方向键命令式把 DOM 焦点移到目标格（跨月翻页落焦）。
// 故断言真实 .toHaveFocus() + 活动格日号变化（先读源码 focusActiveCell/onGridKeydown 确认）。
//   1. 聚焦活动格（初始 = defaultSelectedDate 2024-03-15）。
//   2. ArrowRight/ArrowDown/Home 真实移动焦点到相邻格，活动格日号随之变化。
//   3. PageDown 切到下一月（标题变化），焦点落到新网格的活动格。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import CalendarKbdFixture from './CalendarKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

// 当前活动格（tabindex=0 + --active）的日号文本。
function activeDay(grid: HTMLElement): string {
  const cell = grid.querySelector<HTMLElement>('.cd-calendar__cell--active');
  return cell?.querySelector('.cd-calendar__date')?.textContent?.trim() ?? '';
}

describe('Calendar 键盘 e2e（月网格 roving 真实焦点）', () => {
  it('方向键真实移动焦点到日期格 + Home + PageDown 切月', async () => {
    const { baseElement } = renderKbdFixture(CalendarKbdFixture);

    const grid = baseElement.querySelector('[role="grid"]') as HTMLElement;
    expect(grid).not.toBeNull();
    const title = baseElement.querySelector('.cd-calendar__title') as HTMLElement;
    expect(title.textContent).toContain('March');

    // 初始活动格 = 选中日 2024-03-15。
    expect(activeDay(grid)).toBe('15');
    const activeCell = grid.querySelector('.cd-calendar__cell--active') as HTMLElement;
    activeCell.focus();
    await expect.element(loc(activeCell)).toHaveFocus();

    // 1. ArrowRight → 16，真实焦点跟随到该格（roving）。
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => activeDay(grid)).toBe('16');
    expect(grid.querySelector('.cd-calendar__cell--active')).toBe(document.activeElement);

    // 2. ArrowDown → +7（23）。
    await userEvent.keyboard('{ArrowDown}');
    await expect.poll(() => activeDay(grid)).toBe('23');
    expect(grid.querySelector('.cd-calendar__cell--active')).toBe(document.activeElement);

    // 3. Home → 本周首日（3/23 是周六，周日起 → 3/17）。
    await userEvent.keyboard('{Home}');
    await expect.poll(() => activeDay(grid)).toBe('17');

    // 4. PageDown → 切到下一月（4 月），标题变化，焦点落到新网格活动格。
    await userEvent.keyboard('{PageDown}');
    await expect.poll(() => title.textContent).toContain('April');
    // 切月后 DOM 焦点仍落在活动格（4/17）。
    await expect.poll(() => activeDay(grid)).toBe('17');
    expect(grid.querySelector('.cd-calendar__cell--active')).toBe(document.activeElement);
  });
});
