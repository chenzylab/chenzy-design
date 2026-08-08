<script lang="ts">
  // observeParent（对齐 Semi observeParent）：观测包裹元素的父节点而非自身，
  // 用于「监听我所处容器的尺寸」而无需再包一层被观测元素。
  import { ResizeObserver, Text } from '@chenzy-design/svelte';

  let size = $state<{ width: number; height: number } | null>(null);
</script>

<Text type="tertiary">拖拽外层容器右下角：内部组件观测到的是「父容器」的尺寸</Text>
<div
  style="margin-top:8px; resize:both; overflow:auto; width:320px; height:140px; min-width:180px; min-height:90px; padding:12px; border:1px dashed var(--cd-color-border); border-radius:8px"
>
  <ResizeObserver observeParent onResize={(e) => (size = { width: e.width, height: e.height })}>
    {#snippet children()}
      <Text type="tertiary" size="small">
        父容器：{size ? `${Math.round(size.width)} × ${Math.round(size.height)}` : '—'} px
      </Text>
    {/snippet}
  </ResizeObserver>
</div>
