// CheckboxGroup a11y：role="group" 容器 + 多个 checkbox 选项（原生 input）。
// 只断言静态 ARIA + axe 0 violations，不测键盘（jsdom 限制）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import CheckboxGroup from './CheckboxGroup.svelte';

const OPTIONS = [
  { label: 'Read', value: 'read' },
  { label: 'Write', value: 'write' },
  { label: 'Delete', value: 'delete', disabled: true },
];

describe('CheckboxGroup a11y', () => {
  it('默认：role=group + ariaLabel + 多选项渲染，无 axe violations', async () => {
    const { container } = renderWithLocale(CheckboxGroup, {
      props: { ariaLabel: 'Permissions', options: OPTIONS },
    });
    const group = container.querySelector('[role="group"]');
    expect(group?.getAttribute('aria-label')).toBe('Permissions');

    const boxes = container.querySelectorAll('input[type="checkbox"]');
    expect(boxes.length).toBe(3);
    await expectNoAxeViolations(container);
  });

  it('选中态：value 命中的 checkbox 为 checked', async () => {
    const { container } = renderWithLocale(CheckboxGroup, {
      props: { ariaLabel: 'Permissions', options: OPTIONS, value: ['read', 'write'] },
    });
    const checked = container.querySelectorAll('input[type="checkbox"]:checked');
    expect(checked.length).toBe(2);
    await expectNoAxeViolations(container);
  });

  it('禁用项：对应 checkbox 为 disabled', async () => {
    const { container } = renderWithLocale(CheckboxGroup, {
      props: { ariaLabel: 'Permissions', options: OPTIONS },
    });
    const disabled = container.querySelectorAll('input[type="checkbox"]:disabled');
    expect(disabled.length).toBe(1);
    await expectNoAxeViolations(container);
  });
});
