<!--
  SkeletonImage — 图片占位块，镜像 Semi Skeleton.Image（item.tsx generator('image')）。
  默认 width:100% / height:100%（由 :global .cd-skeleton-image 定义），无内置图标（对齐 Semi）。
  尺寸自定义经 style/class 透传（Semi demo 亦如此，如 style={{ width:200, height:150 }}）。
-->
<script lang="ts">
  interface Props {
    class?: string;
    style?: string;
  }

  let { class: className, style }: Props = $props();

  const cls = $derived(
    ['cd-skeleton-image', className].filter(Boolean).join(' '),
  );
</script>

<div class={cls} {style}></div>
