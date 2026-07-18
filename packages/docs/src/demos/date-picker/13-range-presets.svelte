<script lang="ts">
  import { DatePicker, Space, Text } from '@chenzy-design/svelte';

  let val = $state<[Date | null, Date | null] | null>(null);

  const today = () => new Date();
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };

  // 快捷区间：value 为 [起, 止] 或返回该区间的函数
  const presets = [
    { label: '最近 7 天', value: (): [Date, Date] => [daysAgo(6), today()] },
    { label: '最近 30 天', value: (): [Date, Date] => [daysAgo(29), today()] },
    { label: '本月至今', value: (): [Date, Date] => [new Date(new Date().getFullYear(), new Date().getMonth(), 1), today()] },
  ];
</script>

<Space vertical align="start">
  <!-- RangePicker presets 快捷区间 + presetPosition 位置 -->
  <span style="width:280px;display:inline-block">
    <DatePicker
      type="dateRange"
      value={val}
      presets={presets}
      presetPosition="left"
      onChange={(r) => (val = r as [Date | null, Date | null] | null)}
    />
  </span>
  <Text type="tertiary">
    {val && val[0] && val[1]
      ? `${val[0].toLocaleDateString('zh-CN')} ~ ${val[1].toLocaleDateString('zh-CN')}`
      : '（未选）'}
  </Text>
</Space>
