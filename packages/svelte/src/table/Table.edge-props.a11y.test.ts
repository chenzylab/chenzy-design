// Table 边角 props：renderPagination / expandIcon / hideExpandedColumn /
// rowSpanHover / headerStyle / onGroupedRow。对标 Semi 2.101.0。
// 放在 dom project（jsdom + svelte 插件）：本套件做渲染/DOM 断言，非 axe。
import { describe, it, expect } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import { createRawSnippet } from 'svelte';
import Table from './Table.svelte';

interface Row {
  key: string;
  name: string;
  age: number;
  dept?: string;
}

const dataSource: Row[] = [
  { key: '1', name: 'Alice', age: 30, dept: 'A' },
  { key: '2', name: 'Bob', age: 25, dept: 'B' },
];

const columns = [
  { key: 'name', dataIndex: 'name', title: 'Name' },
  { key: 'age', dataIndex: 'age', title: 'Age' },
];

const expandedRowRender = createRawSnippet(() => ({
  render: () => `<div>expanded</div>`,
}));

describe('Table 边角 props', () => {
  it('hideExpandedColumn 默认 true：展开按钮并入首列，无独立 expand 列', () => {
    const { container } = renderWithLocale(Table, {
      props: { columns, dataSource, expandable: { expandedRowRender } },
    });
    expect(container.querySelector('.cd-table-column-expand')).toBeNull();
    expect(container.querySelector('.cd-table-expand-icon-cell .cd-table-expand-icon')).not.toBeNull();
  });

  it('hideExpandedColumn=false：展开按钮单独成列', () => {
    const { container } = renderWithLocale(Table, {
      props: { columns, dataSource, hideExpandedColumn: false, expandable: { expandedRowRender } },
    });
    expect(container.querySelector('.cd-table-column-expand')).not.toBeNull();
    expect(container.querySelector('.cd-table-expand-icon-cell')).toBeNull();
  });

  it('expandIcon：自定义展开图标替换默认三角', () => {
    const expandIcon = createRawSnippet(() => ({
      render: () => `<i class="my-caret">▶</i>`,
    }));
    const { container } = renderWithLocale(Table, {
      props: { columns, dataSource, expandIcon, expandable: { expandedRowRender } },
    });
    expect(container.querySelector('.cd-table-expand-icon .my-caret')).not.toBeNull();
  });

  it('renderPagination：替换内置 Pagination UI', () => {
    const renderPagination = createRawSnippet(() => ({
      render: () => `<div class="my-pager">custom</div>`,
    }));
    const { container } = renderWithLocale(Table, {
      props: { columns, dataSource, renderPagination, pagination: { pageSize: 1 } },
    });
    expect(container.querySelector('.my-pager')).not.toBeNull();
    expect(container.querySelector('.cd-table-pagination-outer')).toBeNull();
  });

  it('headerStyle：对象应用到所有表头 th', () => {
    const { container } = renderWithLocale(Table, {
      props: { columns, dataSource, headerStyle: { 'background-color': 'rgb(1, 2, 3)' } },
    });
    const ths = container.querySelectorAll('th.cd-table-row-head');
    expect(ths.length).toBe(2);
    ths.forEach((th) => {
      expect((th as HTMLElement).style.backgroundColor).toBe('rgb(1, 2, 3)');
    });
  });

  it('headerStyle：字符串应用到所有表头 th', () => {
    const { container } = renderWithLocale(Table, {
      props: { columns, dataSource, headerStyle: 'color: rgb(4, 5, 6)' },
    });
    container.querySelectorAll('th.cd-table-row-head').forEach((th) => {
      expect((th as HTMLElement).style.color).toBe('rgb(4, 5, 6)');
    });
  });

  it('rowSpanHover：容器附加 cd-table-row-span-hover 类', () => {
    const { container } = renderWithLocale(Table, {
      props: { columns, dataSource, rowSpanHover: true },
    });
    expect(container.querySelector('.cd-table.cd-table-row-span-hover')).not.toBeNull();
  });

  it('onGroupedRow：分组头行合并自定义 className/style', () => {
    let called = false;
    const { container } = renderWithLocale(Table, {
      props: {
        columns,
        dataSource,
        groupBy: 'dept',
        onGroupedRow: (group: Row[]) => {
          called = Array.isArray(group);
          return { className: 'my-group-row', style: 'font-weight:700' };
        },
      },
    });
    const groupRow = container.querySelector('.cd-table-row-section.my-group-row');
    expect(groupRow).not.toBeNull();
    expect((groupRow as HTMLElement).style.fontWeight).toBe('700');
    expect(called).toBe(true);
  });

  it('column.children 表头合并：生成 2 行 thead，父列 colspan 跨子列，body 按叶子列渲染', () => {
    const mergedCols = [
      { key: 'name', dataIndex: 'name', title: 'Name' },
      {
        key: 'g',
        title: 'Group',
        children: [
          { key: 'age', dataIndex: 'age', title: 'Age' },
          { key: 'dept', dataIndex: 'dept', title: 'Dept' },
        ],
      },
    ];
    const { container } = renderWithLocale(Table, {
      props: { columns: mergedCols, dataSource },
    });
    const headRows = container.querySelectorAll('.cd-table-thead tr');
    expect(headRows.length).toBe(2);
    const groupTh = container.querySelector('.cd-table-thead th[colspan="2"]');
    expect(groupTh?.textContent).toContain('Group');
    // body 第一行有 3 个叶子列（name/age/dept）
    const firstBodyRow = container.querySelector('.cd-table-tbody .cd-table-row');
    expect(firstBodyRow?.querySelectorAll('.cd-table-row-cell').length).toBe(3);
  });

  it('column.onCell 行列合并：rowSpan=0 的单元格不渲染', () => {
    const spanCols = [
      { key: 'name', dataIndex: 'name', title: 'Name' },
      {
        key: 'age',
        dataIndex: 'age',
        title: 'Age',
        onCell: (_r: Row, i: number) => (i === 0 ? { rowSpan: 2 } : { rowSpan: 0 }),
      },
    ];
    const { container } = renderWithLocale(Table, {
      props: { columns: spanCols, dataSource },
    });
    const rows = container.querySelectorAll('.cd-table-tbody .cd-table-row');
    expect(rows[0]?.querySelectorAll('.cd-table-row-cell').length).toBe(2);
    expect(rows[1]?.querySelectorAll('.cd-table-row-cell').length).toBe(1); // age 被合并
    expect(container.querySelector('td[rowspan="2"]')).not.toBeNull();
  });

  it('components 覆盖 body.row/wrapper tag：tbody→div、行→div，class 仍注入', () => {
    const { container } = renderWithLocale(Table, {
      props: {
        columns,
        dataSource,
        components: { body: { wrapper: 'div', row: 'div' } },
      },
    });
    const tbody = container.querySelector('.cd-table-tbody');
    expect(tbody?.tagName).toBe('DIV');
    const row = container.querySelector('.cd-table-tbody .cd-table-row');
    expect(row?.tagName).toBe('DIV');
  });

  it('根 class / style 作用于 .cd-table-wrapper', () => {
    const { container } = renderWithLocale(Table, {
      props: { columns, dataSource, class: 'my-table', style: 'opacity:0.5' },
    });
    const wrapper = container.querySelector('.cd-table-wrapper.my-table');
    expect(wrapper).not.toBeNull();
    expect((wrapper as HTMLElement).style.opacity).toBe('0.5');
  });
});
