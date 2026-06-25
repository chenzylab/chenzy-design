// RadioGroup a11y：role="radiogroup" 容器 + 多个 radio 选项（原生 input）。
// 只断言静态 ARIA + axe 0 violations，不测方向键 roving（jsdom 限制）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import RadioGroup from './RadioGroup.svelte';

const OPTIONS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
];

describe('RadioGroup a11y', () => {
  it('默认：role=radiogroup + ariaLabel + 多选项渲染，无 axe violations', async () => {
    const { container } = renderWithLocale(RadioGroup, {
      props: { ariaLabel: 'Fruit', options: OPTIONS },
    });
    const group = container.querySelector('[role="radiogroup"]');
    expect(group?.getAttribute('aria-label')).toBe('Fruit');

    const radios = container.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBe(3);
    await expectNoAxeViolations(container);
  });

  it('选中态：value 命中的 radio 为 checked', async () => {
    const { container } = renderWithLocale(RadioGroup, {
      props: { ariaLabel: 'Fruit', options: OPTIONS, value: 'banana' },
    });
    const checked = container.querySelector('input[type="radio"]:checked') as HTMLInputElement | null;
    expect(checked?.value).toBe('banana');
    await expectNoAxeViolations(container);
  });

  it('禁用项：对应 radio 为 disabled', async () => {
    const { container } = renderWithLocale(RadioGroup, {
      props: { ariaLabel: 'Fruit', options: OPTIONS },
    });
    const disabled = container.querySelectorAll('input[type="radio"]:disabled');
    expect(disabled.length).toBe(1);
    await expectNoAxeViolations(container);
  });
});
