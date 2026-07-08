// TimePicker a11y：触发器（button）+ role=dialog 面板 + 时/分 role=listbox/option 列。
// 只断言静态 ARIA + axe 0 violations，不测真实键盘/焦点（jsdom 限制）。
// 打开态面板 portal 到 document.body，故扫描 document.body。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import TimePicker from './TimePicker.svelte';

describe('TimePicker a11y', () => {
  it('关闭态：触发器 aria-haspopup=dialog / aria-expanded=false，无 axe violations', async () => {
    const { container } = renderWithLocale(TimePicker, {
      props: { ariaLabel: 'Meeting time' },
    });
    const trigger = container.querySelector('.cd-time-picker__trigger');
    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(trigger?.getAttribute('aria-label')).toBe('Meeting time');
    await expectNoAxeViolations(container);
  });

  it('打开态：role=dialog 面板 + listbox/option 列（portal 到 body），无 axe violations', async () => {
    renderWithLocale(TimePicker, {
      props: { defaultOpen: true, ariaLabel: 'Meeting time' },
    });
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-label')).toBeTruthy();
    const listboxes = document.querySelectorAll('[role="listbox"]');
    expect(listboxes.length).toBeGreaterThan(0);
    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBeGreaterThan(0);
    await expectNoAxeViolations(document.body);
  });

  it('已选值：选中 option aria-selected=true + 触发器 aria-expanded=true', async () => {
    renderWithLocale(TimePicker, {
      props: { defaultOpen: true, defaultValue: '09:30:00', ariaLabel: 'Meeting time' },
    });
    const trigger = document.querySelector('.cd-time-picker__trigger');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    const selected = document.querySelector('[role="option"][aria-selected="true"]');
    expect(selected).not.toBeNull();
    await expectNoAxeViolations(document.body);
  });

  // disabledTime 接线验证：返回的 disabledHours 应真正让对应小时 option aria-disabled。
  it('disabledTime：返回的 disabledHours 使对应小时选项 aria-disabled', () => {
    renderWithLocale(TimePicker, {
      props: {
        defaultOpen: true,
        defaultValue: '09:30:00',
        format: 'HH:mm',
        disabledTime: () => ({ disabledHours: () => [0, 1, 2, 3] }),
        ariaLabel: 'Meeting time',
      },
    });
    // 第一列（小时）的 option，文本为 '03' 的应被禁用。
    const hourCol = document.querySelectorAll('[role="listbox"]')[0];
    expect(hourCol, '应存在小时列 listbox').not.toBeUndefined();
    const opts = [...hourCol!.querySelectorAll('[role="option"]')];
    const three = opts.find((el) => el.textContent?.trim() === '03');
    expect(three, '应存在 03 小时选项').not.toBeUndefined();
    expect(three?.getAttribute('aria-disabled')).toBe('true');
    // 未禁用的小时（如 09）应可选。
    const nine = opts.find((el) => el.textContent?.trim() === '09');
    expect(nine?.getAttribute('aria-disabled')).not.toBe('true');
  });

  // showNow=false 隐藏「此刻」按钮。
  it('showNow=false：不渲染「此刻」按钮', () => {
    renderWithLocale(TimePicker, { props: { defaultOpen: true, showNow: false } });
    expect(document.querySelector('.cd-time-picker__now')).toBeNull();
    // 确认按钮容器仍在（确定按钮还在），只是 now 没了。
    expect(document.querySelector('.cd-time-picker__ok')).not.toBeNull();
  });

  it('showNow 默认：渲染「此刻」按钮', () => {
    renderWithLocale(TimePicker, { props: { defaultOpen: true } });
    expect(document.querySelector('.cd-time-picker__now')).not.toBeNull();
  });

  // destroyOnClose=false + 曾打开过（defaultOpen 让 hasOpened 初值 true）+ 受控 open=false：
  // 面板保留 DOM 但 hidden。用静态初始 props 直接命中保留态，不依赖 rerender。
  it('destroyOnClose=false：曾打开过 + 受控关闭，面板 DOM 保留且 hidden', () => {
    renderWithLocale(TimePicker, {
      props: { open: false, defaultOpen: true, destroyOnClose: false, ariaLabel: 'T' },
    });
    const panel = document.querySelector('.cd-time-picker__panel');
    expect(panel, '保留模式下曾打开过的面板应仍在 DOM').not.toBeNull();
    expect(panel?.hasAttribute('hidden')).toBe(true);
  });

  // destroyOnClose=true（默认）+ 曾打开过 + 受控 open=false：面板不在 DOM（关闭即卸载）。
  it('destroyOnClose=true（默认）：受控关闭后面板从 DOM 移除', () => {
    renderWithLocale(TimePicker, {
      props: { open: false, defaultOpen: true, ariaLabel: 'T' },
    });
    expect(document.querySelector('.cd-time-picker__panel')).toBeNull();
  });
});
