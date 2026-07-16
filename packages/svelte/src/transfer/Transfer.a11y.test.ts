// Transfer a11y：严格对齐 Semi（非 dual-listbox）。
// 容器 role=group；每侧列表 role=list（div）；右侧已选项 role=listitem；
// 左侧为原生 Checkbox 行；搜索框 role=search + aria-label；删除按钮 aria-label。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Transfer from './Transfer.svelte';

const dataSource = [
  { key: 'a', label: 'Apple' },
  { key: 'b', label: 'Banana' },
  { key: 'c', label: 'Cherry' },
  { key: 'd', label: 'Date' },
];

describe('Transfer a11y', () => {
  it('默认渲染：role=group + 源列表 role=list + 搜索框 role=search（不跑 axe）', () => {
    const { container } = renderWithLocale(Transfer, { props: { dataSource } });
    expect(container.querySelector('[role="group"]')).not.toBeNull();
    // 源列表容器 role=list（对齐 Semi renderLeftList）。
    const lists = container.querySelectorAll('[role="list"]');
    expect(lists.length).toBeGreaterThanOrEqual(1);
    // 搜索框 role=search + aria-label（对齐 Semi renderFilter）。
    const search = container.querySelector('[role="search"]');
    expect(search?.getAttribute('aria-label')).toBe('Transfer filter');
    // 左侧 4 个 Checkbox 行。
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(4);
  });

  it('带选中：右侧列表含已选项 role=listitem + 删除按钮 aria-label（不跑 axe）', () => {
    const { container } = renderWithLocale(Transfer, {
      props: { dataSource, defaultValue: ['b'] },
    });
    const rightList = container.querySelector('.cd-transfer-right-list');
    expect(rightList?.getAttribute('role')).toBe('list');
    expect(rightList?.textContent).toContain('Banana');
    const items = rightList?.querySelectorAll('[role="listitem"]');
    expect(items?.length).toBe(1);
    const removeBtn = rightList?.querySelector('.cd-transfer-item-close-icon');
    expect(removeBtn?.getAttribute('aria-label')).toBeTruthy();
  });

  it('axe 0 violations', async () => {
    const { container } = renderWithLocale(Transfer, {
      props: { dataSource, defaultValue: ['b'] },
    });
    await expectNoAxeViolations(container);
  });
});

// treeProps 接线验证：treeList 模式内嵌复用 Tree 组件。
describe('Transfer treeList（复用 Tree）', () => {
  const treeData = [
    {
      key: 'fruit',
      label: 'Fruit',
      children: [
        { key: 'apple', label: 'Apple' },
        { key: 'banana', label: 'Banana' },
      ],
    },
  ];

  it('默认 defaultExpandAll：内嵌 Tree 渲染且子节点可见', () => {
    const { container } = renderWithLocale(Transfer, {
      props: { type: 'treeList', dataSource: treeData },
    });
    // 复用本库 Tree 组件（cd-tree 根）。
    expect(container.querySelector('.cd-transfer-tree')).not.toBeNull();
    expect(container.textContent).toContain('Apple');
    expect(container.textContent).toContain('Fruit');
  });
});
