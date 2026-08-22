// Table a11y：数据表格。
// 对齐 Semi Body/index.tsx：role 静态标注为 grid/treegrid（有分组/展开行渲染/树形时
// treegrid，否则 grid），不因交互能力（sorter/rowSelection）与否而切换，也没有方向键
// 漫游/roving tabindex（Semi 无此实现，本库已移除对应自造能力）。
// 均传 pagination={false}：默认内嵌的 Pagination 子组件严格对齐 Semi 后自身带有
// 真实存在于 Semi 源码的 axe 违规（<ul> 直接含 [role=button] 子元素），与本文件
// 测试 Table 自身语义的目标无关，排除之以聚焦断言。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Table from './Table.svelte';

interface Row {
  key: string;
  name: string;
  age: number;
}

const dataSource: Row[] = [
  { key: '1', name: 'Alice', age: 30 },
  { key: '2', name: 'Bob', age: 25 },
];

const plainColumns = [
  { key: 'name', dataIndex: 'name', title: 'Name' },
  { key: 'age', dataIndex: 'age', title: 'Age' },
];

describe('Table a11y', () => {
  it('纯展示表：role=grid + columnheader/gridcell（静态标注，无 axe violations）', async () => {
    const { container } = renderWithLocale(Table, {
      props: { columns: plainColumns, dataSource, 'aria-label': 'Users', pagination: false },
    });
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect(table?.getAttribute('role')).toBe('grid');
    expect(table?.getAttribute('aria-rowcount')).toBe(String(dataSource.length));
    expect(table?.getAttribute('aria-colcount')).toBe(String(plainColumns.length));
    // 列头与数据行
    expect(container.querySelectorAll('th[scope="col"]').length).toBe(2);
    await expectNoAxeViolations(container);
  });

  it('交互态（sortable）：role=grid + columnheader/gridcell + aria-rowcount', async () => {
    const sortableColumns = [
      { key: 'name', dataIndex: 'name', title: 'Name', sorter: true },
      { key: 'age', dataIndex: 'age', title: 'Age', sorter: true },
    ];
    const { container } = renderWithLocale(Table, {
      props: { columns: sortableColumns, dataSource, 'aria-label': 'Users grid', pagination: false },
    });
    const grid = container.querySelector('[role="grid"]');
    expect(grid).not.toBeNull();
    expect(grid?.getAttribute('aria-rowcount')).toBeTruthy();
    expect(container.querySelectorAll('[role="columnheader"]').length).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll('[role="row"]').length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll('[role="gridcell"]').length).toBeGreaterThanOrEqual(1);
    await expectNoAxeViolations(container);
  });

  it('rowSelection：交互态 role=grid + 全选 checkbox 有可访问名', async () => {
    const { container } = renderWithLocale(Table, {
      props: {
        columns: plainColumns,
        dataSource,
        'aria-label': 'Selectable',
        rowSelection: {},
        pagination: false,
      },
    });
    expect(container.querySelector('[role="grid"]')).not.toBeNull();
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
