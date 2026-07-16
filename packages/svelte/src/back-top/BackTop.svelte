<!--
  BackTop — 回到顶部悬浮按钮。
  支持：自定义 target 滚动容器 / window + 阈值显隐 + 受控 visible + 平滑缓动回顶
        + announceOnArrive 到顶播报 + 三尺寸。

  ⚠️ 死循环红线：
    - 滚动监听用 $effect 内命令式 addEventListener('scroll', ..., {passive:true})
      + rAF 节流，cleanup 时 removeEventListener + cancelAnimationFrame；target 变化时重绑。
    - autoVisible 仅在 scroll 回调（非 render 期）写入本地 $state。
    - render 期只读派生的 visible（受控值或 autoVisible），绝不读 scrollTop 几何。
    - 受控 visible：仅读 prop + 触发 onVisibleChange 回调，绝不回写。
    - 回顶动画亦为命令式 rAF 循环；卸载时在 $effect cleanup 中 cancel。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { isAboveThreshold, scrollPositionAt } from '@chenzy-design/core';
  import { IconChevronUp } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';

  interface Props {
    /**
     * 监听并回顶的滚动容器。返回 HTMLElement | CSS 选择器字符串 | null。
     * 不传或返回 null/window 时监听 window（默认行为，向后兼容）。
     */
    target?: () => HTMLElement | string | Window | null;
    /**
     * 受控显隐：传入时由外部决定按钮显隐（内部阈值判定仅用于触发 onVisibleChange）；
     * 不传则内部按 visibilityHeight 阈值自动显隐。
     */
    visible?: boolean;
    /** 回到顶部后用 ARIA live region 播报（文案经 locale BackTop.arrived）。 */
    announceOnArrive?: boolean;
    /** 滚动超过此高度(px)显示按钮 */
    visibilityHeight?: number;
    /** 回顶动画时长(ms)，0 表示瞬时 */
    duration?: number;
    /** 距底偏移，number → px */
    bottom?: number | string;
    /** 距 inline-end 偏移，number → px */
    right?: number | string;
    size?: Size;
    ariaLabel?: string;
    /** 替换图标（保留圆形按钮外壳） */
    icon?: Snippet<[{ size: Size }]>;
    /** 完全自定义按钮内容 */
    children?: Snippet<[{ visible: boolean }]>;
    onClick?: (e: MouseEvent) => void;
    onVisibleChange?: (info: { visible: boolean }) => void;
    onScrollEnd?: () => void;
    class?: string;
  }

  let {
    target,
    visible: controlledVisible,
    announceOnArrive = false,
    visibilityHeight = 400,
    duration = 450,
    bottom = 50,
    right = 100,
    size = 'default',
    ariaLabel,
    icon,
    children,
    onClick,
    onVisibleChange,
    onScrollEnd,
    class: className = '',
  }: Props = $props();

  const loc = useLocale();

  // 本地响应式状态：仅由命令式 scroll 回调写入，render 期只读（非受控时驱动显隐）。
  let autoVisible = $state(false);

  // 派生显隐（红线 #2 纯函数）：受控时取 prop，否则取内部阈值态。render 期只读。
  const visible = $derived(controlledVisible ?? autoVisible);

  // 到顶播报文案（live region 命令式写入，初始为空）。
  let announceText = $state('');

  // 偏移样式：number → px。
  const bottomPx = $derived(typeof bottom === 'number' ? `${bottom}px` : bottom);
  const rightPx = $derived(typeof right === 'number' ? `${right}px` : right);

  /**
   * 把 target 原始返回值规整为「滚动元素 | window」。null 视为 window；
   * 选择器字符串经 querySelector 解析，解析失败回退 window。
   */
  function normalizeScroller(raw: HTMLElement | string | Window | null | undefined): HTMLElement | Window {
    if (raw == null || raw === window) return window;
    if (typeof raw === 'string') {
      if (typeof document === 'undefined') return window;
      return (document.querySelector<HTMLElement>(raw)) ?? window;
    }
    return raw;
  }

  /**
   * 响应式解析的滚动容器：在 $derived 内调用 target?.()，使其依赖被追踪——
   * target 通常 `() => someBoundEl`，bind:this 在挂载后才赋值，借此让监听 $effect
   * 在元素就绪后重新求值并重绑（红线 #3）。无 target 时恒为 window。
   */
  const scroller = $derived(normalizeScroller(target?.()));

  /** scrollToTop 等命令式路径用：即时解析（不依赖响应式快照）。 */
  function resolveScroller(): HTMLElement | Window {
    return normalizeScroller(target?.());
  }

  /** 读取某滚动容器当前 scrollTop（window 走 scrollY）。命令式，仅回调期调用。 */
  function getScrollTop(scroller: HTMLElement | Window): number {
    return scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;
  }

  // 减弱动效偏好（命令式读取，仅 client）。
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

  // 滚动监听（命令式 + rAF 节流 + cleanup）。$effect 仅 client 运行，SSR 安全。
  // 依赖 scroller（含 target 求值）/ visibilityHeight：变化时 cleanup 旧绑定并重绑（红线 #3）。
  $effect(() => {
    const node = scroller; // 响应式：容器(或 window)变化时重绑
    const threshold = visibilityHeight; // 追踪阈值
    let rafId = 0;

    function onScroll() {
      if (rafId) return; // rAF 节流
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        // scrollTop 读取发生在回调中（非 render 期）。
        const top = getScrollTop(node);
        const next = isAboveThreshold(top, threshold);
        // 内部阈值态：受控时不驱动 render，但仍维护以触发 onVisibleChange。
        if (next !== autoVisible) {
          autoVisible = next;
          onVisibleChange?.({ visible: next });
        }
      });
    }

    node.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // 初始判定一次
    return () => {
      node.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  });

  // 回顶动画的 rAF 句柄（组件级，供卸载 cleanup 取消）。
  let scrollRaf = 0;

  $effect(() => {
    // 仅注册卸载时取消未完成的回顶动画。
    return () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  });

  /** 把容器/window 滚到指定 y（命令式）。 */
  function scrollToY(scroller: HTMLElement | Window, y: number) {
    if (scroller === window) window.scrollTo(0, y);
    else (scroller as HTMLElement).scrollTop = y;
  }

  /** 到顶后写入 live region 播报（announceOnArrive 开启时）。先清空确保重复可重播。 */
  function announceArrived() {
    if (!announceOnArrive) return;
    announceText = '';
    // 微任务后再写入，确保 DOM 先清空再赋值，触发 AT 重新播报。
    queueMicrotask(() => {
      announceText = loc().t('BackTop.arrived');
    });
  }

  function finishScroll() {
    scrollRaf = 0;
    onScrollEnd?.();
    announceArrived();
  }

  function scrollToTop(e: MouseEvent) {
    onClick?.(e);
    const scroller = resolveScroller();
    const from = getScrollTop(scroller);
    if (duration <= 0 || reduced) {
      scrollToY(scroller, 0);
      finishScroll();
      return;
    }
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      scrollToY(scroller, scrollPositionAt(from, elapsed, duration));
      if (elapsed < duration) {
        scrollRaf = requestAnimationFrame(step);
      } else {
        finishScroll();
      }
    };
    scrollRaf = requestAnimationFrame(step);
  }
