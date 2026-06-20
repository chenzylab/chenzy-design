<!--
  Popconfirm — 气泡确认（feedback）。
  锚定触发元素的就地二次确认：title/content + 危险分级 type，确认/取消双按钮，
  12 方位 + autoAdjustOverflow flip 碰撞避让，role=dialog non-modal。
  定位：portal 到 getPopupContainer()（缺省 body）+ position:fixed（脱离 overflow:hidden 裁剪）。
  触发：triggerType='click'（默认，点击 toggle）| 'hover'（悬停 enter/leave delay 开关，
  指针移入浮层维持 open，复用 Dropdown 的 hover 定时器模式）。
  异步确认：onConfirm 返回 Promise 时确认按钮进入 loading 态，resolve 后关闭、reject 保持打开
  （对齐 ConfirmModal 的异步编排）。
  复用 core 原语：useId、useDismiss（外部点击/Esc 关闭，popup 列入 extraTargets）、
  useFocusTrap（焦点捕获+归还）、computePosition/useFloating（container 选项接 getPopupContainer）。
  浮层静态显示（{#if isOpen} 直接挂载），无入场动画，reduced-motion 友好。
  TODO(延后): Esc 与 outsideClick 来源细分。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import {
    useId,
    useDismiss,
    useFocusTrap,
    parsePlacement,
    type Placement,
    type Side,
  } from '@chenzy-design/core';
  import { Button } from '../button/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';

  type PopType = 'default' | 'danger' | 'warning';
  type OkType = 'primary' | 'danger';
  type TriggerType = 'click' | 'hover';
  type DismissReason = 'trigger' | 'confirm' | 'cancel' | 'esc' | 'outsideClick';

  interface Props {
    open?: boolean;
    defaultOpen?: boolean;
    title?: string;
    titleSnippet?: Snippet;
    content?: string;
    contentSnippet?: Snippet;
    type?: PopType;
    icon?: Snippet | false;
    okText?: string;
    cancelText?: string;
    okType?: OkType;
    showCancel?: boolean;
    placement?: Placement;
    disabled?: boolean;
    closeOnEsc?: boolean;
    closeOnOutsideClick?: boolean;
    /** 触发方式：'click' 点击 toggle（默认）| 'hover' 悬停开关 */
    triggerType?: TriggerType;
    /** hover 触发：指针进入到打开的延迟（ms） */
    mouseEnterDelay?: number;
    /** hover 触发：指针离开到关闭的延迟（ms） */
    mouseLeaveDelay?: number;
    /** 浮层 portal 容器，缺省 document.body */
    getPopupContainer?: () => HTMLElement | null;
    trigger?: Snippet;
    onOpenChange?: (info: { open: boolean; reason: DismissReason }) => void;
    /** 确认回调；返回 Promise 时确认按钮 loading，resolve 关闭 / reject 保持打开 */
    onConfirm?: () => void | Promise<unknown>;
    onCancel?: () => void;
    class?: string;
  }

  let {
    open,
    defaultOpen = false,
    title,
    titleSnippet,
    content,
    contentSnippet,
    type = 'default',
    icon,
    okText,
    cancelText,
    okType,
    showCancel = true,
    placement = 'top',
    disabled = false,
    closeOnEsc = true,
    closeOnOutsideClick = true,
    triggerType = 'click',
    mouseEnterDelay = 150,
    mouseLeaveDelay = 150,
    getPopupContainer,
    trigger,
    onOpenChange,
    onConfirm,
    onCancel,
    class: className,
  }: Props = $props();

  const loc = useLocale();

  const popupId = useId('cd-popconfirm-popup');
  const titleId = useId('cd-popconfirm-title');
  const contentId = useId('cd-popconfirm-content');

  // --- 受控 open (红线 #1)：不无条件回写 open，仅 onOpenChange ---
  const isControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isControlled ? !!open : innerOpen);

  function getInitialOpen(): boolean {
    return defaultOpen;
  }

  const resolvedOkType = $derived<OkType>(
    okType ?? (type === 'danger' ? 'danger' : 'primary'),
  );

  const hasContent = $derived(Boolean(contentSnippet) || Boolean(content));

  // flip 后的实际方位（驱动箭头朝向）+ 箭头交叉轴偏移
  let resolvedPlacement = $state<Placement>(untrack(() => placement));
  const resolvedSide = $derived<Side>(parsePlacement(resolvedPlacement).side);
  let arrowOffset = $state(0);

  const popupCls = $derived(
    [
      'cd-popconfirm__popup',
      `cd-popconfirm__popup--${resolvedSide}`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const arrowStyle = $derived(
    resolvedSide === 'top' || resolvedSide === 'bottom'
      ? `inset-inline-start:${arrowOffset}px`
      : `inset-block-start:${arrowOffset}px`,
  );

  function setOpen(next: boolean, reason: DismissReason) {
    if (!isControlled) innerOpen = next;
    onOpenChange?.({ open: next, reason });
  }

  function onTriggerClick() {
    if (disabled || triggerType !== 'click') return;
    setOpen(!isOpen, 'trigger');
  }

  function onTriggerKeydown(e: KeyboardEvent) {
    if (disabled) return;
    // 键盘可达性：无论 click/hover，Enter/Space 都能展开（hover 模式键盘等价）。
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(!isOpen, 'trigger');
    }
  }

  // --- hover 延迟开关 (红线 #3)：setTimeout 存普通变量，cleanup 清除。
  //     参考 Dropdown：enter 延迟开、leave 延迟关，指针移入浮层维持 open。 ---
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

  function onTriggerPointerEnter() {
    if (disabled || triggerType !== 'hover') return;
    clearTimers();
    enterTimer = setTimeout(() => setOpen(true, 'trigger'), mouseEnterDelay);
  }

  function onTriggerPointerLeave() {
    if (disabled || triggerType !== 'hover') return;
    clearTimers();
    leaveTimer = setTimeout(() => setOpen(false, 'trigger'), mouseLeaveDelay);
  }

  // popup portal 到容器后不在 rootEl 子树内：指针移入浮层需取消关闭，移出再延迟关。
  function onPopupPointerEnter() {
    if (triggerType !== 'hover') return;
    clearTimers();
  }

  function onPopupPointerLeave() {
    if (triggerType !== 'hover') return;
    clearTimers();
    leaveTimer = setTimeout(() => setOpen(false, 'trigger'), mouseLeaveDelay);
  }

  $effect(() => clearTimers);

  // --- 异步确认 (红线 #3)：onConfirm 返回 Promise 时确认按钮 loading，
  //     resolve 后关闭、reject 保持打开（对齐 ConfirmModal）。 ---
  let confirmLoading = $state(false);

  async function confirm() {
    if (confirmLoading) return;
    const result = onConfirm?.();
    if (result instanceof Promise) {
      confirmLoading = true;
      try {
        await result;
        confirmLoading = false;
        setOpen(false, 'confirm');
      } catch {
        confirmLoading = false; // reject：复位，保持打开
      }
    } else {
      setOpen(false, 'confirm');
    }
  }

  function cancel() {
    if (confirmLoading) return;
    onCancel?.();
    setOpen(false, 'cancel');
  }

  // 外部点击/Esc 统一按取消处理（reason 暂统一 outsideClick，来源细分 TODO）
  function dismiss() {
    if (confirmLoading) return; // 异步确认进行中不被外部点击/Esc 打断
    onCancel?.();
    setOpen(false, 'outsideClick');
  }

  // --- 浮层命令式编排 (红线 #3)：open 且浮层就绪时，
  //     activate focus-trap（焦点移入浮层）、绑 dismiss(Esc/外部点击)；
  //     cleanup 里 undismiss、deactivate(归还焦点) ---
  let popupEl = $state<HTMLElement | null>(null);
  let rootEl = $state<HTMLElement | null>(null);

  // 浮层定位由 use:floating action 接管（避免 effect cleanup 与 {#if} 卸载竞态）。
  function onPlacement(info: { placement: Placement; arrowOffset: number }) {
    resolvedPlacement = info.placement;
    arrowOffset = info.arrowOffset;
  }

  // --- focus-trap + dismiss (红线 #3)：open 且浮层就绪时绑定，cleanup 解绑/归还焦点 ---
  $effect(() => {
    if (!isOpen || !popupEl) return;
    const trap = useFocusTrap(popupEl);
    trap.activate();
    let undismiss = () => {};
    // popup portal 到 body 后不在 rootEl 子树内：把 popupEl 列为 extraTargets，
    // 否则点击浮层内部会被误判为 outsideClick。点触发器在 rootEl 内由 onclick toggle。
    if (closeOnEsc || closeOnOutsideClick) {
      undismiss = useDismiss(rootEl ?? popupEl, {
        onDismiss: dismiss,
        escape: closeOnEsc,
        outsideClick: closeOnOutsideClick,
        extraTargets: [popupEl],
      });
    }
    return () => {
      undismiss();
      trap.deactivate();
      // 浮层关闭即复位 loading（覆盖受控 open 在 loading 中被外部关闭的边界）。
      confirmLoading = false;
    };
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="cd-popconfirm"
  bind:this={rootEl}
  onpointerenter={onTriggerPointerEnter}
  onpointerleave={onTriggerPointerLeave}
>
  <div
    class="cd-popconfirm__trigger"
    role="button"
    tabindex={disabled ? -1 : 0}
    aria-haspopup="dialog"
    aria-expanded={isOpen}
    aria-controls={isOpen ? popupId : undefined}
    aria-disabled={disabled || undefined}
    onclick={onTriggerClick}
    onkeydown={onTriggerKeydown}
  >
    {@render trigger?.()}
  </div>

  {#if isOpen}
    <div
      class={popupCls}
      id={popupId}
      bind:this={popupEl}
      use:floating={{ trigger: rootEl, placement, autoAdjust: true, offset: 8, getContainer: getPopupContainer, onPlacement }}
      role="dialog"
      tabindex="-1"
      aria-labelledby={titleId}
      aria-describedby={hasContent ? contentId : undefined}
      onpointerenter={onPopupPointerEnter}
      onpointerleave={onPopupPointerLeave}
    >
      <div class="cd-popconfirm__arrow" style={arrowStyle} aria-hidden="true"></div>
      <div class="cd-popconfirm__body">
        {#if icon !== false}
          <span
            class="cd-popconfirm__icon cd-popconfirm__icon--{type}"
            aria-hidden="true"
          >
            {#if typeof icon === 'function'}
              {@render icon()}
            {:else if type === 'danger'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
                <path
                  d="M8 4.5v4.2"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <circle cx="8" cy="11.3" r="0.9" fill="currentColor" />
              </svg>
            {:else if type === 'warning'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2 1.5 13.5h13L8 2Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
                <path
                  d="M8 6.3v3"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <circle cx="8" cy="11.4" r="0.85" fill="currentColor" />
              </svg>
            {:else}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
                <path
                  d="M8 7.2v4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <circle cx="8" cy="4.7" r="0.9" fill="currentColor" />
              </svg>
            {/if}
          </span>
        {/if}
        <div class="cd-popconfirm__content-wrap">
          <div id={titleId} class="cd-popconfirm__title">
            {#if titleSnippet}
              {@render titleSnippet()}
            {:else}
              {title}
            {/if}
          </div>
          {#if hasContent}
            <div id={contentId} class="cd-popconfirm__content">
              {#if contentSnippet}
                {@render contentSnippet()}
              {:else}
                {content}
              {/if}
            </div>
          {/if}
        </div>
      </div>
      <div class="cd-popconfirm__footer">
        {#if showCancel}
          <Button size="small" disabled={confirmLoading} onclick={cancel}>
            {cancelText ?? loc().t('Popconfirm.cancel')}
          </Button>
        {/if}
        <Button size="small" type={resolvedOkType} loading={confirmLoading} onclick={confirm}>
          {okText ?? loc().t('Popconfirm.confirm')}
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .cd-popconfirm {
    position: relative;
    display: inline-block;
  }
  .cd-popconfirm__trigger {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }
  .cd-popconfirm__trigger:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  .cd-popconfirm__trigger[aria-disabled='true'] {
    cursor: not-allowed;
  }

  /* 浮层 portal 到 body，由 JS 写 position:fixed + transform 定位 */
  .cd-popconfirm__popup {
    z-index: var(--cd-popconfirm-z);
    inline-size: max-content;
    max-inline-size: var(--cd-popconfirm-max-width);
    padding: var(--cd-popconfirm-padding);
    background: var(--cd-popconfirm-bg);
    border-radius: var(--cd-popconfirm-radius);
    box-shadow: var(--cd-popconfirm-shadow);
  }

  /* arrow：旋转 45° 的纯色方块，交叉轴偏移由内联 style 控制 */
  .cd-popconfirm__arrow {
    position: absolute;
    inline-size: var(--cd-popconfirm-arrow-size);
    block-size: var(--cd-popconfirm-arrow-size);
    background: var(--cd-popconfirm-bg);
    transform: rotate(45deg);
  }
  /* 交叉轴居中补偿：仅在交叉轴方向回退半个箭头尺寸 */
  .cd-popconfirm__popup--top .cd-popconfirm__arrow,
  .cd-popconfirm__popup--bottom .cd-popconfirm__arrow {
    margin-inline-start: calc(var(--cd-popconfirm-arrow-size) / -2);
  }
  .cd-popconfirm__popup--left .cd-popconfirm__arrow,
  .cd-popconfirm__popup--right .cd-popconfirm__arrow {
    margin-block-start: calc(var(--cd-popconfirm-arrow-size) / -2);
  }
  /* 箭头吸附到浮层贴近触发器的那条边（按解析后的 side） */
  .cd-popconfirm__popup--top .cd-popconfirm__arrow {
    inset-block-end: calc(var(--cd-popconfirm-arrow-size) / -2);
  }
  .cd-popconfirm__popup--bottom .cd-popconfirm__arrow {
    inset-block-start: calc(var(--cd-popconfirm-arrow-size) / -2);
  }
  .cd-popconfirm__popup--left .cd-popconfirm__arrow {
    inset-inline-end: calc(var(--cd-popconfirm-arrow-size) / -2);
  }
  .cd-popconfirm__popup--right .cd-popconfirm__arrow {
    inset-inline-start: calc(var(--cd-popconfirm-arrow-size) / -2);
  }

  .cd-popconfirm__body {
    display: flex;
    gap: var(--cd-spacing-2);
  }
  .cd-popconfirm__icon {
    display: inline-flex;
    flex-shrink: 0;
    line-height: 1;
  }
  .cd-popconfirm__icon--danger {
    color: var(--cd-popconfirm-icon-color-danger);
  }
  .cd-popconfirm__icon--warning {
    color: var(--cd-popconfirm-icon-color-warning);
  }
  .cd-popconfirm__icon--default {
    color: var(--cd-popconfirm-icon-color-info);
  }

  .cd-popconfirm__content-wrap {
    min-inline-size: 0;
  }
  .cd-popconfirm__title {
    color: var(--cd-popconfirm-title-color);
    font-size: var(--cd-popconfirm-title-size);
    font-weight: 600;
    line-height: 1.4;
  }
  .cd-popconfirm__content {
    margin-block-start: var(--cd-spacing-1);
    color: var(--cd-popconfirm-color-text-secondary);
    font-size: var(--cd-popconfirm-content-size);
    line-height: 1.5;
  }

  .cd-popconfirm__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--cd-popconfirm-gap-footer);
    margin-block-start: var(--cd-spacing-3);
  }

  /* 本子集无入场动画；reduced-motion 下同样无过渡 */
  @media (prefers-reduced-motion: reduce) {
    .cd-popconfirm__popup {
      transition: none;
    }
  }
</style>
