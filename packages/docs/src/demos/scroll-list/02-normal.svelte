<script lang="ts">
  // 普通列表模式（mode="normal"，对齐 Semi ScrollList story）：
  // 不吸附居中，点击项即选中，选中项高亮背景。三列各自独立选择。
  import { ScrollList, ScrollItem, Button, Text } from '@chenzy-design/svelte';
  import type { ScrollItemSelectPayload } from '@chenzy-design/svelte';

  const list = Array.from({ length: 20 }, (_, i) => ({ value: i }));

  let idx1 = $state(1);
  let idx2 = $state(1);
  let idx3 = $state(1);

  function onSelect(data: ScrollItemSelectPayload): void {
    if (data.type === 1) idx1 = data.index;
    if (data.type === 2) idx2 = data.index;
    if (data.type === 3) idx3 = data.index;
  }
</script>

<div style="width: 320px">
  <ScrollList header="hello world">
    <ScrollItem mode="normal" {list} type={1} selectedIndex={idx1} {onSelect} ariaLabel="1" />
    <ScrollItem mode="normal" {list} type={2} selectedIndex={idx2} {onSelect} ariaLabel="2" />
    <ScrollItem mode="normal" {list} type={3} selectedIndex={idx3} {onSelect} ariaLabel="3" />
    {#snippet footer()}
      <Button size="small" type="primary" theme="solid">Ok</Button>
    {/snippet}
  </ScrollList>
</div>

<div style="margin-top:8px"><Text type="tertiary">选中：{idx1} / {idx2} / {idx3}</Text></div>
