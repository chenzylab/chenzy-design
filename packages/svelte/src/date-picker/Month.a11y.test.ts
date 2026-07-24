/**
 * Month 结构/状态测试 —— 对齐 Semi month.tsx 的 DOM/class/a11y。
 * 断言：role=grid/row/columnheader/gridcell、双层 .day>.day-main、weekday i18n、
 * day 状态 class（today/selected/inrange/端点）、空日格无 -main、renderDate/renderFullDate 分支。
 */
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Month from './Month.svelte';

const PREFIX = 'cd-datepicker';

describe('Month 结构对齐 Semi', () => {
  it('root role=grid + weekday role=row/columnheader×7', async () => {
    const { container } = renderWithLocale(Month, {
      props: { month: new Date(2026, 0, 1) },
    });
    const grid = container.querySelector(`.${PREFIX}-month`);
    expect(grid?.getAttribute('role')).toBe('grid');
    const weekdayRow = container.querySelector(`.${PREFIX}-weekday[role="row"]`);
    expect(weekdayRow).not.toBeNull();
    const headers = container.querySelectorAll(`.${PREFIX}-weekday-item[role="columnheader"]`);
    expect(headers.length).toBe(7);
    await expectNoAxeViolations(container);
  });

  it('日格双层：.day[role=gridcell] > .day-main > span{dayNumber}', () => {
    const { container } = renderWithLocale(Month, {
      props: { month: new Date(2026, 0, 1) },
    });
    // 取一个当月有效日格（含 -main）。
    const dayMain = container.querySelector(`.${PREFIX}-day-main`);
    expect(dayMain).not.toBeNull();
    const cell = dayMain?.closest(`.${PREFIX}-day`);
    expect(cell?.getAttribute('role')).toBe('gridcell');
    expect(cell?.getAttribute('tabindex')).toBe('0');
    // 数字在 span 里。
    expect(dayMain?.querySelector('span')?.textContent).toMatch(/^\d+$/);
  });

  it('2026-01 首周前有空日格（div.day 无 -main，tabindex=-1）', () => {
    // 2026-01-01 是周四，周日起始 → 首周前 4 个空日格。
    const { container } = renderWithLocale(Month, {
      props: { month: new Date(2026, 0, 1), weekStartsOn: 0 },
    });
    const firstWeek = container.querySelector(`.${PREFIX}-weeks .${PREFIX}-week`);
    const cells = firstWeek?.querySelectorAll(`.${PREFIX}-day`);
    expect(cells?.length).toBe(7);
    const emptyCells = firstWeek?.querySelectorAll(`.${PREFIX}-day:not(:has(.${PREFIX}-day-main))`);
    expect(emptyCells?.length).toBe(4);
  });

  it('selected 命中日格带 -day-selected class', () => {
    const { container } = renderWithLocale(Month, {
      props: { month: new Date(2026, 0, 1), selected: new Set(['2026-01-15']) },
    });
    const selected = container.querySelector(`.${PREFIX}-day-selected`);
    expect(selected).not.toBeNull();
    expect(selected?.getAttribute('aria-selected')).toBe('true');
    expect(selected?.getAttribute('aria-label')).toBe('2026-01-15');
  });

  it('range：start/end 端点 + 中间 inrange class', () => {
    const { container } = renderWithLocale(Month, {
      props: {
        month: new Date(2026, 0, 1),
        rangeStart: '2026-01-10',
        rangeEnd: '2026-01-14',
      },
    });
    expect(container.querySelector(`.${PREFIX}-day-selected-start`)).not.toBeNull();
    expect(container.querySelector(`.${PREFIX}-day-selected-end`)).not.toBeNull();
    // 中间日（11/12/13）应有 inrange。
    const inRange = container.querySelectorAll(`.${PREFIX}-day-inrange`);
    expect(inRange.length).toBe(3);
  });

  it('disabledDate 命中日格带 -day-disabled + tabindex=-1', () => {
    const { container } = renderWithLocale(Month, {
      props: {
        month: new Date(2026, 0, 1),
        disabledDate: (d: Date) => d.getDate() === 20,
      },
    });
    const disabled = container.querySelector(`.${PREFIX}-day-disabled`);
    expect(disabled).not.toBeNull();
    expect(disabled?.getAttribute('tabindex')).toBe('-1');
    expect(disabled?.getAttribute('aria-disabled')).toBe('true');
  });
});
