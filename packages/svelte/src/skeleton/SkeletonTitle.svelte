<!--
  SkeletonTitle — 标题占位块，镜像 Semi Skeleton.Title（item.tsx generator('title')）。
  默认 width:100% / height:24px（由 :global .cd-skeleton-title 定义）。
  宽度自定义经 style/class 透传（Semi demo 用 style={{ width:120 }}）。
-->
<script lang="ts">
  interface Props {
    class?: string;
    style?: string;
  }

  let { class: className, style }: Props = $props();

  const cls = $derived(
    ['cd-skeleton-title', className].filter(Boolean).join(' '),
  );
</script>

<div class={cls} {style}></div>
