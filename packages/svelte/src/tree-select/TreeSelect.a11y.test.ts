// TreeSelect a11y：combobox 触发器 + role=tree 面板 + role=treeitem（use:floating portal 到 body）。
// 只断言静态 ARIA + axe 0 violations，不测真实键盘/焦点（jsdom 限制）。
// 打开态面板 portal 到 document.body，故扫描 document.body。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import TreeSelect from './TreeSelect.svelte';

const treeData = [
  {
    key: 'parent',
    label: 'Parent',
    children: [
      { key: 'child-1', label: 'Child 1' },
      { key: 'child-2', label: 'Child 2' },
    ],
  },
  { key: 'leaf', label: 'Leaf' },
];

describe('TreeSelect a11y', () => {
  it('关闭态：触发器 role=combobox / aria-expanded=false，无 axe violations', async () => {
    const { container } = renderWithLocale(TreeSelect, {
      props: { treeData, ariaLabel: 'Department', placeholder: 'Select node' },
    });
    const combobox = container.querySelector('[role="combobox"]');
    expect(combobox).not.toBeNull();
    expect(combobox?.getAttribute('aria-expanded')).toBe('false');
    expect(combobox?.getAttribute('aria-label')).toBe('Department');
    await expectNoAxeViolations(container);
  });

  it('打开态：role=tree + treeitem 渲染（portal 到 body），无 axe violations', async () => {
    renderWithLocale(TreeSelect, {
      props: { treeData, defaultOpen: true, defaultExpandAll: true, ariaLabel: 'Department' },
    });
    const tree = document.querySelector('[role="tree"]');
    expect(tree).not.toBeNull();
    const items = document.querySelectorAll('[role="treeitem"]');
    expect(items.length).toBeGreaterThan(0);
    await expectNoAxeViolations(document.body);
  });

  it('有 children 节点：aria-expanded 标记展开态', async () => {
    renderWithLocale(TreeSelect, {
      props: { treeData, defaultOpen: true, defaultExpandAll: true, ariaLabel: 'Department' },
    });
    const expandable = document.querySelector('[role="treeitem"][aria-expanded]');
    expect(expandable).not.toBeNull();
    expect(['true', 'false']).toContain(expandable?.getAttribute('aria-expanded'));
    await expectNoAxeViolations(document.body);
  });
});
