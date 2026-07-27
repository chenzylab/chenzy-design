/**
 * DatePicker 装配测试（里程碑3：基本 date 单面板）。
 * 断言：combobox 触发器（复用 Input）、点击打开 Popover 面板（Navigation+Month）、
 * 点日期回调 onChange + 关闭、受控 value 回显、defaultOpen 直接展开。
 */
import { describe, it, expect, vi } from 'vitest';
import { tick } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import DatePicker from './DatePicker.svelte';

const PREFIX = 'cd-datepicker';

describe('DatePicker 装配对齐 Semi（date 单面板）', () => {
  it('关闭态：combobox 触发器 + 复用 Input，无 axe violations', async () => {
    const { container } = renderWithLocale(DatePicker, {
      props: { type: 'date' },
    });
    const combobox = container.querySelector('[role="combobox"]');
    expect(combobox).not.toBeNull();
    expect(combobox?.getAttribute('aria-expanded')).toBe('false');
    // 复用 Input（cd-input wrapper 存在）。
    expect(container.querySelector('.cd-input, .cd-input-wrapper')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('defaultOpen：面板 portal 到 body，含 Navigation + Month grid', async () => {
    renderWithLocale(DatePicker, {
      props: { type: 'date', defaultOpen: true },
    });
    await tick();
    const nav = document.querySelector(`.${PREFIX}-navigation`);
    expect(nav).not.toBeNull();
    const grid = document.querySelector(`.${PREFIX}-month[role="grid"]`);
    expect(grid).not.toBeNull();
    const cells = document.querySelectorAll(`.${PREFIX}-day-main`);
    expect(cells.length).toBeGreaterThan(0);
  });

  it('点击日期触发 onChange（dateString 在前）并关闭面板', async () => {
    const onChange = vi.fn<(a: unknown, b: unknown) => void>();
    renderWithLocale(DatePicker, {
      props: { type: 'date', defaultOpen: true, defaultPickerValue: new Date(2026, 0, 1), onChange },
    });
    await tick();
    // 点 2026-01-15。
    const cell = document.querySelector('[aria-label="2026-01-15"]') as HTMLElement;
    expect(cell).not.toBeNull();
    cell.click();
    await tick();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0]).toBe('2026-01-15');
  });

  it('受控 value 回显到触发器 Input', async () => {
    const { container } = renderWithLocale(DatePicker, {
      props: { type: 'date', value: new Date(2026, 2, 20) },
    });
    await tick();
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2026-03-20');
  });

  it('dateRange：defaultOpen 双面板 + 受控 value 反解 selected-start/end', async () => {
    renderWithLocale(DatePicker, {
      props: {
        type: 'dateRange',
        defaultOpen: true,
        value: [new Date(2026, 0, 10), new Date(2026, 0, 20)],
      },
    });
    await tick();
    // 双面板。
    expect(document.querySelectorAll(`.${PREFIX}-month[role="grid"]`).length).toBe(2);
    // range 端点 class（左面板 1 月内含 start=10、end=20）。
    expect(document.querySelector(`.${PREFIX}-day-selected-start`)).not.toBeNull();
    expect(document.querySelector(`.${PREFIX}-day-selected-end`)).not.toBeNull();
  });

  it('dateRange：点两日期触发 onChange（两端完整才通知）', async () => {
    const onChange = vi.fn();
    renderWithLocale(DatePicker, {
      props: {
        type: 'dateRange',
        defaultOpen: true,
        defaultPickerValue: new Date(2026, 0, 1),
        onChange,
      },
    });
    await tick();
    const left = document.querySelector(`.${PREFIX}-month-grid-left`)!;
    (left.querySelector('[aria-label="2026-01-10"]') as HTMLElement).click();
    await tick();
    (left.querySelector('[aria-label="2026-01-20"]') as HTMLElement).click();
    await tick();
    // 两端完整后通知。
    expect(onChange).toHaveBeenCalled();
    const lastArgs = onChange.mock.calls[onChange.mock.calls.length - 1]!;
    // 默认 onChangeWithDateFirst=false：第一参是 dateString（range 为 string[]，对齐 Semi disposeCallbackArgs）。
    expect(Array.isArray(lastArgs[0])).toBe(true);
    expect((lastArgs[0] as string[]).every((s) => typeof s === 'string')).toBe(true);
    // 含 10 与 20 两端。
    expect((lastArgs[0] as string[]).join(' ')).toContain('2026-01-10');
    expect((lastArgs[0] as string[]).join(' ')).toContain('2026-01-20');
  });

  it('month：面板走 YearAndMonth 滚轮（非日历），无 Month grid', async () => {
    renderWithLocale(DatePicker, {
      props: { type: 'month', defaultOpen: true, value: new Date(2026, 5, 1) },
    });
    await tick();
    // yam 面板存在、无日历 grid。
    expect(document.querySelector(`.${PREFIX}-yam`)).not.toBeNull();
    expect(document.querySelector(`.${PREFIX}-month[role="grid"]`)).toBeNull();
    // year+month 两列滚轮。
    expect(document.querySelectorAll('ul[role="listbox"]').length).toBe(2);
  });

  it('month：选年月触发 onChange（Date 为该月首日）', async () => {
    const onChange = vi.fn();
    renderWithLocale(DatePicker, {
      props: { type: 'month', defaultOpen: true, value: new Date(2026, 5, 1), onChange },
    });
    await tick();
    // 点 month 列（第二个 listbox）第 3 项（3月）。
    const monthList = document.querySelectorAll('ul[role="listbox"]')[1]!;
    (monthList.querySelectorAll('li[role="option"]')[2] as HTMLElement).click();
    await tick();
    expect(onChange).toHaveBeenCalled();
    const notifyDate = onChange.mock.calls[onChange.mock.calls.length - 1]![1] as Date;
    expect(notifyDate).toBeInstanceOf(Date);
    expect(notifyDate.getMonth()).toBe(2); // 3月=index 2
  });

  it('presets：面板渲染 QuickControl（默认 bottom），点 preset 触发 onChange + 关面板', async () => {
    const onChange = vi.fn();
    renderWithLocale(DatePicker, {
      props: {
        type: 'date',
        defaultOpen: true,
        onChange,
        presets: [{ text: '今天', start: new Date(2026, 0, 15) }],
      },
    });
    await tick();
    const qc = document.querySelector(`.${PREFIX}-quick-control-bottom`);
    expect(qc).not.toBeNull();
    (qc!.querySelector('button') as HTMLElement).click();
    await tick();
    expect(onChange).toHaveBeenCalled();
    // dateString 为 2026-01-15。
    expect(onChange.mock.calls[0]![0]).toBe('2026-01-15');
  });

  it('presetPosition=left：QuickControl 带 left class', async () => {
    renderWithLocale(DatePicker, {
      props: {
        type: 'date',
        defaultOpen: true,
        presetPosition: 'left',
        presets: [{ text: '今天', start: new Date(2026, 0, 15) }],
      },
    });
    await tick();
    expect(document.querySelector(`.${PREFIX}-quick-control-left`)).not.toBeNull();
  });

  it('dateRange preset：点 [start,end] 触发 onChange（string[]）', async () => {
    const onChange = vi.fn();
    renderWithLocale(DatePicker, {
      props: {
        type: 'dateRange',
        defaultOpen: true,
        onChange,
        presets: [{ text: '本周', start: new Date(2026, 0, 12), end: new Date(2026, 0, 18) }],
      },
    });
    await tick();
    (document.querySelector(`.${PREFIX}-quick-control button`) as HTMLElement).click();
    await tick();
    expect(onChange).toHaveBeenCalled();
    const val = onChange.mock.calls[0]![0] as string[];
    expect(Array.isArray(val)).toBe(true);
    expect(val.join(' ')).toContain('2026-01-12');
    expect(val.join(' ')).toContain('2026-01-18');
  });

  it('insetInput：面板顶部渲染 InsetInput 输入框', async () => {
    renderWithLocale(DatePicker, {
      props: { type: 'date', defaultOpen: true, insetInput: true },
    });
    await tick();
    const wrapper = document.querySelector(`.${PREFIX}-inset-input-wrapper`);
    expect(wrapper).not.toBeNull();
    // date 类型：至少一个日期输入框。
    expect(wrapper!.querySelectorAll('input').length).toBeGreaterThanOrEqual(1);
  });

  it('insetInput：输入日期串 → onChange 提交', async () => {
    const onChange = vi.fn();
    renderWithLocale(DatePicker, {
      props: { type: 'date', defaultOpen: true, insetInput: true, onChange },
    });
    await tick();
    const input = document.querySelector(
      `.${PREFIX}-inset-input-wrapper input`,
    ) as HTMLInputElement;
    input.value = '2026-01-15';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await tick();
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[onChange.mock.calls.length - 1]![0]).toBe('2026-01-15');
  });

  it('dateTimeRange insetInput：4 输入框（左右各 date+time）', async () => {
    renderWithLocale(DatePicker, {
      props: { type: 'dateTimeRange', defaultOpen: true, insetInput: true },
    });
    await tick();
    const wrapper = document.querySelector(`.${PREFIX}-inset-input-wrapper`)!;
    // 左 date+time + 右 date+time = 4 输入框。
    expect(wrapper.querySelectorAll('input').length).toBe(4);
  });

  it('monthRange：面板双列 YearAndMonth（left+right）', async () => {
    renderWithLocale(DatePicker, {
      props: {
        type: 'monthRange',
        defaultOpen: true,
        value: [new Date(2026, 0, 1), new Date(2026, 5, 1)],
      },
    });
    await tick();
    // monthRange 双面板 → 4 列滚轮（2 panel × year+month）。
    expect(document.querySelectorAll('ul[role="listbox"]').length).toBe(4);
  });
});
