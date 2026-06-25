// ColorPicker a11y：inline 面板 role=group；saturation/hue/alpha 滑块 role=slider；
// presets role=listbox/option；trigger 模式按钮 aria-haspopup/aria-expanded，需 ariaLabel 提供可访问名。
// 浮层不 portal，渲染在 root 容器内，故扫 container（参照 Modal 但无需扫 body）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import ColorPicker from './ColorPicker.svelte';

describe('ColorPicker a11y', () => {
  it('inline：role=group 面板 + 滑块 role=slider + presets listbox/option，无 axe violations', async () => {
    const { container } = renderWithLocale(ColorPicker, {
      props: { inline: true, defaultValue: '#3370ff', alpha: true, presets: ['#ff0000', '#00ff00'] },
    });
    const panel = container.querySelector('[role="group"]');
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute('aria-label')).toBeTruthy();

    // saturation / hue / alpha 三个 slider，均有 aria-label + aria-valuenow。
    const sliders = container.querySelectorAll('[role="slider"]');
    expect(sliders.length).toBeGreaterThanOrEqual(3);
    sliders.forEach((s) => {
      expect(s.getAttribute('aria-label')).toBeTruthy();
      expect(s.getAttribute('aria-valuenow')).not.toBeNull();
    });

    // presets：listbox + option，可访问名/选中态。
    const listbox = container.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    expect(listbox?.getAttribute('aria-label')).toBeTruthy();
    const options = container.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0]?.getAttribute('aria-label')).toBeTruthy();

    await expectNoAxeViolations(container);
  });

  it('trigger 模式（关闭态）：trigger 按钮 aria-haspopup=dialog / aria-expanded=false / ariaLabel 可访问名', async () => {
    const { container } = renderWithLocale(ColorPicker, {
      props: { ariaLabel: 'Pick brand color', defaultValue: '#3370ff' },
    });
    const trigger = container.querySelector('.cd-color-picker__trigger');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(trigger?.getAttribute('aria-label')).toBe('Pick brand color');
    await expectNoAxeViolations(container);
  });

  it('trigger 模式（打开态）：role=dialog 面板渲染于容器内，aria-expanded=true，无 axe violations', async () => {
    const { container } = renderWithLocale(ColorPicker, {
      props: { ariaLabel: 'Background color', open: true, defaultValue: '#112233' },
    });
    const trigger = container.querySelector('.cd-color-picker__trigger');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    // 浮层非 portal：直接在 root 容器内查询。
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-label')).toBe('Background color');
    expect(container.querySelectorAll('[role="slider"]').length).toBeGreaterThanOrEqual(2);
    await expectNoAxeViolations(container);
  });
});
