<!--
  DragMove — 严格对齐 Semi Design dragMove（纯逻辑组件，无样式层）。
  包裹单个子元素使其可拖拽在可选约束区内移动（改位置，非尺寸）。core createDragMove 承载
  命令式指针几何：init 按 positionStrategy 设 element position（absolute 默认值/relative 保留
  原文档流位置）+ handler cursor:move（对齐 Semi foundation updatePositionStrategy），
  pointerdown 记起点→document 绑 move/up→clamp 到 constrainer 的 top/left→customMove 或写 style。

  Svelte 无 React cloneElement，无法把 ref 注入 children 本身，故用一层 wrapper div 承载 bind:this
  与几何（这是框架必要适配）；wrapper 不加任何自造样式/token（对齐 Semi 无样式层：无 scss/无 token/
  无 className 视觉）。cursor:move 与 preventDefault（阻止拖拽选中文字、阻止触屏滚动冲突）均由
  core 命令式对齐 Semi foundation（无需 CSS touch-action/user-select 兜底，Semi 单靠 preventDefault
  即覆盖两者，见 foundation.ts _preventDefault）。cd-drag-move class 仅作 DOM 定位锚点用，无样式。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { createDragMove, type DragMovePositionStrategy } from '@chenzy-design/core';

  interface Props {
    /** 拖拽触发元素（缺省为整个被包裹子元素）。返回把手 DOM。 */
    handler?: () => HTMLElement;
    /** 移动约束区。'parent'=父元素，或返回具体容器 DOM；缺省不约束。 */
    constrainer?: (() => HTMLElement | null) | 'parent' | undefined;
    /**
     * 位置读写策略（对齐 Semi positionStrategy）。'absolute'（默认）强制
     * position:absolute，以 offsetLeft/offsetTop 为基准；'relative' 保留元素
     * 原始文档流位置（position:relative），拖拽在其上叠加偏移——Modal 可拖拽
     * 标题栏用它避免首次拖拽时从居中位置跳走。
     */
    positionStrategy?: DragMovePositionStrategy;
    /** 谓词：本次是否允许拖拽。返回 false 取消。 */
    allowMove?: (e: MouseEvent | TouchEvent, element: HTMLElement) => boolean;
    /** 自定义位置应用（缺省组件直接写 el.style.top/left）。 */
    customMove?: (el: HTMLElement, top: number, left: number) => void;
    /** 是否允许从 input/textarea 等表单元素上发起拖拽。默认 false。 */
    allowInputDrag?: boolean;
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
    positionStrategy = 'absolute',
    allowMove,
    customMove,
    allowInputDrag = false,
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

  let rootEl = $state<HTMLDivElement | null>(null);

  const resolveConstrainer = (): HTMLElement | null => {
    if (constrainer === 'parent') {
      return (rootEl?.parentElement as HTMLElement | null) ?? null;
    }
    if (typeof constrainer === 'function') return constrainer();
    return null;
  };

  // 命令式几何：拖拽控制器在挂载 effect 内 init（读最新 props 经闭包）；
  // 卸载兜底 destroy 解绑遗留全局监听。
  $effect(() => {
    if (!rootEl) return;
    const ctrl = createDragMove({
      getElement: () => rootEl,
      ...(handler ? { handler } : {}),
      constrainer: resolveConstrainer,
      positionStrategy,
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

  const cls = $derived(['cd-drag-move', className].filter(Boolean).join(' '));
</script>

<div bind:this={rootEl} class={cls} {style}>
  {@render children?.()}
</div>
