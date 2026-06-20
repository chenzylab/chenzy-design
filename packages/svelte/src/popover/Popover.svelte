<!--
  Popover — see specs/components/show/Popover.spec.md
  基础子集：hover/click/focus/custom 触发、position+align（映射 12 方位）、箭头、间距、标题。
  定位：portal 到 body + position:fixed，core computePosition 计算坐标 +
  autoAdjustOverflow flip 碰撞避让（脱离 overflow:hidden 裁剪）。
  custom：显隐完全由受控 open + onOpenChange 控制，组件不自动响应 hover/click/focus，
  也不启用 useDismiss 外部点击/Esc 关闭——由调用方自行决定何时显隐。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import {
    useId,
    useDismiss,
    makePlacement,
    parsePlacement,
    type Placement,
    type Side,
    type Align,
  } from '@chenzy-design/core';
  import { floating } from '../_floating/use-floating.js';

  type TriggerKind = 'hover' | 'click' | 'focus' | 'custom';
  type Position = 'top' | 'bottom' | 'left' | 'right';

  interface Props {
    content?: string | Snippet;
    title?: string | Snippet;
    open?: boolean;
    defaultOpen?: boolean;
    trigger?: TriggerKind;
    position?: Position;
    align?: Align;
    /** 视口溢出时翻转到对侧 */
    autoAdjustOverflow?: boolean;
    showArrow?: boolean;
    /** start/end 对齐时箭头指向触发器中心（默认 false：贴对齐边） */
    arrowPointAtCenter?: boolean;
    spacing?: number;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    disabled?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: Snippet;
    contentSlot?: Snippet;
  }

  let {
    content,
    title,
    open,
    defaultOpen = false,
    trigger = 'hover',
    position = 'bottom',
    align = 'center',
    autoAdjustOverflow = true,
    showArrow = true,
    arrowPointAtCenter = false,
    spacing = 8,
    mouseEnterDelay = 100,
    mouseLeaveDelay = 100,
    disabled = false,
    onOpenChange,
    children,
    contentSlot,
  }: Props = $props();

  const popId = useId('cd-popover');

  // position + align → core 12 方位 Placement
  const placement = $derived(makePlacement(position as Side, align));

  // --- 受控 open (红线 #1)：不无条件回写 open，仅 onOpenChange ---
  const isControlled = $derived(open !== undefined);
  let innerOpen = $state(untrack(() => defaultOpen));
  const isOpen = $derived(!disabled && (isControlled ? !!open : innerOpen));

  function setOpen(next: boolean) {
    if (next === (isControlled ? !!open : innerOpen)) return;
    if (!isControlled) innerOpen = next;
    onOpenChange?.(next);
  }

  const titleText = $derived(typeof title === 'string' ? title : undefined);
  const titleSnippet = $derived(typeof title === 'function' ? title : undefined);
  const hasTitle = $derived(title !== undefined && title !== '');

  const contentText = $derived(typeof content === 'string' ? content : undefined);
  const contentSnippetFn = $derived(
    typeof content === 'function' ? content : undefined,
  );

  // --- hover 延迟开关：setTimeout 存普通变量，cleanup 清除 ---
  let enterTimer: ReturnType<typeof setTimeout> | undefined;
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;

  function clearTimers() {
    if (enterTimer !== undefined) {
      clearTimeout(enterTimer);
      enterTimer = undefined;
    }
    if (leaveTimer !== undefined) {
      clearTimeout(leaveTimer);
      leaveTimer = undefined;
    }
  }

  function onPointerEnter() {
    if (disabled || trigger !== 'hover') return;
    clearTimers();
    enterTimer = setTimeout(() => setOpen(true), mouseEnterDelay);
  }

  function onPointerLeave() {
    if (disabled || trigger !== 'hover') return;
    clearTimers();
    leaveTimer = setTimeout(() => setOpen(false), mouseLeaveDelay);
  }

  function onFocusIn() {
    if (disabled || trigger !== 'focus') return;
    setOpen(true);
  }

  function onFocusOut() {
    if (disabled || trigger !== 'focus') return;
    setOpen(false);
  }

  function onClick() {
    if (disabled || trigger !== 'click') return;
    setOpen(!isOpen);
  }

  // --- DOM 引用：触发包裹（浮层定位由 use:floating action 接管）---
  let rootEl = $state<HTMLSpanElement | null>(null);
  let popEl = $state<HTMLDivElement | null>(null);

  // 解析后的实际方位（flip 后）
  let resolvedPlacement = $state<Placement>(untrack(() => placement));
  const resolvedSide = $derived<Side>(parsePlacement(resolvedPlacement).side);
  let arrowOffset = $state(0);

  function onPlacement(info: { placement: Placement; arrowOffset: number }) {
    resolvedPlacement = info.placement;
    arrowOffset = info.arrowOffset;
  }

  // --- useDismiss (红线 #3)：仅 click 触发需要 outside/Esc；popup portal 列入 extraTargets ---
  $effect(() => {
    if (!isOpen || !rootEl || trigger !== 'click') return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
      extraTargets: [popEl],
    });
    return cleanup;
  });

  // cleanup hover 定时器
  $effect(() => clearTimers);

  const arrowStyle = $derived(
    resolvedSide === 'top' || resolvedSide === 'bottom'
      ? `inset-inline-start:${arrowOffset}px`
      : `inset-block-start:${arrowOffset}px`,
  );
