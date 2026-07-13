<!--
  仅供 List.bench.ts 使用的基准夹具：按 count 生成 dataSource，
  用 renderItem snippet 渲染真实行。隔离 snippet（snippet 只能在 .svelte 内定义）。
-->
<script lang="ts">
  import { List, ListItem } from './index.js';

  interface Props {
    count?: number;
  }
  let { count = 100 }: Props = $props();

  const dataSource = $derived(
    Array.from({ length: count }, (_, i) => ({ key: `r${i}`, title: `Item ${i}` })),
  );
</script>

<List {dataSource} bordered>
  {#snippet renderItem(item)}
    <ListItem main={(item as { title: string }).title} />
  {/snippet}
</List>
