<!--
  Collapsible — 折叠容器**原语**：对任意 children 做高度折叠/展开过渡。无触发器 UI
  （aria-expanded 由使用方提供）。是 Collapse（手风琴）的底层能力，作为独立原语暴露以支持
  keepDOM / lazyRender / collapseHeight 等精细控制。DOM / API / 机制 / tokens 逐一镜像 Semi Collapsible。

  机制（单套，镜像 Semi index.tsx，不分 grid/measure 两套）：
    始终 ResizeObserver 测内容高度（scrollHeight / borderBox），wrapper 用**显式 height** 过渡：
      展开 → height = 实测内容高度；折叠 → height = collapsedHeight（默认 0，collapseHeight>0 时保留部分）。
    仅在过渡进行中（isTransitioning）且 motion 时挂 .cd-collapsible-transition（才有 transition），
    过渡结束（transitionend）移除——对齐 Semi «-transition» class 的开合。

  DOM（2 层，镜像 Semi）：
    .cd-collapsible-wrapper[.cd-collapsible-transition]  ← 显式 height / opacity / transition-duration
      └ <div overflow:hidden id={id}>  ← ref 测高，children 挂载于此

  §9.3 规避：
    - domHeight / domInRenderTree / isTransitioning 的写只在 ResizeObserver 回调（下一宏任务）或
      isOpen 变化的 $effect（读 isOpen/motion，不读自身），与 render 读分离。
    - hasBeenRendered（lazyRender 簿记）用普通变量，非 $state（render 期只读，写在渲染副作用后）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { collapsibleShouldRender, collapsibleCollapsedHeight } from '@chenzy-design/core';

  interface Props {
    /** 是否展开内容区域。 */
    isOpen?: boolean;
    /** 动画执行的时间（ms）。 */
    duration?: number;
    /** 是否开启动画（false 即时显隐）。 */
    motion?: boolean;
    /** 是否保留隐藏的面板 DOM 树（默认销毁）。 */
    keepDOM?: boolean;
    /** 配合 keepDOM 使用，为 true 时挂载时不会渲染组件（首帧惰性）。 */
    lazyRender?: boolean;
    /** 折叠高度（px，0=完全折叠；>0=保留部分作「展开更多」）。 */
    collapseHeight?: number;
    /** 当内容高度小于 collapseHeight 时，是否自适应内容高度（收起高度取 min(内容高度, collapseHeight)）。 */
    collapseHeightAdaptive?: boolean;
    /** 是否开启淡入淡出。 */
    fade?: boolean;
    /** 变更时重新计算子节点高度，用于优化动态渲染时的计算。 */
    reCalcKey?: number | string | undefined;
    /** id，会设置到 wrapper 内容元素，可配合其他组件的 aria-controls 指明控制关系。 */
    id?: string;
    /** 动画结束的回调。 */
    onMotionEnd?: (() => void) | undefined;
    /** 根节点 class。 */
    class?: string;
    /** 根节点内联样式。 */
    style?: string;
    /** 被折叠的内容。 */
    children?: Snippet;
  }

  let {
    isOpen = false,
    duration = 250,
    motion = true,
    keepDOM = false,
    lazyRender = false,
    collapseHeight = 0,
    collapseHeightAdaptive = false,
    fade = false,
    reCalcKey,
    id,
    onMotionEnd,
    class: className,
    style,
    children,
  }: Props = $props();

  // domHeight：实测内容高度。写只在 ResizeObserver 回调 / reCalcKey 重测（与 render 读分离，规避 §9.3）。
  let domHeight = $state(0);
  // domInRenderTree：内容是否在渲染树中（父级 display:none 时为 false）。对齐 Semi domInRenderTree。
  let domInRenderTree = $state(false);
  // visible：内容视觉可见（展开中/展开完成）。折叠过渡结束后置 false 以便卸载（非 keepDOM）。
  // svelte-ignore state_referenced_locally
  let visible = $state(isOpen);
  // isTransitioning：过渡进行中。isOpen 变化时置 true，transitionend 置 false。仅此时挂 -transition。
  // svelte-ignore state_referenced_locally
  let isTransitioning = $state(false);
  // hasBeenRendered：lazyRender 簿记，普通变量（非 $state；render 期只读，写在渲染副作用后）。
  // svelte-ignore state_referenced_locally
  let hasBeenRendered = isOpen;

  // isOpen 变化时（对齐 Semi getDerivedStateFromProps）：
  //   展开或无 motion → 立即同步 visible；motion 时置 isTransitioning=true。
  // 写读分离：只依赖 isOpen/motion，不读自身 visible/isTransitioning。
  // cacheIsOpen 故意只快照 isOpen 初始值（对齐 Semi cacheIsOpen，后续在 $effect 内比对更新）。
  // svelte-ignore state_referenced_locally
  let cacheIsOpen = isOpen;
  $effect(() => {
    if (isOpen !== cacheIsOpen) {
      if (isOpen || !motion) visible = isOpen;
      if (motion) isTransitioning = true;
      cacheIsOpen = isOpen;
    }
  });

  const shouldRender = $derived(
    collapsibleShouldRender({
      isOpen,
      keepDOM,
      lazyRender,
      collapseHeight,
      visible,
      hasBeenRendered,
    }),
  );
  // 渲染后置位 hasBeenRendered（普通变量，非响应式；规避 §9.3 render 期写 $state）。
  $effect(() => {
    if (shouldRender) hasBeenRendered = true;
  });

  // --- JS 测高（ResizeObserver + scrollHeight），对齐 Semi componentDidMount / handleResize ---
  let domEl: HTMLDivElement | null = $state(null);

  // 从 ResizeObserverEntry 取「是否在渲染树」与「高度」，对齐 Semi getEntryInfo。
  function getEntryInfo(entry: ResizeObserverEntry): { isShown: boolean; height: number } {
    if (entry.borderBoxSize && entry.borderBoxSize[0]) {
      const box = entry.borderBoxSize[0];
      return {
        isShown: !(box.blockSize === 0 && box.inlineSize === 0),
        height: Math.ceil(box.blockSize),
      };
    }
    const rect = entry.contentRect;
    return {
      isShown: !(rect.height === 0 && rect.width === 0),
      height: (entry.target as HTMLElement).clientHeight,
    };
  }

  $effect(() => {
    if (!domEl || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const info = getEntryInfo(entry);
      // 写在 RO 回调（异步宏任务），与 render 读分离。
      if (domHeight !== info.height) domHeight = info.height;
      if (domInRenderTree !== info.isShown) domInRenderTree = info.isShown;
    });
    ro.observe(domEl);
    // 挂载即测一次（对齐 Semi componentDidMount：offsetHeight>0 判定在渲染树后测 scrollHeight）。
    const inTree = domEl.offsetHeight > 0;
    domInRenderTree = inTree;
    if (inTree) domHeight = domEl.scrollHeight;
    return () => ro.disconnect();
  });

  // reCalcKey 变更 / 重回渲染树时重测（对齐 Semi componentDidUpdate）。
  $effect(() => {
    void reCalcKey;
    if (domInRenderTree && domEl) {
      const h = domEl.scrollHeight;
      if (h !== domHeight) domHeight = h;
    }
  });

  const collapsedHeight = $derived(
    collapsibleCollapsedHeight(collapseHeight, collapseHeightAdaptive, domHeight),
  );

  // wrapper 显式高度（对齐 Semi）：展开=实测内容高度，折叠=collapsedHeight。
  const wrapperHeight = $derived(`${isOpen ? domHeight : collapsedHeight}px`);
  // opacity（对齐 Semi）：展开 / 未开 fade / collapseHeight!==0 时为 1，否则 0。
  const wrapperOpacity = $derived(isOpen || !fade || collapseHeight !== 0 ? 1 : 0);
  // 过渡时长：仅 motion 且过渡进行中为 duration，否则 0（对齐 Semi）。
  const transitionDuration = $derived(`${motion && isTransitioning ? duration : 0}ms`);

  function handleTransitionEnd(): void {
    if (!isOpen) visible = false;
    isTransitioning = false;
    onMotionEnd?.();
  }

  const wrapperClass = $derived(
    ['cd-collapsible-wrapper', motion && isTransitioning && 'cd-collapsible-transition', className]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div
  class={wrapperClass}
  style:height={wrapperHeight}
  style:opacity={wrapperOpacity}
  style:transition-duration={transitionDuration}
  {style}
  ontransitionend={handleTransitionEnd}
>
  <div bind:this={domEl} class="cd-collapsible-content" {id}>
    {#if shouldRender}{@render children?.()}{/if}
  </div>
</div>

<style>
  /* wrapper：显式 height 过渡，overflow hidden 裁剪。对齐 Semi .semi-collapsible-wrapper。 */
  .cd-collapsible-wrapper {
    overflow: hidden;
  }
  /* 仅过渡进行中挂载：height + opacity 过渡。对齐 Semi .semi-collapsible-transition。 */
  .cd-collapsible-transition {
    transition:
      height var(--cd-transition-duration-collapsible-height)
        var(--cd-transition-function-collapsible-height)
        var(--cd-transition-delay-collapsible-height),
      opacity var(--cd-transition-duration-collapsible-opacity)
        var(--cd-transition-function-collapsible-opacity)
        var(--cd-transition-delay-collapsible-opacity);
  }
  /* 内容层：overflow hidden（对齐 Semi 内层 div style）。 */
  .cd-collapsible-content {
    overflow: hidden;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-collapsible-transition {
      transition-duration: 0ms !important;
    }
  }
</style>
