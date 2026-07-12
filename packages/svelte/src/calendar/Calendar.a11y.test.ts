// Calendar a11y（DOM 结构 + role 对齐 Semi Design Calendar）：
// - 根容器 role=grid + aria-label（取标题）。
// - month：7 个 role=columnheader（星期表头）+ 若干 role=gridcell（日格），today 格 aria-current=date。
// - week：columnheader（日期表头）+ gridcell（列内容区）+ 全天区，时间格按钮有 aria-label。
// - 无默认头部导航（仅传入 header 时渲染）。
import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/svelte';
import { renderWithLocale } from '../test-utils/a11y.js';
import Calendar from './Calendar.svelte';
import CalendarCustomFieldFixture from './CalendarCustomFieldFixture.svelte';

// jsdom 无 ResizeObserver（Calendar 用 bind:clientHeight 测滚动区高度以定位事件）。
beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  }
});

const FIXED = new Date(2024, 5, 15); // 固定锚点，避免随当天漂移。

describe('Calendar a11y', () => {
  it('month 模式：role=grid + aria-label + 7 columnheader + gridcell', () => {
    const { container } = renderWithLocale(Calendar, {
      props: { mode: 'month', displayValue: FIXED },
    });
    const grid = container.querySelector('[role="grid"]');
    expect(grid).not.toBeNull();
    expect(grid?.getAttribute('aria-label')).toBeTruthy();
    expect(container.querySelectorAll('[role="columnheader"]').length).toBe(7);
    expect(container.querySelectorAll('[role="gridcell"]').length).toBeGreaterThan(0);
  });

  it('month 模式：today 日格 aria-current=date（用今天的月份锚点）', () => {
    const { container } = renderWithLocale(Calendar, {
      props: { mode: 'month', displayValue: new Date() },
    });
    expect(container.querySelector('[role="gridcell"][aria-current="date"]')).not.toBeNull();
  });

  it('对齐 Semi：不传 header 时无默认头部工具栏（month 无导航按钮）', () => {
    const { container } = renderWithLocale(Calendar, {
      props: { mode: 'month', displayValue: FIXED },
    });
    expect(container.querySelector('button')).toBeNull();
  });

  it('week 模式（默认，对齐 Semi weekCalendar：根/表头无 role）：7 列内容区 gridcell + 半小时格 li', () => {
    const { container } = renderWithLocale(Calendar, {
      props: { displayValue: FIXED },
    });
    // 对齐 Semi：week 根无 role=grid，表头 li 无 role=columnheader（Semi weekCalendar 未加）。
    expect(container.querySelector('.cd-calendar-week[role="grid"]')).toBeNull();
    // 7 列 DayCol 内容区（gridcell，对齐 Semi dayCol grid-content role=gridcell）。
    expect(container.querySelectorAll('.cd-calendar-grid-content[role="gridcell"]').length).toBe(7);
    // 半小时格可点击 li（对齐 Semi DayCol skeleton li：空 li onClick，role=button + 可访问名）。
    const slot = container.querySelector('.cd-calendar-grid-skeleton-row-line[role="button"]');
    expect(slot?.getAttribute('aria-label')).toBeTruthy();
  });

  // 回归：event.children 渲染须穿透到跨天全天条（走 span 布局）。
  it('event.children 渲染穿透到跨天全天条（走 span 布局）', () => {
    const { container } = render(CalendarCustomFieldFixture);
    const text = container.textContent ?? '';
    expect(text).toContain('CUSTOM_SPAN_LABEL');
  });
});
