// Slider a11y：role="group" 容器 + 每个手柄 role="slider"（aria-valuemin/max/now）。
// 只断言静态 ARIA + axe 0 violations，不测拖拽/键盘（jsdom 限制）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Slider from './Slider.svelte';

describe('Slider a11y', () => {
  it('默认单值：group 容器 + role=slider 手柄（aria-valuemin/max/now），无 axe violations', async () => {
    const { container } = renderWithLocale(Slider, {
      props: { ariaLabel: 'Volume', value: 30 },
    });
    const group = container.querySelector('[role="group"]');
    expect(group?.getAttribute('aria-label')).toBe('Volume');

    const handle = container.querySelector('[role="slider"]');
    expect(handle).not.toBeNull();
    expect(handle?.getAttribute('aria-valuemin')).toBe('0');
    expect(handle?.getAttribute('aria-valuemax')).toBe('100');
    expect(handle?.getAttribute('aria-valuenow')).toBe('30');
    await expectNoAxeViolations(container);
  });

  it('range：两个 slider 手柄，各自 aria-valuenow', async () => {
    const { container } = renderWithLocale(Slider, {
      props: { ariaLabel: 'Price range', range: true, value: [20, 60] },
    });
    const handles = container.querySelectorAll('[role="slider"]');
    expect(handles.length).toBe(2);
    expect(handles[0]?.getAttribute('aria-valuenow')).toBe('20');
    expect(handles[1]?.getAttribute('aria-valuenow')).toBe('60');
    await expectNoAxeViolations(container);
  });

  it('禁用：aria-disabled=true，无 axe violations', async () => {
    const { container } = renderWithLocale(Slider, {
      props: { ariaLabel: 'Brightness', value: 50, disabled: true },
    });
    const group = container.querySelector('[role="group"]');
    expect(group?.getAttribute('aria-disabled')).toBe('true');
    const handle = container.querySelector('[role="slider"]');
    expect(handle?.getAttribute('aria-disabled')).toBe('true');
    await expectNoAxeViolations(container);
  });
});
