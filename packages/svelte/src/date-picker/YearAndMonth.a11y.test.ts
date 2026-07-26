/**
 * YearAndMonth 测试 —— 对齐 Semi yearAndMonth.tsx（完整含 monthRange 双面板 + autoSelect）。
 * 断言：header 返回按钮、year/month 两列 listbox、选中 index、选年/月回调、monthRange 双面板、
 * disabledDate 禁用月、noBackBtn。
 */
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import YearAndMonth from './YearAndMonth.svelte';

const PREFIX = 'cd-datepicker';
const cy = { left: 2026, right: 2026 };
const cm = { left: 3, right: 4 };

describe('YearAndMonth 对齐 Semi', () => {
  it('header 返回按钮 + year/month 两列 listbox（单面板 month），无 axe violations', async () => {
    const { container } = renderWithLocale(YearAndMonth, {
      props: { type: 'month', currentYear: cy, currentMonth: cm },
    });
    const header = container.querySelector(`.${PREFIX}-yearmonth-header`);
    expect(header).not.toBeNull();
    expect(header?.querySelector('button')).not.toBeNull();
    const lists = container.querySelectorAll('ul[role="listbox"]');
    expect(lists.length).toBe(2); // year + month
    await expectNoAxeViolations(container);
  });

  it('返回按钮点击触发 onBackToMain', () => {
    const onBackToMain = vi.fn();
    const { container } = renderWithLocale(YearAndMonth, {
      props: { type: 'month', currentYear: cy, currentMonth: cm, onBackToMain },
    });
    (container.querySelector(`.${PREFIX}-yearmonth-header button`) as HTMLElement).click();
    expect(onBackToMain).toHaveBeenCalledTimes(1);
  });

  it('noBackBtn=true 时无 header', () => {
    const { container } = renderWithLocale(YearAndMonth, {
      props: { type: 'month', currentYear: cy, currentMonth: cm, noBackBtn: true },
    });
    expect(container.querySelector(`.${PREFIX}-yearmonth-header`)).toBeNull();
  });

  it('点击某月触发 onSelect（currentMonth 更新）', () => {
    const onSelect = vi.fn();
    const { container } = renderWithLocale(YearAndMonth, {
      props: { type: 'month', currentYear: cy, currentMonth: cm, onSelect },
    });
    // 第二个 listbox 是 month 列；点第 6 个 option（6月）。
    const monthList = container.querySelectorAll('ul[role="listbox"]')[1]!;
    const options = monthList.querySelectorAll('li[role="option"]');
    (options[5] as HTMLElement).click();
    expect(onSelect).toHaveBeenCalled();
    const lastCall = onSelect.mock.calls[onSelect.mock.calls.length - 1]![0];
    expect(lastCall.currentMonth.left).toBe(6);
  });

  it('monthRange 双面板：body 内两个 panel', () => {
    const { container } = renderWithLocale(YearAndMonth, {
      props: { type: 'monthRange', currentYear: cy, currentMonth: cm },
    });
    const body = container.querySelector(`.${PREFIX}-yearmonth-body`);
    expect(body).not.toBeNull();
    const panels = body!.querySelectorAll(`.${PREFIX}-yearmonth-panel`);
    expect(panels.length).toBe(2);
    // 每 panel 两列 → 共 4 listbox。
    expect(container.querySelectorAll('ul[role="listbox"]').length).toBe(4);
  });

  it('disabledDate 禁用整年（12 月全禁）→ 该年 option 禁用', () => {
    const { container } = renderWithLocale(YearAndMonth, {
      props: {
        type: 'month',
        currentYear: cy,
        currentMonth: cm,
        // 禁用 2025 全年。
        disabledDate: (d: Date) => d.getFullYear() === 2025,
      },
    });
    const yearList = container.querySelectorAll('ul[role="listbox"]')[0]!;
    const disabledOptions = yearList.querySelectorAll('li.cd-scrolllist-item-disabled');
    expect(disabledOptions.length).toBeGreaterThan(0);
  });
});