</script>

<button
  type="button"
  class="cd-backtop cd-backtop--{size} {className}"
  class:cd-backtop--visible={visible}
  aria-label={ariaLabel ?? loc().t('BackTop.ariaLabel')}
  aria-hidden={!visible}
  tabindex={visible ? 0 : -1}
  style="--cd-backtop-offset-bottom:{bottomPx}; --cd-backtop-offset-inline-end:{rightPx}"
  onclick={scrollToTop}
>
  {#if children}
    {@render children({ visible })}
  {:else if icon}
    {@render icon({ size })}
  {:else}
    <IconChevronUp size="large" aria-hidden="true" />
  {/if}
</button>

{#if announceOnArrive}
  <!-- 到顶播报 live region：视觉隐藏，仅供辅助技术读取（红线 #2：render 期只读 $state）。 -->
  <div class="cd-sr-only" role="status" aria-live="polite" aria-atomic="true">
    {announceText}
  </div>
{/if}

<style>
  .cd-backtop {
    position: fixed;
    box-sizing: border-box;
    /* 距底 / inline-end 偏移对齐 Semi：$spacing-backtop-bottom 50px / $spacing-backtop-right 100px。 */
    inset-block-end: var(--cd-backtop-offset-bottom, 50px);
    inset-inline-end: var(--cd-backtop-offset-inline-end, 100px);
    inline-size: var(--cd-backtop-size);
    block-size: var(--cd-backtop-size);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    text-align: center;
    padding: 0;
    border: 1px solid var(--cd-backtop-border);
    border-radius: var(--cd-backtop-radius);
    background: var(--cd-backtop-bg);
    color: var(--cd-backtop-color);
    box-shadow: var(--cd-backtop-shadow);
    cursor: pointer;
    z-index: var(--cd-backtop-z);
    /* 隐藏态（默认） */
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(8px);
    transition:
      opacity var(--cd-backtop-motion-duration) ease,
      transform var(--cd-backtop-motion-duration) ease,
      visibility var(--cd-backtop-motion-duration) ease;
  }

  .cd-backtop--visible {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0);
  }

  .cd-backtop--small {
    inline-size: var(--cd-backtop-size-small);
    block-size: var(--cd-backtop-size-small);
  }

  .cd-backtop--large {
    inline-size: var(--cd-backtop-size-large);
    block-size: var(--cd-backtop-size-large);
  }

  .cd-backtop:hover {
    background: var(--cd-backtop-bg-hover);
  }

  .cd-backtop:active {
    background: var(--cd-backtop-bg-active);
  }

  .cd-backtop:focus-visible {
    outline: 2px solid var(--cd-backtop-focus-ring);
    outline-offset: 2px;
  }

  /* 到顶播报 live region 复用 tokens.css 全局 .cd-sr-only：视觉隐藏但 AT 可读。 */

  @media (prefers-reduced-motion: reduce) {
    .cd-backtop {
      transition: none;
    }
  }
</style>
