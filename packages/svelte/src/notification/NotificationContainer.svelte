<!--
  NotificationContainer — 单例容器，订阅 store 渲染全部通知，严格对齐 Semi Design
  （semi-ui/notification/index.tsx 的 NotificationList + notification.scss 的 list 定位/动画）。
  DOM 结构镜像 Semi：
    div.cd-notification-list[placement]        ← 每方位一个 list（fixed 定位，六方位）
      NotificationItem × N
  定位对齐 Semi scss：list margin/padding=0，卡片自带 margin(base-loose=20px) 形成边缘间距；
  六方位 fixed：topRight(top/right:0)、top(top:0 居中)、topLeft(top/left:0)、
  bottom(bottom:0 居中)、bottomRight(bottom/right:0)、bottomLeft(bottom/left:0)。
  进/退场动画对齐 Semi animation.scss：opacity 0↔1 + translateX/Y(±100%)↔0，
  300ms cubic-bezier(0.62,0.63,0,1.13)（Semi 组件级动画常量，非全局 token，故字面直连）。
  堆叠顺序对齐 Semi：store 新通知置于队首（[opts,...notices]），list 为普通 flex column，新的在上。
  位置偏移：notification.config({ top/bottom/left/right/zIndex }) 经 getPositionOffsets 注入 list inline style。
  红线：render 不读 effect 写的状态——items 初始同步读一次（拿到惰性挂载前已入队的首条），
  $effect 仅做订阅 + cleanup 退订。
-->
<script lang="ts">
  import type {
    NotificationStore,
    NotificationItem,
    NotificationPosition,
  } from '@chenzy-design/core';
  import NotificationItemView from './NotificationItem.svelte';
  import { getPositionOffsets } from './store.js';

  interface Props {
    store: NotificationStore;
  }

  let { store }: Props = $props();

  // 初始同步读一次：捕获惰性挂载前已入队的首条通知。
  // core 的 subscribe 不会立即回放当前值，因此必须在此先读一次。
  function readInitial(): NotificationItem[] {
    return store.getItems();
  }
  let items = $state<NotificationItem[]>(readInitial());

  // 桥接外部（非 Svelte runes）store：订阅写入本地 state，cleanup 退订。
  $effect(() => {
    const unsub = store.subscribe((v) => {
      items = v;
    });
    return unsub;
  });

  const positions: NotificationPosition[] = [
    'top',
    'topLeft',
    'topRight',
    'bottom',
    'bottomLeft',
    'bottomRight',
  ];

  const grouped = $derived(
    positions.map((p) => ({
      position: p,
      items: items.filter((i) => i.position === p),
    })),
  );

  // 位置偏移 + zIndex 注入 list inline style（对齐 Semi setPosInStyle + wrapper zIndex）。
  const offsets = getPositionOffsets();
  function listStyle(position: NotificationPosition): string {
    const parts: string[] = [];
    if (offsets.zIndex !== undefined) parts.push(`z-index:${offsets.zIndex}`);
    const wants = (side: 'top' | 'bottom' | 'left' | 'right') => {
      const v = offsets[side];
      if (v === undefined) return;
      parts.push(`${side}:${typeof v === 'number' ? `${v}px` : v}`);
    };
    if (position === 'top' || position === 'topLeft' || position === 'topRight') wants('top');
    if (position === 'bottom' || position === 'bottomLeft' || position === 'bottomRight') wants('bottom');
    if (position === 'topLeft' || position === 'bottomLeft') wants('left');
    if (position === 'topRight' || position === 'bottomRight') wants('right');
    return parts.join(';');
  }

  // Semi 动画：进场 slideShow_{pos} / 退场 slideHide_{pos}，300ms cubic-bezier(0.62,0.63,0,1.13)。
  // 用自定义 css transition 表达：css() 内按进度线性给出 transform+opacity，缓动曲线经 easing 注入
  // Semi 的 cubic-bezier（下方 bezier() 采样求值）。
  const SEMI_DURATION = 300;
  // Semi 缓动曲线 cubic-bezier(0.62, 0.63, 0, 1.13) 的求值函数（用于 transition easing）。
  const semiEase = bezier(0.62, 0.63, 0, 1.13);

  function slide(_node: Element, { position }: { position: NotificationPosition }) {
    // 平移轴与起点方向（对齐 Semi keyframes）。
    let axis: 'X' | 'Y' = 'X';
    let sign = 1; // 正=从正方向(+100%)进入
    if (position === 'top') {
      axis = 'Y';
      sign = -1;
    } else if (position === 'bottom') {
      axis = 'Y';
      sign = 1;
    } else if (position === 'topLeft' || position === 'bottomLeft') {
      axis = 'X';
      sign = -1;
    } else {
      axis = 'X';
      sign = 1;
    }
    return {
      duration: SEMI_DURATION,
      easing: semiEase,
      // t: 0→1（进场时正向，退场时反向），u = 1 - t。
      css: (t: number, u: number) =>
        `opacity:${t};transform:translate${axis}(${sign * 100 * u}%);`,
    };
  }

  // 三次贝塞尔 (x1,y1,x2,y2) 求值：给定时间进度 x∈[0,1] 返回缓动后的 y。
  // 牛顿迭代求参数 t 使 bezierX(t)=x，再算 bezierY(t)。用于对齐 Semi 的 cubic-bezier。
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

{#each grouped as group (group.position)}
  {#if group.items.length > 0}
    <div
      class="cd-notification-list cd-notification-list-{group.position}"
      style={listStyle(group.position)}
    >
      {#each group.items as item (item.id)}
        <div
          class="cd-notification-list__item"
          in:slide={{ position: group.position }}
          out:slide={{ position: group.position }}
        >
          <NotificationItemView
            {item}
            onClose={(id) => store.close(id)}
            onPause={(id) => store.pause(id)}
            onResume={(id) => store.resume(id)}
          />
        </div>
      {/each}
    </div>
  {/if}
{/each}

<style>
  /* —— 通知列表（对齐 Semi .semi-notification-list）——
     margin/padding=0（Semi list-margin/list-padding token 值均为 0），
     卡片自带 margin(base-loose) 形成与视口边缘的间距。 */
  .cd-notification-list {
    position: fixed;
    box-sizing: border-box;
    margin: var(--cd-spacing-notification-list-margin);
    padding: var(--cd-spacing-notification-list-padding);
    z-index: var(--cd-z-notification);
    pointer-events: none;
  }

  .cd-notification-list-topRight {
    right: 0;
    top: 0;
  }
  .cd-notification-list-top {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  .cd-notification-list-topLeft {
    left: 0;
    top: 0;
  }
  .cd-notification-list-bottom {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  .cd-notification-list-bottomRight {
    bottom: 0;
    right: 0;
  }
  .cd-notification-list-bottomLeft {
    bottom: 0;
    left: 0;
  }
</style>
