<!--
  Tooltip — see specs/components/show/Tooltip.spec.md
  基础子集：hover/focus/click 触发、常用 placement、箭头、延迟、dark/light 主题。
  TODO(延后): 12 方位完整矩阵的 flip 避让、arrowPointAtCenter、status 图标、custom trigger。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { useId, useDismiss } from '@chenzy-design/core';

  type TriggerKind = 'hover' | 'focus' | 'click';
  type Placement =
    | 'top'
    | 'topLeft'
    | 'topRight'
    | 'bottom'
    | 'bottomLeft'
    | 'bottomRight'
    | 'left'
    | 'right';
  type Theme = 'dark' | 'light';

  interface Props {
    content?: string | Snippet;
    open?: boolean;
    defaultOpen?: boolean;
    trigger?: TriggerKind | Array<TriggerKind>;
    placement?: Placement;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    showArrow?: boolean;
    theme?: Theme;
    maxWidth?: number | string;
    disabled?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: Snippet;
  }

  let {
    content,
    open,
    defaultOpen = false,
    trigger = ['hover', 'focus'],
    placement = 'top',
    mouseEnterDelay = 100,
    mouseLeaveDelay = 100,
    showArrow = true,
    theme = 'dark',
    maxWidth = 300,
    disabled = false,
    onOpenChange,
    children,
  }: Props = $props();

  const tipId = useId('cd-tooltip');

  // --- 受控 open (红线 #1)：不无条件回写 open，仅 onOpenChange ---
  const isControlled = $derived(open !== undefined);
  // eslint-disable-next-line -- 仅取 defaultOpen 初值作为非受控初始态
  let innerOpen = $state(untrack(() => defaultOpen));
  const triggers = $derived(Array.isArray(trigger) ? trigger : [trigger]);
  const hasContent = $derived(content !== undefined && content !== '');
  const isOpen = $derived(
    !disabled && hasContent && (isControlled ? !!open : innerOpen),
  );

  function setOpen(next: boolean) {
    if (next === (isControlled ? !!open : innerOpen)) return;
    if (!isControlled) innerOpen = next;
    onOpenChange?.(next);
  }

  const maxWidthCss = $derived(
    typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
  );

  const contentText = $derived(
    typeof content === 'string' ? content : undefined,
  );
  const contentSnippet = $derived(
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
    if (disabled || !triggers.includes('hover')) return;
    clearTimers();
    enterTimer = setTimeout(() => setOpen(true), mouseEnterDelay);
  }

  function onPointerLeave() {
    if (disabled || !triggers.includes('hover')) return;
    clearTimers();
    leaveTimer = setTimeout(() => setOpen(false), mouseLeaveDelay);
  }

  function onFocusIn() {
    if (disabled || !triggers.includes('focus')) return;
    setOpen(true);
  }

  function onFocusOut() {
    if (disabled || !triggers.includes('focus')) return;
    setOpen(false);
  }

  function onClick() {
    if (disabled || !triggers.includes('click')) return;
    setOpen(!isOpen);
  }

  // --- useDismiss (红线 #3)：仅 click 触发需要 outside/Esc，放进 $effect ---
  let rootEl = $state<HTMLSpanElement | null>(null);

  $effect(() => {
    if (!isOpen || !rootEl || !triggers.includes('click')) return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
    });
    return cleanup;
  });

  // cleanup hover 定时器
  $effect(() => clearTimers);
</script>

<!-- 浮层定位纯 CSS：pop position:absolute 相对 root position:relative -->
<!-- 触发包裹 span 仅转发宿主事件给真正可交互的 children；自身无障碍语义忽略 -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<span
  class="cd-tooltip"
  bind:this={rootEl}
  onpointerenter={onPointerEnter}
  onpointerleave={onPointerLeave}
  onfocusin={onFocusIn}
  onfocusout={onFocusOut}
  onclick={onClick}
