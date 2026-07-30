// TimePicker a11y：触发器复用 Input（aria-haspopup=dialog）+ role=dialog 面板 + 时间列复用
// ScrollList/ScrollItem（-scrolllist-item > ul > li[role=option]）。
// 只断言静态 ARIA + axe 0 violations，不测真实键盘/焦点（jsdom 限制）。
// 打开态面板 portal 到 document.body，故扫描 document.body。
import { describe, it, expect } from 'vitest';
import { tick } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import TimePicker from './TimePicker.svelte';

describe('TimePicker a11y', () => {
  it('关闭态：触发器 Input aria-haspopup=dialog / aria-expanded=false，无 axe violations', async () => {
    const { container } = renderWithLocale(TimePicker, {
      props: { ariaLabelledby: 'lbl' },
    });
    const input = container.querySelector('.cd-time-picker-input input');
    expect(input).not.toBeNull();
    expect(input?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(input?.getAttribute('aria-expanded')).toBe('false');
    await expectNoAxeViolations(container);
  });

  it('timeZone 展示：不同时区独立实例展示按该时区（存储 UTC + 派生展示）', () => {
    // 存储 UTC 固定时刻 2026-01-01T00:00:00Z；timeZone=0 展示墙上 00，timeZone=8 展示 08。
    const utc = new Date('2026-01-01T00:00:00.000Z');
    const r0 = renderWithLocale(TimePicker, { props: { value: utc, timeZone: 0, format: 'HH:mm:ss' } });
    const r8 = renderWithLocale(TimePicker, { props: { value: utc, timeZone: 8, format: 'HH:mm:ss' } });
    const v0 = (r0.container.querySelector('.cd-time-picker-input input') as HTMLInputElement)?.value;
    const v8 = (r8.container.querySelector('.cd-time-picker-input input') as HTMLInputElement)?.value;
    const h0 = Number(v0?.slice(0, 2));
    const h8 = Number(v8?.slice(0, 2));
    expect((h0 + 8) % 24).toBe(h8);
  });

  it('打开态：role=dialog 面板 + listbox/option 列（portal 到 body），无 axe violations', async () => {
    renderWithLocale(TimePicker, {
      props: { defaultOpen: true },
    });
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-label')).toBeTruthy();
    // ScrollItem normal 模式的列：-scrolllist-item > ul[role=listbox]。
    const scrollItems = document.querySelectorAll('.cd-scrolllist-item');
    expect(scrollItems.length).toBeGreaterThan(0);
    const listboxes = document.querySelectorAll('[role="listbox"]');
    expect(listboxes.length).toBeGreaterThan(0);
    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBeGreaterThan(0);
    await expectNoAxeViolations(document.body);
  });

  it('已选值：选中 option aria-selected=true + 触发器 aria-expanded=true', async () => {
    renderWithLocale(TimePicker, {
      props: { defaultOpen: true, defaultValue: '09:30:00' },
    });
    const input = document.querySelector('.cd-time-picker-input input');
    expect(input?.getAttribute('aria-expanded')).toBe('true');
    const selected = document.querySelector('[role="option"][aria-selected="true"]');
    expect(selected).not.toBeNull();
    await expectNoAxeViolations(document.body);
  });

  // disabledTime 接线验证：返回的 disabledHours 应真正让对应小时 option aria-disabled。
  it('disabledTime：返回的 disabledHours 使对应小时选项 aria-disabled', () => {
    renderWithLocale(TimePicker, {
      props: {
        type: 'timeRange',
        defaultOpen: true,
        defaultValue: ['09:30:00', '10:30:00'],
        format: 'HH:mm',
        disabledTime: () => ({ disabledHours: () => [0, 1, 2, 3] }),
      },
    });
    // 左列（begin）的小时列，文本为 '03' 的应被禁用（Combobox 列 class 对齐 Semi -list-hour）。
    const hourCol = document.querySelector('.cd-time-picker-panel-list-hour');
    expect(hourCol, '应存在小时列').not.toBeNull();
    const opts = [...hourCol!.querySelectorAll('[role="option"]')];
    const three = opts.find((el) => el.textContent?.trim() === '03');
    expect(three, '应存在 03 小时选项').not.toBeUndefined();
    expect(three?.getAttribute('aria-disabled')).toBe('true');
    // 未禁用的小时（如 09）应可选。
    const nine = opts.find((el) => el.textContent?.trim() === '09');
    expect(nine?.getAttribute('aria-disabled')).not.toBe('true');
  });

  // timeRange 模式：左右两个 ScrollList 并排（对齐 Semi RANGE_PANEL_LISTS）。
  it('timeRange：面板渲染两个 ScrollList（begin/end 并排）', () => {
    renderWithLocale(TimePicker, {
      props: { type: 'timeRange', defaultOpen: true },
    });
    const lists = document.querySelector('.cd-time-picker-lists');
    expect(lists, '应存在 range 双列容器').not.toBeNull();
    const scrollLists = lists!.querySelectorAll('.cd-scrolllist');
    expect(scrollLists.length).toBe(2);
  });

  // 面板首次打开后常驻 DOM，受控关闭仅 hidden（对齐 Semi Popover 惰性挂载）。
  it('曾打开过 + 受控关闭：面板 DOM 保留且 hidden', () => {
    renderWithLocale(TimePicker, {
      props: { open: false, defaultOpen: true },
    });
    const panel = document.querySelector('.cd-time-picker-panel');
    expect(panel, '曾打开过的面板应仍在 DOM').not.toBeNull();
    expect(panel?.hasAttribute('hidden')).toBe(true);
  });

  // 从未打开过：面板不挂载。
  it('从未打开：面板不在 DOM', () => {
    renderWithLocale(TimePicker, { props: { open: false } });
    expect(document.querySelector('.cd-time-picker-panel')).toBeNull();
  });

  // invalid 校验态（对齐 Semi）：手输非法时间串 → 触发器标记 error。
  it('手输非法时间：触发器进入 error 校验态（invalid）', async () => {
    const { container } = renderWithLocale(TimePicker, {
      props: { format: 'HH:mm:ss' },
    });
    const input = container.querySelector('.cd-time-picker-input input') as HTMLInputElement;
    // 输入非法串 + 失焦（触发 parseAndCommit）。
    input.value = 'not-a-time';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    await tick();
    // error 态：Input wrapper 带 error 类（本库 Input validateStatus=error 的表现）。
    const errored =
      container.querySelector('[class*="error"]') ??
      container.querySelector('.cd-time-picker-input [aria-invalid="true"]');
    expect(errored, '非法输入应进入 error 校验态').not.toBeNull();
  });
});
