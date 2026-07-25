/**
 * Combobox（时间列面板）测试 —— 对齐 Semi timePicker/Combobox.tsx。
 * 时分秒列渲染、选时/分/秒触发 onChange(timeStampValue)、12h ampm 列、hideDisabledOptions、disabled 项。
 */
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Combobox from './Combobox.svelte';

const PREFIX = 'cd-time-picker';

describe('Combobox 时间列面板对齐 Semi', () => {
  it('HH:mm:ss：三列 listbox（时/分/秒），无 axe violations', async () => {
    const { container } = renderWithLocale(Combobox, {
      props: { timeStampValue: new Date(2026, 0, 1, 10, 30, 45).getTime(), format: 'HH:mm:ss' },
    });
    expect(container.querySelector(`.${PREFIX}-list-hour`)).not.toBeNull();
    expect(container.querySelector(`.${PREFIX}-list-minute`)).not.toBeNull();
    expect(container.querySelector(`.${PREFIX}-list-second`)).not.toBeNull();
    expect(container.querySelectorAll('ul[role="listbox"]').length).toBe(3);
    await expectNoAxeViolations(container);
  });

  it('HH:mm：只两列（无秒）', () => {
    const { container } = renderWithLocale(Combobox, {
      props: { timeStampValue: new Date(2026, 0, 1, 10, 30).getTime(), format: 'HH:mm' },
    });
    expect(container.querySelector(`.${PREFIX}-list-second`)).toBeNull();
    expect(container.querySelectorAll('ul[role="listbox"]').length).toBe(2);
  });

  it('选小时触发 onChange（timeStampValue 反映新小时）', () => {
    const onChange = vi.fn();
    const { container } = renderWithLocale(Combobox, {
      props: {
        timeStampValue: new Date(2026, 0, 1, 10, 30, 45).getTime(),
        format: 'HH:mm:ss',
        onChange,
      },
    });
    // hour 列第 8 项（08 时）。
    const hourList = container.querySelector(`.${PREFIX}-list-hour`)!;
    (hourList.querySelectorAll('li[role="option"]')[8] as HTMLElement).click();
    expect(onChange).toHaveBeenCalled();
    const ts = onChange.mock.calls[0]![0].timeStampValue as number;
    expect(new Date(ts).getHours()).toBe(8);
    // 分秒保持。
    expect(new Date(ts).getMinutes()).toBe(30);
  });

  it('use12Hours：额外 ampm 列（4 列），hour 列 12 制', () => {
    const { container } = renderWithLocale(Combobox, {
      props: {
        timeStampValue: new Date(2026, 0, 1, 14, 30, 45).getTime(),
        format: 'hh:mm:ss a',
        use12Hours: true,
        isAM: false,
      },
    });
    expect(container.querySelector(`.${PREFIX}-list-ampm`)).not.toBeNull();
    expect(container.querySelectorAll('ul[role="listbox"]').length).toBe(4);
  });

  it('disabledHours：命中小时 option 标记禁用', () => {
    const { container } = renderWithLocale(Combobox, {
      props: {
        timeStampValue: new Date(2026, 0, 1, 10, 0, 0).getTime(),
        format: 'HH:mm:ss',
        disabledHours: () => [0, 1, 2],
      },
    });
    const hourList = container.querySelector(`.${PREFIX}-list-hour`)!;
    const disabled = hourList.querySelectorAll('li.cd-scrolllist-item-disabled');
    expect(disabled.length).toBeGreaterThanOrEqual(3);
  });

  it('hideDisabledOptions：禁用项从列表移除', () => {
    const { container } = renderWithLocale(Combobox, {
      props: {
        timeStampValue: new Date(2026, 0, 1, 10, 0, 0).getTime(),
        format: 'HH:mm:ss',
        disabledHours: () => [0, 1, 2],
        hideDisabledOptions: true,
      },
    });
    const hourList = container.querySelector(`.${PREFIX}-list-hour`)!;
    // 24 - 3 = 21 项。
    expect(hourList.querySelectorAll('li[role="option"]').length).toBe(21);
  });
});
