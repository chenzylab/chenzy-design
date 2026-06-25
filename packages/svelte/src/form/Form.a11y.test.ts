// Form a11y：经 FormA11yFixture 组合 Form.Input + Form.Field 自定义控件。
// 验证 label 关联（<label for> ↔ 控件 id）、required → aria-required、
// validateStatus=error → 控件 aria-invalid、extraText/error → aria-describedby。
// 仅静态 ARIA + axe（不测校验交互）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import FormA11yFixture from './FormA11yFixture.svelte';

describe('Form a11y', () => {
  it('Form.Input：label 经 for/id 关联到 input，required → aria-required', async () => {
    const { container } = renderWithLocale(FormA11yFixture, {});
    const nameField = container.querySelector('[data-field="name"]');
    expect(nameField).not.toBeNull();
    const label = nameField?.querySelector('label');
    const input = nameField?.querySelector('input');
    expect(label).not.toBeNull();
    expect(input).not.toBeNull();
    // label[for] 精确指向控件 id（WAI-ARIA 首选关联）。
    expect(label?.getAttribute('for')).toBe(input?.getAttribute('id'));
    expect(input?.getAttribute('aria-required')).toBe('true');
  });

  it('Form.Field 自定义控件：validateStatus=error → aria-invalid，describedBy 关联存在的元素', async () => {
    const { container } = renderWithLocale(FormA11yFixture, {});
    const bioField = container.querySelector('[data-field="bio"]');
    expect(bioField).not.toBeNull();
    const textarea = bioField?.querySelector('textarea');
    expect(textarea?.getAttribute('aria-invalid')).toBe('true');
    // aria-describedby 指向实际存在的状态文本元素。
    const describedBy = textarea?.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(container.querySelector(`#${describedBy}`)).not.toBeNull();
  });

  it('整个表单：无 axe violations', async () => {
    const { container } = renderWithLocale(FormA11yFixture, {});
    await expectNoAxeViolations(container);
  });
});
