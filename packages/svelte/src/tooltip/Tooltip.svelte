<!--
  Tooltip — see specs/components/show/Tooltip.spec.md
  基础子集：hover/focus/click 触发、12 方位、箭头、延迟、dark/light 主题。
  定位：portal 到 body + position:fixed，core computePosition 计算坐标 +
  autoAdjustOverflow flip 碰撞避让（脱离 overflow:hidden 裁剪）。
  arrowPointAtCenter：start/end 对齐时箭头改为指向触发器中心（默认贴对齐边）。
  status：default|warning|error，非 default 时内容前渲染语义图标（aria-label 经 locale）。
  custom trigger：显隐完全由受控 open + onOpenChange 控制，不自动 hover/click/focus（供调用方自定义触发）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { useId, useDismiss, type Placement } from '@chenzy-design/core';
  import { floating } from '../_floating/use-floating.js';
  import { resolveSide } from './placement.js';
  import { useLocale } from '../locale-provider/index.js';

  type TriggerKind = 'hover' | 'focus' | 'click' | 'custom';
  type Theme = 'dark' | 'light';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    content?: string | Snippet;
    open?: boolean;
    defaultOpen?: boolean;
    trigger?: TriggerKind | Array<TriggerKind>;
    placement?: Placement;
    /** 视口溢出时翻转到对侧 */
    autoAdjustOverflow?: boolean;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    showArrow?: boolean;
    /** start/end 对齐时箭头指向触发器中心（默认 false：贴对齐边） */
    arrowPointAtCenter?: boolean;
    theme?: Theme;
    /** 语义态：非 default 时内容前渲染对应状态图标 */
    status?: Status;
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
    autoAdjustOverflow = true,
    mouseEnterDelay = 100,
    mouseLeaveDelay = 100,
    showArrow = true,
    arrowPointAtCenter = false,
    theme = 'dark',
    status = 'default',
    maxWidth = 300,
    disabled = false,
    onOpenChange,
    children,
  }: Props = $props();

  const tipId = useId('cd-tooltip');
  const loc = useLocale();

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

  // status：非 default 时内容前渲染语义图标（纯派生，红线 #2）
  const hasStatusIcon = $derived(status === 'warning' || status === 'error');
  const statusLabel = $derived(
    status === 'warning'
      ? loc().t('Tooltip.warningLabel')
      : status === 'error'
        ? loc().t('Tooltip.errorLabel')
        : undefined,
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

  // --- DOM 引用：触发包裹（浮层定位由 use:floating action 接管）---
  let rootEl = $state<HTMLSpanElement | null>(null);
  let popEl = $state<HTMLDivElement | null>(null);

  // 解析后的实际方位（flip 后），驱动箭头朝向 class。初值仅取 placement 一次。
  let resolvedPlacement = $state<Placement>(untrack(() => placement));
  const resolvedSide = $derived(resolveSide(resolvedPlacement));
  let arrowOffset = $state(0);

  // use:floating 的稳定参数：仅含原始输入（placement/trigger 不随 resolved 变化），
  // onPlacement 为稳定函数引用，避免 action update 触发重建循环。
  function onPlacement(info: { placement: Placement; arrowOffset: number }) {
    resolvedPlacement = info.placement;
    arrowOffset = info.arrowOffset;
  }

  // --- useDismiss (红线 #3)：Esc 对所有触发模式生效（WCAG 1.4.13 Content on Hover：
  // hover/focus 浮层也须可由 Esc 关闭）；外部点击关闭仅 click 触发需要（hover/focus 自然关）。
  // popup portal 列入 extraTargets。
  $effect(() => {
    if (!isOpen || !rootEl) return;
    const allowOutsideClick = triggers.includes('click');
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: allowOutsideClick,
      extraTargets: [popEl],
    });
    return cleanup;
  });

  // cleanup hover 定时器
  $effect(() => clearTimers);

  // 箭头沿交叉轴的定位样式：top/bottom 用 inline-start，left/right 用 block-start。
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
      bind:this={popEl}
      use:floating={{ trigger: rootEl, placement, autoAdjust: autoAdjustOverflow, offset: 8, arrowPointAtCenter, onPlacement }}
      class="cd-tooltip__pop cd-tooltip__pop--{resolvedSide} cd-tooltip__pop--{theme}"
      class:cd-tooltip__pop--no-arrow={!showArrow}
      class:cd-tooltip__pop--with-status={hasStatusIcon}
      style="max-inline-size:{maxWidthCss}"
    >
      {#if hasStatusIcon}
        <span class="cd-tooltip__status cd-tooltip__status--{status}" aria-label={statusLabel} role="img">
          {#if status === 'warning'}
            <svg class="cd-tooltip__status-svg" viewBox="0 0 16 16" focusable="false">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linejoin="round"
                d="M8 1.8l6.4 11.4H1.6z"
              />
              <path stroke="currentColor" stroke-width="1.4" stroke-linecap="round" d="M8 6v3.4" />
              <circle cx="8" cy="11.4" r="0.85" fill="currentColor" />
            </svg>
          {:else}
            <svg class="cd-tooltip__status-svg" viewBox="0 0 16 16" focusable="false">
              <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4" />
              <path
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                d="M5.5 5.5l5 5M10.5 5.5l-5 5"
              />
            </svg>
          {/if}
        </span>
      {/if}
      <span class="cd-tooltip__content">
        {#if contentSnippet}
          {@render contentSnippet()}
        {:else}
          {contentText}
        {/if}
      </span>
      {#if showArrow}
        <span class="cd-tooltip__arrow" style={arrowStyle} aria-hidden="true"></span>
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
  /* 浮层 portal 到 body，由 JS 写 position:fixed + transform 定位 */
  .cd-tooltip__pop {
    z-index: var(--cd-tooltip-z);
    inline-size: max-content;
    padding: var(--cd-tooltip-padding);
    border-radius: var(--cd-tooltip-radius);
    font-size: var(--cd-tooltip-font-size);
    line-height: var(--cd-line-height-1, 1.5);
    word-wrap: break-word;
    pointer-events: none;
  }

  /* --- status：图标 + 内容横向排布 --- */
  .cd-tooltip__pop--with-status {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--cd-spacing-1);
  }
  .cd-tooltip__status {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    inline-size: 1em;
    block-size: 1em;
    margin-block-start: 0.1em;
  }
  .cd-tooltip__status-svg {
    inline-size: 100%;
    block-size: 100%;
  }
  .cd-tooltip__status--warning {
    color: var(--cd-tooltip-status-warning);
  }
  .cd-tooltip__status--error {
    color: var(--cd-tooltip-status-error);
  }
  .cd-tooltip__content {
    min-inline-size: 0;
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

  /* --- 箭头：方块旋转 45deg，交叉轴偏移由内联 style 控制 --- */
  .cd-tooltip__arrow {
    position: absolute;
    inline-size: var(--cd-tooltip-arrow-size);
    block-size: var(--cd-tooltip-arrow-size);
    background: inherit;
    transform: rotate(45deg);
  }
  /* 交叉轴居中补偿：仅在交叉轴方向回退半个箭头尺寸 */
  .cd-tooltip__pop--top .cd-tooltip__arrow,
  .cd-tooltip__pop--bottom .cd-tooltip__arrow {
    margin-inline-start: calc(var(--cd-tooltip-arrow-size) / -2);
  }
  .cd-tooltip__pop--left .cd-tooltip__arrow,
  .cd-tooltip__pop--right .cd-tooltip__arrow {
    margin-block-start: calc(var(--cd-tooltip-arrow-size) / -2);
  }
  .cd-tooltip__pop--dark .cd-tooltip__arrow {
    background: var(--cd-tooltip-bg-dark);
  }
  .cd-tooltip__pop--light .cd-tooltip__arrow {
    background: var(--cd-tooltip-bg-light);
  }

  /* 箭头吸附到浮层贴近触发器的那条边（按解析后的 side） */
  .cd-tooltip__pop--top .cd-tooltip__arrow {
    inset-block-end: calc(var(--cd-tooltip-arrow-size) / -2);
  }
  .cd-tooltip__pop--bottom .cd-tooltip__arrow {
    inset-block-start: calc(var(--cd-tooltip-arrow-size) / -2);
  }
  .cd-tooltip__pop--left .cd-tooltip__arrow {
    inset-inline-end: calc(var(--cd-tooltip-arrow-size) / -2);
  }
  .cd-tooltip__pop--right .cd-tooltip__arrow {
    inset-inline-start: calc(var(--cd-tooltip-arrow-size) / -2);
  }
  .cd-tooltip__pop--no-arrow .cd-tooltip__arrow {
    display: none;
  }
</style>
