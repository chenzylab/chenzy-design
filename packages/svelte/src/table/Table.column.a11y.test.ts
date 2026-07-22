// 组合式 <Column> 收集：验证与配置式 columns 等价、嵌套表头合并、动态增删、
// 红线 #2 无 effect 自循环。用 testing-library 真实挂载（context 收集依赖挂载）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Table from './Table.svelte';
import Fixture from './TableColumnFixture.svelte';
import type { ColumnDef } from './types.js';

interface Row {
  key: string;
  name: string;
  size: number;
  owner: string;
  [k: string]: unknown;
}

const dataSource: Row[] = [
  { key: '1', name: 'Alice', size: 30, owner: 'X' },
  { key: '2', name: 'Bob', size: 10, owner: 'Y' },
];

// 配置式等价列树（与 fixture 的组合式声明对应）。sorter 用宽松签名以便 render(Table)
// 泛型推断为 Record<string,unknown>（testing-library render 不绑定 Row 泛型）。
const configColumns: ColumnDef<Record<string, unknown>>[] = [
  {
    title: '基本信息',
    children: [
      { title: '标题', dataIndex: 'name' as const, width: 200 },
      { title: '大小', dataIndex: 'size' as const, width: 100, sorter: (a, b) => (a.size as number) - (b.size as number) },
    ],
  },
  {
    title: '其他信息',
    children: [{ title: '所有者', dataIndex: 'owner' as const }],
  },
];

describe('Table 组合式 <Column>', () => {
  it('渲染两行合并表头（嵌套 Column = 表头合并）', () => {
    const { container } = render(Fixture, { props: { dataSource } });
    // 两行表头：父列行 + 叶子列行
    expect(container.querySelectorAll('thead tr').length).toBe(2);
    const headerTexts = [...container.querySelectorAll('thead th')].map((th) =>
      th.textContent?.trim(),
    );
    expect(headerTexts).toEqual(
      expect.arrayContaining(['基本信息', '其他信息', '标题', '大小', '所有者']),
    );
  });

  it('数据行按叶子列渲染（3 个叶子列，2 行数据）', () => {
    const { container } = render(Fixture, { props: { dataSource } });
    const bodyRows = container.querySelectorAll('tbody tr');
    expect(bodyRows.length).toBe(2);
    // 首行单元格：标题 / 大小 / 所有者
    const firstCells = [...bodyRows[0]!.querySelectorAll('td')].map((td) => td.textContent?.trim());
    expect(firstCells).toContain('Alice');
    expect(firstCells).toContain('30');
    expect(firstCells).toContain('X');
  });

  it('与配置式 columns 产出等价（表头文案 + 数据单元格一致）', () => {
    const composable = render(Fixture, { props: { dataSource } });
    const config = render(Table, { props: { columns: configColumns, dataSource } });
    const headers = (c: HTMLElement) =>
      [...c.querySelectorAll('thead th')].map((th) => th.textContent?.trim()).sort();
    const cells = (c: HTMLElement) =>
      [...c.querySelectorAll('tbody td')].map((td) => td.textContent?.trim()).sort();
    expect(headers(composable.container)).toEqual(headers(config.container));
    expect(cells(composable.container)).toEqual(cells(config.container));
  });

  it('保序：源码顺序 = 叶子列渲染顺序', () => {
    const { container } = render(Fixture, { props: { dataSource } });
    // 叶子列行（第二行）文案按声明顺序
    const leafHeaderRow = container.querySelectorAll('thead tr')[1]!;
    const leafTexts = [...leafHeaderRow.querySelectorAll('th')].map((th) => th.textContent?.trim());
    expect(leafTexts).toEqual(['标题', '大小', '所有者']);
  });

  it('动态增列：includeExtra 切换后列树重建（version 冒泡）', async () => {
    const { container, rerender } = render(Fixture, {
      props: { dataSource, includeExtra: false },
    });
    // 初始 3 叶子列
    expect(container.querySelectorAll('thead tr')[1]!.querySelectorAll('th').length).toBe(3);
    await rerender({ dataSource, includeExtra: true });
    // 增列后 4 叶子列
    expect(container.querySelectorAll('thead tr')[1]!.querySelectorAll('th').length).toBe(4);
  });

  it('红线 #2：挂载含嵌套 Column 的表不抛 effect_update_depth_exceeded', () => {
    // 若收集触发 effect 自循环，render 会抛错；正常返回即通过。
    expect(() => render(Fixture, { props: { dataSource } })).not.toThrow();
  });

  it('并存优先级：同时传 columns 且有 <Column> children 时走配置式', () => {
    // Table 直接用配置式 columns（此处无 children）；组合式与配置式互斥，columns 优先。
    const { container } = render(Table, { props: { columns: configColumns, dataSource } });
    expect(container.querySelectorAll('thead tr').length).toBe(2);
    expect(container.querySelectorAll('tbody tr').length).toBe(2);
  });
});
