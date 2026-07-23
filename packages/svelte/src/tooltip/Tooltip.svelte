<!--
  Tooltip — 文字提示（严格对齐 Semi Design semi-ui/tooltip）。
  浮层基座：Popover / Popconfirm 复用其定位/触发/焦点/dismiss/箭头（对齐 Semi 继承链）。
  DOM（对齐 Semi）：触发包裹 span > .{prefixCls}-wrapper[x-placement]（承 semi-tooltip-wrapper 语义）
       > .cd-tooltip-content（content 层，恒 tooltip 前缀，对齐 Semi ${prefix}-content）
       + 箭头 .{prefixCls}-icon-arrow（同级）。prefixCls 默认 cd-tooltip；Popover 传 cd-popover
       切换整套类名前缀（对齐 Semi prefixCls，替代旧 variant）。
  定位：portal 到 getPopupContainer()（缺省 body）+ position:fixed，core computePosition
       计算坐标 + autoAdjustOverflow flip 碰撞避让（脱离 overflow:hidden 裁剪）。
  x-placement 用 Semi position 命名（topLeft/leftTop…，对齐 Semi arrow.scss 选择器）。
  箭头：默认单 path SVG（TriangleArrow 24×7 / TriangleArrowVertical 7×24）+ fill=currentColor，
       color 走 --cd-color-tooltip-arrow-icon-default（grey-7，对齐 Semi）。Popover 经 showArrow
       Snippet 传入自定义双 path 箭头（描边+背景），Tooltip 自身无 arrowStyle（Semi Tooltip 无）。
  Semi Tooltip 固定 dark（grey-7 背景），无 theme/status/maxWidth（用 style 覆盖 max-width）。
  触发：hover/focus/click/custom/contextMenu（对齐 Semi TRIGGER_SET）。
  custom trigger：显隐完全由受控 visible + onVisibleChange 控制。
  condition=false：不响应 hover/click/focus/contextMenu（custom 不受影响）。
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
    placementToPosition,
    resolveSide,
    type Position,
  } from './placement.js';

  type TriggerKind = 'hover' | 'focus' | 'click' | 'custom' | 'contextMenu';
  type Spacing = number | { x: number; y: number };
  type MarginObject = {
    marginLeft?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
  };

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
    /** 是否显示箭头，或传自定义箭头 Snippet（Popover 传双 path），默认 true */
    showArrow?: boolean | Snippet;
    /** 箭头是否指向触发元素中心（需 showArrow），默认 true */
    arrowPointAtCenter?: boolean;
    disabled?: boolean;
    /** 是否允许触发显示；false 时不响应 hover/click/focus/contextMenu（custom 不受影响），默认 true */
    condition?: boolean;
    /** hover 触发下，点击浮层内部即关闭，默认 false */
    clickToHide?: boolean;
    /** 关闭时保留浮层 DOM 不销毁（--hidden 隐藏），默认 false */
    keepDOM?: boolean;
    /** hover 触发时不响应键盘 focus 显隐，默认 false */
    disableFocusListener?: boolean;
    /** 是否展示进出场动画，默认 true */
    motion?: boolean;
    /**
     * 是否从触发元素中心处变换（仅影响动效 transform-origin），默认 true。对齐 Semi transformFromCenter，
     * 一般无需改动。false 时进出场缩放从浮层自身原点起。
     */
    transformFromCenter?: boolean;
    /** 浮层 z-index（覆盖 CSS token --cd-z-tooltip），默认 undefined（走 token，=1060） */
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
     * 浮层 wrapper 的类名前缀（对齐 Semi prefixCls）：默认 'cd-tooltip'（深色 grey-7 浮层）。
     * Popover/Popconfirm 传 'cd-popover' 切换整套类名前缀 + 浅色浮层视觉 + 双 path 箭头。
     * 拼 {prefixCls}-wrapper / {prefixCls}-icon-arrow / {prefixCls}-with-arrow。
     */
    prefixCls?: string;
    /**
     * 当 children 为 disabled，或 children 为多个元素时，外层包裹 span 的类名（对齐 Semi wrapperClassName）。
     * 此库始终以 span 包裹触发器，故该类名恒作用于包裹 span。
     */
    wrapperClassName?: string;
    /**
     * 外层包裹 span（rootEl，即定位参照的触发宿主）的内联样式。
     * 用于让包裹 span 直接承载触发盒（如 UserGuide 的 fixed 定位空锚点），
     * 避免子元素 position:fixed 使包裹 span 塌缩为 0 尺寸导致 floating 定位错位。
     */
    triggerStyle?: string;
    /**
     * 浮层 wrapper 节点的 id（对齐 Semi wrapperId）；trigger 的 aria 属性指向此 id，
     * 不设则组件随机生成。
     */
    wrapperId?: string | undefined;
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
    disabled = false,
    condition = true,
    clickToHide = false,
    keepDOM = false,
    disableFocusListener = false,
    motion = true,
    transformFromCenter = true,
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
    prefixCls = 'cd-tooltip',
    wrapperClassName = '',
    triggerStyle = '',
    wrapperId,
    role = 'tooltip',
    guardFocus,
    returnFocusOnClose = true,
    dialogLabel,
    ariaLabelledby,
    children,
  }: Props = $props();

  const autoId = useId('cd-tooltip');
  // 浮层 wrapper id：优先用户 wrapperId，否则自动生成（对齐 Semi wrapperId 语义）。
  const tipId = $derived(wrapperId ?? autoId);

  // ConfigProvider 全局浮层容器默认；自身 getPopupContainer prop 优先。
  const globalPopupContainer = getGlobalPopupContainer();
  const resolvePopupContainer = $derived(getPopupContainer ?? globalPopupContainer);

  // Semi 12 方位 position → core Placement（内部定位用）
  const placement = $derived<Placement>(positionToPlacement(position));

  // showArrow 归一：boolean 决定显隐；Snippet 时视为显示且用自定义箭头（Popover 双 path）。
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

  // --- contextMenu 触发（对齐 Semi）：右键 preventDefault 弹浮层；再次右键切换。
  //     非 dialog 时也走此路径（Tooltip contextMenu 无焦点陷入需求，但仍作为可控浮层）。 ---
  function onTriggerContextMenu(e: MouseEvent) {
    if (!allowShow || isCustom || !triggers.includes('contextMenu')) return;
    e.preventDefault();
    setOpen(!isOpen);
  }

  // --- DOM 引用 ---
  let rootEl = $state<HTMLSpanElement | null>(null);
  let popEl = $state<HTMLDivElement | null>(null);

  // 解析后的实际方位（flip 后），驱动箭头朝向与 x-placement。初值仅取 placement 一次。
  let resolvedPlacement = $state<Placement>(untrack(() => placement));
  const resolvedSide = $derived<Side>(resolveSide(resolvedPlacement));
  // x-placement 属性用 Semi position 命名（topLeft/leftTop…，对齐 Semi arrow.scss 选择器）。
  const xPlacement = $derived(placementToPosition(resolvedPlacement));
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
  //     此处 Esc 关闭是无障碍底线，不受 closeOnEsc 门控）。外部点击关闭仅 click/custom/contextMenu
  //     生效（对齐 Semi；hover/focus 自然离开即关）。popup portal 列入 extraTargets。
  //     外部点击先触发 onClickOutSide（仅 custom/click）。 ---
  $effect(() => {
    if (!isOpen || !rootEl) return;
    const allowOutsideClick =
      triggers.includes('click') || triggers.includes('contextMenu') || isCustom;
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
  //  故同步 activate（与 Modal/SideSheet 一致）。 ---
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

  // 浮层根内联样式：自定义 zIndex 覆盖 token 层级 + transform-origin（transformFromCenter=false
  // 时缩放从浮层自身原点）+ 用户 style 追加。
  const popStyle = $derived(
    [
      zIndex !== undefined ? `z-index:${zIndex}` : '',
      transformFromCenter ? '' : 'transform-origin:top left',
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

  // 箭头沿交叉轴的定位：写 CSS 变量到 wrapper（对齐 Semi --semi-tooltip-arrow-offset-x/y），
  // 由 arrow.scss 对齐选择器消费（inset-inline-start/block-start: var(--…-arrow-offset-x)）。
  // top/bottom 系用 x 偏移；left/right 系用 y 偏移。arrowPointAtCenter=true 时对**所有**方位
  // 写变量：core 已按 pointAtCenter 算出 arrowOffset（浮层前缘→触发器中心的距离），CSS 用它
  // 让箭头指向触发器中心。含 start/end 方位（topLeft/topRight…）——这正是 arrowPointAtCenter
  // 的用武之地（对齐 Semi：默认 arrowPointAtCenter=true 时 topLeft 箭头仍指向 children 中心）。
  // 不写变量（arrowPointAtCenter=false）时 CSS 回退：居中方位 50%、start/end 方位边缘固定值。
  const arrowOffsetVar = $derived.by(() => {
    if (!arrowPointAtCenter) return '';
    return resolvedSide === 'top' || resolvedSide === 'bottom'
      ? `--cd-tooltip-arrow-offset-x:${arrowOffset}px`
      : `--cd-tooltip-arrow-offset-y:${arrowOffset}px`;
  });

  const wrapperStyle = $derived(
    [popStyle, arrowOffsetVar].filter(Boolean).join(';'),
  );

  // wrapperStyle（z-index / transform-origin / 用户 style / 箭头偏移 CSS 变量）经 $effect
  // 用 setProperty 逐条写入 popEl.style，而非 `style={wrapperStyle}` 整串绑定。
  // 原因：use:floating 命令式写 popEl.style 的 position/inset/transform/margin 定位浮层；
  // 若用整串 style= 绑定，wrapperStyle 因 onPlacement 回写 arrowOffset 而重算时，Svelte 会
  // 重置整个 style 属性，抹掉 floating 刚写入的定位，导致浮层塌回文档流（UserGuide 尤甚）。
  // 逐条 setProperty 只覆盖自己的键，floating 的定位键得以共存。
  let appliedStyleKeys: string[] = [];
  function parseStyleDecls(css: string): [string, string][] {
    const out: [string, string][] = [];
    for (const decl of css.split(';')) {
      const i = decl.indexOf(':');
      if (i === -1) continue;
      const prop = decl.slice(0, i).trim();
      const val = decl.slice(i + 1).trim();
      if (prop) out.push([prop, val]);
    }
    return out;
  }
  $effect(() => {
    const el = popEl;
    if (!el) return;
    const decls = parseStyleDecls(wrapperStyle);
    const nextKeys = decls.map(([p]) => p);
    // 移除本组件上一轮写过、这一轮不再存在的键（避免残留）。
    for (const k of appliedStyleKeys) {
      if (!nextKeys.includes(k)) el.style.removeProperty(k);
    }
    for (const [prop, val] of decls) el.style.setProperty(prop, val);
    appliedStyleKeys = nextKeys;
  });

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

<!-- 触发包裹 span 仅转发宿主事件给真正可交互的 children（wrapperClassName 作用于此包裹 span） -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<span
  class="cd-tooltip {wrapperClassName}"
  style={triggerStyle || undefined}
  bind:this={rootEl}
  onpointerenter={onPointerEnter}
  onpointerleave={onPointerLeave}
  onfocusin={onFocusIn}
  onfocusout={onFocusOut}
  onclick={onClick}
  oncontextmenu={triggers.includes('contextMenu') ? onTriggerContextMenu : undefined}
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
      {...{ 'x-placement': xPlacement }}
      aria-modal={isDialog ? 'false' : undefined}
      aria-labelledby={isDialog ? ariaLabelledby : undefined}
      aria-label={isDialog ? dialogLabel : undefined}
      aria-hidden={!isOpen || undefined}
      tabindex={isDialog ? -1 : undefined}
      bind:this={popEl}
      use:floating={{ trigger: rootEl, placement, autoAdjust: autoAdjustOverflow, offset: mainAxisSpacing, padding: marginPadding, arrowPointAtCenter, onPlacement, getContainer: resolvePopupContainer, open: isOpen, rePosKey }}
      class="{prefixCls}-wrapper {className}"
      class:cd-tooltip-with-arrow={showArrowBool}
      class:cd-tooltip-wrapper-show={isOpen}
      class:cd-tooltip-wrapper--hidden={!isOpen}
      class:cd-tooltip-wrapper--motion={motionEnabled}
      onclick={onPopClick}
    >
      <div class="cd-tooltip-content">
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
          <!-- 水平箭头（top/bottom）：单 path 24×7 SVG，fill=currentColor（color=grey-7），
               bottom 侧由 x-placement CSS 旋转 180°（对齐 Semi TriangleArrow） -->
          <svg
            class="{prefixCls}-icon-arrow"
            width="24"
            height="7"
            viewBox="0 0 24 7"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M24 0V1C20 1 18.5 2 16.5 4C14.5 6 14 7 12 7C10 7 9.5 6 7.5 4C5.5 2 4 1 0 1V0H24Z" />
          </svg>
        {:else}
          <!-- 垂直箭头（left/right）：单 path 7×24 SVG，right 侧由 x-placement CSS 旋转 180°
               （对齐 Semi TriangleArrowVertical） -->
          <svg
            class="{prefixCls}-icon-arrow"
            width="7"
            height="24"
            viewBox="0 0 7 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M0 0L1 0C1 4, 2 5.5, 4 7.5S7,10 7,12S6 14.5, 4 16.5S1,20 1,24L0 24L0 0z" />
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
    inline-size: auto;
    block-size: auto;
  }

  /* 浮层 portal 到 body，由 JS 写 position:fixed + transform 定位。
     对齐 Semi .semi-tooltip-wrapper：dark grey-7 背景、8/12 内边距、240 max-width。 */
  :global(.cd-tooltip-wrapper) {
    position: relative;
    z-index: var(--cd-z-tooltip);
    inline-size: max-content;
    max-inline-size: var(--cd-width-tooltip);
    padding: var(--cd-spacing-tooltip-content-paddingtop)
      var(--cd-spacing-tooltip-content-paddingright)
      var(--cd-spacing-tooltip-content-paddingbottom)
      var(--cd-spacing-tooltip-content-paddingleft);
    background-color: var(--cd-color-tooltip-bg-default);
    backdrop-filter: var(--cd-filter-tooltip-bg);
    color: var(--cd-color-tooltip-text-default);
    border-radius: var(--cd-radius-tooltip);
    font-size: var(--cd-font-tooltip-fontsize);
    line-height: var(--cd-line-height-regular);
    word-wrap: break-word;
    overflow-wrap: break-word;
    pointer-events: auto;
  }
  /* 箭头颜色：单 path fill=currentColor，color 走 tooltip 箭头色（grey-7，对齐 Semi）。 */
  :global(.cd-tooltip-icon-arrow) {
    color: var(--cd-color-tooltip-arrow-icon-default);
  }
  :global(.cd-tooltip-content) {
    min-inline-size: 0;
  }
  /* 带箭头浮层内容居中（对齐 Semi .semi-tooltip-with-arrow） */
  :global(.cd-tooltip-with-arrow) {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  /* --- 箭头绝对定位（对齐 Semi arrow.scss，按 x-placement 属性选择器）。
     水平箭头 24×7；垂直箭头 7×24；bottom/right 系旋转 180°。
     交叉轴 center 用 --cd-tooltip-arrow-offset-x/y（缺省 50%），start/end 用校正偏移。 --- */
  :global(.cd-tooltip-wrapper) :global(.cd-tooltip-icon-arrow) {
    position: absolute;
    inline-size: var(--cd-width-tooltip-arrow);
    block-size: var(--cd-height-tooltip-arrow);
  }
  /* top 系：箭头在下缘 */
  :global(.cd-tooltip-wrapper[x-placement='top']) :global(.cd-tooltip-icon-arrow) {
    inset-inline-start: var(--cd-tooltip-arrow-offset-x, 50%);
    transform: translateX(-50%);
    inset-block-end: calc(-1 * var(--cd-height-tooltip-arrow) + var(--cd-spacing-tooltip-arrow-offset-y));
  }
  /* topLeft/topRight：arrowPointAtCenter=true 时用 offset-x 变量（箭头中心对准触发器中心，
     translateX(-50%)）；false 时回退到边缘固定值（箭头左/右边缘距浮层边 adjusted-offset-x）。 */
  :global(.cd-tooltip-wrapper[x-placement='topLeft']) :global(.cd-tooltip-icon-arrow) {
    inset-block-end: calc(-1 * var(--cd-height-tooltip-arrow) + var(--cd-spacing-tooltip-arrow-offset-y));
    inset-inline-start: var(
      --cd-tooltip-arrow-offset-x,
      calc(var(--cd-spacing-tooltip-arrow-adjusted-offset-x) + var(--cd-width-tooltip-arrow) / 2)
    );
    transform: translateX(-50%);
  }
  :global(.cd-tooltip-wrapper[x-placement='topRight']) :global(.cd-tooltip-icon-arrow) {
    inset-block-end: calc(-1 * var(--cd-height-tooltip-arrow) + var(--cd-spacing-tooltip-arrow-offset-y));
    inset-inline-start: var(
      --cd-tooltip-arrow-offset-x,
      calc(100% - var(--cd-spacing-tooltip-arrow-adjusted-offset-x) - var(--cd-width-tooltip-arrow) / 2)
    );
    transform: translateX(-50%);
  }
  /* bottom 系：箭头在上缘，旋转 180° */
  :global(.cd-tooltip-wrapper[x-placement='bottom']) :global(.cd-tooltip-icon-arrow) {
    inset-block-start: calc(-1 * var(--cd-height-tooltip-arrow) + var(--cd-spacing-tooltip-arrow-offset-y));
    inset-inline-start: var(--cd-tooltip-arrow-offset-x, 50%);
    transform: translateX(-50%) rotate(180deg);
  }
  :global(.cd-tooltip-wrapper[x-placement='bottomLeft']) :global(.cd-tooltip-icon-arrow) {
    inset-block-start: calc(-1 * var(--cd-height-tooltip-arrow) + var(--cd-spacing-tooltip-arrow-offset-y));
    inset-inline-start: var(
      --cd-tooltip-arrow-offset-x,
      calc(var(--cd-spacing-tooltip-arrow-adjusted-offset-x) + var(--cd-width-tooltip-arrow) / 2)
    );
    transform: translateX(-50%) rotate(180deg);
  }
  :global(.cd-tooltip-wrapper[x-placement='bottomRight']) :global(.cd-tooltip-icon-arrow) {
    inset-block-start: calc(-1 * var(--cd-height-tooltip-arrow) + var(--cd-spacing-tooltip-arrow-offset-y));
    inset-inline-start: var(
      --cd-tooltip-arrow-offset-x,
      calc(100% - var(--cd-spacing-tooltip-arrow-adjusted-offset-x) - var(--cd-width-tooltip-arrow) / 2)
    );
    transform: translateX(-50%) rotate(180deg);
  }
  /* left 系：箭头在右缘（垂直箭头尺寸） */
  :global(.cd-tooltip-wrapper[x-placement='left']) :global(.cd-tooltip-icon-arrow),
  :global(.cd-tooltip-wrapper[x-placement='leftTop']) :global(.cd-tooltip-icon-arrow),
  :global(.cd-tooltip-wrapper[x-placement='leftBottom']) :global(.cd-tooltip-icon-arrow) {
    inline-size: var(--cd-width-tooltip-arrow-vertical);
    block-size: var(--cd-height-tooltip-arrow-vertical);
    inset-inline-end: calc(-1 * var(--cd-width-tooltip-arrow-vertical) + var(--cd-spacing-tooltip-arrow-offset-x));
  }
  :global(.cd-tooltip-wrapper[x-placement='left']) :global(.cd-tooltip-icon-arrow) {
    inset-block-start: var(--cd-tooltip-arrow-offset-y, 50%);
    transform: translateY(-50%);
  }
  /* leftTop/leftBottom：arrowPointAtCenter=true 时用 offset-y 变量（箭头中心对准触发器中心，
     translateY(-50%)）；false 时回退到边缘校正固定值。 */
  :global(.cd-tooltip-wrapper[x-placement='leftTop']) :global(.cd-tooltip-icon-arrow) {
    inset-block-start: var(
      --cd-tooltip-arrow-offset-y,
      calc(var(--cd-tooltip-vertical-rate) * var(--cd-height-tooltip-arrow-vertical) + var(--cd-spacing-tooltip-arrow-adjusted-offset-y) + var(--cd-height-tooltip-arrow-vertical) / 2)
    );
    transform: translateY(-50%);
  }
  :global(.cd-tooltip-wrapper[x-placement='leftBottom']) :global(.cd-tooltip-icon-arrow) {
    inset-block-start: var(
      --cd-tooltip-arrow-offset-y,
      calc(100% - var(--cd-tooltip-vertical-rate) * var(--cd-height-tooltip-arrow-vertical) - var(--cd-spacing-tooltip-arrow-adjusted-offset-y) - var(--cd-height-tooltip-arrow-vertical) / 2)
    );
    transform: translateY(-50%);
  }
  /* right 系：箭头在左缘，旋转 180° */
  :global(.cd-tooltip-wrapper[x-placement='right']) :global(.cd-tooltip-icon-arrow),
  :global(.cd-tooltip-wrapper[x-placement='rightTop']) :global(.cd-tooltip-icon-arrow),
  :global(.cd-tooltip-wrapper[x-placement='rightBottom']) :global(.cd-tooltip-icon-arrow) {
    inline-size: var(--cd-width-tooltip-arrow-vertical);
    block-size: var(--cd-height-tooltip-arrow-vertical);
    inset-inline-start: calc(-1 * var(--cd-width-tooltip-arrow-vertical) + var(--cd-spacing-tooltip-arrow-offset-x));
  }
  :global(.cd-tooltip-wrapper[x-placement='right']) :global(.cd-tooltip-icon-arrow) {
    inset-block-start: var(--cd-tooltip-arrow-offset-y, 50%);
    transform: translateY(-50%) rotate(180deg);
  }
  :global(.cd-tooltip-wrapper[x-placement='rightTop']) :global(.cd-tooltip-icon-arrow) {
    inset-block-start: var(
      --cd-tooltip-arrow-offset-y,
      calc(var(--cd-tooltip-vertical-rate) * var(--cd-height-tooltip-arrow-vertical) + var(--cd-spacing-tooltip-arrow-adjusted-offset-y) + var(--cd-height-tooltip-arrow-vertical) / 2)
    );
    transform: translateY(-50%) rotate(180deg);
  }
  :global(.cd-tooltip-wrapper[x-placement='rightBottom']) :global(.cd-tooltip-icon-arrow) {
    inset-block-start: var(
      --cd-tooltip-arrow-offset-y,
      calc(100% - var(--cd-tooltip-vertical-rate) * var(--cd-height-tooltip-arrow-vertical) - var(--cd-spacing-tooltip-arrow-adjusted-offset-y) - var(--cd-height-tooltip-arrow-vertical) / 2)
    );
    transform: translateY(-50%) rotate(180deg);
  }

  /* motion：进出场 zoomIn（对齐 Semi tooltip zoomIn 关键帧 + 100ms cubic-bezier）。
     用独立 scale 属性（非 transform）做缩放：use:floating 用 transform: translate() 定位，
     动画走 transform 会覆盖定位把浮层拉到 (0,0)；scale 属性与 transform 正交，二者叠加互不覆盖。 */
  :global(.cd-tooltip-wrapper--motion) {
    animation: cd-tooltip-zoom-in var(--cd-animation-duration-tooltip-in)
      var(--cd-animation-function-tooltip-in) both;
  }
  @keyframes cd-tooltip-zoom-in {
    from {
      opacity: var(--cd-tooltip-motion-zoom-opacity-from);
      scale: var(--cd-tooltip-motion-zoom-scale-from);
    }
    50% {
      opacity: var(--cd-tooltip-motion-zoom-opacity-to);
    }
    to {
      opacity: var(--cd-tooltip-motion-zoom-opacity-to);
      scale: 1;
    }
  }

  /* keepDOM=true 关闭后保留 DOM 但不可见、不可交互、不占位 */
  :global(.cd-tooltip-wrapper--hidden) {
    display: none;
  }

  /* reduced-motion：禁用进场动画 */
  @media (prefers-reduced-motion: reduce) {
    :global(.cd-tooltip-wrapper--motion) {
      animation: none;
    }
  }
</style>
