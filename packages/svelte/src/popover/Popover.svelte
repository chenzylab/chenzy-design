<!--
  Popover — see specs/components/show/Popover.spec.md
  基础子集：hover/click/focus/custom 触发、position+align（映射 12 方位）、箭头、间距、标题。
  定位：use:floating action portal 到 getPopupContainer()（默认 body）+ position:fixed，
  core computePosition 计算坐标 + autoAdjustOverflow flip 碰撞避让（脱离 overflow:hidden 裁剪）。
  custom：显隐完全由受控 open + onOpenChange 控制，组件不自动响应 hover/click/focus，
  也不启用 useDismiss 外部点击/Esc 关闭——由调用方自行决定何时显隐。

  spec §4 浮层 prop（复用库内浮层基建，红线 #3 命令式 + cleanup）：
  - getPopupContainer/zIndex：floating action getContainer（回退 ConfigProvider 全局，再回退 body）+ 内联 z-index。
  - trapFocus/returnFocus/rememberFocus：useFocusTrap（trapTab/returnFocus/rememberFocus 选项），关闭归还触发器。
  - closeOnEsc/closeOnOutsideClick：useDismiss（esc/outsideClick 分别可关）。
  - lockScroll：useScrollLock（默认关闭，非阻断）。
  - destroyOnClose：关闭即卸载浮层 DOM（{#if}），重开重建；默认 false 首开后保留（--hidden 隐藏）。
  - stopPropagation：浮层内 click/keydown/pointerdown 停止冒泡。
  - size：small/default/large 内边距档（token 驱动）。
  - motion：进场过渡开关/配置，reduced-motion 退化。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import {
    useId,
    useDismiss,
    useFocusTrap,
    useScrollLock,
    makePlacement,
    parsePlacement,
    type Placement,
    type Side,
    type Align,
  } from '@chenzy-design/core';
  import { getGlobalPopupContainer } from '../config-provider/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';

  type TriggerKind = 'hover' | 'click' | 'focus' | 'custom';
  type Position = 'top' | 'bottom' | 'left' | 'right';
  type Size = 'small' | 'default' | 'large';

  /** motion 配置：传 number 覆盖时长（ms），传 false 关闭过渡 */
  interface MotionConfig {
    /** 过渡时长（ms），缺省走 token --cd-popover-motion-duration */
    duration?: number;
  }

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
    /** 浮层挂载容器，缺省回退 ConfigProvider 全局，再回退 document.body。非 body 容器时 floating 改 absolute 定位。 */
    getPopupContainer?: () => HTMLElement | null | undefined;
    /** 浮层层级，缺省走 token var(--cd-popover-z) */
    zIndex?: number;
    /** 是否陷入焦点（Tab 循环），缺省随 trigger==='click' */
    trapFocus?: boolean;
    /** 关闭后焦点是否归还触发器（仅 trapFocus 时生效），默认 true */
    returnFocus?: boolean;
    /** Esc 关闭，默认 true（custom 触发不生效） */
    closeOnEsc?: boolean;
    /** 外部点击关闭，默认 true（custom 触发不生效） */
    closeOnOutsideClick?: boolean;
    /** 打开时锁定背景滚动，默认 false（非阻断） */
    lockScroll?: boolean;
    /** 关闭时销毁浮层 DOM，默认 false（首开后保留，仅 --hidden 隐藏） */
    destroyOnClose?: boolean;
    /** 重新打开时恢复上次浮层内焦点位置（仅 trapFocus 时生效），默认 false */
    rememberFocus?: boolean;
    /** 阻断浮层内事件冒泡，默认 false */
    stopPropagation?: boolean;
    /** 内边距尺寸档位，默认 default */
    size?: Size;
    /** 动画开关/配置，默认 true */
    motion?: boolean | MotionConfig;
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
    getPopupContainer,
    zIndex,
    trapFocus,
    returnFocus = true,
    closeOnEsc = true,
    closeOnOutsideClick = true,
    lockScroll = false,
    destroyOnClose = false,
    rememberFocus = false,
    stopPropagation = false,
    size = 'default',
    motion = true,
    onOpenChange,
    children,
    contentSlot,
  }: Props = $props();

  const popId = useId('cd-popover');
  const loc = useLocale();

  // ConfigProvider 全局浮层容器默认；自身 getPopupContainer prop 优先，未传时回退此值（再回退 body）。
  const globalPopupContainer = getGlobalPopupContainer();
  const resolvePopupContainer = $derived(getPopupContainer ?? globalPopupContainer);

  // trapFocus 缺省随 click（spec 默认值 trigger==='click'）。
  const shouldTrapFocus = $derived(trapFocus ?? trigger === 'click');

  // motion：false（或 {duration:0}）关闭过渡；number 形态在模板写内联时长。
  const motionEnabled = $derived(motion !== false);
  const motionDuration = $derived(
    typeof motion === 'object' && typeof motion.duration === 'number'
      ? motion.duration
      : undefined,
  );

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
  const titleId = $derived(`${popId}-title`);

  const contentText = $derived(typeof content === 'string' ? content : undefined);
  const contentSnippetFn = $derived(
    typeof content === 'function' ? content : undefined,
  );

  // --- destroyOnClose / 惰性挂载：首开才挂；关闭后 destroyOnClose=false 保留 DOM（--hidden），true 卸载。 ---
  let hasBeenOpened = $state(false);
  $effect(() => {
    if (isOpen) hasBeenOpened = true;
  });
  const shouldRender = $derived(isOpen || (hasBeenOpened && !destroyOnClose));

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
    if (!closeOnEsc && !closeOnOutsideClick) return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: (reason) => {
        if (reason === 'esc' && !closeOnEsc) return;
        if (reason === 'outsideClick' && !closeOnOutsideClick) return;
        setOpen(false);
      },
      escape: closeOnEsc,
      outsideClick: closeOnOutsideClick,
      extraTargets: [popEl],
    });
    return cleanup;
  });

  // --- focus-trap (红线 #3)：click 且 trapFocus 时，open 后陷入焦点，关闭归还触发器。 ---
  //  popEl 经 floating action 在挂载时即 portal 完成，$effect 运行时已在 DOM 且可聚焦，
  //  故同步 activate（与 Modal/Drawer 一致）。触发器 click 的默认聚焦先于 effect 结算，
  //  activate 捕获的 previouslyFocused 即触发器，关闭后 returnFocus 归还正确。
  $effect(() => {
    if (!isOpen || !popEl || !shouldTrapFocus) return;
    const trap = useFocusTrap(popEl, { returnFocus, rememberFocus });
    trap.activate();
    return () => trap.deactivate();
  });

  // --- scroll-lock (红线 #3)：lockScroll 时打开锁背景滚动，关闭即释放。 ---
  $effect(() => {
    if (!isOpen || !lockScroll) return;
    const release = useScrollLock();
    return release;
  });

  // cleanup hover 定时器
  $effect(() => clearTimers);

  // stopPropagation：浮层内交互事件停止冒泡（红线 #3 思路：组件内事件处理，不外泄）。
  function onPopEvent(e: Event) {
    if (stopPropagation) e.stopPropagation();
  }

  const arrowStyle = $derived(
    resolvedSide === 'top' || resolvedSide === 'bottom'
      ? `inset-inline-start:${arrowOffset}px`
      : `inset-block-start:${arrowOffset}px`,
  );

  // 浮层根内联样式：自定义 zIndex 覆盖 token 层级；motion duration 覆盖 token 时长。
  const popStyle = $derived(
    [
      zIndex !== undefined ? `z-index:${zIndex}` : '',
      motionDuration !== undefined
        ? `--cd-popover-motion-duration:${motionDuration}ms`
        : '',
    ]
      .filter(Boolean)
      .join(';'),
  );

  // dialog 兜底 aria-label（无标题时）。
  const dialogLabel = $derived(hasTitle ? undefined : loc().t('Popover.dialogLabel'));
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

  {#if shouldRender}
    <!-- destroyOnClose=false 时关闭仍保留 DOM（--hidden 隐藏），true 时 !isOpen 即被 {#if} 卸载。 -->
    <div
      id={popId}
      role="dialog"
      aria-modal="false"
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-label={dialogLabel}
      aria-hidden={!isOpen || undefined}
      tabindex="-1"
      bind:this={popEl}
      use:floating={{ trigger: rootEl, placement, autoAdjust: autoAdjustOverflow, offset: spacing, arrowPointAtCenter, onPlacement, getContainer: resolvePopupContainer, open: isOpen }}
      class="cd-popover__pop cd-popover__pop--{resolvedSide} cd-popover__pop--{size}"
      class:cd-popover__pop--no-arrow={!showArrow}
      class:cd-popover__pop--hidden={!isOpen}
      class:cd-popover__pop--motion={motionEnabled}
      style={popStyle}
      onclick={onPopEvent}
      onkeydown={onPopEvent}
      onpointerdown={onPopEvent}
    >
      {#if hasTitle}
        <div class="cd-popover__title" id={titleId}>
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
    padding: var(--cd-popover-padding-default);
    background: var(--cd-popover-bg);
    color: var(--cd-popover-color);
    border-radius: var(--cd-popover-radius);
    box-shadow: var(--cd-popover-shadow);
  }
  /* size 档：内边距随档位切换（token 驱动） */
  .cd-popover__pop--small {
    padding: var(--cd-popover-padding-small);
  }
  .cd-popover__pop--default {
    padding: var(--cd-popover-padding-default);
  }
  .cd-popover__pop--large {
    padding: var(--cd-popover-padding-large);
  }
  /* destroyOnClose=false 关闭后保留 DOM 但不可见、不可交互、不占位 */
  .cd-popover__pop--hidden {
    display: none;
  }
  /* motion：进场淡入 + 轻微缩放，token 时长/缓动；reduced-motion 退化 */
  .cd-popover__pop--motion {
    animation: cd-popover-in var(--cd-popover-motion-duration)
      var(--cd-popover-motion-easing, ease) both;
  }
  @keyframes cd-popover-in {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
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

  /* reduced-motion：禁用进场动画 */
  @media (prefers-reduced-motion: reduce) {
    .cd-popover__pop--motion {
      animation: none;
    }
  }
</style>
