<script lang="ts">
  import { ScrollList, Text } from '@chenzy-design/svelte';

  const hourData = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
    disabled: i === 3 || i === 4,
  }));
  let pickedHour = $state<string | number>(9);

  const slYears = Array.from({ length: 6 }, (_, i) => ({ value: 2023 + i, label: `${2023 + i}` }));
  const slMonths = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` }));
  let slDate = $state<(string | number)[]>([2024, 2, 15]);

  function daysInMonth(y: number, m: number): number {
    return new Date(y, m, 0).getDate();
  }

  const slDayData = $derived(
    Array.from({ length: daysInMonth(Number(slDate[0]), Number(slDate[1])) }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}日`,
    })),
  );

  const slDateColumns = $derived([
    { data: slYears, ariaLabel: '年' },
    { data: slMonths, ariaLabel: '月' },
    { data: slDayData, ariaLabel: '日', cyclic: true },
  ]);

  const slCyclicHours = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
  }));
  let slCyclicHour = $state<string | number>(12);

  const slBigData = Array.from({ length: 1000 }, (_, i) => ({ value: i, label: `项 ${i}` }));
  let slBigPicked = $state<string | number>(500);

  let slMoreData = $state(Array.from({ length: 20 }, (_, i) => ({ value: i, label: `条目 ${i}` })));
  let slStatus = $state<'idle' | 'loading' | 'empty'>('idle');
  function slLoadMore() {
    if (slStatus === 'loading' || slMoreData.length >= 60) return;
    slStatus = 'loading';
    setTimeout(() => {
      const start = slMoreData.length;
      slMoreData = [
        ...slMoreData,
        ...Array.from({ length: 20 }, (_, i) => ({ value: start + i, label: `条目 ${start + i}` })),
      ];
      slStatus = 'idle';
    }, 600);
  }
</script>

<Text type="tertiary">滚动 / 点击 / 方向键选择小时（03、04 禁用）</Text>
<div style="width: 80px">
  <ScrollList
    data={hourData}
    defaultValue={9}
    ariaLabel="小时"
    onChange={(info) => (pickedHour = info.value as string | number)}
  />
</div>
<Text type="tertiary">选中小时：{pickedHour}</Text>

<div style="margin-top:16px"><Text type="tertiary">多列联动：年 / 月 / 日（日列范围随年月派生，含闰年；日列 cyclic 循环）</Text></div>
<div style="width: 240px" data-testid="scrolllist-multi">
  <ScrollList
    columns={slDateColumns}
    value={slDate}
    onChange={(info) => {
      const vals = info.value as (string | number)[];
      const y = Number(vals[0]);
      const m = Number(vals[1]);
      const maxDay = new Date(y, m, 0).getDate();
      const d = Math.min(Number(vals[2]), maxDay);
      slDate = [y, m, d];
    }}
  />
</div>
<Text type="tertiary">选中日期：{slDate[0]}-{slDate[1]}-{slDate[2]}</Text>

<div style="margin-top:16px"><Text type="tertiary">cyclic 循环单列（无限轮，向上/下持续滚动接回）</Text></div>
<div style="width: 80px" data-testid="scrolllist-cyclic">
  <ScrollList
    data={slCyclicHours}
    value={slCyclicHour}
    cyclic
    ariaLabel="循环小时"
    onChange={(info) => (slCyclicHour = info.value as string | number)}
  />
</div>
<Text type="tertiary">循环选中：{slCyclicHour}</Text>

<div style="margin-top:16px"><Text type="tertiary">虚拟化（1000 项，仅渲染视口）</Text></div>
<div style="width: 120px" data-testid="scrolllist-virtual">
  <ScrollList
    data={slBigData}
    value={slBigPicked}
    virtualized
    ariaLabel="大数据列"
    onChange={(info) => (slBigPicked = info.value as string | number)}
  />
</div>
<Text type="tertiary">虚拟化选中：{slBigPicked}</Text>

<div style="margin-top:16px"><Text type="tertiary">loadMore + status（滚到末尾加载更多，加载中显示状态）</Text></div>
<div style="width: 140px" data-testid="scrolllist-loadmore">
  <ScrollList
    data={slMoreData}
    status={slStatus}
    ariaLabel="加载更多列"
    onLoadMore={slLoadMore}
  />
</div>
<Text type="tertiary">已加载 {slMoreData.length} 条（最多 60）· 状态 {slStatus}</Text>
