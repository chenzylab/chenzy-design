// Table 键盘 e2e（browser project / 真实 chromium），交互态 grid 2D 方向键漫游。
// 交互态（列带 sorter）下 Table 升级为 WAI-ARIA Grid Pattern，单元格走 REAL focus
// roving（cell.focus() + tabindex 0/-1），jsdom 测不了真实焦点移动：
//   1. roving 单停靠点：Tab 进入 grid 只停在一个单元格（首个 columnheader，其余 -1）。
//   2. ↑↓ 真实移动焦点到上/下一行单元格；←→ 移动到左/右一列单元格。
//   3. Home/End 跳到行内首/末列。
//
// 真实焦点断言用 page locator 的 .toHaveFocus()（对真实 document.activeElement 重试断言）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import TableKbdFixture from './TableKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Table 键盘 e2e（grid 2D roving）', () => {
  it('Tab 单停靠点 + ↑↓ 移行 + ←→ 移列 + Home/End 行内首末', async () => {
    const { baseElement } = renderKbdFixture(TableKbdFixture);

    const grid = baseElement.querySelector('[role="grid"]') as HTMLElement;
    expect(grid).not.toBeNull();

    // 列头（columnheader）与数据单元格（gridcell）。
    const headers = Array.from(
      grid.querySelectorAll<HTMLElement>('[role="columnheader"]'),
    );
    expect(headers.length).toBe(2);
    const [nameHeader, ageHeader] = headers as [HTMLElement, HTMLElement];

    // 全部漫游单元格（header columnheader + body rowheader/gridcell）。
    // 交互态首列单元格为 role=rowheader（!hasSelection && !hasExpand），其余 gridcell。
    const allCells = Array.from(
      grid.querySelectorAll<HTMLElement>(
        '[role="columnheader"],[role="rowheader"],[role="gridcell"]',
      ),
    );
    // 1. roving 单停靠点：恰有一个单元格 tabindex=0，其余 -1。
    const stops = allCells.filter((el) => el.tabIndex === 0);
    expect(stops.length).toBe(1);
    // 默认停靠点为首个列头（row=-1,col=0）。
    expect(nameHeader.tabIndex).toBe(0);
    expect(ageHeader.tabIndex).toBe(-1);

    // 从 before 按钮 Tab，焦点应落到唯一停靠点（首个 columnheader），不逐格进入。
    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(nameHeader)).toHaveFocus();
    expect(nameHeader.tabIndex).toBe(0);

    // 2a. ←→ 移列：→ 移到 Age 列头（同一行 header 行）。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(ageHeader)).toHaveFocus();
    expect(ageHeader.tabIndex).toBe(0);
    expect(nameHeader.tabIndex).toBe(-1);
    // ← 回到 Name 列头。
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(loc(nameHeader)).toHaveFocus();

    // 2b. ↓ 移行：从 Name 列头进入首数据行首列单元格（row=0,col=0）。
    // 首列单元格 role=rowheader（交互态、无 selection/expand），按 aria-colindex 取。
    const bodyRows = Array.from(grid.querySelectorAll<HTMLElement>('tbody [role="row"]'));
    expect(bodyRows.length).toBe(3);
    const cellAt = (row: number, colindex: number) =>
      bodyRows[row]!.querySelector<HTMLElement>(`[aria-colindex="${colindex}"]`)!;

    await userEvent.keyboard('{ArrowDown}');
    const row0Name = cellAt(0, 1);
    await expect.element(loc(row0Name)).toHaveFocus();
    expect(row0Name.textContent).toContain('Alice');

    // 再 ↓ 到第二数据行首列单元格（row=1,col=0）。
    await userEvent.keyboard('{ArrowDown}');
    const row1Name = cellAt(1, 1);
    await expect.element(loc(row1Name)).toHaveFocus();
    expect(row1Name.textContent).toContain('Bob');

    // ↑ 回到 row0 首列单元格。
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(row0Name)).toHaveFocus();

    // 3. End 跳到行内末列（Age 单元格 row=0,col=1）；Home 回到行内首列。
    await userEvent.keyboard('{End}');
    const row0Age = cellAt(0, 2);
    await expect.element(loc(row0Age)).toHaveFocus();
    expect(row0Age.textContent).toContain('30');

    await userEvent.keyboard('{Home}');
    await expect.element(loc(row0Name)).toHaveFocus();
  });
});
