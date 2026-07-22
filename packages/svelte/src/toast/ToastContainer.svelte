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

  // 进/退场动画对齐 Semi：用 CSS keyframe（cd-toast-animation-show/hide）而非框架 transition，
  // 与 Semi（semi-ui/toast/index.tsx 的 Motion + startClassName + onAnimationEnd）同构。
  // 移除是两段式：core.remove 只标记 leaving（触发 hide keyframe），animationend 后调 finalizeRemove 真删。
  // 这样卸载时机由「动画真正结束」驱动，不依赖框架 transition 的 outro 调度（后者在 duration 边界会漏卸载）。
  // 离场动画结束回调：仅当该项仍处于 leaving 才真删（守卫，对齐 Semi animationState==='leave' 判断）。
  function handleAnimationEnd(item: ToastItem) {
    if (item.leaving) store.finalizeRemove(item.id);
  }

  // reduced-motion 时 CSS 动画时长归 0（见 style 块 @media），animationend 仍会在下一 tick 触发 →
  // 依然走 finalizeRemove 完成卸载，无需另设同步兜底。

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
</script>

<div class="cd-toast-wrapper" style={wrapperStyle()}>
  <div class="cd-toast-innerWrapper" class:cd-toast-innerWrapper-hover={hover} onmouseenter={handleEnter} onmouseleave={handleLeave} role="presentation">
    {#each toasts as t, i (t.id)}
      <!-- 进/退场由 CSS keyframe 承载：!leaving→show(enter)，leaving→hide(leave)；animationend 且 leaving 时 finalizeRemove 真删（对齐 Semi startClassName + onAnimationEnd） -->
      <div
        class="cd-toast-listItem"
        class:cd-toast-animation-show={!t.leaving}
        class:cd-toast-animation-hide={t.leaving}
        onanimationend={() => handleAnimationEnd(t)}
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

  /* —— 进/退场动画（对齐 Semi toast.scss animation-show/hide + keyframes）——
     300ms cubic-bezier(.22,.57,.02,1.2)，fill-mode forwards（保持终态直到卸载/被替换）。
     show：opacity 0→1 + translateY(-100%)→0；hide：opacity 1→0 + translateY(0)→-100%。
     hide 动画结束触发 onanimationend → finalizeRemove（卸载）。 */
  .cd-toast-animation-show {
    animation: cd-keyframe-toast-show 300ms cubic-bezier(0.22, 0.57, 0.02, 1.2) 0s;
    animation-fill-mode: forwards;
  }
  .cd-toast-animation-hide {
    animation: cd-keyframe-toast-hide 300ms cubic-bezier(0.22, 0.57, 0.02, 1.2) 0s;
    animation-fill-mode: forwards;
  }

  @keyframes cd-keyframe-toast-show {
    0% {
      opacity: 0;
      transform: translateY(-100%);
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes cd-keyframe-toast-hide {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-100%);
    }
  }

  /* 减少动效：动画时长归零（animationend 仍会在下一 tick 触发，保证离场后 finalizeRemove 卸载）。 */
  @media (prefers-reduced-motion: reduce) {
    .cd-toast-animation-show,
    .cd-toast-animation-hide {
      animation-duration: 0.01ms;
    }
  }
</style>
