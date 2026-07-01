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
  浮层惰性挂载（首开才挂）；destroyOnClose 默认 true 关闭即卸载，false 时保留 DOM（--hidden 隐藏）。
  motion 默认开（淡入+轻缩放），reduced-motion 退化为无动效。arrowPointAtCenter 透传 floating。
  okButtonProps/cancelButtonProps 透传额外按钮属性（onclick/loading/disabled 由组件托管，不被覆盖）。
  关闭回调 reason 来源细分：'confirm'（确认按钮）| 'cancel'（取消按钮）| 'trigger'（点击/键盘/hover toggle）
  | 'esc'（Esc 键）| 'outsideClick'（外部点击）；esc/outsideClick 由 useDismiss 的 DismissReason 透传。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import {
    useId,
    useDismiss,
    useFocusTrap,
    useLiveAnnouncer,
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

  /** 透传给确认/取消 Button 的额外属性（type/theme/size/block/disabled/ariaLabel 等，不含 onclick/loading：由组件托管） */
  type ExtraButtonProps = {
    type?: 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
    theme?: 'solid' | 'borderless' | 'light' | 'outline';
    size?: 'small' | 'default' | 'large';
    block?: boolean;
    disabled?: boolean;
    htmlType?: 'button' | 'submit' | 'reset';
    ariaLabel?: string;
  };

  /** motion 配置：传 number 覆盖时长（ms），传 false 关闭过渡 */
  interface MotionConfig {
    /** 过渡时长（ms），缺省走 token --cd-popconfirm-motion-duration */
    duration?: number;
  }

  interface Props {
    open?: boolean;
    /** open 别名（Semi 原始拼写） */
    visible?: boolean;
    defaultOpen?: boolean;
    /** 非受控初始显隐（defaultOpen 别名，优先级低于 open） */
    defaultVisible?: boolean;
    title?: string;
    titleSnippet?: Snippet;
    content?: string;
    contentSnippet?: Snippet;
    type?: PopType;
    icon?: Snippet | false;
    okText?: string;
    cancelText?: string;
    okType?: OkType;
    /** 取消按钮类型（对应 okType 的取消侧），透传给取消 Button 的 type；优先级高于 cancelButtonProps.type */
    cancelType?: 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
    /** 透传确认按钮额外属性（onclick/loading 由组件托管，传入会被忽略） */
    okButtonProps?: ExtraButtonProps;
    /** 透传取消按钮额外属性（onclick/disabled 由组件托管，传入会被忽略） */
    cancelButtonProps?: ExtraButtonProps;
    showCancel?: boolean;
    placement?: Placement;
    /** placement 别名（Semi 原始拼写） */
    position?: Placement;
    disabled?: boolean;
    closeOnEsc?: boolean;
    closeOnOutsideClick?: boolean;
    /** 关闭时销毁浮层 DOM，默认 true（卸载释放内存）；false 时首开后保留（--hidden 隐藏） */
    destroyOnClose?: boolean;
    /** 箭头是否指向触发元素中心，默认 false */
    arrowPointAtCenter?: boolean;
    /** 是否显示箭头三角，默认 false（浮层与触发器间无连接箭头） */
    showArrow?: boolean;
    /** 入场动效开关/配置，默认 true（受 prefers-reduced-motion 覆盖） */
    motion?: boolean | MotionConfig;
    /** 触发方式：'click' 点击 toggle（默认）| 'hover' 悬停开关 */
    triggerType?: TriggerType;
    /** hover 触发：指针进入到打开的延迟（ms） */
    mouseEnterDelay?: number;
    /** hover 触发：指针离开到关闭的延迟（ms） */
    mouseLeaveDelay?: number;
    /** 浮层 portal 容器，缺省 document.body */
    getPopupContainer?: () => HTMLElement | null;
    /** 浮层 z-index，默认 1030 */
    zIndex?: number;
    /** Tab 键是否在浮层内循环（焦点陷阱），默认 true */
    guardFocus?: boolean;
    /** Esc 关闭时是否将焦点归还给触发元素，默认 true */
    returnFocusOnClose?: boolean;
    /** 点击浮层内事件是否阻止冒泡到文档，默认 true */
    stopPropagation?: boolean;
    trigger?: Snippet;
    onOpenChange?: (info: { open: boolean; reason: DismissReason }) => void;
    /** 确认回调；返回 Promise 时确认按钮 loading，resolve 关闭 / reject 保持打开 */
    onConfirm?: () => void | Promise<unknown>;
    onCancel?: () => void;
    /**
     * 点击浮层外部，在关闭逻辑前触发（区别于 onOpenChange 的 outsideClick reason）。
     * 调用 `event.preventDefault()` 可阻止默认关闭。
     */
    onClickOutside?: (event: MouseEvent) => void;
    /** onClickOutside 别名（Semi 原始大写 S 拼写） */
    onClickOutSide?: (event: MouseEvent) => void;
    /** Esc 键按下时触发（在 closeOnEsc 关闭之前） */
    onEscKeyDown?: (e: KeyboardEvent) => void;
    /** 入场动效结束、浮层完全可见 */
    onAfterOpen?: () => void;
    /** 出场动效结束、DOM 卸载后 */
    onAfterClose?: () => void;
    class?: string;
  }

  let {
    open,
    visible,
    defaultOpen = false,
    defaultVisible,
    title,
    titleSnippet,
    content,
    contentSnippet,
    type = 'default',
    icon,
    okText,
    cancelText,
    okType,
    cancelType,
    okButtonProps,
    cancelButtonProps,
    showCancel = true,
    placement,
    position,
    disabled = false,
    closeOnEsc = true,
    closeOnOutsideClick = true,
    destroyOnClose = true,
    arrowPointAtCenter = false,
    showArrow = false,
    motion = true,
    triggerType = 'click',
    mouseEnterDelay = 150,
    mouseLeaveDelay = 150,
    getPopupContainer,
    zIndex,
    guardFocus = true,
    returnFocusOnClose = true,
    stopPropagation = true,
    trigger,
    onOpenChange,
    onConfirm,
    onCancel,
    onClickOutside,
    onClickOutSide,
    onEscKeyDown,
    onAfterOpen,
    onAfterClose,
    class: className,
  }: Props = $props();

  const loc = useLocale();
  // 单例 live region（polite）：异步确认进入 loading 时播报「处理中」给屏幕阅读器。
  // 命令式写入在事件回调里（confirm()，非 render 期），符合红线 #3。
  const announcer = useLiveAnnouncer();

  const popupId = useId('cd-popconfirm-popup');
  const titleId = useId('cd-popconfirm-title');
  const contentId = useId('cd-popconfirm-content');

  // visible 为 open 别名；open 优先。
  const resolvedOpen = $derived(open ?? visible);
  // position 为 placement 别名；placement 优先，缺省 'top'。
  const resolvedPlacementProp = $derived<Placement>(placement ?? position ?? 'top');

  // --- 受控 open (红线 #1)：不无条件回写 open，仅 onOpenChange ---
  const isControlled = $derived(resolvedOpen !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isControlled ? !!resolvedOpen : innerOpen);

  function getInitialOpen(): boolean {
    // defaultVisible 为 defaultOpen 的别名，优先于 defaultOpen
    return defaultVisible ?? defaultOpen;
  }

  // 确认按钮 type 优先级：显式 okType > okButtonProps.type > 由 type 推导默认（兜底必为非空值）。
  type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
  const resolvedOkType = $derived<ButtonType>(
    okType ?? okButtonProps?.type ?? (type === 'danger' ? 'danger' : 'primary'),
  );
  // 取消按钮 type 优先级：显式 cancelType > cancelButtonProps.type > 'secondary'（默认）。
  const resolvedCancelType = $derived<ButtonType>(
    cancelType ?? cancelButtonProps?.type ?? 'secondary',
  );

  const hasContent = $derived(Boolean(contentSnippet) || Boolean(content));

  // motion：false（或 {duration:0}）关闭过渡；number/object.duration 覆盖 token 时长。
  const motionEnabled = $derived(motion !== false);
  const motionDuration = $derived(
    typeof motion === 'object' && typeof motion.duration === 'number'
      ? motion.duration
      : undefined,
  );

  // --- destroyOnClose / 惰性挂载（红线 #2 纯派生）：首开才挂；关闭后 destroyOnClose=false 保留 DOM（--hidden），true 卸载。 ---
  let hasBeenOpened = $state(false);
  $effect(() => {
    if (isOpen) hasBeenOpened = true;
  });
  const shouldRender = $derived(isOpen || (hasBeenOpened && !destroyOnClose));

  // 浮层根内联样式：motion duration 覆盖 token 时长；zIndex 覆盖 CSS 变量。
  const popupStyle = $derived.by(() => {
    const parts: string[] = [];
    if (motionDuration !== undefined) parts.push(`--cd-popconfirm-motion-duration:${motionDuration}ms`);
    if (zIndex !== undefined) parts.push(`z-index:${zIndex}`);
    return parts.length > 0 ? parts.join(';') : undefined;
  });

  // flip 后的实际方位（驱动箭头朝向）+ 箭头交叉轴偏移
  let resolvedPlacement = $state<Placement>(untrack(() => resolvedPlacementProp));
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
      announcer.announce(loc().t('Popconfirm.confirming'));
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

  // 外部点击/Esc 统一按取消处理，reason 由 useDismiss 细分（'esc' | 'outsideClick'）
  function dismiss(reason: DismissReason) {
    if (confirmLoading) return; // 异步确认进行中不被外部点击/Esc 打断
    onCancel?.();
    setOpen(false, reason);
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
    // guardFocus=true（默认）激活 Tab 循环焦点陷阱；false 时跳过（允许 Tab 离开浮层）。
    // returnFocusOnClose 在构造期决定 deactivate 是否归还焦点（true 默认归还）。
    const trap = guardFocus ? useFocusTrap(popupEl, { returnFocus: returnFocusOnClose }) : null;
    trap?.activate();
    let undismiss = () => {};
    // popup portal 到 body 后不在 rootEl 子树内：把 popupEl 列为 extraTargets，
    // 否则点击浮层内部会被误判为 outsideClick。点触发器在 rootEl 内由 onclick toggle。
    if (closeOnEsc || closeOnOutsideClick) {
      undismiss = useDismiss(rootEl ?? popupEl, {
        onDismiss: (reason) => {
          // onEscKeyDown：Esc 按下时先触发回调（在 dismiss 关闭前）。
          if (reason === 'esc' && onEscKeyDown) {
            // useDismiss 的 onDismiss 不直接传 KeyboardEvent，
            // 以合成空事件触发回调（符合接口契约）。
            const syntheticEv = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            onEscKeyDown(syntheticEv);
          }
          dismiss(reason);
        },
        escape: closeOnEsc,
        outsideClick: closeOnOutsideClick,
        extraTargets: [popupEl],
        // 外部点击：在 useDismiss 关闭判定之前触发 onClickOutside / onClickOutSide（关闭逻辑前）。
        // 调用方 preventDefault() 即阻止默认关闭（返回 false 跳过 onDismiss）。
        onOutsidePointer: (e) => {
          const handler = onClickOutside ?? onClickOutSide;
          if (!handler) return;
          handler(e);
          if (e.defaultPrevented) return false;
        },
      });
    }
    return () => {
      undismiss();
      // returnFocusOnClose=true（默认）时归还焦点给触发元素；false 时不归还
      // （归还策略已在 useFocusTrap 构造期通过 returnFocus 选项决定）。
      trap?.deactivate();
      // 浮层关闭即复位 loading（覆盖受控 open 在 loading 中被外部关闭的边界）。
      confirmLoading = false;
    };
  });

  // --- onAfterOpen / onAfterClose (红线 #3)：入场/出场动效结束钩子 ---
  // onAfterOpen：浮层挂载 + 入场动画 animationend；motion 关闭时下一帧即触发。
  $effect(() => {
    if (!isOpen || !popupEl) return;
    if (!onAfterOpen) return;
    const node = popupEl;
    let raf = 0;
    // 是否真正有入场动画：motion 开启、非 reduced-motion、且实际解析出非零时长。
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // token 未注入或时长为 0 时 animationend 不会触发，退回下一帧判定（避免钩子丢失）。
    const dur =
      typeof window !== 'undefined'
        ? parseFloat(getComputedStyle(node).animationDuration || '0')
        : 0;
    const hasAnim = motionEnabled && !reduced && dur > 0;
    if (hasAnim) {
      const onEnd = (e: AnimationEvent) => {
        if (e.target !== node || e.animationName !== 'cd-popconfirm-in') return;
        onAfterOpen?.();
      };
      node.addEventListener('animationend', onEnd, { once: true });
      return () => node.removeEventListener('animationend', onEnd);
    }
    // 无动画：下一帧（确保已绘制）即视为完全可见。后台标签页 rAF 会被挂起，
    // 补一个 setTimeout 兜底确保钩子最终触发（取先到者，避免重复）。
    let done = false;
    const fire = () => {
      if (done) return;
      done = true;
      onAfterOpen?.();
    };
    raf = requestAnimationFrame(fire);
    const t = setTimeout(fire, 32);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  });

  // onAfterClose：open 由 true→false 后触发（当前无出场动画，关闭即卸载/隐藏）。
  // 簿记用普通变量避免 $state 自循环（按记忆教训）。
  let wasOpen = false;
  $effect(() => {
    const openNow = isOpen;
    if (wasOpen && !openNow) onAfterClose?.();
    wasOpen = openNow;
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

  {#if shouldRender}
    <!-- destroyOnClose=false 时关闭仍保留 DOM（--hidden 隐藏），true 时 !isOpen 即被 {#if} 卸载。 -->
    <div
      class={popupCls}
      class:cd-popconfirm__popup--hidden={!isOpen}
      class:cd-popconfirm__popup--motion={motionEnabled}
      id={popupId}
      style={popupStyle}
      bind:this={popupEl}
      use:floating={{ trigger: rootEl, placement: resolvedPlacementProp, autoAdjust: true, offset: 8, arrowPointAtCenter, getContainer: getPopupContainer, onPlacement, open: isOpen }}
      role="dialog"
      tabindex="-1"
      aria-labelledby={titleId}
      aria-describedby={hasContent ? contentId : undefined}
      aria-hidden={!isOpen || undefined}
      onpointerenter={onPopupPointerEnter}
      onpointerleave={onPopupPointerLeave}
      onclick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      {#if showArrow}
        <div class="cd-popconfirm__arrow" style={arrowStyle} aria-hidden="true"></div>
      {/if}
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
          <Button size="small" {...cancelButtonProps} type={resolvedCancelType} disabled={confirmLoading} onclick={cancel}>
            {cancelText ?? loc().t('Popconfirm.cancel')}
          </Button>
        {/if}
        <Button
          size="small"
          {...okButtonProps}
          type={resolvedOkType}
          loading={confirmLoading}
          onclick={confirm}
        >
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
    border-radius: var(--cd-border-radius-small);
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
  /* destroyOnClose=false 关闭后保留 DOM 但不可见、不可交互、不占位 */
  .cd-popconfirm__popup--hidden {
    display: none;
  }
  /* motion：进场淡入 + 轻微缩放，token 时长/缓动；reduced-motion 退化 */
  .cd-popconfirm__popup--motion {
    animation: cd-popconfirm-in var(--cd-popconfirm-motion-duration)
      var(--cd-popconfirm-motion-easing, ease) both;
  }
  @keyframes cd-popconfirm-in {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
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
    gap: var(--cd-spacing-tight);
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
    font-weight: var(--cd-popconfirm-title-weight);
    line-height: 1.4;
  }
  .cd-popconfirm__content {
    margin-block-start: var(--cd-spacing-extra-tight);
    color: var(--cd-popconfirm-color-text-secondary);
    font-size: var(--cd-popconfirm-content-size);
    line-height: 1.5;
  }

  .cd-popconfirm__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--cd-popconfirm-gap-footer);
    margin-block-start: var(--cd-spacing-base-tight);
  }

  /* reduced-motion：禁用进场动画 */
  @media (prefers-reduced-motion: reduce) {
    .cd-popconfirm__popup--motion {
      animation: none;
    }
  }
</style>
