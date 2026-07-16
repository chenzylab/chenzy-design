// InputNumber a11y：role=spinbutton + aria-valuenow/min/max；步进按钮 locale 可访问名。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import InputNumber from './InputNumber.svelte';

describe('InputNumber a11y', () => {
  it('默认渲染：role=spinbutton + aria-valuenow/min/max，ariaLabel 提供可访问名', async () => {
    const { container } = renderWithLocale(InputNumber, {
      props: { ariaLabel: 'Quantity', defaultValue: 5, min: 0, max: 10 },
    });
    const spin = container.querySelector('[role="spinbutton"]');
    expect(spin).not.toBeNull();
    expect(spin?.getAttribute('aria-label')).toBe('Quantity');
    expect(spin?.getAttribute('aria-valuenow')).toBe('5');
    expect(spin?.getAttribute('aria-valuemin')).toBe('0');
    expect(spin?.getAttribute('aria-valuemax')).toBe('10');
    // 步进按钮可访问名来自 en_US locale（InputNumber.increase / decrease）。
    const inc = container.querySelector('.cd-input-number-button-up');
    const dec = container.querySelector('.cd-input-number-button-down');
    expect(inc?.getAttribute('aria-label')).toBeTruthy();
    expect(inc?.getAttribute('aria-label')).not.toBe('InputNumber.increase');
    expect(dec?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('error 状态：aria-invalid=true', async () => {
    const { container } = renderWithLocale(InputNumber, {
      props: { ariaLabel: 'Amount', validateStatus: 'error' },
    });
    const spin = container.querySelector('[role="spinbutton"]');
    expect(spin?.getAttribute('aria-invalid')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('readonly + hideButtons：aria-readonly，无 axe violations', async () => {
    const { container } = renderWithLocale(InputNumber, {
      props: { ariaLabel: 'Score', defaultValue: 7, readonly: true, hideButtons: true },
    });
    const spin = container.querySelector('[role="spinbutton"]');
    expect(spin?.getAttribute('aria-readonly')).toBe('true');
    await expectNoAxeViolations(container);
  });
});
