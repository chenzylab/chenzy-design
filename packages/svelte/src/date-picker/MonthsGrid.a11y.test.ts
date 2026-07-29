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

  it('monthText 走 locale 模板：英文「Jul 2026」月在前（对齐 Semi monthText ${month} ${year}）', () => {
    const { container } = renderWithLocale(MonthsGrid, {
      props: { type: 'date', defaultPickerValue: new Date(2026, 6, 1) },
      locale: 'en-US',
    });
    const text = container.querySelector(`.${PREFIX}-navigation-month`)?.textContent?.trim();
    expect(text).toBe('Jul 2026');
  });

  it('monthText 走 locale 模板：中文「2026年 7月」年在前', () => {
    const { container } = renderWithLocale(MonthsGrid, {
      props: { type: 'date', defaultPickerValue: new Date(2026, 6, 1) },
      locale: 'zh-CN',
    });
    const text = container.querySelector(`.${PREFIX}-navigation-month`)?.textContent?.trim();
    expect(text).toBe('2026年 7月');
  });

  it('翻月触发 onPanelChange（对齐 Semi notifyPanelChange）', async () => {
    const onPanelChange = vi.fn();
    const { container } = renderWithLocale(MonthsGrid, {
      props: { type: 'date', defaultPickerValue: new Date(2026, 0, 1), onPanelChange },
    });
    (container.querySelector('button[aria-label="Next month"]') as HTMLElement).click();
    await tick();
    expect(onPanelChange).toHaveBeenCalledTimes(1);
    // 抛出的是新面板游标日期（2026-02）。
    const arg = onPanelChange.mock.calls[0]![0] as Date;
    expect(arg.getMonth()).toBe(1); // 0-based：2 月
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

  it('dateTime：点 Switch 时间段 → tpk 层显示 Combobox 时间列', async () => {
    const { container } = renderWithLocale(MonthsGrid, {
      props: { type: 'dateTime', defaultPickerValue: new Date(2026, 0, 1, 10, 30) },
    });
    // 初始日期视图，无 tpk。
    expect(container.querySelector(`.${PREFIX}-tpk`)).toBeNull();
    // 点 Switch 时间段。
    (container.querySelector(`.${PREFIX}-switch-time`) as HTMLElement).click();
    await tick();
    // tpk 层 + Combobox 时间列出现。
    expect(container.querySelector(`.${PREFIX}-tpk`)).not.toBeNull();
    expect(container.querySelector('.cd-datepicker-tpk-col-list-hour')).not.toBeNull();
  });

  it('dateTime：disabledTime → tpk 时间列小时禁用（calcDisabledTime 接线）', async () => {
    const { container } = renderWithLocale(MonthsGrid, {
      props: {
        type: 'dateTime',
        defaultPickerValue: new Date(2026, 0, 1, 10, 0),
        disabledTime: () => ({ disabledHours: () => [0, 1, 2] }),
      },
    });
    (container.querySelector(`.${PREFIX}-switch-time`) as HTMLElement).click();
    await tick();
    const hourList = container.querySelector('.cd-datepicker-tpk-col-list-hour')!;
    const disabled = hourList.querySelectorAll('li.cd-scrolllist-item-disabled');
    expect(disabled.length).toBeGreaterThanOrEqual(3);
  });

  it('dateTime：时间列选小时触发 onSelectedChange（合并日期+新时间）', async () => {
    const onSelectedChange = vi.fn();
    const { container } = renderWithLocale(MonthsGrid, {
      props: {
        type: 'dateTime',
        defaultPickerValue: new Date(2026, 0, 15, 10, 30, 0),
        onSelectedChange,
      },
    });
    (container.querySelector(`.${PREFIX}-switch-time`) as HTMLElement).click();
    await tick();
    const hourList = container.querySelector('.cd-datepicker-tpk-col-list-hour')!;
    (hourList.querySelectorAll('li[role="option"]')[8] as HTMLElement).click();
    await tick();
    expect(onSelectedChange).toHaveBeenCalled();
    const dates = onSelectedChange.mock.calls[onSelectedChange.mock.calls.length - 1]![0] as Date[];
    expect(dates[0]!.getHours()).toBe(8);
  });

  it('dateRange：双面板并排（left+right），两个 Navigation + 两个 Month grid', () => {
    const { container } = renderWithLocale(MonthsGrid, {
      props: { type: 'dateRange', defaultPickerValue: new Date(2026, 0, 1) },
    });
    expect(container.querySelector(`.${PREFIX}-month-grid-left`)).not.toBeNull();
    expect(container.querySelector(`.${PREFIX}-month-grid-right`)).not.toBeNull();
    expect(container.querySelectorAll(`.${PREFIX}-navigation`).length).toBe(2);
    expect(container.querySelectorAll(`.${PREFIX}-month[role="grid"]`).length).toBe(2);
  });

  it('dateRange：双面板 WEEKS 高度对齐到较多行（maxWeekNum）', () => {
    // 2026-02（5 行）+ 2026-03（右=左+1=03，6 行）→ 两面板 WEEKS 高度应相等（对齐到 6 行）。
    const { container } = renderWithLocale(MonthsGrid, {
      props: { type: 'dateRange', defaultPickerValue: new Date(2026, 1, 1) },
    });
    const weeks = container.querySelectorAll(`.${PREFIX}-weeks`);
    expect(weeks.length).toBe(2);
    const h0 = (weeks[0] as HTMLElement).style.height;
    const h1 = (weeks[1] as HTMLElement).style.height;
    expect(h0).toBe(h1);
    expect(h0).not.toBe('');
  });

  it('dateRange：左右面板初始不同月（右=左+1，避免同月）', () => {
    const { container } = renderWithLocale(MonthsGrid, {
      props: { type: 'dateRange', defaultPickerValue: new Date(2026, 0, 1) },
    });
    const navMonths = container.querySelectorAll(`.${PREFIX}-navigation-month`);
    expect(navMonths[0]!.textContent).not.toBe(navMonths[1]!.textContent);
  });

  it('dateRange 点两日期触发 onSelectedChange（首点 start，次点 end）', async () => {
    const onSelectedChange = vi.fn();
    const { container } = renderWithLocale(MonthsGrid, {
      props: { type: 'dateRange', defaultPickerValue: new Date(2026, 0, 1), onSelectedChange },
    });
    // 左面板点 10 号（2026-01）。
    const left = container.querySelector(`.${PREFIX}-month-grid-left`)!;
    (left.querySelector('[aria-label="2026-01-10"]') as HTMLElement).click();
    await tick();
    (left.querySelector('[aria-label="2026-01-20"]') as HTMLElement).click();
    await tick();
    expect(onSelectedChange).toHaveBeenCalled();
  });
});
