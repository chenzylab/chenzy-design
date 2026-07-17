// TimePicker a11y：触发器复用 Input（aria-haspopup=dialog）+ role=dialog 面板 + 时间列复用
// ScrollList/ScrollItem（-scrolllist-item > ul > li[role=option]）。
// 只断言静态 ARIA + axe 0 violations，不测真实键盘/焦点（jsdom 限制）。
// 打开态面板 portal 到 document.body，故扫描 document.body。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import TimePicker from './TimePicker.svelte';

describe('TimePicker a11y', () => {
  it('关闭态：触发器 Input aria-haspopup=dialog / aria-expanded=false，无 axe violations', async () => {
    const { container } = renderWithLocale(TimePicker, {
      props: { ariaLabelledby: 'lbl' },
    });
    const input = container.querySelector('.cd-time-picker__input input');
    expect(input).not.toBeNull();
    expect(input?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(input?.getAttribute('aria-expanded')).toBe('false');
    await expectNoAxeViolations(container);
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
    const input = document.querySelector('.cd-time-picker__input input');
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
    // 左列（begin）的小时列，文本为 '03' 的应被禁用。
    const hourCol = document.querySelector('.cd-time-picker__panel-list-hour');
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
    const lists = document.querySelector('.cd-time-picker__lists');
    expect(lists, '应存在 range 双列容器').not.toBeNull();
    const scrollLists = lists!.querySelectorAll('.cd-scrolllist');
    expect(scrollLists.length).toBe(2);
  });

  // 面板首次打开后常驻 DOM，受控关闭仅 hidden（对齐 Semi Popover 惰性挂载）。
  it('曾打开过 + 受控关闭：面板 DOM 保留且 hidden', () => {
    renderWithLocale(TimePicker, {
      props: { open: false, defaultOpen: true },
    });
    const panel = document.querySelector('.cd-time-picker__panel');
    expect(panel, '曾打开过的面板应仍在 DOM').not.toBeNull();
    expect(panel?.hasAttribute('hidden')).toBe(true);
  });

  // 从未打开过：面板不挂载。
  it('从未打开：面板不在 DOM', () => {
    renderWithLocale(TimePicker, { props: { open: false } });
    expect(document.querySelector('.cd-time-picker__panel')).toBeNull();
  });
});
