// Tree a11y：层级树控件。
// 容器 role=tree（aria-multiselectable），每行 role=treeitem 含 aria-level/expanded/selected。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Tree from './Tree.svelte';

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

describe('Tree a11y', () => {
  it('默认渲染：role=tree + treeitem，无 axe violations', async () => {
    const { container } = renderWithLocale(Tree, {
      props: { treeData, ariaLabel: 'File tree' },
    });
    const tree = container.querySelector('[role="tree"]');
    expect(tree).not.toBeNull();
    expect(tree?.getAttribute('aria-label')).toBe('File tree');
    expect(container.querySelectorAll('[role="treeitem"]').length).toBeGreaterThanOrEqual(2);
    await expectNoAxeViolations(container);
  });

  it('展开节点：aria-expanded 反映展开态 + aria-level', async () => {
    const { container } = renderWithLocale(Tree, {
      props: { treeData, ariaLabel: 'Tree', defaultExpandAll: true },
    });
    const expanded = container.querySelector('[role="treeitem"][aria-expanded="true"]');
    expect(expanded?.textContent).toContain('Parent');
    expect(expanded?.getAttribute('aria-level')).toBe('1');
    // 展开后子节点可见，aria-level=2
    const child = Array.from(container.querySelectorAll('[role="treeitem"]')).find((el) =>
      el.textContent?.includes('Child 1'),
    );
    expect(child?.getAttribute('aria-level')).toBe('2');
    await expectNoAxeViolations(container);
  });

  it('checkable：treeitem aria-checked + 容器 aria-multiselectable', async () => {
    const { container } = renderWithLocale(Tree, {
      props: { treeData, ariaLabel: 'Tree', checkable: true, defaultExpandAll: true },
    });
    expect(container.querySelector('[role="tree"]')?.getAttribute('aria-multiselectable')).toBe('true');
    expect(container.querySelector('[role="treeitem"][aria-checked]')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('选中态：selectable 节点 aria-selected', async () => {
    const { container } = renderWithLocale(Tree, {
      props: { treeData, ariaLabel: 'Tree', defaultValue: 'leaf' },
    });
    const selected = container.querySelector('[role="treeitem"][aria-selected="true"]');
    expect(selected?.textContent).toContain('Leaf');
    await expectNoAxeViolations(container);
  });
});
