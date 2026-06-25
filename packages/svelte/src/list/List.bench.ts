// List 渲染基准（最小骨架，趋势参考，不接 CI 门禁）。
// 在 jsdom 下真实 mount List（数据驱动 dataSource + renderItem），测挂载耗时。
// 仅供观察回归趋势；硬门禁是 size-limit 体积预算（perf:size / perf:check）。
import { bench, describe } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import ListBenchFixture from './ListBenchFixture.svelte';

describe('List render', () => {
  bench(
    'mount 100 items',
    () => {
      render(ListBenchFixture, { props: { count: 100 } });
      cleanup();
    },
    { time: 300 },
  );

  bench(
    'mount 500 items',
    () => {
      render(ListBenchFixture, { props: { count: 500 } });
      cleanup();
    },
    { time: 500 },
  );
});