>
  <span
    class="cd-tooltip__trigger"
    aria-describedby={isOpen ? tipId : undefined}
  >
    {@render children?.()}
  </span>

  {#if isOpen}
    <div
      id={tipId}
      role="tooltip"
      class="cd-tooltip__pop cd-tooltip__pop--{placement} cd-tooltip__pop--{theme}"
      class:cd-tooltip__pop--no-arrow={!showArrow}
      style="max-inline-size:{maxWidthCss}"
    >
      {#if contentSnippet}
        {@render contentSnippet()}
      {:else}
        {contentText}
      {/if}
      {#if showArrow}
        <span class="cd-tooltip__arrow" aria-hidden="true"></span>
      {/if}
    </div>
  {/if}
</span>

<style>
  .cd-tooltip {
    position: relative;
    display: inline-block;
  }
  .cd-tooltip__trigger {
    display: inline-block;
  }
  .cd-tooltip__pop {
    position: absolute;
    z-index: var(--cd-tooltip-z);
    inline-size: max-content;
    padding: var(--cd-tooltip-padding);
    border-radius: var(--cd-tooltip-radius);
    font-size: var(--cd-tooltip-font-size);
    line-height: var(--cd-line-height-1, 1.5);
    word-wrap: break-word;
    pointer-events: none;
  }

  /* --- 主题 --- */
  .cd-tooltip__pop--dark {
    background: var(--cd-tooltip-bg-dark);
    color: var(--cd-tooltip-color-dark);
  }
  .cd-tooltip__pop--light {
    background: var(--cd-tooltip-bg-light);
    color: var(--cd-tooltip-color-light);
    box-shadow: var(--cd-tooltip-shadow);
  }

  /* --- 箭头：方块旋转 45deg，按 placement 定位 --- */
  .cd-tooltip__arrow {
    position: absolute;
    inline-size: var(--cd-tooltip-arrow-size);
    block-size: var(--cd-tooltip-arrow-size);
    background: inherit;
    transform: rotate(45deg);
  }
  .cd-tooltip__pop--dark .cd-tooltip__arrow {
    background: var(--cd-tooltip-bg-dark);
  }
  .cd-tooltip__pop--light .cd-tooltip__arrow {
    background: var(--cd-tooltip-bg-light);
  }

  /* --- placement 定位（纯 CSS，不测 DOM）--- */
  /* top 系列 */
  .cd-tooltip__pop--top,
  .cd-tooltip__pop--topLeft,
  .cd-tooltip__pop--topRight {
    inset-block-end: calc(100% + var(--cd-tooltip-arrow-size));
  }
  .cd-tooltip__pop--top {
    inset-inline-start: 50%;
    transform: translateX(-50%);
  }
  .cd-tooltip__pop--topLeft {
    inset-inline-start: 0;
  }
  .cd-tooltip__pop--topRight {
    inset-inline-end: 0;
  }
  .cd-tooltip__pop--top .cd-tooltip__arrow,
  .cd-tooltip__pop--topLeft .cd-tooltip__arrow,
  .cd-tooltip__pop--topRight .cd-tooltip__arrow {
    inset-block-end: calc(var(--cd-tooltip-arrow-size) / -2);
  }
  .cd-tooltip__pop--top .cd-tooltip__arrow {
    inset-inline-start: 50%;
    margin-inline-start: calc(var(--cd-tooltip-arrow-size) / -2);
  }
  .cd-tooltip__pop--topLeft .cd-tooltip__arrow {
    inset-inline-start: calc(var(--cd-tooltip-arrow-size) * 2);
  }
  .cd-tooltip__pop--topRight .cd-tooltip__arrow {
    inset-inline-end: calc(var(--cd-tooltip-arrow-size) * 2);
  }

  /* bottom 系列 */
  .cd-tooltip__pop--bottom,
  .cd-tooltip__pop--bottomLeft,
  .cd-tooltip__pop--bottomRight {
    inset-block-start: calc(100% + var(--cd-tooltip-arrow-size));
  }
  .cd-tooltip__pop--bottom {
    inset-inline-start: 50%;
    transform: translateX(-50%);
  }
  .cd-tooltip__pop--bottomLeft {
    inset-inline-start: 0;
  }
  .cd-tooltip__pop--bottomRight {
    inset-inline-end: 0;
  }
  .cd-tooltip__pop--bottom .cd-tooltip__arrow,
  .cd-tooltip__pop--bottomLeft .cd-tooltip__arrow,
  .cd-tooltip__pop--bottomRight .cd-tooltip__arrow {
    inset-block-start: calc(var(--cd-tooltip-arrow-size) / -2);
  }
  .cd-tooltip__pop--bottom .cd-tooltip__arrow {
    inset-inline-start: 50%;
    margin-inline-start: calc(var(--cd-tooltip-arrow-size) / -2);
  }
  .cd-tooltip__pop--bottomLeft .cd-tooltip__arrow {
    inset-inline-start: calc(var(--cd-tooltip-arrow-size) * 2);
  }
  .cd-tooltip__pop--bottomRight .cd-tooltip__arrow {
    inset-inline-end: calc(var(--cd-tooltip-arrow-size) * 2);
  }

  /* left */
  .cd-tooltip__pop--left {
    inset-inline-end: calc(100% + var(--cd-tooltip-arrow-size));
    inset-block-start: 50%;
    transform: translateY(-50%);
  }
  .cd-tooltip__pop--left .cd-tooltip__arrow {
    inset-inline-end: calc(var(--cd-tooltip-arrow-size) / -2);
    inset-block-start: 50%;
    margin-block-start: calc(var(--cd-tooltip-arrow-size) / -2);
  }

  /* right */
  .cd-tooltip__pop--right {
    inset-inline-start: calc(100% + var(--cd-tooltip-arrow-size));
    inset-block-start: 50%;
    transform: translateY(-50%);
  }
  .cd-tooltip__pop--right .cd-tooltip__arrow {
    inset-inline-start: calc(var(--cd-tooltip-arrow-size) / -2);
    inset-block-start: 50%;
    margin-block-start: calc(var(--cd-tooltip-arrow-size) / -2);
  }
</style>