</script>

<!-- 触发包裹 span 仅转发宿主事件给真正可交互的 children；自身无障碍语义忽略 -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<span
  class="cd-popover"
  bind:this={rootEl}
  onpointerenter={onPointerEnter}
  onpointerleave={onPointerLeave}
  onfocusin={onFocusIn}
  onfocusout={onFocusOut}
  onclick={onClick}
>
  <span
    class="cd-popover__trigger"
    aria-haspopup="dialog"
    aria-expanded={isOpen}
    aria-controls={isOpen ? popId : undefined}
  >
    {@render children?.()}
  </span>

  {#if isOpen}
    <div
      id={popId}
      role="dialog"
      aria-modal="false"
      bind:this={popEl}
      use:floating={{ trigger: rootEl, placement, autoAdjust: autoAdjustOverflow, offset: spacing, arrowPointAtCenter, onPlacement }}
      class="cd-popover__pop cd-popover__pop--{resolvedSide}"
      class:cd-popover__pop--no-arrow={!showArrow}
    >
      {#if hasTitle}
        <div class="cd-popover__title">
          {#if titleSnippet}
            {@render titleSnippet()}
          {:else}
            {titleText}
          {/if}
        </div>
      {/if}
      <div class="cd-popover__content">
        {#if contentSlot}
          {@render contentSlot()}
        {:else if contentSnippetFn}
          {@render contentSnippetFn()}
        {:else}
          {contentText}
        {/if}
      </div>
      {#if showArrow}
        <span class="cd-popover__arrow" style={arrowStyle} aria-hidden="true"></span>
      {/if}
    </div>
  {/if}
</span>

<style>
  .cd-popover {
    position: relative;
    display: inline-block;
  }
  .cd-popover__trigger {
    display: inline-block;
  }
  /* 浮层 portal 到 body，由 JS 写 position:fixed + transform 定位 */
  .cd-popover__pop {
    z-index: var(--cd-popover-z);
    inline-size: max-content;
    max-inline-size: 20rem;
    padding: var(--cd-popover-padding);
    background: var(--cd-popover-bg);
    color: var(--cd-popover-color);
    border-radius: var(--cd-popover-radius);
    box-shadow: var(--cd-popover-shadow);
  }
  .cd-popover__title {
    margin-block-end: var(--cd-spacing-2);
    padding-block-end: var(--cd-spacing-2);
    border-block-end: 1px solid var(--cd-popover-title-border);
    color: var(--cd-popover-title-color);
    font-weight: var(--cd-font-weight-medium, 600);
  }

  /* --- 箭头：方块旋转 45deg，交叉轴偏移由内联 style 控制 --- */
  .cd-popover__arrow {
    position: absolute;
    inline-size: var(--cd-popover-arrow-size);
    block-size: var(--cd-popover-arrow-size);
    background: var(--cd-popover-bg);
    box-shadow: var(--cd-popover-shadow);
    transform: rotate(45deg);
  }
  .cd-popover__pop--top .cd-popover__arrow,
  .cd-popover__pop--bottom .cd-popover__arrow {
    margin-inline-start: calc(var(--cd-popover-arrow-size) / -2);
  }
  .cd-popover__pop--left .cd-popover__arrow,
  .cd-popover__pop--right .cd-popover__arrow {
    margin-block-start: calc(var(--cd-popover-arrow-size) / -2);
  }

  /* 箭头吸附到浮层贴近触发器的那条边（按解析后的 side） */
  .cd-popover__pop--top .cd-popover__arrow {
    inset-block-end: calc(var(--cd-popover-arrow-size) / -2);
  }
  .cd-popover__pop--bottom .cd-popover__arrow {
    inset-block-start: calc(var(--cd-popover-arrow-size) / -2);
  }
  .cd-popover__pop--left .cd-popover__arrow {
    inset-inline-end: calc(var(--cd-popover-arrow-size) / -2);
  }
  .cd-popover__pop--right .cd-popover__arrow {
    inset-inline-start: calc(var(--cd-popover-arrow-size) / -2);
  }
  .cd-popover__pop--no-arrow .cd-popover__arrow {
    display: none;
  }
</style>
