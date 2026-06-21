<!--
  NotificationContainer — 单例容器，订阅 store 渲染全部通知。
  由 store.ts 惰性 mount 到 body（或 getPopupContainer）下的宿主节点；仅此一个实例。
  按 6 placement（topLeft/top/topRight/bottomLeft/bottom/bottomRight）分组渲染独立堆叠列。
  RTL：item.direction==='rtl' 时左右方位互换（topRight→topLeft 视觉镜像），堆叠列写 dir=rtl
  令卡片整体镜像（关闭按钮、图标、文案方向、内边距均经逻辑属性自动翻转）；进出场水平偏移随之取反。
  Esc 关闭（红线 #3）：$effect 命令式挂 window keydown，按 Esc 关闭最近一条通知；cleanup 移除监听。
  进出场用 svelte/transition fly（运行时驱动，退场后 DOM 正常卸载，不卡 from 帧）；
  重排用 animate:flip。reduced-motion 时 fly duration 降为 0。
  红线：render 不读 effect 写的状态——items 初始同步读一次（拿到惰性挂载前已入队的首条），
  $effect 仅做订阅 + cleanup 退订 / keydown 监听 + cleanup。
-->
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { prefersReducedMotion } from 'svelte/motion';
  import type {
    NotificationStore,
    NotificationItem,
    NotificationPlacement,
  } from '@chenzy-design/core';
  import NotificationItemView from './NotificationItem.svelte';

  interface Props {
    store: NotificationStore;
  }

  let { store }: Props = $props();

  // 初始同步读一次：捕获惰性挂载前已入队的首条通知。
  // 用函数包裹读取，避免 state 初始化器直接引用 prop 触发 state_referenced_locally。
  // core 的 subscribe 不会立即回放当前值，因此必须在此先读一次。
  function readInitial(): NotificationItem[] {
    return store.getItems();
  }
  let items = $state<NotificationItem[]>(readInitial());

  // 桥接外部（非 Svelte runes）store：订阅写入本地 state，cleanup 退订。
  // 这是 store->state 的单向桥，无法用 $derived 表达（外部 store 非响应式源）。
  $effect(() => {
    const unsub = store.subscribe((v) => {
      items = v;
    });
    return unsub;
  });

  // Esc 关闭（红线 #3）：命令式挂 window keydown，关闭最近一条（最后入队）通知；cleanup 移除。
  // 直接读 store.getItems()（快照），不读 effect 写的 items state，避免 effect 自依赖重订阅。
  $effect(() => {
    function onKeydown(e: KeyboardEvent): void {
      if (e.key !== 'Escape') return;
      const current = store.getItems();
      const last = current[current.length - 1];
      if (last) store.close(last.id, 'manual');
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });

  const placements: NotificationPlacement[] = [
    'topLeft',
    'top',
    'topRight',
    'bottomLeft',
    'bottom',
    'bottomRight',
  ];

  // RTL 方位镜像：rtl 通知的左右方位视觉互换（topRight→topLeft 等），居中不变。
  const RTL_SWAP: Record<NotificationPlacement, NotificationPlacement> = {
    topLeft: 'topRight',
    topRight: 'topLeft',
    bottomLeft: 'bottomRight',
    bottomRight: 'bottomLeft',
    top: 'top',
    bottom: 'bottom',
  };
  function effectivePlacement(item: NotificationItem): NotificationPlacement {
    return item.direction === 'rtl' ? RTL_SWAP[item.placement] : item.placement;
  }

  const flyDuration = $derived(prefersReducedMotion.current ? 0 : 220);
  const flipDuration = $derived(prefersReducedMotion.current ? 0 : 200);

  const grouped = $derived(
    placements.map((p) => ({
      placement: p,
      items: items.filter((i) => effectivePlacement(i) === p),
    })),
  );

  // 每个方位的进出场水平/垂直偏移：左侧从左滑入、右侧从右滑入、居中走垂直。
  function flyParams(placement: NotificationPlacement): { x: number; y: number } {
    if (placement === 'topLeft' || placement === 'bottomLeft') return { x: -24, y: 0 };
    if (placement === 'topRight' || placement === 'bottomRight') return { x: 24, y: 0 };
    return { x: 0, y: placement === 'top' ? -16 : 16 };
  }

  function handleClose(id: string) {
    store.close(id, 'manual');
  }
  function handlePause(id: string) {
    store.pause(id);
  }
  function handleResume(id: string) {
    store.resume(id);
  }
</script>

{#each grouped as group (group.placement)}
  {#if group.items.length > 0}
    <div class="cd-notification-stack cd-notification-stack--{group.placement}">
      {#each group.items as item (item.id)}
        <div
          class="cd-notification-stack__item"
          dir={item.direction}
          in:fly={{ ...flyParams(group.placement), duration: flyDuration }}
          out:fly={{ ...flyParams(group.placement), duration: flyDuration }}
          animate:flip={{ duration: flipDuration }}
        >
          <NotificationItemView
            {item}
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
  .cd-notification-stack {
    position: fixed;
    z-index: var(--cd-notification-z);
    display: flex;
    flex-direction: column;
    gap: var(--cd-notification-gap);
    inline-size: max-content;
    max-inline-size: calc(100vw - 2 * var(--cd-notification-offset));
    pointer-events: none;
  }

  .cd-notification-stack--topLeft {
    top: var(--cd-notification-offset);
    left: var(--cd-notification-offset);
  }

  .cd-notification-stack--top {
    top: var(--cd-notification-offset);
    left: 50%;
    transform: translateX(-50%);
  }

  .cd-notification-stack--topRight {
    top: var(--cd-notification-offset);
    right: var(--cd-notification-offset);
  }

  .cd-notification-stack--bottomLeft {
    bottom: var(--cd-notification-offset);
    left: var(--cd-notification-offset);
    flex-direction: column-reverse;
  }

  .cd-notification-stack--bottom {
    bottom: var(--cd-notification-offset);
    left: 50%;
    transform: translateX(-50%);
    flex-direction: column-reverse;
  }

  .cd-notification-stack--bottomRight {
    bottom: var(--cd-notification-offset);
    right: var(--cd-notification-offset);
    flex-direction: column-reverse;
  }

  .cd-notification-stack__item {
    inline-size: auto;
    max-inline-size: 100%;
    pointer-events: none;
  }
</style>
