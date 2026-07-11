<script lang="ts">
  import { Calendar, RadioGroup, Radio } from '@chenzy-design/svelte';

  // 对齐 Semi「设置周起始日」：weekStartsOn 0=周日 … 6=周六，对月 / 周视图生效。
  let weekStartsOn = $state<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
</script>

<RadioGroup
  type="button"
  ariaLabel="周起始日"
  value={weekStartsOn}
  onChange={(v) => (weekStartsOn = v as 0 | 1 | 2 | 3 | 4 | 5 | 6)}
>
  <Radio value={0}>周日</Radio>
  <Radio value={1}>周一</Radio>
  <Radio value={2}>周二</Radio>
  <Radio value={3}>周三</Radio>
  <Radio value={4}>周四</Radio>
  <Radio value={5}>周五</Radio>
  <Radio value={6}>周六</Radio>
</RadioGroup>

<div style="margin-top: 20px;">
  <Calendar mode="month" {weekStartsOn} />
</div>
