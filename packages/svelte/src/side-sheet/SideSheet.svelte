<!--
  SideSheet — 滑动侧边栏。严格镜像 Semi Design（semi-foundation/sideSheet + semi-ui/sideSheet）。
  从视口四边（left/right/top/bottom）滑入的浮层容器，承载二级操作页面 / 详情 / 表单 / 筛选。

  DOM 结构对齐 Semi：
    .cd-sidesheet.cd-sidesheet-{placement}[-horizontal][-rtl][-popup][-fixed][-hidden]  ← wrapper（Portal 内）
      ├ .cd-sidesheet-mask[.动画类]                        ← 遮罩（aria-hidden；mask=true）
      └ .cd-sidesheet-inner.cd-sidesheet-inner-wrap.cd-sidesheet-size-{size}[.动画类]  ← role=dialog tabindex=-1
          └ .cd-sidesheet-content
              ├ .cd-sidesheet-header（role=heading aria-level=1）
              │    ├ .cd-sidesheet-title（有 title）
              │    └ IconButton.cd-sidesheet-close（closable）
              ├ .cd-sidesheet-body
              └ .cd-sidesheet-footer（footer 时）

  API 严格镜像 Semi 名：visible（受控不回写）/ onCancel / afterVisibleChange / placement /
    size(small|medium|large，默认 small) / width(默认 448) / height(默认 400) / title / footer /
    closable / closeIcon / closeOnEsc(默认 false) / mask / maskClosable / disableScroll /
    keepDOM / getPopupContainer / zIndex(默认 1000) / motion / style / bodyStyle / headerStyle /
    maskStyle / className。ReactNode→Snippet、className→class（本库 Svelte 惯例）。

  进出场动画对齐 Semi CSSAnimation：mask 淡入淡出 + inner 按 placement 滑入滑出；JS 状态机
    以 animationState(enter/leave) 驱动动画类，动画结束（animationend）后收起 displayNone 卸载。
    motion=false 或 prefers-reduced-motion 退化为即时显隐。

  浮层基建：Portal 到 getPopupContainer()/body 脱离父层叠上下文；mask=true 默认锁 body 滚动
    （disableScroll）；closeOnEsc 时 window keydown 监听 Esc 关闭；堆叠 z-index 复用 modal/z-stack
    模块级计数器（zIndex prop 优先），与 Modal 统一层栈、后开者在上。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { useId, useScrollLock } from '@chenzy-design/core';
  import { IconClose } from '@chenzy-design/icons';
  import { IconButton } from '../iconbutton/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import { getGlobalPopupContainer } from '../config-provider/index.js';
  import { acquireZIndex } from '../modal/z-stack.js';

  type Placement = 'left' | 'right' | 'top' | 'bottom';
  type Size = 'small' | 'medium' | 'large';

  interface Props {
    /** 面板是否可见（受控；受控时不回写）。对齐 Semi visible。 */
    visible?: boolean;
    /** 滑出位置，支持 top/bottom/left/right。对齐 Semi placement。 */
    placement?: Placement;
    /** 尺寸：small(448)/medium(684)/large(920)，仅 left/right 生效。对齐 Semi size。 */
    size?: Size;
    /** 宽度，位置为 left/right 时生效。对齐 Semi width（默认 448）。 */
    width?: number | string;
    /** 高度，位置为 top/bottom 时生效。对齐 Semi height（默认 400）。 */
    height?: number | string;
    /** 标题（string）。对齐 Semi title。 */
    title?: string;
    /** 自定义标题区（Snippet），覆盖 title。对齐 Semi title(ReactNode)。 */
    titleSnippet?: Snippet;
    /** 是否显示右上角关闭按钮。对齐 Semi closable。 */
    closable?: boolean;
    /** 自定义关闭图标（Snippet）。传 null 不显示图标。对齐 Semi closeIcon。 */
    closeIcon?: Snippet | null;
    /** 是否显示遮罩；false 时允许操作外部区域。对齐 Semi mask。 */
    mask?: boolean;
    /** 点击遮罩是否关闭。对齐 Semi maskClosable。 */
    maskClosable?: boolean;
    /** Esc 是否关闭。对齐 Semi closeOnEsc（默认 false）。 */
    closeOnEsc?: boolean;
    /** 关闭后是否保留内部组件不销毁。对齐 Semi keepDOM。 */
    keepDOM?: boolean;
    /** 渲染在 body 层时是否禁止 body 滚动（overflow:hidden）。对齐 Semi disableScroll。 */
    disableScroll?: boolean;
    /** 指定父级 DOM，弹层渲染至该 DOM。对齐 Semi getPopupContainer。 */
    getPopupContainer?: () => HTMLElement | null;
    /** 弹层 z-index。对齐 Semi zIndex（默认 1000）。 */
    zIndex?: number;
    /** 是否允许动画。对齐 Semi motion。 */
    motion?: boolean;
    /** 面板根内联样式。对齐 Semi style。 */
    style?: string;
    /** 内容区域内联样式。对齐 Semi bodyStyle。 */
    bodyStyle?: string;
    /** Header 区域内联样式。对齐 Semi headerStyle。 */
    headerStyle?: string;
    /** 遮罩内联样式。对齐 Semi maskStyle。 */
    maskStyle?: string;
    /** 底部区域（Snippet），提供 close() 关闭面板。对齐 Semi footer(ReactNode)。 */
    footer?: Snippet<[{ close: () => void }]> | null;
    /** 主内容区（可滚动）。对齐 Semi children。 */
    children?: Snippet;
    /** 无可见标题时的 aria-label。对齐 Semi aria-label。 */
    ariaLabel?: string;
    /** 根元素自定义类名。对齐 Semi className。 */
    class?: string;
    /** 面板展示/隐藏动画结束触发。对齐 Semi afterVisibleChange。 */
    afterVisibleChange?: (isVisible: boolean) => void;
    /** 取消面板时的回调。对齐 Semi onCancel。 */
    onCancel?: (e: MouseEvent | KeyboardEvent) => void;
  }

  let {
    visible,
    placement = 'right',
    size = 'small',
    width,
    height,
    title,
    titleSnippet,
    closable = true,
    closeIcon,
    mask = true,
    maskClosable = true,
    closeOnEsc = false,
    keepDOM = false,
    disableScroll = true,
    getPopupContainer,
    zIndex = 1000,
    motion = true,
    style,
    bodyStyle,
    headerStyle,
    maskStyle,
    footer,
    children,
    ariaLabel,
    class: className,
    afterVisibleChange,
    onCancel,
  }: Props = $props();

  const loc = useLocale();
  const titleId = useId('cd-sidesheet-title');
  const globalPopupContainer = getGlobalPopupContainer();

  // 受控 visible（红线 #1）：不无条件回写，仅 onCancel 通知。
  const isControlled = $derived(visible !== undefined);
  let innerOpen = $state(false);
  const isOpen = $derived(isControlled ? !!visible : innerOpen);

  const hasTitle = $derived(Boolean(titleSnippet) || Boolean(title));
  const isVertical = $derived(placement === 'left' || placement === 'right');
  const isHorizontal = $derived(placement === 'top' || placement === 'bottom');

  // 尺寸解析（对齐 Semi）：left/right 用 width（缺省走 size class）；top/bottom 用 height（缺省 448）。
  // Semi：sheetHeight = isHorizontal ? (height || 400) : '100%'；宽度经 size class 或 width 内联。
  const widthPx = $derived(
    width === undefined ? undefined : typeof width === 'number' ? `${width}px` : width,
  );
  const heightPx = $derived(
    height === undefined ? undefined : typeof height === 'number' ? `${height}px` : height,
  );
  const sheetHeight = $derived(isHorizontal ? (heightPx ?? '400px') : '100%');
  // 仅 left/right 时把 width 作为内联宽（Semi：isVertical 时才设 width）。
  const innerWidth = $derived(isVertical ? widthPx : undefined);

  // getPopupContainer 指向非 body 时 popup 模式（wrapper position:static，mask/inner absolute）。
  const container = $derived(getPopupContainer ?? undefined);
  const isPopup = $derived(typeof container === 'function' && container() != null);

  const rtl = $derived(loc().direction === 'rtl');

  // —— 进出场动画状态机（对齐 Semi CSSAnimation）——
  // animationState：enter（入场）/ leave（出场）。displayNone：动画结束后卸载/隐藏内容。
  // 初值：受控看 visible，非受控起始为关（!innerOpen 即 true）；untrack 表明仅取初次快照。
  let displayNone = $state(untrack(() => (visible === undefined ? true : !visible)));

  function motionEnabled(): boolean {
    if (!motion) return false;
    if (typeof window === 'undefined') return true;
    return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  // isOpen 边沿：打开→立即显示并入场；关闭→出场，动画结束（或无动画）后 displayNone。
  $effect(() => {
    const opening = isOpen;
    if (opening) {
      displayNone = false;
      if (!motionEnabled()) {
        // 无动画：下一微任务通知可见（DOM 已挂载）。
        queueMicrotask(() => afterVisibleChange?.(true));
      }
    } else if (!displayNone) {
      if (!motionEnabled()) {
        displayNone = true;
        queueMicrotask(() => afterVisibleChange?.(false));
      }
      // 有动画：等 inner/mask animationend 再置 displayNone（onAnimationEnd）。
    }
  });

  // 动画结束回调：出场结束收起 displayNone 卸载；入场结束通知可见。
  function onAnimationEnd() {
    if (!isOpen) {
      if (!displayNone) {
        displayNone = true;
        afterVisibleChange?.(false);
      }
    } else {
      afterVisibleChange?.(true);
    }
  }

  // 渲染条件（对齐 Semi shouldRender）：可见 或 keepDOM 或（有动画且出场未结束）。
  const shouldRender = $derived(
    isOpen || keepDOM || (motion && !displayNone),
  );

  // —— 关闭编排 ——
  function emitCancel(e: MouseEvent | KeyboardEvent) {
    if (!isControlled) innerOpen = false;
    onCancel?.(e);
  }

  // footer snippet 暴露的 close()：合成一个 click 语义事件传给 onCancel。
  function close() {
    if (!isControlled) innerOpen = false;
    onCancel?.(new MouseEvent('click'));
  }

  let mouseDownOnMask = false;
  function onMaskMouseDown(e: MouseEvent) {
    mouseDownOnMask = e.target === e.currentTarget;
  }
  function onMaskClick(e: MouseEvent) {
    if (maskClosable && e.target === e.currentTarget && mouseDownOnMask) {
      emitCancel(e);
    }
    mouseDownOnMask = false;
  }

  // —— Esc 关闭（对齐 Semi window keydown 监听）——
  $effect(() => {
    if (!isOpen || !closeOnEsc || typeof window === 'undefined') return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.stopPropagation();
        emitCancel(e);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // —— 背景滚动锁（对齐 Semi beforeShow disabledBodyScroll）——
  // 仅默认渲染在 body（无 getPopupContainer）且 disableScroll 时锁；对齐 Semi。
  $effect(() => {
    if (!isOpen || !disableScroll || isPopup || typeof document === 'undefined') return;
    const release = useScrollLock();
    return release;
  });

  // —— 堆叠 z-index：zIndex prop 优先，否则模块计数器分配 ——
  let stackZ = $state<number | undefined>(undefined);
  $effect(() => {
    if (!isOpen) return;
    const { zIndex: z, release } = acquireZIndex();
    stackZ = z;
    return () => {
      stackZ = undefined;
      release();
    };
  });
  const effectiveZ = $derived(stackZ ?? zIndex);

  // —— portal（红线 #3）：命令式挂到 getPopupContainer()/body，脱离父层叠上下文 ——
  function portal(node: HTMLElement) {
    if (typeof document === 'undefined') return { destroy() {} };
    const target = container?.() ?? globalPopupContainer?.() ?? document.body;
    target.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  }

  // wrapper class（对齐 Semi classList）。
  const wrapperCls = $derived(
    [
      'cd-sidesheet',
      `cd-sidesheet-${placement}`,
      isHorizontal && 'cd-sidesheet-horizontal',
      isPopup && 'cd-sidesheet-popup',
      rtl && 'cd-sidesheet-rtl',
      !mask && 'cd-sidesheet-fixed',
      !mask && `cd-sidesheet-size-${size}`,
      keepDOM && displayNone && 'cd-sidesheet-hidden',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // inner class（对齐 Semi -inner -inner-wrap -size-{size} + 动画类）。
  const animate = $derived(motion);
  const innerAnimCls = $derived(
    !animate
      ? ''
      : isOpen
        ? `cd-sidesheet-animation-content_show_${placement}`
        : `cd-sidesheet-animation-content_hide_${placement}`,
  );
  const maskAnimCls = $derived(
    !animate ? '' : isOpen ? 'cd-sidesheet-animation-mask_show' : 'cd-sidesheet-animation-mask_hide',
  );

  const innerCls = $derived(
    ['cd-sidesheet-inner', 'cd-sidesheet-inner-wrap', `cd-sidesheet-size-${size}`, innerAnimCls]
      .filter(Boolean)
      .join(' '),
  );

  // inner 内联尺寸样式（对齐 Semi getDialogElement）：width（mask=false 时 100%，宽度在 wrapper）、height。
  const innerStyle = $derived(
    [
      style,
      innerWidth !== undefined ? `width: ${mask ? innerWidth : '100%'}` : undefined,
      isHorizontal ? `height: ${sheetHeight}` : undefined,
    ]
      .filter(Boolean)
      .join('; ') || undefined,
  );

  // wrapper 内联样式：z-index；popup 时 position:static；mask=false 且 left/right 时宽度在 wrapper。
  const wrapperStyle = $derived(
    [
      `z-index: ${effectiveZ}`,
      isPopup ? 'position: static' : undefined,
      !mask && innerWidth !== undefined ? `width: ${innerWidth}` : undefined,
    ]
      .filter(Boolean)
      .join('; '),
  );
</script>

{#if shouldRender}
  <!-- use:portal 命令式挂载到 getPopupContainer()/body，脱离父层叠上下文。 -->
  <div class={wrapperCls} style={wrapperStyle} use:portal>
    {#if mask}
      <!-- 遮罩 aria-hidden；点击关闭为鼠标增强（键盘等价 Esc）。 -->
      <div
        aria-hidden="true"
        class="cd-sidesheet-mask {maskAnimCls}"
        style={maskStyle}
        onmousedown={maskClosable ? onMaskMouseDown : undefined}
        onclick={maskClosable ? onMaskClick : undefined}
        onanimationend={onAnimationEnd}
      ></div>
    {/if}
    <div
      class={innerCls}
      role="dialog"
      tabindex="-1"
      aria-modal={mask ? 'true' : undefined}
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-label={hasTitle ? undefined : ariaLabel}
      style={innerStyle}
      onanimationend={onAnimationEnd}
    >
      <div class="cd-sidesheet-content">
        {#if hasTitle || closable}
          <div class="cd-sidesheet-header" role="heading" aria-level="1" style={headerStyle}>
            {#if hasTitle}
              <div id={titleId} class="cd-sidesheet-title">
                {#if titleSnippet}
                  {@render titleSnippet()}
                {:else}
                  {title}
                {/if}
              </div>
            {/if}
            {#if closable}
              <IconButton
                class="cd-sidesheet-close"
                type="tertiary"
                theme="borderless"
                size="small"
                ariaLabel={loc().t('SideSheet.closeAriaLabel')}
                onclick={emitCancel}
              >
                {#snippet icon()}
                  {#if closeIcon}
                    {@render closeIcon()}
                  {:else}
                    <IconClose />
                  {/if}
                {/snippet}
              </IconButton>
            {/if}
          </div>
        {/if}

        <div class="cd-sidesheet-body" style={bodyStyle}>
          {@render children?.()}
        </div>

        {#if footer}
          <div class="cd-sidesheet-footer">
            {@render footer({ close })}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* 严格镜像 Semi semi-foundation/sideSheet/sideSheet.scss。变量 → --cd-*-side-sheet-* 对齐层。 */
  .cd-sidesheet {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    margin: var(--cd-spacing-side-sheet-margin);
    color: var(--cd-color-side-sheet-main-text);
    font-size: var(--cd-font-size-regular, 14px);
  }
  .cd-sidesheet-inner:focus,
  .cd-sidesheet-content:focus {
    outline: none;
  }
  .cd-sidesheet-inner-wrap {
    position: absolute;
  }

  /* —— 四方向贴边（对齐 Semi -left/-right/-top/-bottom）—— */
  .cd-sidesheet-left,
  .cd-sidesheet-right {
    top: 0;
    width: 0%;
    height: 100%;
  }
  .cd-sidesheet-left .cd-sidesheet-inner-wrap,
  .cd-sidesheet-right .cd-sidesheet-inner-wrap {
    height: 100%;
  }
  .cd-sidesheet-left.cd-sidesheet,
  .cd-sidesheet-right.cd-sidesheet {
    width: 100%;
  }
  .cd-sidesheet-right {
    right: 0;
  }
  .cd-sidesheet-right .cd-sidesheet-inner-wrap {
    right: 0;
  }
  .cd-sidesheet-top,
  .cd-sidesheet-bottom {
    left: 0;
    width: 100%;
    height: 0%;
  }
  .cd-sidesheet-top .cd-sidesheet-inner-wrap,
  .cd-sidesheet-bottom .cd-sidesheet-inner-wrap {
    width: 100%;
  }
  .cd-sidesheet-top.cd-sidesheet,
  .cd-sidesheet-bottom.cd-sidesheet {
    height: 100%;
  }
  .cd-sidesheet-top {
    top: 0;
  }
  .cd-sidesheet-bottom {
    bottom: 0;
  }
  .cd-sidesheet-bottom .cd-sidesheet-inner-wrap {
    bottom: 0;
  }

  /* —— title（对齐 Semi -title）—— */
  .cd-sidesheet-title {
    flex: 1 0 auto;
    margin: var(--cd-spacing-side-sheet-title-margin);
    color: var(--cd-color-side-sheet-main-text);
    font-weight: var(--cd-font-side-sheet-title-fontweight);
    font-size: var(--cd-font-side-sheet-title-fontsize);
    line-height: 1.5;
    text-align: left;
  }

  /* —— inner（对齐 Semi -inner）—— */
  .cd-sidesheet-inner {
    z-index: 1;
    overflow: auto;
    background-color: var(--cd-color-side-sheet-bg);
    backdrop-filter: var(--cd-filter-side-sheet-bg);
    border: 0;
  }

  /* —— header（对齐 Semi -header）—— */
  .cd-sidesheet-header {
    display: flex;
    align-items: flex-start;
    padding: var(--cd-spacing-side-sheet-header-padding);
    padding-bottom: var(--cd-spacing-side-sheet-header-padding-bottom);
    border-bottom: var(--cd-width-side-sheet-header-border-bottom) solid
      var(--cd-color-side-sheet-header-border-bottom);
  }

  /* —— body（对齐 Semi -body）—— */
  .cd-sidesheet-body {
    flex: 1;
    overflow: auto;
    padding: var(--cd-spacing-side-sheet-body-paddingy) var(--cd-spacing-side-sheet-body-paddingx);
  }

  /* —— size（对齐 Semi -size-small/medium/large）—— */
  .cd-sidesheet-size-small {
    width: var(--cd-width-side-sheet-size-small);
  }
  .cd-sidesheet-size-medium {
    width: var(--cd-width-side-sheet-size-medium);
  }
  .cd-sidesheet-size-large {
    width: var(--cd-width-side-sheet-size-large);
  }
  .cd-sidesheet-size-small.cd-sidesheet {
    width: var(--cd-width-side-sheet-size-small);
  }
  .cd-sidesheet-size-medium.cd-sidesheet {
    width: var(--cd-width-side-sheet-size-medium);
  }
  .cd-sidesheet-size-large.cd-sidesheet {
    width: var(--cd-width-side-sheet-size-large);
  }

  /* —— content（对齐 Semi -content）—— */
  .cd-sidesheet-content {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100%;
    overflow: hidden;
  }

  /* —— mask（对齐 Semi -mask）—— */
  .cd-sidesheet-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--cd-color-side-sheet-mask-bg);
    backdrop-filter: var(--cd-filter-side-sheet-mask-bg);
    opacity: 1;
  }

  /* —— footer（对齐 Semi -footer）—— */
  .cd-sidesheet-footer {
    padding: var(--cd-spacing-side-sheet-footer-padding);
  }

  /* —— fixed（mask=false；对齐 Semi -fixed，阴影 + 贴边定位）—— */
  .cd-sidesheet-fixed .cd-sidesheet-inner {
    box-shadow: var(--cd-shadow-elevated);
  }
  .cd-sidesheet-fixed.cd-sidesheet-left {
    left: 0;
  }
  .cd-sidesheet-fixed.cd-sidesheet-left .cd-sidesheet-inner {
    left: 0;
  }
  .cd-sidesheet-fixed.cd-sidesheet-right {
    left: auto;
  }
  .cd-sidesheet-fixed.cd-sidesheet-right .cd-sidesheet-inner {
    right: 0;
  }
  .cd-sidesheet-fixed.cd-sidesheet-top,
  .cd-sidesheet-fixed.cd-sidesheet-bottom {
    height: auto;
  }
  .cd-sidesheet-fixed.cd-sidesheet-bottom {
    top: auto;
  }
  .cd-sidesheet-fixed.cd-sidesheet-bottom .cd-sidesheet-inner {
    bottom: 0;
  }

  /* —— popup（getPopupContainer 非 body；对齐 Semi -popup）—— */
  .cd-sidesheet.cd-sidesheet-popup {
    position: absolute;
  }

  /* —— hidden（keepDOM 且关闭；对齐 Semi -hidden）—— */
  .cd-sidesheet-hidden {
    display: none;
  }

  /* —— RTL（对齐 Semi rtl.scss）—— */
  .cd-sidesheet-rtl .cd-sidesheet-inner {
    direction: rtl;
  }
  .cd-sidesheet-rtl .cd-sidesheet-title {
    text-align: right;
  }

  /* —— 关闭按钮（Semi 用 IconButton；此处仅补 x-semi-prop 无关的对齐视觉，实际样式由 Button 承担）—— */

  /* —— 进出场动画（对齐 Semi animation.scss keyframes + animation-content/mask 类）—— */
  @keyframes cd-sidesheet-slideShow_top {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
  }
  @keyframes cd-sidesheet-slideHide_top {
    from { transform: translateY(0); }
    to { transform: translateY(-100%); }
  }
  @keyframes cd-sidesheet-slideShow_bottom {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  @keyframes cd-sidesheet-slideHide_bottom {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
  }
  @keyframes cd-sidesheet-slideShow_left {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  @keyframes cd-sidesheet-slideHide_left {
    from { transform: translateX(0); }
    to { transform: translateX(-100%); }
  }
  @keyframes cd-sidesheet-slideShow_right {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  @keyframes cd-sidesheet-slideHide_right {
    from { transform: translateX(0); }
    to { transform: translateX(100%); }
  }
  @keyframes cd-sidesheet-opacityShow {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes cd-sidesheet-opacityHide {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  .cd-sidesheet-animation-content_show_top {
    animation: cd-sidesheet-slideShow_top var(--cd-animation-duration-side-sheet-inner-show)
      var(--cd-animation-function-side-sheet-inner-show) var(--cd-animation-delay-side-sheet-inner-show);
    animation-fill-mode: forwards;
  }
  .cd-sidesheet-animation-content_hide_top {
    animation: cd-sidesheet-slideHide_top var(--cd-animation-duration-side-sheet-inner-hide)
      var(--cd-animation-function-side-sheet-inner-hide) var(--cd-animation-delay-side-sheet-inner-hide);
    animation-fill-mode: forwards;
  }
  .cd-sidesheet-animation-content_show_bottom {
    animation: cd-sidesheet-slideShow_bottom var(--cd-animation-duration-side-sheet-inner-show)
      var(--cd-animation-function-side-sheet-inner-show) var(--cd-animation-delay-side-sheet-inner-show);
    animation-fill-mode: forwards;
  }
  .cd-sidesheet-animation-content_hide_bottom {
    animation: cd-sidesheet-slideHide_bottom var(--cd-animation-duration-side-sheet-inner-hide)
      var(--cd-animation-function-side-sheet-inner-hide) var(--cd-animation-delay-side-sheet-inner-hide);
    animation-fill-mode: forwards;
  }
  .cd-sidesheet-animation-content_show_left {
    animation: cd-sidesheet-slideShow_left var(--cd-animation-duration-side-sheet-inner-show)
      var(--cd-animation-function-side-sheet-inner-show) var(--cd-animation-delay-side-sheet-inner-show);
    animation-fill-mode: forwards;
  }
  .cd-sidesheet-animation-content_hide_left {
    animation: cd-sidesheet-slideHide_left var(--cd-animation-duration-side-sheet-inner-hide)
      var(--cd-animation-function-side-sheet-inner-hide) var(--cd-animation-delay-side-sheet-inner-hide);
    animation-fill-mode: forwards;
  }
  .cd-sidesheet-animation-content_show_right {
    animation: cd-sidesheet-slideShow_right var(--cd-animation-duration-side-sheet-inner-show)
      var(--cd-animation-function-side-sheet-inner-show) var(--cd-animation-delay-side-sheet-inner-show);
    animation-fill-mode: forwards;
  }
  .cd-sidesheet-animation-content_hide_right {
    animation: cd-sidesheet-slideHide_right var(--cd-animation-duration-side-sheet-inner-hide)
      var(--cd-animation-function-side-sheet-inner-hide) var(--cd-animation-delay-side-sheet-inner-hide);
    animation-fill-mode: forwards;
  }
  .cd-sidesheet-animation-mask_show {
    animation: cd-sidesheet-opacityShow var(--cd-animation-duration-side-sheet-mask-show)
      var(--cd-animation-function-side-sheet-mask-show) var(--cd-animation-delay-side-sheet-mask-show);
    animation-fill-mode: forwards;
  }
  .cd-sidesheet-animation-mask_hide {
    animation: cd-sidesheet-opacityHide var(--cd-animation-duration-side-sheet-mask-hide)
      var(--cd-animation-function-side-sheet-mask-hide) var(--cd-animation-delay-side-sheet-mask-hide);
    animation-fill-mode: forwards;
  }

  /* reduced-motion：禁用位移/淡入动画，立即显隐（motion=false 时 JS 已不加动画类） */
  @media (prefers-reduced-motion: reduce) {
    .cd-sidesheet-inner,
    .cd-sidesheet-mask {
      animation: none !important;
    }
  }
</style>
