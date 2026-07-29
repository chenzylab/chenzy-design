// ColorPicker a11y（对齐 Semi 重写后）：
// 默认 inline 直接渲染面板，saturation/hue/alpha 三个 role=slider 均带 aria-label + aria-valuenow；
// DataPart 复用 Input/InputNumber/Select/Button，各自携带可访问名。
// usePopover 模式浮层由 Popover 承载（其无障碍在 Popover 自身测试覆盖），此处只验默认色块 trigger。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import { colorValueFromHex } from '@chenzy-design/core';
import ColorPicker from './ColorPicker.svelte';

describe('ColorPicker a11y', () => {
  it('inline：saturation/hue/alpha 三 slider 带 aria-label + aria-valuenow，无 axe violations', async () => {
    const { container } = renderWithLocale(ColorPicker, {
      props: { value: colorValueFromHex('#3370ff'), alpha: true },
    });

    const sliders = container.querySelectorAll('[role="slider"]');
    expect(sliders.length).toBe(3);
    sliders.forEach((s) => {
      expect(s.getAttribute('aria-label')).toBeTruthy();
      expect(s.getAttribute('aria-valuenow')).not.toBeNull();
    });

    // DataPart 渲染：色块 + Input + Select（alpha 时还有 InputNumber）。
    expect(container.querySelector('.cd-color-picker-colordemoblock')).not.toBeNull();
    expect(container.querySelector('.cd-color-picker-colorpickerinput')).not.toBeNull();
    expect(container.querySelector('.cd-color-picker-formatselect')).not.toBeNull();
    expect(container.querySelector('.cd-color-picker-colorpickerinputnumber')).not.toBeNull();

    await expectNoAxeViolations(container);
  });

  it('alpha 关闭：无 alpha slider 与 alpha 数字输入', async () => {
    const { container } = renderWithLocale(ColorPicker, {
      props: { value: colorValueFromHex('#112233'), alpha: false },
    });
    expect(container.querySelectorAll('[role="slider"]').length).toBe(2);
    expect(container.querySelector('.cd-color-picker-colorpickerinputnumber')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('usePopover：默认色块 trigger 渲染，无 axe violations', async () => {
    const { container } = renderWithLocale(ColorPicker, {
      props: { value: colorValueFromHex('#39c5bb'), usePopover: true },
    });
    expect(container.querySelector('.cd-color-picker-popover-defaultchildren')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  // 回归：DataPart 三个控件的定位 class 必须直接挂在子组件根节点上（对齐 Semi 的
  // colorPickerInput / colorPickerInputNumber / formatSelect），不额外包 div——
  // 多包一层会跟随 InputGroup 的 line-height 把 dataPart 从 24px 撑到 28px。
  it('DataPart 定位 class 挂在控件根节点上（不额外包 div，对齐 Semi）', () => {
    const { container } = renderWithLocale(ColorPicker, {
      props: { value: colorValueFromHex('#39c5bb'), alpha: true },
    });
    const group = container.querySelector('.cd-color-picker-inputgroup');
    const input = container.querySelector('.cd-color-picker-colorpickerinput');
    const number = container.querySelector('.cd-color-picker-colorpickerinputnumber');
    const select = container.querySelector('.cd-color-picker-formatselect');
    expect(group?.classList.contains('cd-input-group')).toBe(true);
    expect(input?.classList.contains('cd-input-wrapper')).toBe(true);
    expect(number?.classList.contains('cd-input-number')).toBe(true);
    expect(select?.classList.contains('cd-select')).toBe(true);
  });

  // 回归：`%` 后缀是文本节点不是图标，不能拿 -suffix-icon 的 8px 外边距
  // （对齐 Semi isSemiIcon=false 的第三态：text/icon 变体都不加），否则 58px 的
  // 数字输入格被吃掉 16px，"100" 会被截成 "1"。
  it('alpha 百分比后缀不带 icon 外边距变体（对齐 Semi 第三态）', () => {
    const { container } = renderWithLocale(ColorPicker, {
      props: { value: colorValueFromHex('#39c5bb'), alpha: true },
    });
    const suffix = container.querySelector(
      '.cd-color-picker-colorpickerinputnumber .cd-input-suffix',
    );
    expect(suffix).not.toBeNull();
    expect(suffix?.classList.contains('cd-input-suffix-icon')).toBe(false);
    expect(suffix?.classList.contains('cd-input-suffix-text')).toBe(false);
  });

  // 回归：alpha 关闭时 hex 截断到 7 位（对齐 Semi handleChangeA）。
  it('alpha 关闭时 onChange 回的 hex 不带 alpha 段', () => {
    let got: string | undefined;
    const { container } = renderWithLocale(ColorPicker, {
      props: {
        defaultValue: colorValueFromHex('#39c5bb'),
        alpha: false,
        onChange: (v: { hex: string }) => (got = v.hex),
      },
    });
    const hue = container.querySelector('.cd-color-picker-colorslider') as HTMLElement;
    hue.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(got).toBeDefined();
    expect(got!.length).toBe(7);
  });
});
