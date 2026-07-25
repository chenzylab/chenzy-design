/**
 * MonthsGrid 装配测试 —— 对齐 Semi monthsGrid.tsx（单面板 date/dateTime）。
 * Navigation+Month 渲染、点日期选中、翻月更新、点月标题进 yam、dateTime 有 Switch。
 */
import { describe, it, expect, vi } from 'vitest';
import { tick } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import MonthsGrid from './MonthsGrid.svelte';

const PREFIX = 'cd-datepicker';

describe('MonthsGrid 装配对齐 Semi（单面板）', () => {
  it('date：Navigation + Month grid 渲染，无 axe violations', async () => {
    const { container } = renderWithLocale(MonthsGrid, {
      props: { type: 'date', defaultPickerValue: new Date(2026, 0, 1) },
    });
    expect(container.querySelector(`.${PREFIX}-navigation`)).not.toBeNull();
    expect(container.querySelector(`.${PREFIX}-month[role="grid"]`)).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('点日期触发 onSelectedChange', async () => {
    const onSelectedChange = vi.fn();
    const { container } = renderWithLocale(MonthsGrid, {
      props: { type: 'date', defaultPickerValue: new Date(2026, 0, 1), onSelectedChange },
    });
    const cell = container.querySelector('[aria-label="2026-01-15"]') as HTMLElement;
    expect(cell).not.toBeNull();
    cell.click();
    await tick();
    expect(onSelectedChange).toHaveBeenCalledTimes(1);
    expect((onSelectedChange.mock.calls[0]![0] as Date[])[0]!.getDate()).toBe(15);
  });

  it('翻月：nextMonth 后 Navigation monthText 更新', async () => {
    const { container } = renderWithLocale(MonthsGrid, {
      props: { type: 'date', defaultPickerValue: new Date(2026, 0, 1) },
    });
    const before = container.querySelector(`.${PREFIX}-navigation-month`)?.textContent;
    (container.querySelector('button[aria-label="Next month"]') as HTMLElement).click();
    await tick();
    const after = container.querySelector(`.${PREFIX}-navigation-month`)?.textContent;
    expect(after).not.toBe(before);
  });

  it('点月份标题进入年月滚轮（yam 叠加层）', async () => {
    const { container } = renderWithLocale(MonthsGrid, {
      props: { type: 'date', defaultPickerValue: new Date(2026, 0, 1) },
    });
    // 点 Navigation 中间月份 Button。
    const monthBtn = container.querySelector(`.${PREFIX}-navigation-month button`) as HTMLElement;
    monthBtn.click();
    await tick();
    expect(container.querySelector(`.${PREFIX}-yam`)).not.toBeNull();
    // 年月列表出现。
    expect(container.querySelectorAll('ul[role="listbox"]').length).toBe(2);
  });

  it('dateTime：渲染 Switch（日期/时间切换）', () => {
    const { container } = renderWithLocale(MonthsGrid, {
      props: { type: 'dateTime', defaultPickerValue: new Date(2026, 0, 1) },
    });
    expect(container.querySelector(`.${PREFIX}-switch`)).not.toBeNull();
  });
});
