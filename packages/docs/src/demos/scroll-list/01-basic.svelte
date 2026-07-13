<script lang="ts">
  // 基本使用（对齐 Semi 官方主 demo）：滚轮三列——时段 / 小时 / 分钟。
  // 滚动或点击选择，选中项吸附到中央选区；header/footer 自定义头尾。
  import { ScrollList, ScrollItem, Button, Text } from '@chenzy-design/svelte';
  import type { ScrollItemSelectPayload } from '@chenzy-design/svelte';

  let idxAP = $state(1);
  let idxHour = $state(1);
  let idxMinute = $state(1);

  const ampms = [{ value: '上午' }, { value: '下午' }];
  const hours = Array.from({ length: 12 }, (_, i) => ({ value: i + 1 }));
  const minutes = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    disabled: i % 2 === 1,
  }));

  function onSelect(data: ScrollItemSelectPayload): void {
    if (data.type === 'ap') idxAP = data.index;
    if (data.type === 'hour') idxHour = data.index;
    if (data.type === 'minute') idxMinute = data.index;
  }
</script>

<div style="width: 320px">
  <ScrollList header="无限滚动列表">
    <ScrollItem
      mode="wheel"
      list={ampms}
      type="ap"
      selectedIndex={idxAP}
      {onSelect}
      ariaLabel="时段"
    />
    <ScrollItem
      mode="wheel"
      cycled
      list={hours}
      type="hour"
      selectedIndex={idxHour}
      {onSelect}
      ariaLabel="小时"
    />
    <ScrollItem
      mode="wheel"
      cycled
      list={minutes}
      type="minute"
      selectedIndex={idxMinute}
      {onSelect}
      ariaLabel="分钟"
    />
    {#snippet footer()}
      <Button size="small" type="primary" theme="solid">Ok</Button>
    {/snippet}
  </ScrollList>
</div>

<div style="margin-top:8px">
  <Text type="tertiary">
    当前：{ampms[idxAP]?.value} {hours[idxHour]?.value} 时 {minutes[idxMinute]?.value} 分
  </Text>
</div>
