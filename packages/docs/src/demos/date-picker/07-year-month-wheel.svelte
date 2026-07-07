<script lang="ts">
  import { DatePicker, Space, Text } from '@chenzy-design/svelte';

  // 点头部年月标题即展开年 + 月滚轮，快速跳转到很远的年份。
  let dateVal = $state<Date | Date[] | null>(null);
  let cyclicVal = $state<Date | Date[] | null>(null);
</script>

<Space vertical align="start">
  <Text type="tertiary">点击面板头部的「年月」标题，展开年 + 月滚轮列，快速跳转到任意年月，再选具体日期。</Text>
  <Space>
    <span style="width:240px; display:inline-block">
      <DatePicker
        value={dateVal}
        defaultOpen
        startYear={2000}
        endYear={2035}
        onChange={(d) => (dateVal = d)}
      />
    </span>
    <Text type="tertiary">
      已选：{dateVal instanceof Date ? dateVal.toLocaleDateString('zh-CN') : '（未选）'}
    </Text>
  </Space>

  <Text type="tertiary">yearAndMonthOpts 开启循环滚动（年列 + 月列首尾相接）。</Text>
  <Space>
    <span style="width:240px; display:inline-block">
      <DatePicker
        value={cyclicVal}
        yearAndMonthOpts={{ yearCyclic: true, monthCyclic: true }}
        onChange={(d) => (cyclicVal = d)}
      />
    </span>
    <Text type="tertiary">
      已选：{cyclicVal instanceof Date ? cyclicVal.toLocaleDateString('zh-CN') : '（未选）'}
    </Text>
  </Space>
</Space>
