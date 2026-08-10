// Select a11y：combobox 触发器 + listbox/option 浮层（use:floating portal 到 body）。
// 只断言静态 ARIA + axe，不测真实键盘/焦点（jsdom 限制）。
//
// 修复记录：根 `<div role="combobox">` 现经 ariaLabel/ariaLabelledby prop 或
//   placeholder / locale Select.ariaLabel 回退获可访问名，axe aria-input-field-name 消除。
import { describe, it, expect, vi } from 'vitest';
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
      props: { optionList: options, placeholder: 'Pick a fruit' },
    });
    const combobox = container.querySelector('[role="combobox"]');
    expect(combobox).not.toBeNull();
    expect(combobox?.getAttribute('aria-expanded')).toBe('false');
    expect(combobox?.getAttribute('aria-haspopup')).toBe('listbox');
    // destroyOnClose=false（默认）关闭态浮层保持挂载，须带 [hidden] 隐藏。
    // 回归防护：.cd-select-dropdown 的 display:flex 曾压过 [hidden] 的 UA display:none，
    // 导致浮层常驻可见（如 Pagination size-changer 弹层关不掉），已用属性选择器修复。
    const dropdown = document.querySelector('.cd-select-dropdown');
    expect(dropdown).not.toBeNull();
    expect(dropdown?.hasAttribute('hidden')).toBe(true);
  });

  it('打开态：listbox + option 渲染（结构断言）', () => {
    renderWithLocale(Select, {
      props: { optionList: options, defaultOpen: true, placeholder: 'Pick a fruit' },
    });
    const listbox = document.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    expect(document.querySelectorAll('[role="option"]').length).toBe(options.length);
  });

  it('已选值：选中 option aria-selected=true（结构断言）', () => {
    renderWithLocale(Select, {
      props: { optionList: options, defaultOpen: true, defaultValue: 'banana' },
    });
    const selected = document.querySelector('[role="option"][aria-selected="true"]');
    expect(selected?.textContent).toContain('Banana');
  });

  it('多选：aria-multiselectable=true（结构断言）', () => {
    renderWithLocale(Select, {
      props: { optionList: options, defaultOpen: true, multiple: true },
    });
    expect(document.querySelector('[role="listbox"]')?.getAttribute('aria-multiselectable')).toBe('true');
  });

  // combobox 可访问名回退到 placeholder（缺省走 locale Select.ariaLabel）。
  it('打开态：axe 0 violations（combobox 经 placeholder/locale 获可访问名）', async () => {
    renderWithLocale(Select, {
      props: { optionList: options, defaultOpen: true, placeholder: 'Pick a fruit' },
    });
    expect(document.querySelector('[role="combobox"]')?.getAttribute('aria-label')).toBe('Pick a fruit');
    await expectNoAxeViolations(document.body);
  });

  // allowCreate 新建项的 DOM 对齐 Semi：`<span class="-create-tips">Create</span>` + 裸的输入值
  // 两个节点。曾坑：本库把值插值进一整串（locale 键还叫 `Select.create`、值含 "{label}"），
  // 与 Semi 的 createText（不含占位符）语义不符，且缺 `-create-tips` span 与其配套样式。
  it('allowCreate：create-tips span 承载「创建」前缀，输入值为独立文本节点（对齐 Semi）', async () => {
    renderWithLocale(Select, {
      props: { optionList: options, defaultOpen: true, filter: true, allowCreate: true },
    });
    // searchPosition 默认 'trigger'（对齐 Semi），搜索框内联在触发器上；
    // 用共享类 .cd-select-search 定位其外层 Input 组件 wrapper，不假定 trigger/dropdown 位置；
    // 真正可写值/派发原生事件的是内层 <input class="cd-input">（Select 复用 Input 组件后，
    // .cd-select-search 挂在 Input 的 wrapper div 上，非裸 <input> 本身，见 Input.svelte）。
    const search = document.querySelector('.cd-select-search .cd-input') as HTMLInputElement;
    expect(search).not.toBeNull();
    search.value = 'Durian';
    search.dispatchEvent(new Event('input', { bubbles: true }));

    const createOpt = await vi.waitUntil(() => document.querySelector('.cd-select-option-create'));
    const tips = createOpt.querySelector('.cd-select-create-tips');
    // 前缀是独立 span，且文案为 locale 的 createText（en_US: 'Create'，不含占位符）
    expect(tips?.textContent?.trim()).toBe('Create');
    // 输入值不在 span 内，而是选项自身的文本
    expect(tips?.textContent).not.toContain('Durian');
    expect(createOpt.textContent).toContain('Durian');
  });
});
