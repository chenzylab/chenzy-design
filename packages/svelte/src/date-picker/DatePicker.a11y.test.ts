// DatePicker a11y：触发器（button，默认非 editable）+ role=dialog 面板 + role=grid 日历。
// 只断言静态 ARIA + axe 0 violations，不测真实键盘/焦点（jsdom 限制）。
// 打开态面板 portal 到 document.body，故扫描 document.body。
import { describe, it, expect, vi } from 'vitest';
import { tick } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import DatePicker from './DatePicker.svelte';

describe('DatePicker a11y', () => {
  it('关闭态：触发器 aria-haspopup=dialog / aria-expanded=false，无 axe violations', async () => {
    const { container } = renderWithLocale(DatePicker, {
      props: { ariaLabel: 'Start date' },
    });
    const trigger = container.querySelector('.cd-date-picker__trigger');
    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(trigger?.getAttribute('aria-label')).toBe('Start date');
    await expectNoAxeViolations(container);
  });

  it('打开态：role=dialog 面板 + role=grid 日历（portal 到 body），无 axe violations', async () => {
    renderWithLocale(DatePicker, {
      props: { defaultOpen: true, ariaLabel: 'Start date' },
    });
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-label')).toBeTruthy();
    const grid = document.querySelector('[role="grid"]');
    expect(grid).not.toBeNull();
    const cells = document.querySelectorAll('[role="gridcell"]');
    expect(cells.length).toBeGreaterThan(0);
    await expectNoAxeViolations(document.body);
  });

  it('打开态：触发器 aria-expanded=true + columnheader 表头存在', async () => {
    renderWithLocale(DatePicker, {
      props: { defaultOpen: true, ariaLabel: 'Start date' },
    });
    const trigger = document.querySelector('.cd-date-picker__trigger');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    const headers = document.querySelectorAll('[role="columnheader"]');
    expect(headers.length).toBe(7);
    await expectNoAxeViolations(document.body);
  });
});

// 对齐 Semi 时补全的能力（在 dom project / jsdom + svelte 编译下断言 DOM/回调）。
describe('DatePicker 对齐 Semi 补全能力', () => {
  it('disabledDate 收到第二参 options（单选场景字段为空）', () => {
    const spy = vi.fn<(d: Date, o: Record<string, unknown>) => boolean>(() => false);
    renderWithLocale(DatePicker, { props: { defaultOpen: true, disabledDate: spy } });
    expect(spy).toHaveBeenCalled();
    const options = spy.mock.calls[0]?.[1];
    expect(options).toMatchObject({ rangeStart: '', rangeEnd: '', rangeInputFocus: expect.anything() });
  });

  it('range 场景 disabledDate 第二参含 rangeStart/rangeEnd/rangeInputFocus', () => {
    const spy = vi.fn<(d: Date, o: Record<string, unknown>) => boolean>(() => false);
    renderWithLocale(DatePicker, {
      props: { type: 'dateRange', defaultOpen: true, disabledDate: spy },
    });
    const options = spy.mock.calls.at(-1)?.[1];
    expect(options).toHaveProperty('rangeStart');
    expect(options).toHaveProperty('rangeEnd');
    expect(options).toHaveProperty('rangeInputFocus');
  });

  it('range 场景 disabledTime 第二参 panelType 传 left/right', () => {
    const spy = vi.fn<(d: Date, panelType?: string) => Record<string, unknown>>(() => ({}));
    renderWithLocale(DatePicker, {
      props: { type: 'dateTimeRange', defaultOpen: true, disabledTime: spy },
    });
    expect(spy).toHaveBeenCalled();
    const panelTypes = spy.mock.calls.map((c) => c[1]);
    expect(panelTypes).toContain('left');
    expect(panelTypes).toContain('right');
  });

  it('dateTime 面板默认日期视图（不渲染时间列），点时间切换按钮后才显示', async () => {
    renderWithLocale(DatePicker, { props: { type: 'dateTime', defaultOpen: true } });
    // 默认日期视图：无时间列
    expect(document.querySelector('.cd-date-picker__time--single')).toBeNull();
    // 切到时间视图
    const timeBtn = document.querySelector<HTMLButtonElement>('.cd-date-picker__switch-time');
    expect(timeBtn).not.toBeNull();
    timeBtn!.click();
    await tick();
    expect(document.querySelector('.cd-date-picker__time--single')).not.toBeNull();
  });

  it('timePickerOpts.scrollItemProps wheel/cycled 切到时间视图后时间列为 wheel 模式', async () => {
    renderWithLocale(DatePicker, {
      props: {
        type: 'dateTime',
        defaultOpen: true,
        timePickerOpts: { scrollItemProps: { mode: 'wheel', cycled: true } },
      },
    });
    document.querySelector<HTMLButtonElement>('.cd-date-picker__switch-time')!.click();
    await tick();
    expect(document.querySelector('.cd-scrolllist-item-wheel')).not.toBeNull();
  });

  it('默认（不传 scrollItemProps）切到时间视图时间列为 normal 模式', async () => {
    renderWithLocale(DatePicker, { props: { type: 'dateTime', defaultOpen: true } });
    document.querySelector<HTMLButtonElement>('.cd-date-picker__switch-time')!.click();
    await tick();
    expect(document.querySelector('.cd-scrolllist-item-wheel')).toBeNull();
  });
});
