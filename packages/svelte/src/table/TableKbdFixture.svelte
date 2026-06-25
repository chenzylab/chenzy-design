<!--
  仅供 Table.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  交互态（列带 sorter）下 Table 升级为 WAI-ARIA Grid Pattern：role=grid +
  columnheader/gridcell + 单元格 roving tabindex。前后各放一个按钮，验证
  Tab 进入 grid 只停在单一 roving 单元格（roving 单停靠点），而非逐格进 Tab 序。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Table from './Table.svelte';

  interface Row {
    key: string;
    name: string;
    age: number;
    [k: string]: unknown;
  }

  const dataSource: Row[] = [
    { key: '1', name: 'Alice', age: 30 },
    { key: '2', name: 'Bob', age: 25 },
    { key: '3', name: 'Carol', age: 28 },
  ];

  // 列带 sorter → isInteractive → gridEnabled，触发 grid 键盘漫游。
  const columns = [
    { key: 'name', dataIndex: 'name', title: 'Name', sorter: true },
    { key: 'age', dataIndex: 'age', title: 'Age', sorter: true },
  ];
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Table {columns} {dataSource} rowKey="key" ariaLabel="Users grid" />
  <button type="button" data-testid="after">after</button>
</LocaleProvider>
