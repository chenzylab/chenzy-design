// Table 渲染基准（最小骨架，趋势参考，不接 CI 门禁）。
// 在 jsdom 下真实 mount Table，测不同行数的挂载耗时。仅供观察回归趋势，
// 数字受 jsdom/CI 机器影响，不作为硬门禁（门禁是 size-limit 体积预算）。
import { bench, describe } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Table from './Table.svelte';

interface Row extends Record<string, unknown> {
  key: string;
  name: string;
  age: number;
  city: string;
}

const columns = [
  { key: 'name', dataIndex: 'name', title: 'Name' },
  { key: 'age', dataIndex: 'age', title: 'Age' },
  { key: 'city', dataIndex: 'city', title: 'City' },
];

function makeRows(n: number): Row[] {
  return Array.from({ length: n }, (_, i) => ({
    key: String(i),
    name: `User ${i}`,
    age: 20 + (i % 50),
    city: `City ${i % 10}`,
  }));
}

describe('Table render', () => {
  const rows100 = makeRows(100);
  const rows1000 = makeRows(1000);

  bench(
    'mount 100 rows',
    () => {
      render(Table, { props: { columns, dataSource: rows100 } });
      cleanup();
    },
    { time: 300 },
  );

  bench(
    'mount 1000 rows',
    () => {
      render(Table, { props: { columns, dataSource: rows1000 } });
      cleanup();
    },
    { time: 500 },
  );
});
