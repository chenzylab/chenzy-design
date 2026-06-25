// RangePicker 键盘 e2e（browser project / 真实 chromium）。
// 双面板（左=cursor 月、右=cursor+1 月），同 DatePicker 用 aria-activedescendant 模型：
// 焦点停在高亮所在面板的 role=grid 容器，方向键改变该容器的 aria-activedescendant；
// 高亮跨面板时 activedescendant 在两个网格间切换（先读源码 leftActiveId/rightActiveId 确认）。
//   1. 打开后焦点落在左网格，aria-activedescendant 指向起始高亮（defaultValue[0]=2024-03-10）。
//   2. 方向键移动高亮（aria-activedescendant 变化）。
//   3. 键盘选区：两次 Enter 选起止，onChange 拿到提交的 [start, end]，面板关闭归还 trigger。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import RangePickerKbdFixture from './RangePickerKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

// 任一网格的 aria-activedescendant 后缀（-YYYY-M-D）；高亮不在该面板时返回 ''。
function activeSuffix(grid: HTMLElement): string {
  const id = grid.getAttribute('aria-activedescendant');
  if (!id) return '';
  return id.split('-').slice(-3).join('-');
}

describe('RangePicker 键盘 e2e（双面板网格 + 范围选择）', () => {
  it('左网格方向键移动 aria-activedescendant；两次 Enter 提交区间并归还 trigger', async () => {
    const changes: Array<[Date | null, Date | null] | null> = [];
    const { baseElement } = renderKbdFixture(RangePickerKbdFixture, {
      onChange: (v: [Date | null, Date | null] | null) => changes.push(v),
    });

    const trigger = baseElement.querySelector('[data-testid="before"]') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    await userEvent.click(trigger);

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    const grids = Array.from(dialog.querySelectorAll<HTMLElement>('[role="grid"]'));
    expect(grids.length).toBe(2);
    const [leftGrid] = grids as [HTMLElement, HTMLElement];

    // 1. 焦点落在左网格（起始高亮 defaultValue[0]=2024-03-10 在左面板）。
    await expect.element(loc(leftGrid)).toHaveFocus();
    expect(activeSuffix(leftGrid)).toBe('2024-2-10');

    // 2. ArrowRight → 11，ArrowDown → +7（18）。activedescendant 随之变化。
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => activeSuffix(leftGrid)).toBe('2024-2-11');
    await userEvent.keyboard('{ArrowDown}');
    await expect.poll(() => activeSuffix(leftGrid)).toBe('2024-2-18');

    // 3. 键盘选区：Enter 定起点（3/18）；再 ArrowRight 到 3/19；Enter 定终点提交。
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => activeSuffix(leftGrid)).toBe('2024-2-19');
    await userEvent.keyboard('{Enter}');

    // onChange 收到提交的区间 [2024-03-18, 2024-03-19]（排序后），面板关闭。
    await expect.poll(() => changes.length).toBeGreaterThan(0);
    const last = changes[changes.length - 1];
    expect(last).not.toBeNull();
    const [start, end] = last as [Date, Date];
    expect(start.getMonth()).toBe(2);
    expect(start.getDate()).toBe(18);
    expect(end.getDate()).toBe(19);

    // 提交后面板关闭，焦点归还 trigger（focus trap returnFocus）。
    await expect.element(loc(trigger)).toHaveFocus();
  });
});
