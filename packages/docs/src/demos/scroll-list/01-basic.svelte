<script lang="ts">
  // 基本使用（对齐 Semi）：滚轮三列——时段 / 小时 / 分钟。
  // 滚动列表提供类似 iOS 的滚动选择模式，支持滚动至指定窗口位置选择与点击选择。
  import { ScrollList, ScrollItem, Button } from '@chenzy-design/svelte';
  import type { ScrollItemSelectPayload } from '@chenzy-design/svelte';

  let selectIndex1 = $state(1);
  let selectIndex2 = $state(1);
  let selectIndex3 = $state(1);

  const ampms = [{ value: '上午' }, { value: '下午' }];
  const hours = Array.from({ length: 12 }, (_, i) => ({ value: i + 1 }));
  const minutes = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    disabled: i % 2 === 1,
  }));

  function onSelect(data: ScrollItemSelectPayload): void {
    if (data.type === 'ap') selectIndex1 = data.index;
    if (data.type === 'hour') selectIndex2 = data.index;
    if (data.type === 'minute') selectIndex3 = data.index;
  }
</script>

<ScrollList style="border:unset; box-shadow:unset;" header="无限滚动列表">
  <ScrollItem
    mode="wheel"
    cycled={false}
    list={ampms}
    type="ap"
    selectedIndex={selectIndex1}
    {onSelect}
    ariaLabel="时段"
  />
  <ScrollItem
    mode="wheel"
    cycled
    list={hours}
    type="hour"
    selectedIndex={selectIndex2}
    {onSelect}
    ariaLabel="小时"
  />
  <ScrollItem
    mode="wheel"
    cycled
    list={minutes}
    type="minute"
    selectedIndex={selectIndex3}
    {onSelect}
    ariaLabel="分钟"
  />
  {#snippet footer()}
    <Button size="small" type="primary" theme="solid">Ok</Button>
  {/snippet}
</ScrollList>
