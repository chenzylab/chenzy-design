<script lang="ts">
  // 单个无限滚动列表（对齐 Semi SingleWheelList story）：cycled + motion=false（无缓动直达）+ 无边框/阴影。
  import { ScrollList, ScrollItem, Button } from '@chenzy-design/svelte';
  import type { ScrollItemSelectPayload } from '@chenzy-design/svelte';

  let selectIndex3 = $state(-2);

  const minutes = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    disabled: i % 2 === 1,
  }));

  function onSelectMinute(data: ScrollItemSelectPayload): void {
    console.log('You have choose the minute for: ', data.value);
    if (data.type === 3) selectIndex3 = data.index;
  }

  function handleClose(): void {
    console.log('close');
  }
</script>

<ScrollList style="border:unset; box-shadow:unset;" header="单个无限滚动列表">
  <ScrollItem
    mode="wheel"
    cycled
    motion={false}
    list={minutes}
    type={3}
    selectedIndex={selectIndex3}
    onSelect={onSelectMinute}
    aria-label="分钟"
  />
  {#snippet footer()}
    <Button size="small" type="primary" theme="solid" onclick={handleClose}>Ok</Button>
  {/snippet}
</ScrollList>
