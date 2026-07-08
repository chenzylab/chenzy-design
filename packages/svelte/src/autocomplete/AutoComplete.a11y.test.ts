// AutoComplete a11y：combobox 文本输入 + 内联 listbox/option 下拉（非 portal）。
// 只断言静态 ARIA + axe，不测真实键盘/焦点（jsdom 限制）。下拉内联在 root 子树，扫 container。
//
// 修复记录：input role="combobox" 现经 ariaLabel/ariaLabelledby prop 或
//   placeholder(非空) / locale AutoComplete.ariaLabel 回退获可访问名，
//   打开态 axe aria-input-field-name 消除。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import AutoComplete from './AutoComplete.svelte';

const data = [
  { label: 'alpha', value: 'alpha' },
  { label: 'alphabet', value: 'alphabet' },
  { label: 'beta', value: 'beta' },
];

describe('AutoComplete a11y', () => {
  it('关闭态：input role=combobox / aria-autocomplete=list，无 axe violations', async () => {
    const { container } = renderWithLocale(AutoComplete, {
      props: { data, placeholder: 'Type to search' },
    });
    const combobox = container.querySelector('[role="combobox"]');
    expect(combobox).not.toBeNull();
    expect(combobox?.getAttribute('aria-autocomplete')).toBe('list');
    expect(combobox?.getAttribute('aria-expanded')).toBe('false');
    await expectNoAxeViolations(container);
  });

  it('打开态：listbox + option 渲染 + aria-controls 指向 listbox（结构断言）', () => {
    const { container } = renderWithLocale(AutoComplete, {
      props: { data, defaultOpen: true, defaultValue: 'a' },
    });
    const combobox = container.querySelector('[role="combobox"]');
    // 浮层经 use:floating portal 到 body，故从 document 查找而非 container。
    const listbox = document.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    expect(document.querySelectorAll('[role="option"]').length).toBeGreaterThan(0);
    expect(combobox?.getAttribute('aria-expanded')).toBe('true');
    // aria-controls 契约不变：combobox 仍指向 portal 后的 listbox id。
    expect(combobox?.getAttribute('aria-controls')).toBe(listbox?.getAttribute('id'));
  });

  // combobox input 可访问名缺省走 locale AutoComplete.ariaLabel（placeholder 此处为空）。
  it('打开态：axe 0 violations（combobox input 经 locale 获可访问名）', async () => {
    const { container } = renderWithLocale(AutoComplete, {
      props: { data, defaultOpen: true, defaultValue: 'a' },
    });
    expect(container.querySelector('[role="combobox"]')?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
