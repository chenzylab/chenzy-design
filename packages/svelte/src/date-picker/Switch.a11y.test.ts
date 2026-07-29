/**
 * Switch 测试 —— 对齐 Semi monthsGrid.tsx renderSwitch。
 * 两段 role=button（date/time）、active 归属随 isTimePickerOpen、图标随 density、
 * disabledTimePicker 禁用 time 段、点击回调。
 */
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Switch from './Switch.svelte';

const PREFIX = 'cd-datepicker';
const showDate = new Date(2026, 0, 15, 14, 30, 45);

describe('Switch 对齐 Semi', () => {
  it('date/time 两段 role=button + 文案，date 默认 active，无 axe violations', async () => {
    const { container } = renderWithLocale(Switch, { props: { showDate } });
    const dateBtn = container.querySelector(`.${PREFIX}-switch-date`);
    const timeBtn = container.querySelector(`.${PREFIX}-switch-time`);
    expect(dateBtn?.getAttribute('role')).toBe('button');
    expect(timeBtn?.getAttribute('role')).toBe('button');
    // date 视图默认 active。
    expect(dateBtn?.classList.contains(`${PREFIX}-switch-date-active`)).toBe(true);
    expect(timeBtn?.classList.contains(`${PREFIX}-switch-date-active`)).toBe(false);
    // 日期文案走语言相关 FORMAT_SWITCH_DATE：英文 MM/dd/yyyy（renderWithLocale 默认 en_US）。
    // 时间文案格式与语言无关（对齐 Semi 注释 "Timepicker format is constant"）。
    expect(dateBtn?.textContent).toContain('01/15/2026');
    expect(timeBtn?.textContent).toContain('14:30:45');
    await expectNoAxeViolations(container);
  });

  it('日期文案按语言切换格式（对齐 Semi locale.localeFormatToken.FORMAT_SWITCH_DATE）', () => {
    const en = renderWithLocale(Switch, { props: { showDate }, locale: 'en-US' });
    expect(en.container.querySelector(`.${PREFIX}-switch-date`)?.textContent).toContain(
      '01/15/2026',
    );
    const zh = renderWithLocale(Switch, { props: { showDate }, locale: 'zh-CN' });
    expect(zh.container.querySelector(`.${PREFIX}-switch-date`)?.textContent).toContain(
      '2026-01-15',
    );
  });

  it('isTimePickerOpen=true 时 active 移到 time 段', () => {
    const { container } = renderWithLocale(Switch, {
      props: { showDate, isTimePickerOpen: true },
    });
    expect(
      container.querySelector(`.${PREFIX}-switch-time`)?.classList.contains(`${PREFIX}-switch-date-active`),
    ).toBe(true);
    expect(
      container.querySelector(`.${PREFIX}-switch-date`)?.classList.contains(`${PREFIX}-switch-date-active`),
    ).toBe(false);
  });

  it('density=compact 无图标；default 有图标', () => {
    const { container: compact } = renderWithLocale(Switch, {
      props: { showDate, density: 'compact' },
    });
    expect(compact.querySelector(`.${PREFIX}-switch .cd-icon`)).toBeNull();
    const { container: def } = renderWithLocale(Switch, { props: { showDate, density: 'default' } });
    expect(def.querySelector(`.${PREFIX}-switch .cd-icon`)).not.toBeNull();
  });

  it('点击 date/time 段触发回调；disabledTimePicker 时 time 不触发', () => {
    const onShowDatePanel = vi.fn();
    const onShowTimePicker = vi.fn();
    const { container } = renderWithLocale(Switch, {
      props: { showDate, onShowDatePanel, onShowTimePicker },
    });
    (container.querySelector(`.${PREFIX}-switch-date`) as HTMLElement).click();
    (container.querySelector(`.${PREFIX}-switch-time`) as HTMLElement).click();
    expect(onShowDatePanel).toHaveBeenCalledTimes(1);
    expect(onShowTimePicker).toHaveBeenCalledTimes(1);

    const onTime2 = vi.fn();
    const { container: c2 } = renderWithLocale(Switch, {
      props: { showDate, disabledTimePicker: true, onShowTimePicker: onTime2 },
    });
    (c2.querySelector(`.${PREFIX}-switch-time`) as HTMLElement).click();
    expect(onTime2).not.toHaveBeenCalled();
    expect(c2.querySelector(`.${PREFIX}-switch-time-disabled`)).not.toBeNull();
  });
});
