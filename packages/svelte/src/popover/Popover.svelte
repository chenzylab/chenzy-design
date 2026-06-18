<!--
  Popover — see specs/components/show/Popover.spec.md
  基础子集：hover/click/focus 触发、常用 position、对齐、箭头、间距、标题。
  TODO(延后): autoAdjustOverflow flip、12 方位完整矩阵、custom trigger。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { useId, useDismiss } from '@chenzy-design/core';

  type TriggerKind = 'hover' | 'click' | 'focus';
  type Position = 'top' | 'bottom' | 'left' | 'right';
  type Align = 'start' | 'center' | 'end';

  interface Props {
    content?: string | Snippet;
    title?: string | Snippet;
    open?: boolean;
    defaultOpen?: boolean;
    trigger?: TriggerKind;
    position?: Position;
    align?: Align;
    showArrow?: boolean;
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
    showArrow = true,
    spacing = 8,
    mouseEnterDelay = 100,
    mouseLeaveDelay = 100,
    disabled = false,
    onOpenChange,
    children,
    contentSlot,
  }: Props = $props();

  const popId = useId('cd-popover');

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

  // --- useDismiss (红线 #3)：仅 click 触发需要 outside/Esc，放进 $effect ---
  let rootEl = $state<HTMLSpanElement | null>(null);

  $effect(() => {
    if (!isOpen || !rootEl || trigger !== 'click') return;
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
      class="cd-popover__pop cd-popover__pop--{position} cd-popover__pop--align-{align}"
      class:cd-popover__pop--no-arrow={!showArrow}
      style="--popover-spacing:{spacing}px"
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
        <span class="cd-popover__arrow" aria-hidden="true"></span>
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
  .cd-popover__pop {
    position: absolute;
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

  /* --- 箭头：方块旋转 45deg，按 position 定位 --- */
  .cd-popover__arrow {
    position: absolute;
    inline-size: var(--cd-popover-arrow-size);
    block-size: var(--cd-popover-arrow-size);
    background: var(--cd-popover-bg);
    box-shadow: var(--cd-popover-shadow);
    transform: rotate(45deg);
  }

  /* --- position 主方向（用 --popover-spacing 控制偏移）--- */
  .cd-popover__pop--top {
    inset-block-end: calc(100% + var(--popover-spacing));
  }
  .cd-popover__pop--bottom {
    inset-block-start: calc(100% + var(--popover-spacing));
  }
  .cd-popover__pop--left {
    inset-inline-end: calc(100% + var(--popover-spacing));
  }
  .cd-popover__pop--right {
    inset-inline-start: calc(100% + var(--popover-spacing));
  }

  /* --- align 交叉轴微调 --- */
  /* top / bottom 的交叉轴是 inline 方向 */
  .cd-popover__pop--top.cd-popover__pop--align-start,
  .cd-popover__pop--bottom.cd-popover__pop--align-start {
    inset-inline-start: 0;
  }
  .cd-popover__pop--top.cd-popover__pop--align-center,
  .cd-popover__pop--bottom.cd-popover__pop--align-center {
    inset-inline-start: 50%;
    transform: translateX(-50%);
  }
  .cd-popover__pop--top.cd-popover__pop--align-end,
  .cd-popover__pop--bottom.cd-popover__pop--align-end {
    inset-inline-end: 0;
  }
  /* left / right 的交叉轴是 block 方向 */
  .cd-popover__pop--left.cd-popover__pop--align-start,
  .cd-popover__pop--right.cd-popover__pop--align-start {
    inset-block-start: 0;
  }
  .cd-popover__pop--left.cd-popover__pop--align-center,
  .cd-popover__pop--right.cd-popover__pop--align-center {
    inset-block-start: 50%;
    transform: translateY(-50%);
  }
  .cd-popover__pop--left.cd-popover__pop--align-end,
  .cd-popover__pop--right.cd-popover__pop--align-end {
    inset-block-end: 0;
  }

  /* --- 箭头定位（指向触发器）--- */
  .cd-popover__pop--top .cd-popover__arrow {
    inset-block-end: calc(var(--cd-popover-arrow-size) / -2);
    inset-inline-start: 50%;
    margin-inline-start: calc(var(--cd-popover-arrow-size) / -2);
  }
  .cd-popover__pop--bottom .cd-popover__arrow {
    inset-block-start: calc(var(--cd-popover-arrow-size) / -2);
    inset-inline-start: 50%;
    margin-inline-start: calc(var(--cd-popover-arrow-size) / -2);
  }
  .cd-popover__pop--left .cd-popover__arrow {
    inset-inline-end: calc(var(--cd-popover-arrow-size) / -2);
    inset-block-start: 50%;
    margin-block-start: calc(var(--cd-popover-arrow-size) / -2);
  }
  .cd-popover__pop--right .cd-popover__arrow {
    inset-inline-start: calc(var(--cd-popover-arrow-size) / -2);
    inset-block-start: 50%;
    margin-block-start: calc(var(--cd-popover-arrow-size) / -2);
  }
</style>
