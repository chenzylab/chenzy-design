// Transfer a11y：严格对齐 Semi（非 dual-listbox）。
// 容器 role=group；每侧列表 role=list（div）；右侧已选项 role=listitem；
// 左侧为原生 Checkbox 行；搜索框 role=search + aria-label；删除按钮 aria-label。
import { describe, it, expect } from 'vitest';
import { fireEvent } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Transfer from './Transfer.svelte';
import TransferCustomSelectedDraggableFixture from './TransferCustomSelectedDraggableFixture.svelte';

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

  it('draggable 默认渲染：每行带 data-sortable-item 定位标记', () => {
    const { container } = renderWithLocale(Transfer, {
      props: { dataSource, defaultValue: ['a', 'b'], draggable: true },
    });
    const rows = container.querySelectorAll('[data-sortable-item]');
    expect(rows.length).toBe(2);
  });
});

// 回归：renderSelectedItem 自定义渲染 + draggable 组合场景下，之前自定义内容外层完全
// 没有包裹层，导致 data-sortable-item 标记缺失——sortable action 的 getRows()/
// resolveIndexFromEvent 找不到行边界，拖拽在这种组合下完全失效（表现为手柄按下无反应）。
// 对齐 Semi `_sortable` SortableItem：外层定位容器（dnd-kit `ref={setNodeRef}` 的真实
// DOM 节点，供 rect 测量）始终存在，renderItem({sortableHandle}) 只替换容器内部内容。
describe('Transfer renderSelectedItem + draggable（自定义渲染场景下的拖拽定位标记）', () => {
  it('自定义渲染的行仍带 data-sortable-item，sortableHandle attachment 正确挂载标记属性', () => {
    const { container } = renderWithLocale(TransferCustomSelectedDraggableFixture, {
      props: { dataSource, defaultValue: ['a', 'b'] },
    });
    // 自定义渲染场景下，行边界标记必须存在（否则 sortable action 无法测量/定位任何行）。
    const rows = container.querySelectorAll('[data-sortable-item]');
    expect(rows.length).toBe(2);
    // sortableHandle() 返回的 attachment 挂载后应在用户指定节点上打上标记属性，
    // resolveRightDragIndex 靠它判定"点击命中了手柄"而非整行任意位置。
    const handles = container.querySelectorAll('[data-cd-transfer-sortable-handle]');
    expect(handles.length).toBe(2);
    // 手柄必须落在 data-sortable-item 容器内部，closest() 才能正确解析出该行索引。
    handles.forEach((h) => {
      expect(h.closest('[data-sortable-item]')).not.toBeNull();
    });
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

  // 叶子节点带 value 字段（与 key 不同）：验证 Tree 组件 value 通道（对齐 Semi
  // getValueOrKey）与 Transfer 的 key↔value 转换（keyByValue）正确串联，点击叶子能
  // 真实迁移到已选列（回归：曾因 Tree/Transfer 两端值语义不一致导致点击勾选失效）。
  const treeDataWithValue = [
    {
      key: 'k-fruit',
      value: 'v-fruit',
      label: 'Fruit',
      children: [
        { key: 'k-apple', value: 'v-apple', label: 'Apple' },
        { key: 'k-banana', value: 'v-banana', label: 'Banana' },
      ],
    },
  ];

  it('叶子节点带 value 字段：点击勾选后立即迁移到已选列（values 回传节点 value）', async () => {
    let received: unknown;
    const { container } = renderWithLocale(Transfer, {
      props: {
        type: 'treeList',
        dataSource: treeDataWithValue,
        onChange: (values: unknown) => {
          received = values;
        },
      },
    });
    const appleRow = Array.from(container.querySelectorAll('[role="treeitem"]')).find((el) =>
      el.textContent?.includes('Apple'),
    ) as HTMLElement;
    const cb = appleRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await fireEvent.click(cb);
    expect(received).toEqual(['v-apple']);
    expect(container.querySelector('.cd-transfer-right-list')?.textContent).toContain('Apple');
  });
});
