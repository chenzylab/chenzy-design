<!--
  ToastContainer — 单例容器，订阅 store 渲染全部 toast。
  由 store.ts 惰性 mount 到 body 下的宿主节点；仅此一个实例。
  按 6 方位（topLeft/top/topRight/bottomLeft/bottom/bottomRight）分组渲染独立堆叠列，
  对齐 Notification 的方位实现。向后兼容：旧的纯 top/bottom 用法仍居中堆叠不变。
  进出场用 svelte/transition fly（运行时驱动，退场后 DOM 正常卸载，不卡 from 帧）；
  重排用 animate:flip。reduced-motion 时 fly duration 降为 0。
  红线 #2：方位分组（grouped）/进出场偏移（flyParams）为派生纯函数。
  红线：render 不读 effect 写的状态——toasts 初始同步读一次（拿到惰性挂载前已入队的首条），
  $effect 仅做订阅 + cleanup 退订。
-->
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { prefersReducedMotion } from 'svelte/motion';
  import type { ToastStore, ToastItem, ToastPosition } from '@chenzy-design/core';
  import ToastItemView from './ToastItem.svelte';
  import { getToastConfig } from './store.js';

  interface Props {
    store: ToastStore;
  }

  let { store }: Props = $props();

  // 初始同步读一次：捕获惰性挂载前已入队的首条 toast。
  // 用函数包裹读取，避免 state 初始化器直接引用 prop 触发 state_referenced_locally。
  // core 的 subscribe 不会立即回放当前值，因此必须在此先读一次。
  function readInitial(): ToastItem[] {
    return store.getToasts();
  }
  let toasts = $state<ToastItem[]>(readInitial());

  // 桥接外部（非 Svelte runes）store：订阅写入本地 state，cleanup 退订。
  // 这是 store->state 的单向桥，无法用 $derived 表达（外部 store 非响应式源）。
  $effect(() => {
    const unsub = store.subscribe((v) => {
      toasts = v;
    });
    return unsub;
  });

  const positions: ToastPosition[] = [
    'topLeft',
    'top',
    'topRight',
    'bottomLeft',
    'bottom',
    'bottomRight',
  ];

  const flyDuration = $derived(prefersReducedMotion.current ? 0 : 220);
  const flipDuration = $derived(prefersReducedMotion.current ? 0 : 200);

  // 红线 #2：方位分组纯派生——按 6 方位过滤当前 toasts。
  const grouped = $derived(
    positions.map((p) => ({
      position: p,
      items: toasts.filter((t) => t.position === p),
    })),
  );

  // 每方位进出场偏移：左侧从左滑入、右侧从右滑入、居中走垂直（对齐 Notification）。
  function flyParams(position: ToastPosition): { x: number; y: number } {
    if (position === 'topLeft' || position === 'bottomLeft') return { x: -24, y: 0 };
    if (position === 'topRight' || position === 'bottomRight') return { x: 24, y: 0 };
    return { x: 0, y: position === 'top' ? -16 : 16 };
  }

  function handleClose(id: string) {
    store.remove(id, 'manual');
  }
  function handlePause(id: string) {
    store.pause(id);
  }
  function handleResume(id: string) {
    store.resume(id);
  }

  // 全局配置衍生样式变量（应用到容器的 CSS 自定义属性）。
  function toPx(v: number | string | undefined): string | undefined {
    if (v === undefined) return undefined;
    return typeof v === 'number' ? `${v}px` : v;
  }

  const cfg = $derived(getToastConfig());
  const configStyle = $derived(() => {
    const parts: string[] = [];
    if (cfg.zIndex !== undefined) parts.push(`--cd-toast-z: ${cfg.zIndex}`);
    if (cfg.top !== undefined) parts.push(`--cd-toast-config-top: ${toPx(cfg.top)}`);
    if (cfg.bottom !== undefined) parts.push(`--cd-toast-config-bottom: ${toPx(cfg.bottom)}`);
    if (cfg.left !== undefined) parts.push(`--cd-toast-config-left: ${toPx(cfg.left)}`);
    if (cfg.right !== undefined) parts.push(`--cd-toast-config-right: ${toPx(cfg.right)}`);
    return parts.length > 0 ? parts.join('; ') : undefined;
  });

  // 任一 toast 带 stack 标志时，整组容器附加 stacked class。
  const hasStack = $derived(toasts.some((t) => t.stack));
</script>

{#each grouped as group (group.position)}
  {#if group.items.length > 0}
    <div
      class={['cd-toast-stack', `cd-toast-stack--${group.position}`, hasStack && 'cd-toast-wrapper--stacked']}
      style={configStyle()}
    >
      {#each group.items as t (t.id)}
        <div
          class="cd-toast-stack__item"
          in:fly={{ ...flyParams(group.position), duration: flyDuration }}
          out:fly={{ ...flyParams(group.position), duration: flyDuration }}
          animate:flip={{ duration: flipDuration }}
        >
          <ToastItemView
            toast={t}
            onClose={handleClose}
            onPause={handlePause}
            onResume={handleResume}
          />
        </div>
      {/each}
    </div>
  {/if}
{/each}

<style>
  .cd-toast-stack {
    position: fixed;
    z-index: var(--cd-toast-z);
    display: flex;
    flex-direction: column;
    gap: var(--cd-toast-stack-gap);
    inline-size: max-content;
    max-inline-size: calc(100vw - 32px);
    pointer-events: none;
  }

  .cd-toast-stack--topLeft {
    top: 24px;
    left: 24px;
    align-items: flex-start;
  }

  .cd-toast-stack--top {
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
  }

  .cd-toast-stack--topRight {
    top: 24px;
    right: 24px;
    align-items: flex-end;
  }

  .cd-toast-stack--bottomLeft {
    bottom: 24px;
    left: 24px;
    align-items: flex-start;
    flex-direction: column-reverse;
  }

  .cd-toast-stack--bottom {
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
    flex-direction: column-reverse;
  }

  .cd-toast-stack--bottomRight {
    bottom: 24px;
    right: 24px;
    align-items: flex-end;
    flex-direction: column-reverse;
  }

  .cd-toast-stack__item {
    inline-size: auto;
    max-inline-size: 100%;
    pointer-events: none;
  }
</style>
