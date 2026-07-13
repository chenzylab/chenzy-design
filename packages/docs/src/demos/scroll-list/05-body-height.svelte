<script lang="ts">
  // 自定义 body 高度（bodyHeight，补全 Semi ScrollList 的 bodyHeight prop）：
  // 收窄可视高度到 180px，可见行数随之减少；wheel 列仍居中吸附。
  import { ScrollList, ScrollItem, Text } from '@chenzy-design/svelte';
  import type { ScrollItemSelectPayload } from '@chenzy-design/svelte';

  const nums = Array.from({ length: 30 }, (_, i) => ({ value: i }));

  let idx = $state(5);
  function onSelect(data: ScrollItemSelectPayload): void {
    idx = data.index;
  }
</script>

<div style="width: 120px">
  <ScrollList header="紧凑高度" bodyHeight={180}>
    <ScrollItem mode="wheel" list={nums} selectedIndex={idx} {onSelect} ariaLabel="数值" />
  </ScrollList>
</div>

<div style="margin-top:8px"><Text type="tertiary">选中：{nums[idx]?.value}</Text></div>
