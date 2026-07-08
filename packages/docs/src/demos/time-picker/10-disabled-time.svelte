<script lang="ts">
  import { TimePicker, Text } from '@chenzy-design/svelte';

  let value = $state<Date | null>(null);

  // disabledTime 按当前已选时间动态返回禁用规则：
  // 禁用 0 ~ 6 点；且当已选到某小时时，禁用该小时之前的所有分钟。
  function disabledTime(date: Date) {
    const h = date.getHours();
    return {
      disabledHours: () => [0, 1, 2, 3, 4, 5, 6],
      disabledMinutes: (hour: number) =>
        hour === h ? Array.from({ length: date.getMinutes() }, (_, i) => i) : [],
    };
  }
</script>

<div style="display:flex; align-items:center; gap:12px">
  <TimePicker
    {value}
    {disabledTime}
    onChange={(t) => (value = Array.isArray(t) ? t[0] : t)}
  />
  <Text type="tertiary">disabledTime 按已选时间动态禁用（0 ~ 6 点 + 更早分钟）</Text>
</div>
