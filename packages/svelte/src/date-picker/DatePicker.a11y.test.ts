// DatePicker a11y：触发器（button，默认非 editable）+ role=dialog 面板 + role=grid 日历。
// 只断言静态 ARIA + axe 0 violations，不测真实键盘/焦点（jsdom 限制）。
// 打开态面板 portal 到 document.body，故扫描 document.body。
import { describe, it, expect } from 'vitest';
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
