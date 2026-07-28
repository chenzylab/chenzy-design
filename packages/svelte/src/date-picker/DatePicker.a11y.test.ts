/**
 * DatePicker 装配测试（里程碑3：基本 date 单面板）。
 * 断言：combobox 触发器（复用 Input）、点击打开 Popover 面板（Navigation+Month）、
 * 点日期回调 onChange + 关闭、受控 value 回显、defaultOpen 直接展开。
 */
import { describe, it, expect, vi } from 'vitest';
import { tick, mount, unmount } from 'svelte';
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
    // 面板根节点是 `-panel-yam`（对齐 Semi cssClasses.PANEL_YAM，承 max-width + scrolllist 规则）；
    // `-yam` 是 MonthsGrid 里 absolute 覆盖层的类，两者不可混用。
    expect(document.querySelector(`.${PREFIX}-panel-yam`)).not.toBeNull();
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

  it('multiple：触发器多值用逗号分隔（对齐 Semi DEFAULT_SEPARATOR_MULTIPLE，非 range 的 " ~ "）', async () => {
    const { container } = renderWithLocale(DatePicker, {
      props: {
        type: 'date',
        multiple: true,
        value: [new Date(2026, 6, 10), new Date(2026, 6, 12)],
      },
    });
    await tick();
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2026-07-10,2026-07-12');
    expect(input.value).not.toContain('~');
  });

  it('range：触发器两端用 rangeSeparator 连接且无多余空格', async () => {
    const { container } = renderWithLocale(DatePicker, {
      props: {
        type: 'dateRange',
        value: [new Date(2026, 6, 10), new Date(2026, 7, 5)],
      },
    });
    await tick();
    const inputs = [...container.querySelectorAll('input')] as HTMLInputElement[];
    expect(inputs.map((i) => i.value)).toEqual(['2026-07-10', '2026-08-05']);
  });

  it('placeholder 按 type 分派（对齐 Semi locale placeholder：date/dateTime/*Range）', async () => {
    const cases: Array<[string, string[]]> = [
      ['date', ['Select date']],
      ['dateTime', ['Select date and time']],
      ['dateRange', ['Start date', 'End date']],
      ['dateTimeRange', ['Start date', 'End date']],
      // monthRange 走**单框**（对齐 Semi isRenderMultipleInputs），placeholder 两端拼成一条
      ['monthRange', ['Start month ~ End month']],
    ];
    for (const [type, expected] of cases) {
      const { container, unmount } = renderWithLocale(DatePicker, { props: { type } });
      await tick();
      const phs = [...container.querySelectorAll('input')].map((i) => (i as HTMLInputElement).placeholder);
      expect(phs, `type=${type}`).toEqual(expected);
      unmount();
    }
  });

  it('placeholder prop 支持 [start, end] 数组覆盖 range 两端（对齐 Semi）', async () => {
    const { container } = renderWithLocale(DatePicker, {
      props: { type: 'dateRange', placeholder: ['起', '止'] },
    });
    await tick();
    const phs = [...container.querySelectorAll('input')].map((i) => (i as HTMLInputElement).placeholder);
    expect(phs).toEqual(['起', '止']);
  });

  it('locale prop 局部覆盖文案（对齐 Semi locale，未给字段回退 provider）', async () => {
    const { container } = renderWithLocale(DatePicker, {
      props: {
        type: 'date',
        locale: { placeholder: { date: '选个日子', dateTime: '', dateRange: ['', ''], dateTimeRange: ['', ''], monthRange: ['', ''] } },
      },
    });
    await tick();
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('选个日子');
  });

  it('defaultPickerValue 数组：[0] 定位左面板、[1] 定位右面板（对齐 Semi getDefaultPickerDate）', async () => {
    renderWithLocale(DatePicker, {
      props: {
        type: 'dateRange',
        defaultOpen: true,
        defaultPickerValue: [new Date(2022, 7, 8), new Date(2022, 10, 9)],
      },
    });
    await tick();
    const titles = [...document.querySelectorAll('.cd-datepicker-container button span')]
      .map((e) => e.textContent?.trim() ?? '')
      .filter((t) => /2022/.test(t));
    // 左面板 8 月、右面板 11 月（右面板取数组第二项而非 addMonths(left,1)）。
    const uniq = [...new Set(titles)];
    expect(uniq, `titles=${JSON.stringify(titles)}`).toHaveLength(2);
    expect(uniq[0]).toMatch(/Aug|8/);
    expect(uniq[1]).toMatch(/Nov|11/);
  });

  it('命令式方法：open/close 控制面板，focus/blur 控制触发器焦点（对齐 Semi）', async () => {
    // 命令式 API 走 export function + bind:this，需直接 mount 组件拿实例（harness 拿不到内部实例）。
    const target = document.createElement('div');
    document.body.appendChild(target);
    const api = mount(DatePicker, { target, props: { type: 'date' } }) as unknown as {
      open(): void; close(): void; focus(t?: 'rangeStart' | 'rangeEnd'): void; blur(): void;
    };
    await tick();
    api.open();
    await tick();
    expect(document.querySelector('.cd-datepicker-container')).not.toBeNull();
    api.close();
    await tick();
    expect(document.querySelector('.cd-datepicker-container')).toBeNull();
    const input = target.querySelector('input') as HTMLInputElement;
    api.focus();
    await tick();
    expect(document.activeElement).toBe(input);
    api.blur();
    await tick();
    expect(document.activeElement).not.toBe(input);
    unmount(api as never);
    target.remove();
  });

  it('range hover 预览：选中起点后 hover 未来日期，中间整段高亮（对齐 Semi isHover）', async () => {
    // 回归防护：range 只有两端都选完才提交，故选中起点时 DatePicker 传给 MonthsGrid 的
    // rangeStart 仍是空串。若 MonthsGrid 用 `??` 合并，空串会覆盖 foundation 内部已写入的起点，
    // 导致 _isHoverAfterStart 恒 false、预览区间整段不显示（真机可见 bug）。
    renderWithLocale(DatePicker, {
      props: { type: 'dateRange', defaultOpen: true, defaultPickerValue: new Date(2026, 6, 1) },
    });
    await tick();
    const dayOf = (n: string) =>
      [...document.querySelectorAll('.cd-datepicker-container [class*="cd-datepicker-day"]')].find(
        (e) => e.textContent?.trim() === n,
      ) as HTMLElement | undefined;

    // 选起点 10 号
    const d10 = dayOf('10');
    expect(d10).toBeDefined();
    d10!.click();
    await tick();
    expect(d10!.className).toMatch(/selected-start|selected/);

    // hover 20 号 → 11..19 应带 inhover（预览区间）
    const d20 = dayOf('20');
    d20!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    await tick();
    const mid = dayOf('15');
    expect(mid, '15 号应存在于面板').toBeDefined();
    expect(mid!.className, `15 号 class=${mid!.className}`).toMatch(/inhover/);
  });

  it('range 关闭面板即清聚焦端，触发器 -active 高亮不残留（对齐 Semi close→resetFocus）', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const api = mount(DatePicker, { target, props: { type: 'dateRange' } }) as unknown as {
      open(): void; close(): void; focus(t?: 'rangeStart' | 'rangeEnd'): void;
    };
    await tick();
    api.focus('rangeStart');
    api.open();
    await tick();
    const startWrapper = target.querySelector('.cd-datepicker-range-input-wrapper-start')!;
    expect(startWrapper.className).toMatch(/wrapper-active/);

    api.close();
    await tick();
    expect(
      target.querySelector('.cd-datepicker-range-input-wrapper-start')!.className,
      '关闭后 -active 应消失',
    ).not.toMatch(/wrapper-active/);
    unmount(api as never);
    target.remove();
  });

  it('range 点触发器：焦点落到对应端 input 且面板不抢焦点（对齐 Semi setRangeInputFocus + 无 trapFocus）', async () => {
    // 两处回归：① Popover guardFocus 缺省随 role=dialog 会把焦点抢到面板首个按钮（Semi 未开 trapFocus）；
    // ② setRangeInputFocus 除改 state 外还须 inputNode.focus()，否则点 wrapper 只亮 -active、焦点留 body。
    const { container } = renderWithLocale(DatePicker, { props: { type: 'dateRange' } });
    await tick();
    const startW = container.querySelector('.cd-datepicker-range-input-wrapper-start') as HTMLElement;
    const startInput = startW.querySelector('input') as HTMLInputElement;
    startW.click();
    await tick();
    expect(startW.className).toMatch(/wrapper-active/);
    expect(document.activeElement, '焦点应落在起始 input，而非面板内按钮/body').toBe(startInput);

    const endW = container.querySelector('.cd-datepicker-range-input-wrapper-end') as HTMLElement;
    const endInput = endW.querySelector('input') as HTMLInputElement;
    endW.click();
    await tick();
    expect(endW.className).toMatch(/wrapper-active/);
    expect(document.activeElement).toBe(endInput);
  });

  it('monthRange：双面板同在 yearmonth-body 容器内（横排布局的结构前提）', async () => {
    // 注：jsdom 不加载组件 <style>（document.styleSheets 为空），无法断言 display:flex，
    // 故此处只锁结构；横排视觉由 YearAndMonth 的 :global(.cd-datepicker-yearmonth-body{display:flex})
    // 保证（照搬 Semi），需真机核。
    renderWithLocale(DatePicker, { props: { type: 'monthRange', defaultOpen: true } });
    await tick();
    const body = document.querySelector('.cd-datepicker-yearmonth-body') as HTMLElement;
    expect(body, 'monthRange 应渲染 yearmonth-body 容器').not.toBeNull();
    expect(body.querySelectorAll('.cd-datepicker-yearmonth-panel').length).toBe(2);
  });

  it('range 触发器展示串走 type 默认 format（monthRange 显示 yyyy-MM 而非 yyyy-MM-dd）', async () => {
    // 回归：内部传 MonthsGrid 的 rangeStart/End 串固定 yyyy-MM-dd（供同日比较），
    // 但触发器展示必须走 getDefaultFormatTokenByType(type)，否则 monthRange 会显示成 2026-09-01。
    const { container } = renderWithLocale(DatePicker, {
      props: { type: 'monthRange', value: [new Date(2026, 8, 1), new Date(2026, 11, 1)] },
    });
    await tick();
    // monthRange 走单框（对齐 Semi isRenderMultipleInputs），整段区间在一个 input 里；
    // 本条断言的重点仍是**格式**为 yyyy-MM 而非 yyyy-MM-dd。
    const values = [...container.querySelectorAll('input')].map((i) => (i as HTMLInputElement).value);
    expect(values).toEqual(['2026-09 ~ 2026-12']);
  });

  it('range 触发器展示串：用户传 format 时以其为准', async () => {
    const { container } = renderWithLocale(DatePicker, {
      props: { type: 'dateRange', format: 'yyyy/MM/dd', value: [new Date(2026, 6, 10), new Date(2026, 7, 5)] },
    });
    await tick();
    const values = [...container.querySelectorAll('input')].map((i) => (i as HTMLInputElement).value);
    expect(values).toEqual(['2026/07/10', '2026/08/05']);
  });

  it('needConfirm：选择只暂存不写值/不触发 onChange，点确定才提交（对齐 Semi cachedSelectedValue）', async () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { container } = renderWithLocale(DatePicker, {
      props: { type: 'dateTime', needConfirm: true, defaultOpen: true, onChange, onConfirm },
    });
    await tick();
    const input = container.querySelector('input') as HTMLInputElement;
    const before = input.value;

    const d15 = [...document.querySelectorAll('.cd-datepicker-container [class*="cd-datepicker-day"]')].find(
      (e) => e.textContent?.trim() === '15',
    ) as HTMLElement;
    d15.click();
    await tick();
    // 选择后：触发器不变、onChange 未触发、面板不关
    expect(input.value, '选择后触发器应保持原值').toBe(before);
    expect(onChange, 'needConfirm 下选择不应触发 onChange').not.toHaveBeenCalled();
    expect(document.querySelector('.cd-datepicker-container'), '需确认时不自动关闭').not.toBeNull();
    // 面板高亮读暂存值 → 15 号应已选中
    expect(d15.className).toMatch(/selected/);

    const ok = [...document.querySelectorAll('.cd-datepicker-footer button')].find(
      (b) => /确定|Confirm|OK/.test(b.textContent?.trim() ?? ''),
    ) as HTMLElement;
    ok.click();
    await tick();
    expect(onChange, '确定后才提交 onChange').toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalled();
    expect(input.value, '确定后触发器写入所选值').not.toBe(before);
  });

  it('needConfirm：取消丢弃暂存，value 与 onChange 均不受影响（对齐 Semi）', async () => {
    const onChange = vi.fn();
    const onCancel = vi.fn();
    const { container } = renderWithLocale(DatePicker, {
      props: { type: 'dateTime', needConfirm: true, defaultOpen: true, onChange, onCancel },
    });
    await tick();
    const input = container.querySelector('input') as HTMLInputElement;
    const before = input.value;

    const d15 = [...document.querySelectorAll('.cd-datepicker-container [class*="cd-datepicker-day"]')].find(
      (e) => e.textContent?.trim() === '15',
    ) as HTMLElement;
    d15.click();
    await tick();

    const cancel = [...document.querySelectorAll('.cd-datepicker-footer button')].find(
      (b) => /取消|Cancel/.test(b.textContent?.trim() ?? ''),
    ) as HTMLElement;
    cancel.click();
    await tick();
    expect(input.value, '取消后触发器保持原值').toBe(before);
    expect(onChange, '取消不应触发 onChange').not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it('不开 needConfirm：选择即写值并触发 onChange（回归防护，勿被暂存层误伤）', async () => {
    const onChange = vi.fn();
    const { container } = renderWithLocale(DatePicker, {
      props: { type: 'date', defaultOpen: true, onChange },
    });
    await tick();
    const d15 = [...document.querySelectorAll('.cd-datepicker-container [class*="cd-datepicker-day"]')].find(
      (e) => e.textContent?.trim() === '15',
    ) as HTMLElement;
    d15.click();
    await tick();
    expect(onChange).toHaveBeenCalled();
    expect((container.querySelector('input') as HTMLInputElement).value).toMatch(/15/);
  });

  it('选日期后仅 type=date 自动关面板，dateTime 保持打开（对齐 Semi foundation:1019）', async () => {
    // 回归：Semi 的关闭条件精确到 type —— `type==='date' && !multiple` 或
    // `type==='dateRange' && 两端完整`；dateTime/dateTimeRange 还要选时间，必须保持打开。
    const pick = async (type: string) => {
      const { unmount } = renderWithLocale(DatePicker, { props: { type, defaultOpen: true } });
      await tick();
      const d15 = [...document.querySelectorAll('.cd-datepicker-container [class*="cd-datepicker-day"]')].find(
        (e) => e.textContent?.trim() === '15',
      ) as HTMLElement;
      d15.click();
      await tick();
      const open = !!document.querySelector('.cd-datepicker-container');
      unmount();
      await tick();
      return open;
    };
    expect(await pick('date'), 'date 选完应关闭').toBe(false);
    expect(await pick('dateTime'), 'dateTime 应保持打开').toBe(true);
  });

  it('wheel cycled：三列都有环绕余量（份数 >= 3），选中项靠列表末尾也不退化', async () => {
    // 回归：份数按 selectedIndex 的理论位置算，选中项靠两端时会算出 0 份（如 60 项选第 54 项），
    // parts=1 时 adjustInfiniteList 的 `scrollTop ± listHeight` 会被浏览器夹紧、环绕失效
    // （真机表现：分钟列滚到底就停、中间项不高亮）。故 cycled 下 prepend/append 各保底 1 份。
    renderWithLocale(DatePicker, {
      props: {
        type: 'dateTime',
        defaultOpen: true,
        defaultValue: new Date(2026, 6, 15, 15, 54, 49),
        timePickerOpts: { scrollItemProps: { mode: 'wheel', cycled: true } },
      },
    });
    await tick();
    const sw = document.querySelector('.cd-datepicker-switch-time') as HTMLElement;
    sw.click();
    await tick();
    const wheels = [...document.querySelectorAll('.cd-datepicker-tpk .cd-scrolllist-item-wheel')];
    expect(wheels.length, 'wheel 模式应渲染 3 列').toBe(3);
    const base = [24, 60, 60];
    wheels.forEach((w, i) => {
      const li = w.querySelectorAll('li').length;
      expect(li, `第 ${i} 列 li=${li}，应 >= 基准 ${base[i]} × 3`).toBeGreaterThanOrEqual(base[i]! * 3);
    });
  });

  it('dateTimeRange 两侧同时切时间视图：双 tpk 都带 -yam-showing（不塌高）', async () => {
    // 回归：-yam-showing 原限定 !isRange，range 两侧都切 time 后日历全被卸载，
    // 容器塌到高 53px、tpk 高 0，时间列虽渲染但不可见（真机表现：面板成一条）。
    renderWithLocale(DatePicker, { props: { type: 'dateTimeRange', defaultOpen: true } });
    await tick();
    const switches = [...document.querySelectorAll('.cd-datepicker-switch-time')] as HTMLElement[];
    expect(switches.length, 'range 应有左右两个时间切换').toBe(2);
    switches[0]!.click();
    await tick();
    switches[1]!.click();
    await tick();
    const grids = [...document.querySelectorAll('[class*="cd-datepicker-month-grid-"]')];
    expect(grids.length).toBe(2);
    grids.forEach((g, i) => {
      expect(g.getAttribute('x-open-type'), `第 ${i} 侧应为 time`).toBe('time');
      expect(g.className, `第 ${i} 侧应带 -yam-showing 撑住尺寸`).toMatch(/yam-showing/);
    });
    expect(document.querySelectorAll('.cd-datepicker-tpk').length, '双 tpk').toBe(2);
  });

  it('insetInput 打开面板：焦点落内嵌输入框 + 触发器禁用，关闭后恢复（对齐 Semi）', async () => {
    // 对齐 Semi handlePanelVisibleChange：visible 时 setInsetInputFocus() +
    // setTimeout(setTriggerDisabled(true))，关闭时 setTriggerDisabled(false)。
    // 触发器 disabled 后光标才会自然留在面板内嵌输入框（Semi datePicker.tsx:460 注释）。
    const target = document.createElement('div');
    document.body.appendChild(target);
    const api = mount(DatePicker, {
      target,
      props: { type: 'date', insetInput: true },
    }) as unknown as { open(): void; close(): void };
    await tick();

    api.open();
    await tick();
    // 聚焦走 queueMicrotask、禁用走 setTimeout(0)，等两拍
    await new Promise((r) => setTimeout(r, 20));
    const insetInput = document.querySelector(
      '.cd-datepicker-inset-input-wrapper input',
    ) as HTMLInputElement;
    expect(insetInput, '应渲染内嵌输入框').not.toBeNull();
    expect(document.activeElement, '焦点应落在内嵌输入框').toBe(insetInput);
    const trigger = target.querySelector('input') as HTMLInputElement;
    expect(trigger.disabled, '打开后触发器应禁用').toBe(true);

    api.close();
    await tick();
    await new Promise((r) => setTimeout(r, 20));
    expect(
      (target.querySelector('input') as HTMLInputElement).disabled,
      '关闭后触发器应恢复',
    ).toBe(false);
    unmount(api as never);
    target.remove();
  });

  it('insetInput 浮层覆盖触发器：x-placement=leftTopOver（对齐 Semi）', async () => {
    // 照搬 Semi index.tsx:53-65：insetInput 未显式指定 position 时用 POSITION_INLINE_INPUT
    // （leftTopOver），且 position 含 'Over' 时 spacing 用 SPACING_INSET_INPUT(1)。
    // leftTopOver 语义 = 浮层左/上边缘与触发器对齐后各回退 1px，**压在触发器上**
    // （面板自带内嵌输入框，无需再露出触发器）。
    const target = document.createElement('div');
    document.body.appendChild(target);
    const api = mount(DatePicker, {
      target,
      props: { type: 'date', insetInput: true, defaultOpen: true },
    });
    await tick();
    await new Promise((r) => setTimeout(r, 20));

    const wrapper = document.querySelector('.cd-popover-wrapper');
    expect(wrapper, '应渲染浮层').not.toBeNull();
    expect(
      wrapper?.getAttribute('x-placement'),
      'insetInput 浮层应用覆盖型方位 leftTopOver（不可退化成 leftTop）',
    ).toBe('leftTopOver');

    unmount(api as never);
    target.remove();
  });

  it('disabledDate 第二参 options 携带 rangeStart（对齐 Semi 动态禁用）', async () => {
    // Semi 的 disabledDate(date, options) 第二参给 { rangeStart, rangeEnd, rangeInputFocus }，
    // 「禁止选择早于已选起点的日期」这类动态禁用全靠它。
    // 回归：MonthsGrid 曾用单参包装 `(d) => disabledDate(d)` 透传给 Month，
    // **吞掉第二参** → 用户回调里 options.rangeStart 恒 undefined → 动态禁用整个失效。
    const seen: Array<Record<string, unknown> | undefined> = [];
    const disabledDate = (_d: Date, options?: Record<string, unknown>) => {
      seen.push(options);
      return false;
    };
    renderWithLocale(DatePicker, {
      props: {
        type: 'dateRange',
        defaultOpen: true,
        defaultValue: [new Date(2026, 6, 16), null],
        disabledDate,
      },
    });
    await tick();

    expect(seen.length, 'disabledDate 应被调用').toBeGreaterThan(0);
    expect(
      seen.some((o) => o !== undefined && 'rangeStart' in o),
      '第二参 options 必须携带 rangeStart（不可被单参包装吞掉）',
    ).toBe(true);
  });

  it('点 preset 后面板不关闭（对齐 Semi handlePresetClick 全程不碰 open）', async () => {
    // Semi foundation.ts:1069-1092 的 handlePresetClick 只做 handleSelectedChange
    // + notifyPresetsClick，**从不改 open 状态**；用户点完 preset 还能继续在面板里调时间。
    // 回归：本库原先单值/range 都会 setOpen(false)。
    const onPresetClick = vi.fn();
    const target = document.createElement('div');
    document.body.appendChild(target);
    const api = mount(DatePicker, {
      target,
      props: {
        type: 'dateTime',
        defaultOpen: true,
        presetPosition: 'left',
        presets: [{ text: 'Today', start: new Date(2026, 6, 28), end: new Date(2026, 6, 28) }],
        onPresetClick,
      },
    });
    await tick();
    await new Promise((r) => setTimeout(r, 20));

    const presetBtn = document.querySelector(
      '.cd-datepicker-quick-control-left-content .cd-button',
    ) as HTMLElement;
    expect(presetBtn, '应渲染 preset 按钮').not.toBeNull();
    presetBtn.click();
    await tick();
    await new Promise((r) => setTimeout(r, 20));

    expect(onPresetClick, 'onPresetClick 应被调用').toHaveBeenCalled();
    expect(
      document.querySelector('.cd-datepicker-quick-control-left-content'),
      '点 preset 后面板应保持打开',
    ).not.toBeNull();

    unmount(api as never);
    target.remove();
  });

  it('monthRange 右面板：同年时早于起始月的月份禁用（对齐 Semi isRightPanelDisabled）', async () => {
    // Semi yearAndMonth.tsx renderColMonth:
    //   panelType===right && currentMonth[left] && currentYear[left]===currentYear[right]
    //   && currentMonth[left] > month
    // 回归：年列早有对应的 needDisabled，月列此前只应用 disabledDate，
    // 导致 monthRange 左右同年时右面板早于起始月的月份仍可选。
    renderWithLocale(DatePicker, {
      props: {
        type: 'monthRange',
        defaultOpen: true,
        defaultValue: [new Date(2026, 6, 1), new Date(2026, 7, 1)], // 2026-07 ~ 2026-08
      },
    });
    await tick();

    const lists = document.querySelectorAll('ul[role="listbox"]');
    expect(lists.length, 'monthRange 应有 4 列（左年/左月/右年/右月）').toBe(4);
    // 按**列内序位**判断，不解析文案——renderWithLocale 默认 en_US，月名是
    // January/February…，parseInt 会得 NaN（这里踩过一次）。
    const rightMonths = [...lists[3]!.querySelectorAll('li[role="option"]')];
    const isDisabled = (li: Element) =>
      li.getAttribute('aria-disabled') === 'true' || li.className.includes('disabled');
    const disabledIdx = rightMonths.flatMap((li, i) => (isDisabled(li) ? [i] : []));
    // 起始月为 7 → 右面板前 6 项（1..6 月）禁用，第 7 项起可选
    expect(disabledIdx, '右面板应禁用前 6 个月').toEqual([0, 1, 2, 3, 4, 5]);
    expect(isDisabled(rightMonths[6]!), '第 7 个月（起始月本身）不应禁用').toBe(false);
  });

  it('中文 locale：年/月列选中项加“年”“月”后缀（对齐 Semi 两列各一个 transform）', async () => {
    // Semi yearAndMonth.tsx:158/205 —— zh-CN/zh-TW 下年列 `${val}年`、月列 `${val}月`，
    // 且 transform 只作用于**选中项**（未选中的月份保持裸数字）。
    // 回归：本库原先只给年列传了 transform，月列漏传 → 选中月显示裸「7」而非「7月」。
    // renderWithLocale 默认 en_US（该 locale 下**不该**加后缀），故显式切 zh_CN。
    renderWithLocale(DatePicker, {
      locale: 'zh_CN',
      props: { type: 'month', defaultOpen: true, value: new Date(2026, 6, 1) },
    });
    await tick();

    const lists = document.querySelectorAll('ul[role="listbox"]');
    expect(lists.length, '年 + 月两列').toBe(2);
    const selectedText = (ul: Element) =>
      ul.querySelector('li[role="option"][aria-selected="true"]')?.textContent?.trim();
    expect(selectedText(lists[0]!), '年列选中项应带「年」').toBe('2026年');
    expect(selectedText(lists[1]!), '月列选中项应带「月」').toBe('7月');

    // 未选中项保持裸数字（transform 仅作用于选中项）
    const monthTexts = [...lists[1]!.querySelectorAll('li[role="option"]')]
      .filter((li) => li.getAttribute('aria-selected') !== 'true')
      .map((li) => li.textContent?.trim())
      .filter(Boolean);
    expect(monthTexts.some((t) => t?.includes('月')), '未选中月份不应带「月」').toBe(false);
  });

  it('insetInput：monthRange 是单输入框，其余 range 才多框（对齐 Semi isRenderMultipleInputs）', async () => {
    // Semi dateInput.tsx:319-323 `isRenderMultipleInputs()` =
    // `type.includes('Range') && type !== 'monthRange'`，原注释
    // "isRange and not monthRange render multiple inputs"。
    // 回归：本库原判定是 /range/i.test(type)，把 monthRange 也当多框
    // → 渲染成两个框 + 「-」分隔符，而 Semi 是一个框、placeholder 为 `yyyy-MM ~ yyyy-MM`。
    // 用 as const 保住字面量类型——写成 `type: string` 会与 PickerType 联合类型不兼容
    // （mount 的 props 是强类型；svelte-check 会报错，docs typecheck 查不出来）。
    const cases = [
      { type: 'monthRange', inputs: 1, sep: false },
      { type: 'dateRange', inputs: 2, sep: true },
      { type: 'dateTimeRange', inputs: 4, sep: true },
    ] as const;
    for (const c of cases) {
      const target = document.createElement('div');
      document.body.appendChild(target);
      const api = mount(DatePicker, {
        target,
        props: { type: c.type, insetInput: true, defaultOpen: true },
      });
      await tick();
      await new Promise((r) => setTimeout(r, 20));

      const inset = document.querySelector('.cd-datepicker-inset-input-wrapper');
      expect(inset, `${c.type} 应渲染内嵌输入框`).not.toBeNull();
      expect(inset?.querySelectorAll('input').length, `${c.type} 输入框数量`).toBe(c.inputs);
      expect(
        !!inset?.querySelector('.cd-datepicker-inset-input-separator'),
        `${c.type} 分隔符`,
      ).toBe(c.sep);

      unmount(api as never);
      target.remove();
    }
  });

  it('触发器：monthRange 是单框，其余 range 才双框（对齐 Semi isRenderMultipleInputs）', async () => {
    // 同 isRenderMultipleInputs 契约，但作用在**触发器**上（Semi dateInput.tsx:446 分支）。
    // 回归：本库 DateInput 的 isRange 原为 `type.includes('Range')`，把 monthRange 也渲染成
    // 双框 + `~` 分隔符；Semi 是单框显示整段区间。
    const cases = [
      { type: 'monthRange', rangeTrigger: false },
      { type: 'dateRange', rangeTrigger: true },
      { type: 'dateTimeRange', rangeTrigger: true },
      { type: 'month', rangeTrigger: false },
    ] as const;
    for (const c of cases) {
      const { container } = renderWithLocale(DatePicker, { props: { type: c.type } });
      await tick();
      expect(
        !!container.querySelector(`.${PREFIX}-range-input`),
        `${c.type} 是否双框 range 触发器`,
      ).toBe(c.rangeTrigger);
    }
  });

  it('showClear 默认 true（对齐 Semi，meta/md 早已声明 true）', async () => {
    // Semi DatePicker 不在 defaultProps 里设 showClear，透传 undefined 给 DateInput，
    // 由后者 defaultProps `showClear: true` 兜底；Semi 文档也标默认 true。
    // 回归：本库 DatePicker/DateInput 实现都写死 false，而 meta/md 声明 true——声明未接线。
    const { container } = renderWithLocale(DatePicker, {
      props: { type: 'dateRange', value: [new Date(2026, 6, 10), new Date(2026, 7, 5)] },
    });
    await tick();
    // range 清除按钮不依赖 hover（Semi renderRangeClearBtn 直接按有值渲染）
    expect(
      container.querySelector(`.${PREFIX}-range-input-clearbtn`),
      '未显式传 showClear 时应默认显示清除按钮',
    ).not.toBeNull();
  });

  it('range 清除按钮默认隐藏、DOM 上排在 suffix 之前（对齐 Semi）', async () => {
    // Semi datePicker.scss:1016/955：clearbtn 默认 display:none，仅
    // ① 触发器 hover ② 某端聚焦(-wrapper-active) 时 display:flex；
    // 且同时 `clearbtn ~ suffix { display:none }` 让清除按钮占据日历图标的位置。
    // 回归：本库原为无条件 display:flex 且不隐藏 suffix → 清除按钮挤在图标左边。
    const { container } = renderWithLocale(DatePicker, {
      props: { type: 'dateRange', defaultValue: [new Date(2026, 6, 10), new Date(2026, 7, 5)] },
    });
    await tick();
    const root = container.querySelector(`.${PREFIX}-range-input`)!;
    const kids = [...root.children].map((c) => c.className);
    const clearIdx = kids.findIndex((c) => c.includes('range-input-clearbtn'));
    const suffixIdx = kids.findIndex((c) => c.includes('range-input-suffix'));
    expect(clearIdx, '应渲染清除按钮').toBeGreaterThanOrEqual(0);
    expect(suffixIdx, '应渲染 suffix').toBeGreaterThanOrEqual(0);
    expect(clearIdx, 'clearbtn 必须排在 suffix 之前（兄弟选择器 ~ 才成立）').toBeLessThan(
      suffixIdx,
    );
  });

  it('showClear=false 时不渲染清除按钮', async () => {
    const { container } = renderWithLocale(DatePicker, {
      props: {
        type: 'dateRange',
        showClear: false,
        value: [new Date(2026, 6, 10), new Date(2026, 7, 5)],
      },
    });
    await tick();
    expect(container.querySelector(`.${PREFIX}-range-input-clearbtn`)).toBeNull();
  });

  it('insetInput 下触发器 disabled 仍显示清除按钮（对齐 Semi showClearIgnoreDisabled）', async () => {
    // Semi datePicker.tsx:678 `showClearIgnoreDisabled: Boolean(insetInput)`。
    // insetInput 打开面板会把触发器置 disabled，不忽略的话清除按钮恰好在面板打开时消失。
    const { container } = renderWithLocale(DatePicker, {
      props: {
        type: 'dateRange',
        insetInput: true,
        disabled: true,
        value: [new Date(2026, 6, 10), new Date(2026, 7, 5)],
      },
    });
    await tick();
    expect(
      container.querySelector(`.${PREFIX}-range-input-clearbtn`),
      'insetInput 时 disabled 不应吃掉清除按钮',
    ).not.toBeNull();
  });

  it('清空后复位 rangeInputFocus（对齐 Semi setRangeInputFocus(false)）', async () => {
    // 回归：清空只写空值、没复位焦点态，触发器会残留 -active 高亮。
    // 用 defaultValue（非受控）——受控 value 下 Semi 同样不自行清值
    // （foundation.ts:620 `if (!this._isControlledComponent('value'))`）。
    const { container } = renderWithLocale(DatePicker, {
      props: { type: 'dateRange', defaultValue: [new Date(2026, 6, 10), new Date(2026, 7, 5)] },
    });
    await tick();
    // 先点起始端制造 -active
    (container.querySelector(`.${PREFIX}-range-input-wrapper-start`) as HTMLElement)?.click();
    await tick();
    const clearBtn = container.querySelector(`.${PREFIX}-range-input-clearbtn`) as HTMLElement;
    clearBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await tick();

    expect(
      [...container.querySelectorAll('input')].map((i) => (i as HTMLInputElement).value),
      '清空后两端都应为空',
    ).toEqual(['', '']);
    expect(
      container.querySelector(`.${PREFIX}-range-input-wrapper-active`),
      '清空后不应残留 -active',
    ).toBeNull();
  });

  it('range 触发器无值时 value 为空串而非裸分隔符（对齐 Semi formatText）', async () => {
    // Semi dateInput.tsx:131 `value && value.length ? formatShowText(value) : ''`。
    // 回归：本库无值时曾拼出 ' ~ '，双框下看不出来（分隔符是独立元素），
    // 但 monthRange 走单框时该串会成为 input 的 value 顶掉 placeholder，
    // 触发器只显示一个「~」。
    for (const type of ['monthRange', 'dateRange', 'dateTimeRange']) {
      const { container, unmount } = renderWithLocale(DatePicker, { props: { type } });
      await tick();
      const vals = [...container.querySelectorAll('input')].map((i) => (i as HTMLInputElement).value);
      expect(vals.every((v) => v === ''), `${type} 无值时所有 input 应为空串`).toBe(true);
      unmount();
    }
  });

  it('触发器 monthRange：未传 placeholder 时用 locale 两端拼串（对齐 Semi）', async () => {
    // Semi dateInput.tsx:459：placeholder 为数组时 `[0] + rangeSeparator + [1]`。
    // 本库 locale 的 monthRange 是 ['开始月份','结束月份']，单框下应拼成一条。
    const { container } = renderWithLocale(DatePicker, {
      locale: 'zh_CN',
      props: { type: 'monthRange' },
    });
    await tick();
    const input = container.querySelector('input');
    expect(input?.placeholder, 'monthRange 单框应显示两端拼串').toBe('开始月份 ~ 结束月份');
  });

  it('insetInput monthRange：placeholder 是两端拼串（对齐 Semi）', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const api = mount(DatePicker, {
      target,
      props: { type: 'monthRange', insetInput: true, defaultOpen: true },
    });
    await tick();
    await new Promise((r) => setTimeout(r, 20));

    const input = document.querySelector<HTMLInputElement>(
      '.cd-datepicker-inset-input-wrapper input',
    );
    expect(input?.placeholder, 'monthRange 单框 placeholder 应为 `yyyy-MM ~ yyyy-MM`').toBe(
      'yyyy-MM ~ yyyy-MM',
    );

    unmount(api as never);
    target.remove();
  });

  it('yam 列 normal 模式有 min-width 规则（回归：只搬 wheel 那条会落空）', async () => {
    // Semi datePicker.scss:196-207 有**两条** li min-width：wheel 的 `-list-outer > ul > li`
    // 与 normal 的 `-item > ul > li`（后者 = 64 + wheel outer paddingRight 18 = 82，
    // Semi 注释「make the same width under wheel and normal mode」）。
    // 本库 yam 列写死 mode="normal"，原先只搬了 wheel 那条 → normal 下无 -list-outer 元素、
    // 规则完全落空 → 列宽塌到文字宽，monthRange 下「2026年」被挤成两行。
    renderWithLocale(DatePicker, {
      locale: 'zh_CN',
      props: { type: 'monthRange', defaultOpen: true, insetInput: true },
    });
    await tick();

    // normal 模式的 DOM 契约：.cd-scrolllist-item > ul > li（无 -list-outer）
    const normalLi = document.querySelector('.cd-scrolllist-item > ul > li');
    expect(normalLi, 'yam 列应走 normal 模式 DOM（-item > ul > li）').not.toBeNull();
    expect(
      document.querySelector('.cd-scrolllist-list-outer'),
      'normal 模式不应有 wheel 的 -list-outer',
    ).toBeNull();
  });

  it('非中文 locale：年/月列不加后缀（对齐 Semi 仅 zh-CN/zh-TW 生效）', async () => {
    renderWithLocale(DatePicker, {
      locale: 'en_US',
      props: { type: 'month', defaultOpen: true, value: new Date(2026, 6, 1) },
    });
    await tick();

    const lists = document.querySelectorAll('ul[role="listbox"]');
    const yearSel = lists[0]
      ?.querySelector('li[role="option"][aria-selected="true"]')
      ?.textContent?.trim();
    expect(yearSel, 'en_US 年列不应带「年」').toBe('2026');
  });

  it('month/monthRange 面板根节点用 -panel-yam 且带 x-insetinput（对齐 Semi）', async () => {
    // 回归：面板根节点曾误用 `-yam`（那是 MonthsGrid 里 absolute + width:100% 的覆盖层类），
    // 导致根节点拿不到 `-panel-yam` 的宽度规则 → 面板宽度塌成 0 → 白底/阴影画不出来，
    // 年月列因 absolute 脱离而裸露在页面上（insetInput 覆盖型浮层下还会透出触发器文字）。
    const target = document.createElement('div');
    document.body.appendChild(target);
    const api = mount(DatePicker, {
      target,
      props: { type: 'month', insetInput: true, defaultOpen: true },
    });
    await tick();
    await new Promise((r) => setTimeout(r, 20));

    const panel = document.querySelector(`.${PREFIX}-panel-yam`);
    expect(panel, '面板根节点应带 -panel-yam').not.toBeNull();
    expect(panel?.getAttribute('x-insetinput'), 'insetInput 时面板应带 x-insetinput=true').toBe(
      'true',
    );
    // `-yam` 覆盖层是 MonthsGrid 的类，不该出现在面板根节点上
    expect(panel?.classList.contains(`${PREFIX}-yam`), '根节点不应带覆盖层类 -yam').toBe(false);

    unmount(api as never);
    target.remove();
  });

  it('insetInput 显式 position 优先于 leftTopOver（对齐 Semi 仅在未指定时兜底）', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const api = mount(DatePicker, {
      target,
      props: { type: 'date', insetInput: true, defaultOpen: true, position: 'bottomLeft' },
    });
    await tick();
    await new Promise((r) => setTimeout(r, 20));

    expect(
      document.querySelector('.cd-popover-wrapper')?.getAttribute('x-placement'),
      '显式传 position 时不应被 leftTopOver 覆盖',
    ).toBe('bottomLeft');

    unmount(api as never);
    target.remove();
  });
});
