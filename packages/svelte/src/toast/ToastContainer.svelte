<!--
  ToastContainer — 单例容器，订阅 store 渲染全部 toast。
  由 store.ts 惰性 mount 到 body 下的宿主节点；仅此一个实例。
  按 position 分 top / bottom 两个固定定位堆叠列。
  进出场用 svelte/transition fly（运行时驱动，退场后 DOM 正常卸载，不卡 from 帧）；
  重排用 animate:flip。reduced-motion 时 fly duration 降为 0。
  红线：render 不读 effect 写的状态——toasts 初始同步读一次（拿到惰性挂载前已入队的首条），
  $effect 仅做订阅 + cleanup 退订。
-->
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { prefersReducedMotion } from 'svelte/motion';
  import type { ToastStore, ToastItem } from '@chenzy-design/core';
  import ToastItemView from './ToastItem.svelte';

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

  const topToasts = $derived(toasts.filter((t) => t.position === 'top'));
  const bottomToasts = $derived(toasts.filter((t) => t.position === 'bottom'));

  const flyDuration = $derived(prefersReducedMotion.current ? 0 : 220);
  const flipDuration = $derived(prefersReducedMotion.current ? 0 : 200);

  function handleClose(id: string) {
    store.remove(id, 'manual');
  }
  function handlePause(id: string) {
    store.pause(id);
  }
  function handleResume(id: string) {
    store.resume(id);
  }
</script>

{#if topToasts.length > 0}
  <div class="cd-toast-stack cd-toast-stack--top">
    {#each topToasts as t (t.id)}
      <div
        class="cd-toast-stack__item"
        in:fly={{ y: -16, duration: flyDuration }}
        out:fly={{ y: -16, duration: flyDuration }}
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

{#if bottomToasts.length > 0}
  <div class="cd-toast-stack cd-toast-stack--bottom">
    {#each bottomToasts as t (t.id)}
      <div
        class="cd-toast-stack__item"
        in:fly={{ y: 16, duration: flyDuration }}
        out:fly={{ y: 16, duration: flyDuration }}
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

<style>
  .cd-toast-stack {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    z-index: var(--cd-toast-z);
    display: flex;
    flex-direction: column;
    gap: var(--cd-toast-stack-gap);
    align-items: center;
    inline-size: max-content;
    max-inline-size: calc(100vw - 32px);
    pointer-events: none;
  }

  .cd-toast-stack--top {
    top: 24px;
  }

  .cd-toast-stack--bottom {
    bottom: 24px;
    flex-direction: column-reverse;
  }

  .cd-toast-stack__item {
    inline-size: auto;
    max-inline-size: 100%;
    pointer-events: none;
  }
</style>
