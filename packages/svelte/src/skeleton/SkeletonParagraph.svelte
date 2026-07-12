<!--
  SkeletonParagraph — 段落占位块，镜像 Semi Skeleton.Paragraph（item.tsx Paragraph）。
  渲染 <ul> + rows 个 <li>；默认 rows=4。行宽/行高/行距 + 首行 100%、末行 60%
  由 Skeleton.svelte 的 :global .cd-skeleton-paragraph 样式定义（对齐 Semi）。
-->
<script lang="ts">
  interface Props {
    /** 段落占位行数，对齐 Semi，默认 4。 */
    rows?: number;
    class?: string;
    style?: string;
  }

  let { rows = 4, class: className, style }: Props = $props();

  const cls = $derived(
    ['cd-skeleton-paragraph', className].filter(Boolean).join(' '),
  );
  const lines = $derived(Array.from({ length: Math.max(0, rows) }, (_, i) => i));
</script>

<ul class={cls} {style}>
  {#each lines as i (i)}
    <li></li>
  {/each}
</ul>
