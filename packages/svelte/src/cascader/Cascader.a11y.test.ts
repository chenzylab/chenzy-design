// Cascader a11y：combobox 触发器 + 每列 listbox/option 浮层（use:floating portal 到 body）。
// 只断言静态 ARIA + axe 0 violations，不测真实键盘/焦点（jsdom 限制）。
// 打开态面板 portal 到 document.body，故扫描 document.body。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Cascader from './Cascader.svelte';

const treeData = [
  {
    label: 'Zhejiang',
    value: 'zj',
    children: [
      { label: 'Hangzhou', value: 'hz', children: [{ label: 'West Lake', value: 'xh' }] },
    ],
  },
  {
    label: 'Jiangsu',
    value: 'js',
    children: [{ label: 'Nanjing', value: 'nj' }],
  },
];

describe('Cascader a11y', () => {
  it('关闭态：触发器 role=combobox / aria-expanded=false，无 axe violations', async () => {
    const { container } = renderWithLocale(Cascader, {
      props: { treeData, ariaLabel: 'Region', placeholder: 'Select region' },
    });
    const combobox = container.querySelector('[role="combobox"]');
    expect(combobox).not.toBeNull();
    expect(combobox?.getAttribute('aria-expanded')).toBe('false');
    expect(combobox?.getAttribute('aria-haspopup')).toBe('listbox');
    expect(combobox?.getAttribute('aria-label')).toBe('Region');
    await expectNoAxeViolations(container);
  });

  // 每列 listbox 经 locale Cascader.columnLabel 获可访问名（「第 N 级选项」）。
  it('打开态：面板列 listbox + option 渲染（portal 到 body），无 axe violations', async () => {
    renderWithLocale(Cascader, {
      props: { treeData, defaultOpen: true, ariaLabel: 'Region' },
    });
    const listbox = document.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    expect(listbox?.getAttribute('aria-label')).toBeTruthy();
    const optionEls = document.querySelectorAll('[role="option"]');
    expect(optionEls.length).toBeGreaterThan(0);
    await expectNoAxeViolations(document.body);
  });

  it('已选路径：触发器 aria-expanded 切换，选中 option 标记 aria-selected', async () => {
    renderWithLocale(Cascader, {
      props: { treeData, defaultOpen: true, defaultValue: ['zj', 'hz', 'xh'], ariaLabel: 'Region' },
    });
    const combobox = document.querySelector('[role="combobox"]');
    expect(combobox?.getAttribute('aria-expanded')).toBe('true');
    const selected = document.querySelector('[role="option"][aria-selected="true"]');
    expect(selected).not.toBeNull();
    await expectNoAxeViolations(document.body);
  });
});
