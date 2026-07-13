<!--
  Tooltip — 文字提示（严格对齐 Semi Design semi-ui/tooltip）。
  浮层基座：Popover / Popconfirm 复用其定位/触发/焦点/dismiss/箭头（对齐 Semi 继承链）。
  DOM：触发包裹 span + portal 浮层 .cd-tooltip__pop（承 semi-tooltip-wrapper 语义）
       > .cd-tooltip__content（content 层）+ SVG 箭头（同级）。
  定位：portal 到 getPopupContainer()（缺省 body）+ position:fixed，core computePosition
       计算坐标 + autoAdjustOverflow flip 碰撞避让（脱离 overflow:hidden 裁剪）。
  Semi 12 方位 position（top/topLeft/leftTop…）→ core side+align Placement（见 placement.ts）。
  Semi Tooltip 固定 dark（grey-7 背景），无 theme/status/maxWidth（用 style 覆盖 max-width）。
  箭头：SVG 双 path（外层 border 色 + 内层 bg 色），vertical(24×7) / horizontal(7×24) 两套，
       对齐 Semi TriangleArrow/TriangleArrowVertical。arrowStyle 可定制 border/bg 色。
  custom trigger：显隐完全由受控 visible + onVisibleChange 控制。
  condition=false：不响应 hover/click/focus（custom 不受影响）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import {
    useId,
    useDismiss,
    useScrollLock,
    useFocusTrap,
    type Placement,
    type Side,
  } from '@chenzy-design/core';
  import { getGlobalPopupContainer } from '../config-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import {
    positionToPlacement,
    resolveSide,
    type Position,
  } from './placement.js';

  type TriggerKind = 'hover' | 'focus' | 'click' | 'custom';
  type Spacing = number | { x: number; y: number };
  type MarginObject = {
    marginLeft?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
  };
  /** 箭头颜色定制（对齐 Semi arrowStyle 的 borderColor/backgroundColor/borderOpacity 子集）。 */
  interface ArrowStyle {
    borderColor?: string;
    backgroundColor?: string;
    borderOpacity?: string | number;
  }

  interface Props {
    content?: string | Snippet;
    /** 受控显隐（配合 trigger='custom'），对齐 Semi visible。undefined = 非受控 */
    visible?: boolean | undefined;
    /** 非受控初始显隐 */
    defaultVisible?: boolean;
    trigger?: TriggerKind | Array<TriggerKind>;
    /** 弹出方位，Semi 12 方位命名（top/topLeft/leftTop…），默认 top */
    position?: Position;
    /** 视口溢出时翻转到对侧 */
    autoAdjustOverflow?: boolean;
    /** 浮层与触发器的距离（px）；{x,y} 时主轴取对应分量。默认 8 */
    spacing?: Spacing | undefined;
    /** 计算溢出翻转时增加的冗余安全边距（对齐 Semi margin），默认 0 */
    margin?: number | MarginObject;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    /** 是否显示箭头，或传自定义箭头 Snippet，默认 true */
    showArrow?: boolean | Snippet;
    /** 箭头是否指向触发元素中心（需 showArrow），默认 true */
    arrowPointAtCenter?: boolean;
    /** 箭头颜色定制（border/bg/opacity） */
    arrowStyle?: ArrowStyle | undefined;
    disabled?: boolean;
    /** 是否允许触发显示；false 时不响应 hover/click/focus（custom 不受影响），默认 true */
    condition?: boolean;
    /** hover 触发下，点击浮层内部即关闭，默认 false */
    clickToHide?: boolean;
    /** 关闭时保留浮层 DOM 不销毁（--hidden 隐藏），默认 false */
    keepDOM?: boolean;
    /** hover 触发时不响应键盘 focus 显隐，默认 false */
    disableFocusListener?: boolean;
    /** 是否展示进出场动画，默认 true */
    motion?: boolean;
    /** 浮层 z-index（覆盖 CSS token --cd-tooltip-z），默认 undefined（走 token） */
    zIndex?: number | undefined;
    /** 浮层自定义类名（追加到浮层元素） */
    class?: string;
    /** 浮层自定义内联样式（追加到浮层元素） */
    style?: string;
    /** 阻止浮层上的点击事件冒泡，默认 false（对齐 Semi） */
    stopPropagation?: boolean;
    /** Esc 关闭浮层，默认 true（WCAG 1.4.13：hover/focus 浮层也须可由 Esc 关闭） */
    closeOnEsc?: boolean;
    /** 显示时阻止页面滚动 */
    preventScroll?: boolean;
    /** 更新该值手动触发浮层重新定位（对齐 Semi rePosKey） */
    rePosKey?: string | number | undefined;
    /** 自定义浮层挂载容器（缺省回退 ConfigProvider 全局，再回退 body） */
    getPopupContainer?: (() => HTMLElement | null | undefined) | undefined;
    /** 显隐切换回调（对齐 Semi onVisibleChange） */
    onVisibleChange?: ((visible: boolean) => void) | undefined;
    /** 点击浮层与触发器外部区域的回调（仅 custom/click 有效，对齐 Semi onClickOutSide） */
    onClickOutSide?: ((e: MouseEvent) => void) | undefined;
    /** 浮层完全关闭后的回调 */
    afterClose?: (() => void) | undefined;
    /**
     * 浮层视觉档（对齐 Semi prefixCls 机制）：'tooltip'（默认，深色 grey-7 浮层）
     * | 'popover'（浅色 bg-3 白底 + 边框 + 阴影，供 Popover/Popconfirm 复用）。
     * 切换浮层根 class 命名空间与箭头默认配色 token。
     */
    variant?: 'tooltip' | 'popover';
    /** 浮层 role（对齐 Semi role），默认 'tooltip'。Popover 传 'dialog' 承载可交互富内容。 */
    role?: string;
    /** dialog 模式（role=dialog）：焦点陷入浮层（Tab 循环），默认随 role==='dialog' */
    guardFocus?: boolean | undefined;
    /** 关闭后焦点归还触发器（仅 guardFocus 时生效），默认 true */
    returnFocusOnClose?: boolean;
    /** dialog 模式无标题时的兜底 aria-label（Popover 传入） */
    dialogLabel?: string | undefined;
    /** dialog 模式浮层的 aria-labelledby（Popover 有标题时传入） */
    ariaLabelledby?: string | undefined;
    children?: Snippet;
  }

  let {
    content,
    visible,
    defaultVisible = false,
    trigger = 'hover',
    position = 'top',
    autoAdjustOverflow = true,
    spacing = 8,
    margin = 0,
    mouseEnterDelay = 50,
    mouseLeaveDelay = 50,
    showArrow = true,
    arrowPointAtCenter = true,
    arrowStyle,
    disabled = false,
    condition = true,
    clickToHide = false,
    keepDOM = false,
    disableFocusListener = false,
    motion = true,
    zIndex,
    class: className = '',
    style: styleExtra = '',
    stopPropagation = false,
    closeOnEsc = true,
    preventScroll = false,
    rePosKey,
    getPopupContainer,
    onVisibleChange,
    onClickOutSide,
    afterClose,
    variant = 'tooltip',
    role = 'tooltip',
    guardFocus,
    returnFocusOnClose = true,
    dialogLabel,
    ariaLabelledby,
    children,
  }: Props = $props();

  const tipId = useId('cd-tooltip');

  // ConfigProvider 全局浮层容器默认；自身 getPopupContainer prop 优先。
  const globalPopupContainer = getGlobalPopupContainer();
  const resolvePopupContainer = $derived(getPopupContainer ?? globalPopupContainer);

  // Semi 12 方位 position → core Placement（内部定位用）
  const placement = $derived<Placement>(positionToPlacement(position));

  // showArrow 归一：boolean 决定显隐；Snippet 时视为显示且用自定义箭头。
  const showArrowBool = $derived(showArrow !== false);
  const customArrow = $derived(
    typeof showArrow === 'function' ? (showArrow as Snippet) : undefined,
  );

  // spacing 主轴分量：top/bottom 用 y，left/right 用 x；number 直接用。
  const mainAxisSpacing = $derived.by(() => {
    if (typeof spacing === 'number') return spacing;
    const side = resolveSide(placement);
    return side === 'top' || side === 'bottom' ? spacing.y : spacing.x;
  });

  // margin 归一为 flip 判定的安全边距（core padding 语义近似；取最大分量作视口边距冗余）。
  const marginPadding = $derived.by(() => {
    if (typeof margin === 'number') return margin;
    return Math.max(
      margin.marginTop ?? 0,
      margin.marginBottom ?? 0,
      margin.marginLeft ?? 0,
      margin.marginRight ?? 0,
    );
  });

  const motionEnabled = $derived(motion !== false);

  // dialog 模式（role=dialog）：承载可交互富内容（Popover click/custom），需焦点陷入。
  const isDialog = $derived(role === 'dialog');
  // guardFocus 缺省随 dialog（对齐 Semi Popover 的 trapFocus 默认随 click→dialog）。
  const shouldTrapFocus = $derived(guardFocus ?? isDialog);

  // --- 受控 visible (红线 #1)：不无条件回写，仅 onVisibleChange ---
  const isControlled = $derived(visible !== undefined);
  // eslint-disable-next-line -- 仅取 defaultVisible 初值作为非受控初始态
  let innerOpen = $state(untrack(() => defaultVisible));
  const triggers = $derived(Array.isArray(trigger) ? trigger : [trigger]);
  const isCustom = $derived(triggers.includes('custom'));
  const hasContent = $derived(content !== undefined && content !== '');
  // condition=false 时禁止显示（custom 不受影响）；disabled 同理。
  const allowShow = $derived(condition !== false && !disabled);
  const isOpen = $derived(
    hasContent &&
      (isControlled ? !!visible : innerOpen) &&
      (isCustom || allowShow),
  );

  function setOpen(next: boolean) {
    if (next === (isControlled ? !!visible : innerOpen)) return;
    if (!isControlled) innerOpen = next;
    onVisibleChange?.(next);
  }

  const contentText = $derived(
    typeof content === 'string' ? content : undefined,
  );
  const contentSnippet = $derived(
    typeof content === 'function' ? (content as Snippet) : undefined,
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
    if (!allowShow || isCustom || !triggers.includes('hover')) return;
    clearTimers();
    enterTimer = setTimeout(() => setOpen(true), mouseEnterDelay);
  }

  function onPointerLeave() {
    if (!allowShow || isCustom || !triggers.includes('hover')) return;
    clearTimers();
    leaveTimer = setTimeout(() => setOpen(false), mouseLeaveDelay);
  }

  function onFocusIn() {
    if (!allowShow || isCustom) return;
    // focus 触发；或 hover 触发但未禁用 focus 监听（键盘可达性，对齐 Semi）。
    const focusable =
      triggers.includes('focus') ||
      (triggers.includes('hover') && !disableFocusListener);
    if (!focusable) return;
    setOpen(true);
  }

  function onFocusOut() {
    if (!allowShow || isCustom) return;
    const focusable =
      triggers.includes('focus') ||
      (triggers.includes('hover') && !disableFocusListener);
    if (!focusable) return;
    setOpen(false);
  }

  function onClick() {
    if (!allowShow || isCustom || !triggers.includes('click')) return;
    // dialog 模式的 click 由触发器 span 的 capture 阶段处理（见 onTriggerClickCapture），
    // 避免 children 子元素 stopPropagation 截断（对齐 Semi：click 绑触发器本身）。
    if (isDialog) return;
    setOpen(!isOpen);
  }

  // dialog 模式：click 绑触发器 span 的捕获阶段，子元素 stopPropagation 不影响打开。
  function onTriggerClickCapture() {
    if (!isDialog || !allowShow || isCustom || !triggers.includes('click')) return;
    setOpen(!isOpen);
  }

  // --- DOM 引用 ---
  let rootEl = $state<HTMLSpanElement | null>(null);
  let popEl = $state<HTMLDivElement | null>(null);

  // 解析后的实际方位（flip 后），驱动箭头朝向 class。初值仅取 placement 一次。
  let resolvedPlacement = $state<Placement>(untrack(() => placement));
  const resolvedSide = $derived<Side>(resolveSide(resolvedPlacement));
  let arrowOffset = $state(0);

  function onPlacement(info: { placement: Placement; arrowOffset: number }) {
    resolvedPlacement = info.placement;
    arrowOffset = info.arrowOffset;
  }

  // --- keepDOM / 惰性挂载：首开才挂；keepDOM=true 关闭后保留 DOM（--hidden），false 卸载。 ---
  let hasBeenOpened = $state(false);
  $effect(() => {
    if (isOpen) hasBeenOpened = true;
  });
  const shouldRender = $derived(isOpen || (hasBeenOpened && keepDOM));

  // --- useDismiss (红线 #3)：Esc 对所有触发模式生效（WCAG 1.4.13 Content on Hover/Focus：
  //     hover/focus 浮层也须可由 Esc 关闭；Semi closeOnEsc 默认关仅指 click 触发的专用行为，
  //     此处 Esc 关闭是无障碍底线，不受 closeOnEsc 门控）。外部点击关闭仅 click/custom 生效
  //     （对齐 Semi；hover/focus 自然离开即关）。popup portal 列入 extraTargets。
  //     外部点击先触发 onClickOutSide（仅 custom/click）。 ---
  $effect(() => {
    if (!isOpen || !rootEl) return;
    const allowOutsideClick = triggers.includes('click') || isCustom;
    if (!closeOnEsc && !allowOutsideClick) return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: (reason) => {
        if (reason === 'esc' && !closeOnEsc) return;
        if (reason === 'outsideClick' && !allowOutsideClick) return;
        setOpen(false);
      },
      escape: closeOnEsc,
      outsideClick: allowOutsideClick,
      extraTargets: [popEl],
      ...(onClickOutSide
        ? {
            onOutsidePointer: (e: PointerEvent) => {
              onClickOutSide(e as unknown as MouseEvent);
              if (e.defaultPrevented) return false;
            },
          }
        : {}),
    });
    return cleanup;
  });

  // --- focus-trap (红线 #3)：dialog 模式且 guardFocus 时，open 后陷入焦点，关闭归还触发器。
  //  popEl 经 floating action 在挂载时即 portal 完成，$effect 运行时已在 DOM 且可聚焦，
  //  故同步 activate（与 Modal/Drawer 一致）。 ---
  $effect(() => {
    if (!isOpen || !popEl || !shouldTrapFocus) return;
    const trap = useFocusTrap(popEl, { returnFocus: returnFocusOnClose });
    trap.activate();
    return () => trap.deactivate();
  });

  // cleanup hover 定时器
  $effect(() => clearTimers);

  // --- preventScroll：显示时锁定背景滚动（红线 #3：命令式 + cleanup）---
  $effect(() => {
    if (!isOpen || !preventScroll) return;
    const release = useScrollLock();
    return release;
  });

  // --- afterClose：浮层关闭后异步回调，确保动画有机会结束 ---
  let prevOpenRef = { value: false };
  $effect(() => {
    const current = isOpen;
    if (prevOpenRef.value && !current) {
      requestAnimationFrame(() => afterClose?.());
    }
    prevOpenRef.value = current;
  });

  // 浮层根内联样式：自定义 zIndex 覆盖 token 层级 + 用户 style 追加。
  const popStyle = $derived(
    [
      zIndex !== undefined ? `z-index:${zIndex}` : '',
      styleExtra,
    ]
      .filter(Boolean)
      .join(';'),
  );

  // clickToHide：hover 触发下点击浮层内部即关闭；否则按 stopPropagation 决定冒泡。
  function onPopClick(e: MouseEvent) {
    if (stopPropagation) e.stopPropagation();
    if (clickToHide && !isCustom) setOpen(false);
  }

  // 箭头沿交叉轴的定位样式：top/bottom 用 inline-start，left/right 用 block-start。
  const arrowStyleCss = $derived(
    resolvedSide === 'top' || resolvedSide === 'bottom'
      ? `inset-inline-start:${arrowOffset}px`
      : `inset-block-start:${arrowOffset}px`,
  );

  // 箭头颜色：arrowStyle 覆盖 token 默认（border/bg/opacity）。
  // variant 决定默认配色 token：tooltip 深色（border=bg 无独立描边）；
  // popover 浅色（bg=popover-arrow-bg、border=popover-arrow-border 独立描边）。
  const arrowDefaultBg = $derived(
    variant === 'popover'
      ? 'var(--cd-color-popover-arrow-bg)'
      : 'var(--cd-tooltip-bg)',
  );
  const arrowDefaultBorder = $derived(
    variant === 'popover'
      ? 'var(--cd-color-popover-arrow-border)'
      : 'var(--cd-tooltip-arrow-border, var(--cd-tooltip-bg))',
  );
  const arrowBorderColor = $derived(arrowStyle?.borderColor);
  const arrowBgColor = $derived(arrowStyle?.backgroundColor);
  const arrowBorderOpacity = $derived(arrowStyle?.borderOpacity);

  // dialog 模式：触发器承载 button 角色（aria-haspopup/expanded/controls 挂合法宿主，
  // 对齐 Semi Popover 的 a11y 修复）；tooltip 模式保持纯 span + aria-describedby。
  // dialog 模式触发器可 Enter/Space 激活（与原生 button 一致）。
  function onTriggerKeydown(e: KeyboardEvent) {
    if (!isDialog || !allowShow || isCustom) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setOpen(!isOpen);
    }
  }
