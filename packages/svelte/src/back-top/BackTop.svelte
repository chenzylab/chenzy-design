<!--
  BackTop — 回到顶部悬浮按钮（严格对齐 Semi backtop/index.tsx + foundation.ts）。

  Semi 契约（index.tsx BackTopProps，共 7 prop）：
    target / visibilityHeight(400) / duration(450) / onClick / style / className / children。
  DOM：仅在 visible 时渲染 `<div class="semi-backtop" style onClick>{children || <IconButton theme="light" icon={<IconChevronUp/>}/>}</div>`，
       不可见时返回 null（非 opacity 切换）。圆形按钮观感来自 IconButton(theme="light")，
       BackTop 自身 scss 只有 position/right/bottom/z/cursor/text-align/overflow（3 变量：z=10、right=100px、bottom=50px）。

  ⚠️ 死循环红线（对齐 Semi foundation 的命令式监听 + rAF）：
    - 滚动监听用 $effect 内命令式 addEventListener('scroll', ..., {passive:true}) + rAF 节流，
      cleanup 时 removeEventListener + cancelAnimationFrame；target 变化时重绑。
    - visible 仅在 scroll 回调（非 render 期）写入本地 $state；render 期只读，绝不读 scrollTop 几何。
    - 回顶动画为命令式 rAF 循环；卸载时在 $effect cleanup 中 cancel。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { isAboveThreshold, scrollPositionAt } from '@chenzy-design/core';
  import { IconChevronUp } from '@chenzy-design/icons';
  import IconButton from '../iconbutton/IconButton.svelte';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    /** 返回需要监听其滚动事件的元素对应 DOM 元素的函数。默认 () => window（对齐 Semi）。 */
    target?: () => HTMLElement | Window | null;
    /** 出现 BackTop 需要达到的滚动高度(px)（对齐 Semi，默认 400）。 */
    visibilityHeight?: number;
    /** 滚动到顶部的时间(ms)（对齐 Semi，默认 450）。 */
    duration?: number;
    /** 点击事件的回调函数。 */
    onClick?: (e: MouseEvent) => void;
    /** 自定义按钮内容（对齐 Semi children，替换默认 IconButton）。 */
    children?: Snippet;
    /** 根节点内联样式（对齐 Semi style）。 */
    style?: string;
    /** 根节点类名（对齐 Semi className）。 */
    class?: string;
  }

  let {
    target,
    visibilityHeight = 400,
    duration = 450,
    onClick,
    children,
    style = '',
    class: className = '',
  }: Props = $props();

  const loc = useLocale();

  // 本地响应式状态：仅由命令式 scroll 回调写入，render 期只读（驱动显隐）。
  let visible = $state(false);

  /**
   * 响应式解析滚动容器：在 $derived 内调用 target?.()，使其依赖被追踪——
   * target 通常 `() => someBoundEl`，bind:this 挂载后才赋值，借此让监听 $effect
   * 在元素就绪后重新求值并重绑。无 target 时恒为 window（对齐 Semi getDefaultTarget）。
   */
  const scroller = $derived<HTMLElement | Window>(target?.() ?? window);

  /** 读取某滚动容器当前 scrollTop（window 走 scrollY）。命令式，仅回调期调用。 */
  function getScrollTop(node: HTMLElement | Window): number {
    return node === window ? window.scrollY : (node as HTMLElement).scrollTop;
  }

  // 减弱动效偏好（命令式读取，仅 client）。
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

  // 滚动监听（命令式 + rAF 节流 + cleanup）。$effect 仅 client 运行，SSR 安全。
  // 依赖 scroller（含 target 求值）/ visibilityHeight：变化时 cleanup 旧绑定并重绑。
  $effect(() => {
    const node = scroller;
    const threshold = visibilityHeight;
    let rafId = 0;

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const top = getScrollTop(node);
        visible = isAboveThreshold(top, threshold);
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
  $effect(() => () => {
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
  });

  /** 把容器/window 滚到指定 y（命令式）。 */
  function scrollToY(node: HTMLElement | Window, y: number) {
    if (node === window) window.scrollTo(0, y);
    else (node as HTMLElement).scrollTop = y;
  }

  /** 点击回顶：对齐 Semi onClick → setScrollTop(0) + notifyClick。 */
  function handleClick(e: MouseEvent) {
    onClick?.(e);
    const node = target?.() ?? window;
    const from = getScrollTop(node);
    if (duration <= 0 || reduced) {
      scrollToY(node, 0);
      return;
    }
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      scrollToY(node, scrollPositionAt(from, elapsed, duration));
      if (elapsed < duration) scrollRaf = requestAnimationFrame(step);
      else scrollRaf = 0;
    };
    scrollRaf = requestAnimationFrame(step);
  }
</script>

{#if visible}
  <!--
    对齐 Semi：仅 visible 时渲染 div.semi-backtop（不可见时不在 DOM）。
    Semi 外层 div 只是可点击容器（无 role/tabindex），真实按钮语义/键盘可聚焦由内部
    IconButton(theme="light") 承担——避免 div[role=button] 再套 button 的嵌套交互问题。
    自定义 children 时外层同为可点击容器（对齐 Semi）。
  -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="cd-back-top {className}" {style} onclick={handleClick}>
    {#if children}
      {@render children()}
    {:else}
      <IconButton theme="light" ariaLabel={loc().t('BackTop.ariaLabel')} icon={defaultIcon} />
    {/if}
  </div>
{/if}

{#snippet defaultIcon()}
  <IconChevronUp />
{/snippet}

<style>
  /* 严格对齐 Semi semi-foundation/backtop/backtop.scss：仅定位/层级/光标/居中/裁剪。
     圆形按钮观感由内部 IconButton(theme="light") 提供，BackTop 自身无视觉 token。 */
  .cd-back-top {
    position: fixed;
    box-sizing: border-box;
    inset-inline-end: var(--cd-backtop-right);
    inset-block-end: var(--cd-backtop-bottom);
    z-index: var(--cd-backtop-z);
    cursor: pointer;
    text-align: center;
    overflow: hidden;
  }
</style>
