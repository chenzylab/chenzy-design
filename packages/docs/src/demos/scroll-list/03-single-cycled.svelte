<script lang="ts">
  // 单列无限循环（对齐 Semi SingleWheelList）：cycled 到头尾可继续翻动，无缝衔接。
  // 奇数项禁用，滚动落定会跳过禁用项。motion=false 直达无缓动。
  import { ScrollList, ScrollItem, Button, Text } from '@chenzy-design/svelte';
  import type { ScrollItemSelectPayload } from '@chenzy-design/svelte';

  const minutes = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    disabled: i % 2 === 1,
  }));

  let idx = $state(2);
  function onSelect(data: ScrollItemSelectPayload): void {
    idx = data.index;
  }
</script>

<div style="width: 120px">
  <ScrollList header="单个无限滚动列表">
    <ScrollItem
      mode="wheel"
      cycled
      motion={false}
      list={minutes}
      selectedIndex={idx}
      {onSelect}
      ariaLabel="分钟"
    />
    {#snippet footer()}
      <Button size="small" type="primary" theme="solid">Ok</Button>
    {/snippet}
  </ScrollList>
</div>

<div style="margin-top:8px"><Text type="tertiary">选中分钟：{minutes[idx]?.value}</Text></div>
