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

  // 回归：对齐 Semi renderTime——`list.splice(0, 1, '')` 在 formatTime 之后执行，
  // 故第 0 项恒为空串，renderTimeDisplay 也被覆盖（反例：自定义分支先于判空则渲染出 "T0"）。
  it('renderTimeDisplay：第 0 项恒为空串，其余走自定义（对齐 Semi splice 覆盖）', () => {
    const { container } = renderWithLocale(Calendar, {
      props: { displayValue: FIXED, renderTimeDisplay: (h: number) => `T${h}` },
    });
    const items = container.querySelectorAll('.cd-calendar-time-item span');
    expect(items.length).toBeGreaterThan(1);
    expect(items[0]?.textContent).toBe('');
    expect(items[1]?.textContent).toBe('T1');
  });

  // 回归：对齐 Semi renderAllDayEvents——回传 props.events 全量事件（非解析后的全天桶），
  // 故只含定时事件时自定义渲染仍能拿到它（反例：传 allDayBucket 会得到空数组）。
  it('allDayEventsRender：回传全量 events（对齐 Semi props.events）', () => {
    const seen: unknown[][] = [];
    renderWithLocale(Calendar, {
      props: {
        displayValue: FIXED,
        // 纯定时事件：不会进全天桶，只有传全量 events 才拿得到。
        events: [{ key: 'timed', start: new Date(2024, 5, 15, 9, 0), end: new Date(2024, 5, 15, 10, 0) }],
        allDayEventsRender: (events: unknown[]) => {
          seen.push(events);
          return null;
        },
      },
    });
    expect(seen.length).toBeGreaterThan(0);
    expect(seen[0]?.length).toBe(1);
  });

  // 回归：对齐 Semi className/style 两个通用 prop（本库原缺）。Semi 是 `{ height, width, ...style }`，
  // 用户 style 排在后面故可覆盖 height/width。
  it('class / style 落根节点，且 style 可覆盖 height（对齐 Semi 合并顺序）', () => {
    const { container } = renderWithLocale(Calendar, {
      props: { mode: 'month', displayValue: FIXED, class: 'my-cal', style: 'height: 123px; margin-top: 20px;' },
    });
    const root = container.querySelector('.cd-calendar-month') as HTMLElement | null;
    expect(root?.classList.contains('my-cal')).toBe(true);
    expect(root?.style.marginTop).toBe('20px');
    // height 默认 600，用户 style 排后面故最终生效的是 123px。
    expect(root?.style.height).toBe('123px');
  });

  // 回归：week 视图根节点的列数自定义属性不能被 style 合并挤掉。
  it('week 视图：--cd-calendar-col-count 与用户 style 并存', () => {
    const { container } = renderWithLocale(Calendar, {
      props: { displayValue: FIXED, style: 'margin-top: 20px;' },
    });
    const root = container.querySelector('.cd-calendar-week') as HTMLElement | null;
    expect(root?.style.getPropertyValue('--cd-calendar-col-count')).toBe('7');
    expect(root?.style.marginTop).toBe('20px');
    expect(root?.style.height).toBe('600px');
  });

  // 回归：对齐 Semi renderAllDay 的 `style = allDayEventsRender ? null : { height }`——
  // 自定义全天区不锁高（反例：仍写 `${rows}em` 会限制自定义内容高度）。
  it('allDayEventsRender：自定义全天区不设 height（对齐 Semi style=null）', () => {
    const { container } = renderWithLocale(Calendar, {
      props: { displayValue: FIXED, allDayEventsRender: () => null },
    });
    const allDay = container.querySelector('.cd-calendar-all-day') as HTMLElement | null;
    expect(allDay).not.toBeNull();
    expect(allDay?.style.height).toBe('');
  });
});
