<!--
  DragMove — wraps a single child element and makes it draggable within an
  optional constrainer region. Consumes createDragMove from core for imperative
  pointer geometry (redline #3: no reactive attachment reads geometry). The
  wrapper is `position: absolute` so top/left take effect; the handler defaults
  to the whole wrapper. Keyboard move (arrow keys) + i18n aria-label go beyond
  Semi's pointer-only behaviour. See specs/components/other/DragMove.spec.md §4.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { createDragMove } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    /** 拖拽触发元素（缺省为整个被包裹子元素）。返回把手 DOM。 */
    handler?: () => HTMLElement;
    /** 移动约束区。'parent'=父元素，或返回具体容器 DOM；缺省不约束。 */
    constrainer?: (() => HTMLElement | null) | 'parent';
    /** 谓词：本次是否允许拖拽。返回 false 取消。 */
    allowMove?: (e: MouseEvent | TouchEvent, element: HTMLElement) => boolean;
    /** 自定义位置应用（缺省组件直接写 el.style.top/left）。 */
    customMove?: (el: HTMLElement, top: number, left: number) => void;
    /** 是否允许从 input/textarea 等表单元素上发起拖拽。默认 false。 */
    allowInputDrag?: boolean;
    /** 是否让把手键盘可达（tabindex + 方向键移动 + aria-label）。默认 false。 */
    keyboard?: boolean;
    /** 键盘方向键移动步长（px）。默认 10。 */
    keyboardStep?: number;
    class?: string;
    style?: string;
    /** 鼠标事件透传。 */
    onMouseDown?: (e: MouseEvent) => void;
    onMouseMove?: (e: MouseEvent) => void;
    onMouseUp?: (e: MouseEvent) => void;
    /** 触摸事件透传。 */
    onTouchStart?: (e: TouchEvent) => void;
    onTouchMove?: (e: TouchEvent) => void;
    onTouchEnd?: (e: TouchEvent) => void;
    onTouchCancel?: (e: TouchEvent) => void;
    /** 被拖拽移动的子元素。 */
    children?: Snippet;
  }

  let {
    handler,
    constrainer,
    allowMove,
    customMove,
    allowInputDrag = false,
    keyboard = false,
    keyboardStep = 10,
    class: className = '',
    style,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    children,
  }: Props = $props();

  const loc = useLocale();

  let rootEl = $state<HTMLDivElement | null>(null);

  const resolveConstrainer = (): HTMLElement | null => {
    if (constrainer === 'parent') {
      return (rootEl?.parentElement as HTMLElement | null) ?? null;
    }
    if (typeof constrainer === 'function') return constrainer();
    return null;
  };

  // 命令式几何：拖拽控制器在挂载 effect 内 init（读最新 props 经闭包）；
  // 卸载兜底 destroy 解绑遗留全局监听（红线 #3 / §9.3）。
  $effect(() => {
    if (!rootEl) return;
    const ctrl = createDragMove({
      getElement: () => rootEl,
      ...(handler ? { handler } : {}),
      constrainer: resolveConstrainer,
      ...(allowMove ? { allowMove } : {}),
      ...(customMove ? { customMove } : {}),
      allowInputDrag,
      ...(onMouseDown ? { onMouseDown } : {}),
      ...(onMouseMove ? { onMouseMove } : {}),
      ...(onMouseUp ? { onMouseUp } : {}),
      ...(onTouchStart ? { onTouchStart } : {}),
      ...(onTouchMove ? { onTouchMove } : {}),
      ...(onTouchEnd ? { onTouchEnd } : {}),
      ...(onTouchCancel ? { onTouchCancel } : {}),
    });
    ctrl.init();
    return () => ctrl.destroy();
  });

  // 键盘移动：把手聚焦后方向键移动位置（命令式读当前 offset，写 style）。
  function handleKeydown(event: KeyboardEvent): void {
    if (!keyboard || !rootEl) return;
    let dx = 0;
    let dy = 0;
    switch (event.key) {
      case 'ArrowLeft':
        dx = -keyboardStep;
        break;
      case 'ArrowRight':
        dx = keyboardStep;
        break;
      case 'ArrowUp':
        dy = -keyboardStep;
        break;
      case 'ArrowDown':
        dy = keyboardStep;
        break;
      default:
        return;
    }
    event.preventDefault();
    const nextLeft = rootEl.offsetLeft + dx;
    const nextTop = rootEl.offsetTop + dy;
    if (customMove) {
      customMove(rootEl, nextTop, nextLeft);
    } else {
      rootEl.style.left = `${nextLeft}px`;
      rootEl.style.top = `${nextTop}px`;
    }
  }

  const cls = $derived(['cd-drag-move', className].filter(Boolean).join(' '));
  const label = $derived(loc().t('DragMove.handleAriaLabel'));
</script>

{#if keyboard}
  <div
    bind:this={rootEl}
    class={cls}
    {style}
    role="button"
    tabindex="0"
    aria-label={label}
    onkeydown={handleKeydown}
  >
    {@render children?.()}
  </div>
{:else}
  <div bind:this={rootEl} class={cls} {style}>
    {@render children?.()}
  </div>
{/if}

<style>
  .cd-drag-move {
    /* createDragMove forces position:absolute imperatively; declare cursor +
       touch-action here so pointer/touch drags feel right. */
    cursor: var(--cd-dragmove-cursor);
    touch-action: none;
    user-select: none;
  }
  .cd-drag-move:focus-visible {
    outline: 2px solid var(--cd-color-focus);
    outline-offset: 2px;
  }
</style>
