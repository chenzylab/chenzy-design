// Select a11y：combobox 触发器 + listbox/option 浮层（use:floating portal 到 body）。
// 只断言静态 ARIA + axe，不测真实键盘/焦点（jsdom 限制）。
//
// 修复记录：根 `<div role="combobox">` 现经 ariaLabel/ariaLabelledby prop 或
//   placeholder / locale Select.ariaLabel 回退获可访问名，axe aria-input-field-name 消除。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Select from './Select.svelte';

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

describe('Select a11y', () => {
  it('关闭态：触发器 role=combobox / aria-expanded=false / aria-haspopup=listbox（结构断言）', () => {
    const { container } = renderWithLocale(Select, {
      props: { options, placeholder: 'Pick a fruit' },
    });
    const combobox = container.querySelector('[role="combobox"]');
    expect(combobox).not.toBeNull();
    expect(combobox?.getAttribute('aria-expanded')).toBe('false');
    expect(combobox?.getAttribute('aria-haspopup')).toBe('listbox');
    // destroyOnClose=false（默认）关闭态浮层保持挂载，须带 [hidden] 隐藏。
    // 回归防护：.cd-select__dropdown 的 display:flex 曾压过 [hidden] 的 UA display:none，
    // 导致浮层常驻可见（如 Pagination size-changer 弹层关不掉），已用属性选择器修复。
    const dropdown = document.querySelector('.cd-select__dropdown');
    expect(dropdown).not.toBeNull();
    expect(dropdown?.hasAttribute('hidden')).toBe(true);
  });

  it('打开态：listbox + option 渲染（结构断言）', () => {
    renderWithLocale(Select, {
      props: { options, defaultOpen: true, placeholder: 'Pick a fruit' },
    });
    const listbox = document.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    expect(document.querySelectorAll('[role="option"]').length).toBe(options.length);
  });

  it('已选值：选中 option aria-selected=true（结构断言）', () => {
    renderWithLocale(Select, {
      props: { options, defaultOpen: true, defaultValue: 'banana' },
    });
    const selected = document.querySelector('[role="option"][aria-selected="true"]');
    expect(selected?.textContent).toContain('Banana');
  });

  it('多选：aria-multiselectable=true（结构断言）', () => {
    renderWithLocale(Select, {
      props: { options, defaultOpen: true, multiple: true },
    });
    expect(document.querySelector('[role="listbox"]')?.getAttribute('aria-multiselectable')).toBe('true');
  });

  // combobox 可访问名回退到 placeholder（缺省走 locale Select.ariaLabel）。
  it('打开态：axe 0 violations（combobox 经 placeholder/locale 获可访问名）', async () => {
    renderWithLocale(Select, {
      props: { options, defaultOpen: true, placeholder: 'Pick a fruit' },
    });
    expect(document.querySelector('[role="combobox"]')?.getAttribute('aria-label')).toBe('Pick a fruit');
    await expectNoAxeViolations(document.body);
  });
});