</script>

<!-- 触发包裹 span 仅转发宿主事件给真正可交互的 children -->
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
  <!-- dialog 模式触发器承载 button 角色（aria-haspopup/expanded/controls 挂合法宿主）；
       tooltip 模式保持纯 span + aria-describedby。role/tabindex 动态，抑制静态分析误报。 -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <span
    class="cd-tooltip__trigger"
    role={isDialog ? 'button' : undefined}
    tabindex={isDialog && !isCustom ? 0 : undefined}
    aria-haspopup={isDialog ? 'dialog' : undefined}
    aria-expanded={isDialog ? isOpen : undefined}
    aria-controls={isDialog && isOpen ? tipId : undefined}
    aria-describedby={!isDialog && isOpen ? tipId : undefined}
    aria-disabled={isDialog && disabled ? 'true' : undefined}
    onclickcapture={isDialog ? onTriggerClickCapture : undefined}
    onkeydown={isDialog ? onTriggerKeydown : undefined}
  >
    {@render children?.()}
  </span>

  {#if shouldRender}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
      id={tipId}
      {role}
      aria-modal={isDialog ? 'false' : undefined}
      aria-labelledby={isDialog ? ariaLabelledby : undefined}
      aria-label={isDialog ? dialogLabel : undefined}
      aria-hidden={!isOpen || undefined}
      tabindex={isDialog ? -1 : undefined}
      bind:this={popEl}
      use:floating={{ trigger: rootEl, placement, autoAdjust: autoAdjustOverflow, offset: mainAxisSpacing, padding: marginPadding, arrowPointAtCenter, onPlacement, getContainer: resolvePopupContainer, open: isOpen, rePosKey }}
      class="cd-tooltip__pop cd-tooltip__pop--{variant} cd-tooltip__pop--{resolvedSide} {className}"
      class:cd-tooltip__pop--no-arrow={!showArrowBool}
      class:cd-tooltip__pop--with-arrow={showArrowBool}
      class:cd-tooltip__pop--hidden={!isOpen}
      class:cd-tooltip__pop--motion={motionEnabled}
      style={popStyle}
      onclick={onPopClick}
    >
      <div class="cd-tooltip__content">
        {#if contentSnippet}
          {@render contentSnippet()}
        {:else}
          {contentText}
        {/if}
      </div>
      {#if showArrowBool}
        {#if customArrow}
          {@render customArrow()}
        {:else if resolvedSide === 'top' || resolvedSide === 'bottom'}
          <!-- 水平箭头（top/bottom）：24×7 SVG 双 path，bottom 侧旋转 180° -->
          <svg
            class="cd-tooltip__arrow cd-tooltip__arrow--v"
            width="24"
            height="7"
            viewBox="0 0 24 7"
            style={arrowStyleCss}
            aria-hidden="true"
            focusable="false"
          >
            <path d="M0 0.5L0 1.5C4 1.5, 5.5 3, 7.5 5S10,8 12,8S14.5 7, 16.5 5S20,1.5 24,1.5L24 0.5L0 0.5z" style="fill:{arrowBorderColor ?? arrowDefaultBorder};opacity:{arrowBorderOpacity ?? 1}" />
            <path d="M0 0L0 1C4 1, 5.5 2, 7.5 4S10,7 12,7S14.5  6, 16.5 4S20,1 24,1L24 0L0 0z" style="fill:{arrowBgColor ?? arrowDefaultBg}" />
          </svg>
        {:else}
          <!-- 垂直箭头（left/right）：7×24 SVG 双 path，right 侧旋转 180° -->
          <svg
            class="cd-tooltip__arrow cd-tooltip__arrow--h"
            width="7"
            height="24"
            viewBox="0 0 7 24"
            style={arrowStyleCss}
            aria-hidden="true"
            focusable="false"
          >
            <path d="M0.5 0L1.5 0C1.5 4, 3 5.5, 5 7.5S8,10 8,12S7 14.5, 5 16.5S1.5,20 1.5,24L0.5 24L0.5 0z" style="fill:{arrowBorderColor ?? arrowDefaultBorder};opacity:{arrowBorderOpacity ?? 1}" />
            <path d="M0 0L1 0C1 4, 2 5.5, 4 7.5S7,10 7,12S6 14.5, 4 16.5S1,20 1,24L0 24L0 0z" style="fill:{arrowBgColor ?? arrowDefaultBg}" />
          </svg>
        {/if}
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
  /* 浮层 portal 到 body，由 JS 写 position:fixed + transform 定位。
     对齐 Semi .semi-tooltip-wrapper：dark grey-7 背景、8/12 内边距、240 max-width。 */
  .cd-tooltip__pop {
    z-index: var(--cd-tooltip-z);
    inline-size: max-content;
    max-inline-size: var(--cd-tooltip-max-width);
    padding: var(--cd-tooltip-padding);
    background: var(--cd-tooltip-bg);
    color: var(--cd-tooltip-color);
    border-radius: var(--cd-tooltip-radius);
    font-size: var(--cd-tooltip-font-size);
    line-height: var(--cd-tooltip-line-height);
    word-wrap: break-word;
    overflow-wrap: break-word;
    pointer-events: auto;
  }
  .cd-tooltip__content {
    min-inline-size: 0;
  }

  /* --- variant=popover：浅色浮层（对齐 Semi .semi-popover-wrapper：bg-3 白底 + 阴影 + medium 圆角）。
     内边距归零，由 Popover 内层 .cd-popover-content / .cd-popover-title 控制（对齐 Semi）。 --- */
  .cd-tooltip__pop--popover {
    padding: 0;
    max-inline-size: none;
    background: var(--cd-color-popover-bg-default);
    color: var(--cd-color-text-0);
    border-radius: var(--cd-radius-popover);
    box-shadow: var(--cd-popover-shadow);
    font-size: var(--cd-tooltip-font-size);
    line-height: var(--cd-tooltip-line-height);
    backdrop-filter: var(--cd-filter-popover-bg);
  }

  /* --- 箭头：SVG 双 path，arrowOffset（内联 inset-*）指箭头中心距浮层前缘，
     故交叉轴用 margin 回退半个箭头宽/高，把中心对准 arrowOffset；bottom/right 侧旋转 180°。 --- */
  .cd-tooltip__arrow {
    position: absolute;
    display: block;
  }
  /* 水平箭头（top/bottom 系）：宽 24 高 7；交叉轴回退半宽 12px；主轴贴边（高 7 → 露出 6px 补 1px 缝） */
  .cd-tooltip__pop--top .cd-tooltip__arrow--v,
  .cd-tooltip__pop--bottom .cd-tooltip__arrow--v {
    margin-inline-start: -12px;
  }
  .cd-tooltip__pop--top .cd-tooltip__arrow--v {
    inset-block-end: -6px;
  }
  .cd-tooltip__pop--bottom .cd-tooltip__arrow--v {
    inset-block-start: -6px;
    transform: rotate(180deg);
  }
  /* 垂直箭头（left/right 系）：宽 7 高 24；交叉轴回退半高 12px */
  .cd-tooltip__pop--left .cd-tooltip__arrow--h,
  .cd-tooltip__pop--right .cd-tooltip__arrow--h {
    margin-block-start: -12px;
  }
  .cd-tooltip__pop--left .cd-tooltip__arrow--h {
    inset-inline-end: -6px;
  }
  .cd-tooltip__pop--right .cd-tooltip__arrow--h {
    inset-inline-start: -6px;
    transform: rotate(180deg);
  }
  .cd-tooltip__pop--no-arrow .cd-tooltip__arrow {
    display: none;
  }

  /* motion：进场淡入 + 轻微缩放（zoom），token 时长/缓动；reduced-motion 退化。
     用独立 scale 属性（非 transform）做缩放：use:floating 用 transform: translate() 定位，
     动画走 transform 会覆盖定位把浮层拉到 (0,0)；scale 属性与 transform 正交，二者叠加互不覆盖。 */
  .cd-tooltip__pop--motion {
    animation: cd-tooltip-in var(--cd-tooltip-motion-duration)
      var(--cd-tooltip-motion-easing, ease) both;
  }
  @keyframes cd-tooltip-in {
    from {
      opacity: 0;
      scale: 0.8;
    }
    to {
      opacity: 1;
      scale: 1;
    }
  }

  /* keepDOM=true 关闭后保留 DOM 但不可见、不可交互、不占位 */
  .cd-tooltip__pop--hidden {
    display: none;
  }

  /* reduced-motion：禁用进场动画 */
  @media (prefers-reduced-motion: reduce) {
    .cd-tooltip__pop--motion {
      animation: none;
    }
  }
</style>
