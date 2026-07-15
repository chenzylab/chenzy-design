<!--
  ToastContainer — 单例容器，订阅 store 渲染全部 toast，严格对齐 Semi Design
  （semi-ui/toast/index.tsx 的 ToastList + toast.scss 的 wrapper/innerWrapper 定位/动画）。
  DOM 结构镜像 Semi：
    div.cd-toast-wrapper                         ← fixed, top:0, width:100%, flex justify-center
      div.cd-toast-innerWrapper[-hover]          ← fit-content 居中，stack hover 时加 -hover
        ToastItem × N
  定位对齐 Semi scss：wrapper top:0 居中；config 的 top/left/bottom/right/zIndex 经 getToastConfig
  注入 wrapper inline style（对齐 Semi index.tsx 对 wrapper div 直接设 style[pos]）。
  进/退场动画对齐 Semi animation.scss：opacity 0↔1 + translateY(-100%)↔0，
  300ms cubic-bezier(.22,.57,.02,1.2)（Semi 组件级动画常量，非全局 token，字面直连）。
  堆叠顺序对齐 Semi：store 新 toast 追加到队尾（[...list, item]），innerWrapper 普通 flex column，新的在下。
  stack 展开：innerWrapper mouseenter → hover=true → 每条 zero-height-wrapper 撑开为实测高度（对齐 Semi mouseInSide）。
  红线：render 不读 effect 写的状态——toasts 初始同步读一次（拿到惰性挂载前已入队的首条），
  $effect 仅做订阅 + cleanup 退订。
-->
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { prefersReducedMotion } from 'svelte/motion';
  import type { ToastStore, ToastItem } from '@chenzy-design/core';
  import ToastItemView from './ToastItem.svelte';
  import type { ToastPositionConfig } from './store.js';

  interface Props {
    store: ToastStore;
    /** 位置配置 getter（top/left/bottom/right/zIndex），闭包隔离多实例。局部 holder 可省略。 */
    getPositionConfig?: () => ToastPositionConfig;
  }

  let { store, getPositionConfig }: Props = $props();

  // 初始同步读一次：捕获惰性挂载前已入队的首条 toast。
  // core 的 subscribe 不会立即回放当前值，因此必须在此先读一次。
  function readInitial(): ToastItem[] {
    return store.getToasts();
  }
  let toasts = $state<ToastItem[]>(readInitial());

  // 桥接外部（非 Svelte runes）store：订阅写入本地 state，cleanup 退订。
  $effect(() => {
    const unsub = store.subscribe((v) => {
      toasts = v;
    });
    return unsub;
  });

  // 动画时长：reduced-motion 时降为 0（对齐 Semi 动画 300ms）。
  const SEMI_DURATION = 300;
  const flyDuration = $derived(prefersReducedMotion.current ? 0 : SEMI_DURATION);
  const flipDuration = $derived(prefersReducedMotion.current ? 0 : SEMI_DURATION);
  // Semi 缓动 cubic-bezier(.22,.57,.02,1.2) 的求值函数（供 transition easing）。
  const semiEase = bezier(0.22, 0.57, 0.02, 1.2);

  // 任一 toast 带 stack → 整组走堆叠模式（对齐 Semi ref.stack）。
  const stacked = $derived(toasts.some((t) => t.stack));

  // stack 展开态：innerWrapper hover 时 true（对齐 Semi mouseInSide）。
  // 展开时每个 ToastItem 自测高度撑开 zero-height-wrapper（对齐 Semi Toast.render 里对 toastEle 测高）。
  let hover = $state(false);

  function handleEnter() {
    if (!stacked) return;
    hover = true;
  }
  function handleLeave() {
    if (!stacked) return;
    hover = false;
  }

  // 全局配置（top/left/bottom/right/zIndex）注入 wrapper inline style（对齐 Semi index.tsx）。
  function toPx(v: number | string | undefined): string | undefined {
    if (v === undefined) return undefined;
    return typeof v === 'number' ? `${v}px` : v;
  }
  const cfg = $derived(getPositionConfig?.() ?? {});
  const wrapperStyle = $derived(() => {
    const parts: string[] = [];
    if (cfg.zIndex !== undefined) parts.push(`z-index:${cfg.zIndex}`);
    const top = toPx(cfg.top);
    const bottom = toPx(cfg.bottom);
    const left = toPx(cfg.left);
    const right = toPx(cfg.right);
    if (top !== undefined) parts.push(`top:${top}`);
    if (bottom !== undefined) parts.push(`bottom:${bottom}`);
    if (left !== undefined) parts.push(`left:${left}`);
    if (right !== undefined) parts.push(`right:${right}`);
    return parts.length ? parts.join(';') : undefined;
  });

  // 三次贝塞尔求值（对齐 Notification 做法，用于 transition easing）。
  function bezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
    const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
    const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
    return (x: number) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) {
        const dx = sampleX(t) - x;
        if (Math.abs(dx) < 1e-5) break;
        const d = sampleDX(t);
        if (Math.abs(d) < 1e-6) break;
        t -= dx / d;
      }
      return sampleY(t);
    };
  }
</script>

<div class="cd-toast-wrapper" style={wrapperStyle()}>
  <div class="cd-toast-innerWrapper" class:cd-toast-innerWrapper-hover={hover} onmouseenter={handleEnter} onmouseleave={handleLeave} role="presentation">
    {#each toasts as t, i (t.id)}
      <div
        class="cd-toast-listItem"
        in:fly={{ y: -16, duration: flyDuration, easing: semiEase }}
        out:fly={{ y: -16, duration: flyDuration, easing: semiEase }}
        animate:flip={{ duration: flipDuration }}
      >
        <ToastItemView
          toast={t}
          onClose={(id) => store.remove(id)}
          onPause={(id) => store.pause(id)}
          onResume={(id) => store.resume(id)}
          expanded={stacked && hover}
          reservedIndex={toasts.length - i - 1}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  /* —— 容器（对齐 Semi .semi-toast-wrapper）—— */
  .cd-toast-wrapper {
    position: fixed;
    height: 0;
    top: var(--cd-spacing-toast-wrapper-top);
    width: var(--cd-width-toast-wrapper);
    display: flex;
    justify-content: center;
    z-index: var(--cd-z-toast);
    pointer-events: none;
  }

  /* —— 内层（对齐 Semi .semi-toast-innerWrapper）—— */
  .cd-toast-innerWrapper {
    width: fit-content;
    height: fit-content;
    text-align: center;
    pointer-events: none;
  }

  /* hover 展开态：取消 3D 透视（对齐 Semi -innerWrapper-hover）。 */
  .cd-toast-innerWrapper-hover :global(.cd-toast-zero-height-wrapper) {
    perspective: unset;
    perspective-origin: center center;
  }

  .cd-toast-listItem {
    pointer-events: none;
  }
</style>
