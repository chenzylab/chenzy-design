// TimePicker 对齐 Semi 的回归测试（文档整页对齐轮次新增）。
// 覆盖：use12Hours 未显式传 format 时的默认格式分派（Semi getDefaultFormatIfNeed）、
// panelHeader/panelFooter 数组按面板分派（Semi createPanelProps）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import TimePicker from './TimePicker.svelte';

function triggerValue(container: HTMLElement): string {
  return (container.querySelector('.cd-time-picker__input input') as HTMLInputElement)?.value ?? '';
}

describe('TimePicker 对齐 Semi', () => {
  it('use12Hours 未显式传 format：默认格式为 a h:mm:ss（对齐 Semi DEFAULT_FORMAT_A）', () => {
    const { container } = renderWithLocale(TimePicker, {
      props: { use12Hours: true, defaultValue: '13:24:35' },
    });
    // Semi：a h:mm:ss → 「下午 1:24:35」（locale 决定 a 的文案），关键是不出现 24h 的 13
    const v = triggerValue(container);
    expect(v).not.toContain('13:24:35');
    expect(v).toMatch(/1:24:35/);
  });

  it('use12Hours 显式传 format：以传入 format 为准（不被默认覆盖）', () => {
    const { container } = renderWithLocale(TimePicker, {
      props: { use12Hours: true, format: 'a h:mm', defaultValue: '13:24:35' },
    });
    const v = triggerValue(container);
    expect(v).toMatch(/1:24$/);
  });

  it('不传 use12Hours：默认格式仍为 HH:mm:ss', () => {
    const { container } = renderWithLocale(TimePicker, {
      props: { defaultValue: '13:24:35' },
    });
    expect(triggerValue(container)).toBe('13:24:35');
  });

  it('英文：选中项只显示数字，不带 Hour/Minute/Second 后缀（对齐 Semi en_US hour/minute/second 为空串）', () => {
    renderWithLocale(TimePicker, {
      props: { defaultOpen: true, defaultValue: '08:34:14', format: 'HH:mm:ss' },
      locale: 'en-US',
    });
    const selected = [...document.querySelectorAll('.cd-scrolllist-item-sel')].map((el) =>
      el.textContent?.trim(),
    );
    expect(selected).toEqual(['08', '34', '14']);
  });

  it('中文：选中项带 时/分/秒 后缀（对齐 Semi zh_CN）', () => {
    renderWithLocale(TimePicker, {
      props: { defaultOpen: true, defaultValue: '08:34:14', format: 'HH:mm:ss' },
      locale: 'zh-CN',
    });
    const selected = [...document.querySelectorAll('.cd-scrolllist-item-sel')].map((el) =>
      el.textContent?.trim(),
    );
    expect(selected).toEqual(['08时', '34分', '14秒']);
  });

  it('列 aria-label 与后缀单位解耦：英文后缀为空但列仍有 Hour/Minute/Second 无障碍名', () => {
    renderWithLocale(TimePicker, {
      props: { defaultOpen: true, defaultValue: '08:34:14', format: 'HH:mm:ss' },
      locale: 'en-US',
    });
    const labels = [...document.querySelectorAll('[role="listbox"]')].map((el) =>
      el.getAttribute('aria-label'),
    );
    expect(labels).toContain('Hour');
    expect(labels).toContain('Minute');
    expect(labels).toContain('Second');
  });

  it('中文 12h：触发器 a 渲染为「下午」而非 pm（对齐 Semi locale bundle 自带 dateFnsLocale）', () => {
    const { container } = renderWithLocale(TimePicker, {
      props: { use12Hours: true, defaultValue: '13:24:35' },
      locale: 'zh-CN',
    });
    const v = triggerValue(container);
    expect(v).toContain('下午');
    expect(v).not.toContain('pm');
  });

  it('英文 12h：触发器 a 渲染为 PM（date-fns enUS）', () => {
    const { container } = renderWithLocale(TimePicker, {
      props: { use12Hours: true, defaultValue: '13:24:35' },
      locale: 'en-US',
    });
    expect(triggerValue(container)).toMatch(/PM/i);
  });

  it('use12Hours 面板出现 AM/PM 列（对齐 Semi renderAmPmSelect）', () => {
    renderWithLocale(TimePicker, { props: { use12Hours: true, defaultOpen: true } });
    expect(document.querySelector('.cd-time-picker-panel-list-ampm')).not.toBeNull();
  });

  it('scrollItemProps 覆盖列默认 mode（对齐 Semi 在 mode 之后 spread）', () => {
    renderWithLocale(TimePicker, {
      props: { defaultOpen: true, scrollItemProps: { mode: 'wheel', cycled: true } },
    });
    // wheel 模式下 ScrollItem 渲染 -item-wheel（normal 模式则无）。
    expect(document.querySelector('.cd-scrolllist-item-wheel')).not.toBeNull();
  });

  it('timeRange 触发器按 rangeSeparator 拼接两端（对齐 Semi DEFAULT_RANGE_SEPARATOR）', () => {
    const { container } = renderWithLocale(TimePicker, {
      props: { type: 'timeRange', defaultValue: ['10:23:15', '12:38:32'], format: 'HH:mm:ss' },
    });
    expect(triggerValue(container)).toBe('10:23:15 ~ 12:38:32');
  });

  it('disabledTime 第一参是已选值数组，右面板据起点禁用（对齐 Semi getDisabledTimeFns 传 dates）', () => {
    // 起点 03:00 已选 → 右面板小时 0/1/2 应禁用。
    renderWithLocale(TimePicker, {
      props: {
        type: 'timeRange',
        defaultOpen: true,
        defaultValue: ['03:00:00', null],
        format: 'HH:mm:ss',
        disabledTime: (dates: Date[], panelType?: 'left' | 'right') => {
          const start = dates[0];
          if (panelType === 'right' && start instanceof Date) {
            const h = start.getHours();
            return { disabledHours: () => Array.from({ length: h }, (_, i) => i) };
          }
          return {};
        },
      },
    });
    const hourCols = document.querySelectorAll('.cd-time-picker-panel-list-hour');
    expect(hourCols.length).toBe(2);
    const rightDisabled = [...hourCols[1]!.querySelectorAll('li')].filter(
      (li) => li.getAttribute('aria-disabled') === 'true',
    );
    expect(rightDisabled.length).toBe(3);
    // 左面板不受影响（disabledTime 对 left 返回空对象）。
    const leftDisabled = [...hourCols[0]!.querySelectorAll('li')].filter(
      (li) => li.getAttribute('aria-disabled') === 'true',
    );
    expect(leftDisabled.length).toBe(0);
  });

  it('单选模式不调用 disabledTime（对齐 Semi 仅 range 生效）', () => {
    const calls: unknown[] = [];
    renderWithLocale(TimePicker, {
      props: {
        defaultOpen: true,
        disabledTime: (...args: unknown[]) => {
          calls.push(args);
          return { disabledHours: () => [0, 1, 2] };
        },
      },
    });
    expect(calls.length).toBe(0);
  });

  it('range 模式 panelHeader 传数组：左右面板分别取 [0]/[1]（对齐 Semi createPanelProps）', () => {
    renderWithLocale(TimePicker, {
      props: {
        type: 'timeRange',
        defaultOpen: true,
        panelHeader: ['start header', 'end header'],
      },
    });
    const headers = [...document.querySelectorAll('.cd-scrolllist-header')].map((el) =>
      el.textContent?.trim(),
    );
    expect(headers).toContain('start header');
    expect(headers).toContain('end header');
  });

  it('range 模式 panelFooter 传数组：左右面板分别取 [0]/[1]', () => {
    renderWithLocale(TimePicker, {
      props: {
        type: 'timeRange',
        defaultOpen: true,
        panelFooter: ['start footer', 'end footer'],
      },
    });
    const footers = [...document.querySelectorAll('.cd-scrolllist-footer')].map((el) =>
      el.textContent?.trim(),
    );
    expect(footers).toContain('start footer');
    expect(footers).toContain('end footer');
  });
});
