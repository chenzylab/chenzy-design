<!--
  Collapsible — see specs/components/show/Collapsible.spec.md
  折叠容器**原语**：对任意 children 做高度折叠/展开过渡。无触发器 UI（aria-expanded 由使用方提供）。
  是 Collapse（手风琴）的底层能力，作为独立原语暴露以支持 keepDOM / lazyRender / collapseHeight
  等精细控制，API 对齐 Semi Collapsible。

  两种折叠机制（择一，视 collapseHeight）：
    A. collapseHeight===0（默认）：CSS grid grid-template-rows 0fr↔1fr 过渡——自适应高度、无 JS 测量、
       无布局抖动（复用 Collapse 方案）。完全折叠。
    B. collapseHeight>0（「展开更多」，部分折叠）：CSS grid 无法保留部分高度，改用显式 height 过渡 +
       JS 测高（scrollHeight）。测量延后到 rAF（写读分离，规避 §9.3 effect 循环）；reCalcKey 变更重测。

  §9.3 规避：
    - hasBeenRendered（lazyRender 簿记）用普通变量，非 $state（render 期只读、写在过渡/挂载副作用）。
    - measuredHeight 的写只在 rAF 回调 / ResizeObserver 回调（下一宏任务），与 render 读分离。
    - ResizeObserver observe() 的首帧测量延后到 rAF，不在挂载 $effect 同步栈内读写自身 $state。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { collapsibleShouldRender, collapsibleCollapsedHeight } from '@chenzy-design/core';

  interface Props {
    /** 是否展开。 */
    isOpen?: boolean;
    /** 过渡时长（ms）。 */
    duration?: number;
    /** 是否启用过渡动画（false 即时显隐）。 */
    motion?: boolean;
    /** 折叠时是否保留 DOM（false 则完全折叠后移除内容 DOM）。 */
    keepDOM?: boolean;
    /** 首次展开前不渲染内容（配合 keepDOM，首帧惰性）。 */
    lazyRender?: boolean;
    /** 折叠时保留的高度（px，0=完全折叠；>0=保留部分作「展开更多」）。 */
    collapseHeight?: number;
    /** 折叠高度是否自适应（不超过实测内容高度）。 */
    collapseHeightAdaptive?: boolean;
    /** 折叠时是否叠加透明度渐变。 */
    fade?: boolean;
    /** 变更时强制重算高度（内容动态变化后触发重测，仅 collapseHeight>0 生效）。 */
    reCalcKey?: number | string;
    /** 内容容器 id。 */
    id?: string;
    /** 展开/折叠过渡动画结束回调。 */
    onMotionEnd?: () => void;
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

  // 部分折叠（保留高度）时走 JS 测高机制；否则走纯 CSS grid。
  const usesMeasure = $derived(collapseHeight > 0);

  // visible：内容视觉可见（展开中/展开完成）。折叠过渡结束后置 false 以便卸载（非 keepDOM）。
  // svelte-ignore state_referenced_locally
  let visible = $state(isOpen);
  // hasBeenRendered：lazyRender 簿记，普通变量（非 $state；render 期只读，写在渲染副作用后）。
  // svelte-ignore state_referenced_locally
  let hasBeenRendered = isOpen;
  // measuredHeight：JS 测高结果（仅 collapseHeight>0 用）。写只在 rAF / RO 回调（写读分离）。
  let measuredHeight = $state(0);

  // isOpen 变化时同步 visible（展开立即可见；折叠保持可见直到过渡结束）。
  // 无 motion 时折叠即时置不可见。写读分离：只依赖 isOpen/motion，不读自身 visible。
  // svelte-ignore state_referenced_locally
  let prevIsOpen = isOpen;
  $effect(() => {
    if (isOpen !== prevIsOpen) {
      if (isOpen || !motion) visible = isOpen;
      prevIsOpen = isOpen;
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

  // --- JS 测高（仅 collapseHeight>0）---
  let contentEl: HTMLDivElement | null = $state(null);
  let rafId = 0;

  function measure(): void {
    if (typeof requestAnimationFrame === 'undefined') return; // SSR / 无 rAF 环境
    if (rafId) cancelAnimationFrame(rafId);
    // 延后到下一帧：写（measuredHeight）与 render 读分离，规避 §9.3。
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      if (contentEl) {
        const h = contentEl.scrollHeight;
        if (h !== measuredHeight) measuredHeight = h;
      }
    });
  }

  $effect(() => {
    if (!usesMeasure || !contentEl) return;
    // reCalcKey 依赖：变更即重测（读一次建立依赖）。
    void reCalcKey;
    void isOpen;
    measure();
    // ResizeObserver 可能不存在（jsdom / 老环境）：优雅降级为仅首帧测量。
    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : null;
    ro?.observe(contentEl);
    return () => {
      ro?.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };
  });

  const collapsedHeight = $derived(
    collapsibleCollapsedHeight(collapseHeight, collapseHeightAdaptive, measuredHeight),
  );

  // 显式高度（仅测高机制）：展开=测得高度（auto 兜底），折叠=collapsedHeight。
  const explicitHeight = $derived.by(() => {
    if (!usesMeasure) return undefined;
    if (isOpen) return measuredHeight > 0 ? `${measuredHeight}px` : 'auto';
    return `${collapsedHeight}px`;
  });

  const transitionDuration = $derived(motion ? `${duration}ms` : '0ms');
  // fade：折叠且完全折叠（collapseHeight===0）时透明。对齐 Semi opacity 逻辑。
  const wrapperOpacity = $derived(!isOpen && fade && collapseHeight === 0 ? 0 : 1);

  // aria-hidden：完全折叠（不 keepDOM 且 collapseHeight===0）且已不可见时，内容移出可达性树。
  const contentHidden = $derived(!isOpen && !visible && collapseHeight === 0 ? true : undefined);

  function handleTransitionEnd(e: TransitionEvent): void {
    // 只响应本容器自身的高度过渡（grid-template-rows / height），忽略子元素冒泡。
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== 'grid-template-rows' && e.propertyName !== 'height') return;
    if (!isOpen) visible = false;
    onMotionEnd?.();
  }

  const rootClass = $derived(
    ['cd-collapsible', motion && 'cd-collapsible--motion', usesMeasure && 'cd-collapsible--measure']
      .filter(Boolean)
      .join(' '),
  );
</script>

{#if usesMeasure}
  <!-- 机制 B：collapseHeight>0 部分折叠，显式 height 过渡 + JS 测高。 -->
  <div
    class={[rootClass, className].filter(Boolean).join(' ')}
    style:height={explicitHeight}
    style:opacity={wrapperOpacity}
    style:transition-duration={transitionDuration}
    style={style}
    ontransitionend={handleTransitionEnd}
  >
    <div bind:this={contentEl} class="cd-collapsible__content" {id} aria-hidden={contentHidden}>
      {#if shouldRender}{@render children?.()}{/if}
    </div>
  </div>
{:else}
  <!-- 机制 A：默认完全折叠，CSS grid grid-template-rows 0fr↔1fr 自适应过渡（无 JS 测量）。 -->
  <div
    class={[rootClass, className].filter(Boolean).join(' ')}
    class:cd-collapsible--open={isOpen}
    style:opacity={wrapperOpacity}
    style:transition-duration={transitionDuration}
    style={style}
    ontransitionend={handleTransitionEnd}
  >
    <div class="cd-collapsible__inner">
      <div bind:this={contentEl} class="cd-collapsible__content" {id} aria-hidden={contentHidden}>
        {#if shouldRender}{@render children?.()}{/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* 机制 A：grid 0fr↔1fr 自适应折叠（无 JS 测高）。 */
  .cd-collapsible {
    display: grid;
    grid-template-rows: 0fr;
    transition-property: opacity;
    transition-timing-function: var(--cd-collapsible-motion-ease);
    transition-duration: 0ms;
  }
  .cd-collapsible--open {
    grid-template-rows: 1fr;
  }
  .cd-collapsible--motion {
    transition-property: grid-template-rows, opacity;
  }
  .cd-collapsible__inner {
    overflow: hidden;
    min-block-size: 0;
  }

  /* 机制 B：collapseHeight>0，显式 height 过渡。root 覆盖为 block+overflow hidden。 */
  .cd-collapsible--measure {
    display: block;
    overflow: hidden;
    grid-template-rows: none;
    transition-property: opacity;
  }
  .cd-collapsible--measure.cd-collapsible--motion {
    transition-property: height, opacity;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-collapsible--motion,
    .cd-collapsible--measure.cd-collapsible--motion {
      transition-duration: 0ms !important;
    }
  }
</style>
