// Calendar a11y：month 模式渲染 role=grid + role=row + columnheader + gridcell；
// 工具栏 prev/next 按钮 locale 可访问名；popup 模式 trigger aria-haspopup/aria-expanded。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Calendar from './Calendar.svelte';

const FIXED = new Date(2024, 5, 15); // 固定锚点，避免随当天漂移。

describe('Calendar a11y', () => {
  it('month 模式：role=grid + columnheader + gridcell，prev/next locale 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(Calendar, {
      props: { mode: 'month', defaultValue: FIXED, ariaLabel: 'Event calendar' },
    });
    const grid = container.querySelector('[role="grid"]');
    expect(grid).not.toBeNull();
    expect(grid?.getAttribute('aria-label')).toBeTruthy();
    expect(container.querySelectorAll('[role="row"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[role="columnheader"]').length).toBe(7);
    expect(container.querySelectorAll('[role="gridcell"]').length).toBeGreaterThan(0);

    // 工具栏 prev/next 按钮可访问名来自 en_US locale（两按钮共用 .cd-calendar__nav）。
    const navs = container.querySelectorAll('.cd-calendar__nav');
    expect(navs.length).toBe(2);
    const prevLabel = navs[0]?.getAttribute('aria-label');
    const nextLabel = navs[1]?.getAttribute('aria-label');
    expect(prevLabel).toBeTruthy();
    expect(prevLabel).not.toBe('Calendar.prev');
    expect(nextLabel).toBeTruthy();
    expect(nextLabel).not.toBe('Calendar.next');
    await expectNoAxeViolations(container);
  });

  it('选中态：gridcell aria-selected，无 axe violations', async () => {
    const { container } = renderWithLocale(Calendar, {
      props: { mode: 'month', defaultValue: FIXED, defaultSelectedDate: FIXED, ariaLabel: 'Calendar' },
    });
    const selected = container.querySelector('[role="gridcell"][aria-selected="true"]');
    expect(selected).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('popup 模式：trigger 按钮 aria-haspopup=dialog / aria-expanded=false，无 axe violations', async () => {
    const { container } = renderWithLocale(Calendar, {
      props: { mode: 'month', defaultValue: FIXED, popup: true, ariaLabel: 'Date picker calendar' },
    });
    const trigger = container.querySelector('[aria-haspopup="dialog"]');
    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    await expectNoAxeViolations(container);
  });
});
