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
    expect(container.querySelector('.cd-color-picker__colorDemoBlock')).not.toBeNull();
    expect(container.querySelector('.cd-color-picker__colorPickerInput')).not.toBeNull();
    expect(container.querySelector('.cd-color-picker__formatSelect')).not.toBeNull();
    expect(container.querySelector('.cd-color-picker__colorPickerInputNumber')).not.toBeNull();

    await expectNoAxeViolations(container);
  });

  it('alpha 关闭：无 alpha slider 与 alpha 数字输入', async () => {
    const { container } = renderWithLocale(ColorPicker, {
      props: { value: colorValueFromHex('#112233'), alpha: false },
    });
    expect(container.querySelectorAll('[role="slider"]').length).toBe(2);
    expect(container.querySelector('.cd-color-picker__colorPickerInputNumber')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('usePopover：默认色块 trigger 渲染，无 axe violations', async () => {
    const { container } = renderWithLocale(ColorPicker, {
      props: { value: colorValueFromHex('#39c5bb'), usePopover: true },
    });
    expect(container.querySelector('.cd-color-picker-popover-defaultChildren')).not.toBeNull();
    await expectNoAxeViolations(container);
  });
});
