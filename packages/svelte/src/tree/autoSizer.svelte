<!--
  AutoSizer — 对齐 Semi Design `autoSizer.tsx`。
  观测父节点尺寸变化，扣除父节点 padding 后把可用高度经 children 参数暴露给虚拟滚动容器
  （对齐 Semi observeParent + paddingTop/paddingBottom 扣除逻辑）；高度未测出前不渲染内容
  （bailoutOnChildren，避免虚拟列表用 0 高度首帧闪烁）。复用库内 `ResizeObserver` 组件的
  observeParent 模式，不重复实现监听逻辑。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { CDResizeEntry } from '@chenzy-design/core';
  import ResizeObserverEl from '../resize-observer/ResizeObserver.svelte';

  interface Props {
    defaultHeight?: number | string;
    defaultWidth?: number | string;
    children?: Snippet<[{ width: number | string; height: number }]>;
  }

  let { defaultHeight = '100%', defaultWidth = '100%', children }: Props = $props();

  // 初始高度只取 defaultHeight 挂载时的值（对齐 Semi constructor 里 `this.state.height = defaultHeight || 0`），
  // 后续更新完全由 ResizeObserver 回调驱动，defaultHeight 变化不重置已测得的高度。
  // svelte-ignore state_referenced_locally
  let height = $state<number>(typeof defaultHeight === 'number' ? defaultHeight : 0);

  function onResize(entry: CDResizeEntry): void {
    const target = entry.target as HTMLElement;
    // observeParent 现同时观测自身与父节点两个目标（对齐 Semi，见 ResizeObserver.svelte 顶部说明）；
    // Semi autoSizer 只取 entries[1]（父节点那条），这里用 class 排除"自身"那条，只处理父节点尺寸。
    if (target.classList.contains('cd-tree-auto-wrapper')) return;
    const style = window.getComputedStyle(target);
    const paddingTop = parseInt(style.paddingTop, 10) || 0;
    const paddingBottom = parseInt(style.paddingBottom, 10) || 0;
    const newHeight = target.offsetHeight - paddingTop - paddingBottom;
    if (height !== newHeight) height = newHeight;
  }

  const bailoutOnChildren = $derived(height === 0);
  const wrapperHeightVar = $derived(
    typeof defaultHeight === 'number' ? `${defaultHeight}px` : defaultHeight,
  );
</script>

{#snippet content()}
  {#if !bailoutOnChildren && children}
    {@render children({ height, width: defaultWidth })}
  {/if}
{/snippet}

<div class="cd-tree-auto-wrapper-outer" style={`--cd-tree-auto-wrapper-height:${wrapperHeightVar}`}>
  <ResizeObserverEl observeParent {onResize} class="cd-tree-auto-wrapper" children={content} />
</div>

<style>
  .cd-tree-auto-wrapper-outer {
    height: var(--cd-tree-auto-wrapper-height);
    overflow: visible;
  }
  :global(.cd-tree-auto-wrapper) {
    height: 100%;
    overflow: visible;
  }
</style>
