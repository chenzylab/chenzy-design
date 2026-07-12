<!--
  SkeletonButton — 按钮占位块，镜像 Semi Skeleton.Button（item.tsx generator('button')）。
  默认 width:115px / height:32px（由 :global .cd-skeleton-button 定义）。
  尺寸自定义经 style/class 透传。
-->
<script lang="ts">
  interface Props {
    class?: string;
    style?: string;
  }

  let { class: className, style }: Props = $props();

  const cls = $derived(
    ['cd-skeleton-button', className].filter(Boolean).join(' '),
  );
</script>

<div class={cls} {style}></div>
