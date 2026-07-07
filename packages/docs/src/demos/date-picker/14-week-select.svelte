<script lang="ts">
  import { RangePicker, Space, Text } from '@chenzy-design/svelte';

  let val = $state<[Date | null, Date | null] | null>(null);

  // 周选择：单击任意日期即选中该周（周一~周日）
  function startOfWeek(d: Date): Date {
    const r = new Date(d);
    const day = (r.getDay() + 6) % 7; // 周一=0
    r.setDate(r.getDate() - day);
    return r;
  }
  function endOfWeek(d: Date): Date {
    const r = startOfWeek(d);
    r.setDate(r.getDate() + 6);
    return r;
  }
</script>

<Space vertical align="start">
  <!-- startDateOffset/endDateOffset：单击一个日期即选中整周 -->
  <span style="width:280px;display:inline-block">
    <RangePicker
      value={val}
      startDateOffset={startOfWeek}
      endDateOffset={endOfWeek}
      onChange={(r) => (val = r)}
    />
  </span>
  <Text type="tertiary">
    单击任意日期即选中整周：{val && val[0] && val[1]
      ? `${val[0].toLocaleDateString('zh-CN')} ~ ${val[1].toLocaleDateString('zh-CN')}`
      : '（未选）'}
  </Text>
</Space>
