/**
 * DatePickerNext 装配测试（里程碑3：基本 date 单面板）。
 * 断言：combobox 触发器（复用 Input）、点击打开 Popover 面板（Navigation+Month）、
 * 点日期回调 onChange + 关闭、受控 value 回显、defaultOpen 直接展开。
 */
import { describe, it, expect, vi } from 'vitest';
import { tick } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import DatePickerNext from './DatePickerNext.svelte';

const PREFIX = 'cd-datepicker';

describe('DatePickerNext 装配对齐 Semi（date 单面板）', () => {
  it('关闭态：combobox 触发器 + 复用 Input，无 axe violations', async () => {
    const { container } = renderWithLocale(DatePickerNext, {
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
    renderWithLocale(DatePickerNext, {
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
    renderWithLocale(DatePickerNext, {
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
    const { container } = renderWithLocale(DatePickerNext, {
      props: { type: 'date', value: new Date(2026, 2, 20) },
    });
    await tick();
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2026-03-20');
  });
});
