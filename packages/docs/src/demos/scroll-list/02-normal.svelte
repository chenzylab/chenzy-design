<script lang="ts">
  // normal 模式（对齐 Semi ScrollList story）：三列同数据，点击选中、不吸附居中。
  import { ScrollList, ScrollItem, Button } from '@chenzy-design/svelte';
  import type { ScrollItemSelectPayload } from '@chenzy-design/svelte';

  let selectIndex1 = $state(1);
  let selectIndex2 = $state(1);
  let selectIndex3 = $state(1);

  const list = Array.from({ length: 20 }, (_, i) => ({ value: i }));

  function onSelect(data: ScrollItemSelectPayload): void {
    if (data.type === 1) selectIndex1 = data.index;
    if (data.type === 2) selectIndex2 = data.index;
    if (data.type === 3) selectIndex3 = data.index;
  }

  function handleClose(): void {
    console.log('close');
  }
</script>

<ScrollList header="hello world">
  <ScrollItem
    mode="normal"
    {list}
    type={1}
    selectedIndex={selectIndex1}
    {onSelect}
    aria-label="1"
  />
  <ScrollItem
    mode="normal"
    {list}
    type={2}
    selectedIndex={selectIndex2}
    {onSelect}
    aria-label="2"
  />
  <ScrollItem
    mode="normal"
    {list}
    type={3}
    selectedIndex={selectIndex3}
    {onSelect}
    aria-label="3"
  />
  {#snippet footer()}
    <Button size="small" type="primary" theme="solid" onclick={handleClose}>Ok</Button>
  {/snippet}
</ScrollList>
