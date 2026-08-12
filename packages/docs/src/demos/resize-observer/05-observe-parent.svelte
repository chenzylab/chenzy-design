<script lang="ts">
  // observeParent（严格对齐 Semi observeParent）：额外同时观测父节点，非替代自身——
  // 回调会收到两条 entry（自身 + 父节点），排除组件自身固定的 .cd-resize-observer 包裹元素，
  // 只保留父容器那条。
  import { ResizeObserver, Text } from '@chenzy-design/svelte';

  let size = $state<{ width: number; height: number } | null>(null);
</script>

<Text type="tertiary">拖拽外层容器右下角：内部组件同时观测自身与「父容器」，此处只展示父容器尺寸</Text>
<div
  style="margin-top:8px; resize:both; overflow:auto; width:320px; height:140px; min-width:180px; min-height:90px; padding:12px; border:1px dashed var(--cd-color-border); border-radius:8px"
>
  <ResizeObserver
    observeParent
    onResize={(e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('cd-resize-observer')) return;
      size = { width: e.width, height: e.height };
    }}
  >
    {#snippet children()}
      <Text type="tertiary" size="small">
        父容器：{size ? `${Math.round(size.width)} × ${Math.round(size.height)}` : '—'} px
      </Text>
    {/snippet}
  </ResizeObserver>
</div>
