// Table a11y：数据表格。
// 纯展示表为原生 <table>（role=table）；交互态（sorter/rowSelection 等）升级为
// WAI-ARIA Grid Pattern：role=grid + columnheader/row/gridcell。两种都各测一个。
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
  it('纯展示表：原生 table 语义（无 role=grid），无 axe violations', async () => {
    const { container } = renderWithLocale(Table, {
      props: { columns: plainColumns, dataSource, 'aria-label': 'Users', pagination: false },
    });
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    // 纯展示降级：不应有 role=grid
    expect(table?.getAttribute('role')).toBeNull();
    expect(container.querySelector('[role="grid"]')).toBeNull();
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
