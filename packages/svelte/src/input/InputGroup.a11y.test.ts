// InputGroup a11y：控件区 role=group + label 关联 aria-labelledby；size/disabled 经 context 回退透传。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './InputGroupA11yFixture.svelte';

describe('InputGroup a11y', () => {
  it('无 label：控件区 role=group，两个 input 拼接渲染，无 axe violations', async () => {
    const { container } = renderWithLocale(Fixture, { props: {} });
    const controls = container.querySelector('.cd-inputgroup__controls');
    expect(controls?.getAttribute('role')).toBe('group');
    expect(controls?.getAttribute('aria-labelledby')).toBeNull();
    expect(container.querySelectorAll('.cd-inputgroup__controls input').length).toBe(2);
    await expectNoAxeViolations(container);
  });

  it('有 label：aria-labelledby 指向 label 元素，无 axe violations', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { label: 'Price range' },
    });
    const controls = container.querySelector('.cd-inputgroup__controls');
    const labelledby = controls?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const labelEl = labelledby ? container.querySelector(`#${labelledby}`) : null;
    expect(labelEl?.textContent).toContain('Price range');
    await expectNoAxeViolations(container);
  });

  it('组级 size：经 context 回退透传给子 Input（子控件未显式 size）', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { size: 'large' },
    });
    const inputs = container.querySelectorAll('.cd-input');
    expect(inputs.length).toBe(2);
    inputs.forEach((el) => {
      expect(el.classList.contains('cd-input--large')).toBe(true);
    });
  });

  it('组级 disabled：经 context 回退透传给子 Input', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { disabled: true },
    });
    const inputs = container.querySelectorAll('.cd-input');
    inputs.forEach((el) => {
      expect(el.classList.contains('cd-input--disabled')).toBe(true);
    });
  });
});
