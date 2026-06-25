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
});
