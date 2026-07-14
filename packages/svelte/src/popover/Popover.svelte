<!--
  Popover — 气泡卡片（严格对齐 Semi Design semi-ui/popover）。
  架构：Popover 封装 Tooltip（对齐 Semi `Popover extends Tooltip`）——定位/触发/焦点/
       dismiss/12方位全部委托 Tooltip，自身仅：
       - prefixCls='cd-popover' 切换整套浮层类名前缀（.cd-popover-wrapper / -icon-arrow）
         + 浅色浮层视觉（bg-3 白底 + 阴影，本组件 CSS 提供）
       - showArrow 时传入自定义双 path 箭头 Snippet（描边 + 背景，8px，对齐 Semi Arrow.tsx）
       - content={popCard} 渲染 .cd-popover > (.cd-popover-title?) + .cd-popover-content
         （承 Semi renderPopCard 的 .popover / .popover-content 结构）
       - role 派生：click/custom → dialog（承可交互富内容）；hover/focus → tooltip
       - spacing 默认按 showArrow 切换：4（无箭头）/ 10（有箭头，对齐 Semi SPACING/SPACING_WITH_ARROW）
       - content 支持函数形态：({ initialFocusRef }) => ...，打开时自动聚焦（对齐 Semi 2.8.0）
  箭头：Popover 用独立双 path SVG（一层描边色 + 一层背景色，对齐 Semi popover/Arrow.tsx），
       尺寸 8px（Semi popover 覆写 tooltip 箭头为 8px），颜色 arrowStyle 覆盖 token 默认；
       与 Tooltip 单 path currentColor 箭头解耦（各自 DOM 严格对齐 Semi）。
  注意事项同 Semi：Popover 需将事件监听器应用到 children，children 应能承载事件与定位。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { Tooltip, type Position } from '../tooltip/index.js';
  import { useLocale } from '../locale-provider/index.js';

  type TriggerKind = 'hover' | 'focus' | 'click' | 'custom' | 'contextMenu';

  /** content 带参 Snippet 入参：将 initialFocusRef action 绑定到浮层内可聚焦元素，打开时自动聚焦。
   *  （对齐 Semi content 函数形态 ({ initialFocusRef }) => …，Svelte 中即带参数 Snippet） */
  interface RenderContentProps {
    initialFocusRef: (node: HTMLElement) => void;
  }

  /** 箭头颜色定制（对齐 Semi arrowStyle，Popover 专有；Semi Tooltip 无此 prop）。 */
  interface ArrowStyle {
    borderColor?: string;
    backgroundColor?: string;
    borderOpacity?: string | number;
  }

  interface Props {
    /**
     * 浮层内容：文本 / Snippet。Snippet 可选接收 { initialFocusRef } 入参
     * （对齐 Semi content 函数形态 ({ initialFocusRef }) => …）：绑定到浮层内可聚焦元素，
     * 打开时自动聚焦。不声明参数的普通内容 Snippet 也可直接传（多余入参被忽略）。
     */
    content?: string | Snippet<[RenderContentProps]>;
    /** 标题，提供则渲染 .cd-popover-title 标题区与下边框 */
    title?: string | Snippet;
    /** 受控显隐（配合 trigger='custom'），对齐 Semi visible */
    visible?: boolean;
    /** 非受控初始显隐 */
    defaultVisible?: boolean;
    /** 触发方式；custom 完全受控（仅 visible + onVisibleChange） */
    trigger?: TriggerKind;
    /** 弹出方位（Semi 12 方位命名 + 2 Over），默认 bottom */
    position?: Position;
    /** 视口溢出时翻转到对侧 */
    autoAdjustOverflow?: boolean;
    /** 是否显示箭头，默认 false（对齐 Semi Popover） */
    showArrow?: boolean;
    /** 箭头是否指向触发元素中心（需 showArrow），默认 true */
    arrowPointAtCenter?: boolean;
    /** 箭头颜色定制（border/bg/opacity），对齐 Semi arrowStyle */
    arrowStyle?: ArrowStyle;
    /** 浮层与触发器距离(px)；缺省按 showArrow 取 10 / 4（对齐 Semi） */
    spacing?: number | { x: number; y: number };
    /** 计算溢出翻转时增加的冗余安全边距（对齐 Semi margin） */
    margin?: number | { marginLeft?: number; marginTop?: number; marginRight?: number; marginBottom?: number };
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    /** 是否允许触发显示；false 时不响应 hover/click/focus（custom 不受影响），对齐 Semi condition */
    condition?: boolean;
    /** 点击浮层及内部任一元素时自动关闭，对齐 Semi clickToHide */
    clickToHide?: boolean;
    /** 关闭时保留浮层 DOM 不销毁（--hidden 隐藏），对齐 Semi keepDOM */
    keepDOM?: boolean;
    /** hover 触发时不响应键盘 focus 显隐，对齐 Semi disableFocusListener */
    disableFocusListener?: boolean;
    disabled?: boolean;
    /** 是否展示进出场动画 */
    motion?: boolean;
    /** 浮层挂载容器，缺省回退 ConfigProvider 全局，再回退 body */
    getPopupContainer?: () => HTMLElement | null | undefined;
    /** 浮层 z-index，缺省走 token */
    zIndex?: number;
    /** Esc 关闭浮层 */
    closeOnEsc?: boolean;
    /** 焦点处于浮层内时 Tab 是否循环（对齐 Semi guardFocus），默认随 dialog 模式 */
    guardFocus?: boolean;
    /** 关闭后焦点归还触发器（仅 guardFocus 时生效），对齐 Semi returnFocusOnClose */
    returnFocusOnClose?: boolean;
    /** 阻止浮层上的点击事件冒泡，对齐 Semi stopPropagation */
    stopPropagation?: boolean;
    /** 更新该值手动触发浮层重新定位，对齐 Semi rePosKey */
    rePosKey?: string | number;
    /** 浮层自定义类名 */
    class?: string;
    /** 浮层自定义内联样式 */
    style?: string;
    /** 显隐切换回调，对齐 Semi onVisibleChange */
    onVisibleChange?: (visible: boolean) => void;
    /** 点击浮层与触发器外部区域的回调（仅 custom/click），对齐 Semi onClickOutSide */
    onClickOutSide?: (e: MouseEvent) => void;
    /** 浮层完全关闭后的回调 */
    afterClose?: () => void;
    /**
     * dialog 模式浮层的 aria-labelledby（外部封装者传入，指向自绘标题元素 id）。
     * Popconfirm 等封装 Popover 时，标题渲染在 content 内，用此项关联浮层与标题。
     * 优先于 Popover 自身 title 生成的 id。
     */
    ariaLabelledby?: string;
    /** 触发元素（必填） */
    children?: Snippet;
  }

  let {
    content,
    title,
    visible,
    defaultVisible = false,
    trigger = 'hover',
    position = 'bottom',
    autoAdjustOverflow = true,
    showArrow = false,
    arrowPointAtCenter = true,
    arrowStyle,
    spacing,
    margin = 0,
    mouseEnterDelay = 50,
    mouseLeaveDelay = 50,
    condition = true,
    clickToHide = false,
    keepDOM = false,
    disableFocusListener = false,
    disabled = false,
    motion = true,
    getPopupContainer,
    zIndex,
    closeOnEsc = true,
    guardFocus,
    returnFocusOnClose = true,
    stopPropagation = false,
    rePosKey,
    class: className = '',
    style: styleExtra = '',
    onVisibleChange,
    onClickOutSide,
    afterClose,
    ariaLabelledby: ariaLabelledbyProp,
    children,
  }: Props = $props();

  const loc = useLocale();
  const titleId = useId('cd-popover-title');

  // role 派生（对齐 Semi）：click/custom 承载可交互富内容 → dialog；hover/focus/contextMenu → tooltip。
  const isDialog = $derived(trigger === 'click' || trigger === 'custom');
  const role = $derived(isDialog ? 'dialog' : 'tooltip');

  // spacing 缺省：有箭头 10 / 无箭头 4（对齐 Semi SPACING_WITH_ARROW / SPACING）。
  const resolvedSpacing = $derived(spacing ?? (showArrow ? 10 : 4));

  // 标题归一：string / Snippet。
  const titleText = $derived(typeof title === 'string' ? title : undefined);
  const titleSnippet = $derived(typeof title === 'function' ? (title as Snippet) : undefined);
  const hasTitle = $derived(title !== undefined && title !== '');

  // content 归一：string 文本 / Snippet（可选带 { initialFocusRef } 参数）。
  const contentText = $derived(typeof content === 'string' ? content : undefined);
  const contentSnippet = $derived(
    typeof content === 'function' ? (content as Snippet<[RenderContentProps]>) : undefined,
  );

  // initialFocusRef action：绑定到浮层内元素，打开时聚焦（对齐 Semi content 函数）。
  // 浮层已由 Tooltip focus-trap 陷入，此处仅把初始焦点落到指定元素。
  function initialFocusRef(node: HTMLElement) {
    queueMicrotask(() => node.focus?.());
  }

  // dialog 模式浮层的 aria 关联：外部传入 ariaLabelledby 优先（Popconfirm 等封装者自绘标题）；
  // 否则自身有标题 → 指向自绘标题；两者皆无 → aria-label 兜底。
  const ariaLabelledby = $derived(
    !isDialog ? undefined : (ariaLabelledbyProp ?? (hasTitle ? titleId : undefined)),
  );
  const dialogLabel = $derived(
    isDialog && !ariaLabelledby ? loc().t('Popover.dialogLabel') : undefined,
  );

  // 箭头颜色：arrowStyle 覆盖 token 默认（描边 = popover-arrow-border，背景 = popover-arrow-bg）。
  const arrowBorderColor = $derived(arrowStyle?.borderColor ?? 'var(--cd-color-popover-arrow-border)');
  const arrowBgColor = $derived(arrowStyle?.backgroundColor ?? 'var(--cd-color-popover-arrow-bg)');
  const arrowBorderOpacity = $derived(arrowStyle?.borderOpacity ?? 1);
</script>

<Tooltip
  prefixCls="cd-popover"
  {role}
  {position}
  {visible}
  {defaultVisible}
  {trigger}
  {autoAdjustOverflow}
  showArrow={showArrow ? popoverArrow : false}
  {arrowPointAtCenter}
  spacing={resolvedSpacing}
  {margin}
  {mouseEnterDelay}
  {mouseLeaveDelay}
  {condition}
  {clickToHide}
  {keepDOM}
  {disableFocusListener}
  {disabled}
  {motion}
  {getPopupContainer}
  {zIndex}
  {closeOnEsc}
  {guardFocus}
  {returnFocusOnClose}
  {stopPropagation}
  {rePosKey}
  class={className}
  style={styleExtra}
  {onVisibleChange}
  {onClickOutSide}
  {afterClose}
  {dialogLabel}
  {ariaLabelledby}
  content={popCard}
>
  {@render children?.()}
</Tooltip>

<!-- Popover 双 path 箭头（对齐 Semi popover/Arrow.tsx）：水平 top/bottom、垂直 left/right。
     方位由 Tooltip 传的 resolvedSide 决定，但 showArrow Snippet 无入参，故渲染两套 SVG，
     由 .cd-popover-wrapper[x-placement] 选择器控制显隐 + 定位（见 <style>）。 -->
{#snippet popoverArrow()}
  <svg
    class="cd-popover-icon-arrow cd-popover-icon-arrow--h"
    width="24"
    height="8"
    viewBox="0 0 24 7"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M0 0.5L0 1.5C4 1.5, 5.5 3, 7.5 5S10,8 12,8S14.5 7, 16.5 5S20,1.5 24,1.5L24 0.5L0 0.5z" style="fill:{arrowBorderColor};opacity:{arrowBorderOpacity}" />
    <path d="M0 0L0 1C4 1, 5.5 2, 7.5 4S10,7 12,7S14.5  6, 16.5 4S20,1 24,1L24 0L0 0z" style="fill:{arrowBgColor}" />
  </svg>
  <svg
    class="cd-popover-icon-arrow cd-popover-icon-arrow--v"
    width="8"
    height="24"
    viewBox="0 0 7 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M0.5 0L1.5 0C1.5 4, 3 5.5, 5 7.5S8,10 8,12S7 14.5, 5 16.5S1.5,20 1.5,24L0.5 24L0.5 0z" style="fill:{arrowBorderColor};opacity:{arrowBorderOpacity}" />
    <path d="M0 0L1 0C1 4, 2 5.5, 4 7.5S7,10 7,12S6 14.5, 4 16.5S1,20 1,24L0 24L0 0z" style="fill:{arrowBgColor}" />
  </svg>
{/snippet}

<!-- renderPopCard：对齐 Semi <div class="popover"><div class="popover-content">…</div></div>。
     标题区（可选）+ 内容区。内容函数形态注入 initialFocusRef。 -->
{#snippet popCard()}
  <div class="cd-popover" class:cd-popover--with-arrow={showArrow}>
    {#if hasTitle}
      <div class="cd-popover-title" id={titleId}>
        {#if titleSnippet}
          {@render titleSnippet()}
        {:else}
          {titleText}
        {/if}
      </div>
    {/if}
    <div class="cd-popover-content">
      {#if contentSnippet}
        {@render contentSnippet({ initialFocusRef })}
      {:else}
        {contentText}
      {/if}
    </div>
  </div>
{/snippet}

<style>
  /* --- 浮层视觉：浅色 bg-3 白底 + 阴影 + medium 圆角（对齐 Semi .semi-popover-wrapper）。
     内边距归零，由内层 .cd-popover / .cd-popover-content 控制（对齐 Semi）。 --- */
  :global(.cd-popover-wrapper) {
    position: relative;
    z-index: var(--cd-z-popover);
    padding: 0;
    max-inline-size: none;
    background-color: var(--cd-color-popover-bg-default);
    color: var(--cd-color-text-0);
    border-radius: var(--cd-radius-popover);
    box-shadow: var(--cd-shadow-elevated);
    backdrop-filter: var(--cd-filter-popover-bg);
    font-size: var(--cd-font-tooltip-fontsize);
    line-height: var(--cd-line-height-regular);
    word-wrap: break-word;
    overflow-wrap: break-word;
    pointer-events: auto;
    box-sizing: border-box;
  }

  /* 对齐 Semi .popover / .popover-content 结构：Popover 内层承载 padding。 */
  .cd-popover {
    box-sizing: border-box;
  }
  /* 带箭头时整卡内边距（对齐 Semi $spacing-popover_withArrow-padding: 12px）。 */
  .cd-popover--with-arrow {
    padding: var(--cd-spacing-popover-witharrow-padding);
  }
  /* 标题区：下边框分隔，内边距对齐 Semi $spacing-popover_title-padding: 8px。 */
  .cd-popover-title {
    padding: var(--cd-spacing-popover-title-padding);
    border-block-end: var(--cd-width-popover-title-border) solid
      var(--cd-color-popover-border-default);
    color: var(--cd-color-text-0);
    font-weight: var(--cd-font-weight-bold);
  }
  /* 内容区：Semi .popover-content 无固定内边距（由用户 content 自带），此处不加 padding。 */
  .cd-popover-content {
    min-inline-size: 0;
  }

  /* --- 箭头（双 path，8px；描边由 path:nth-child(1)、背景 path:nth-child(2) 内联 style 上色）。
     定位对齐 Semi tooltip/arrow.scss（popover import 复用同一套选择器，尺寸换 8px/6px）。
     showArrow Snippet 渲染两套 SVG（水平 --h / 垂直 --v），由 x-placement 选择器决定显隐。 --- */
  :global(.cd-popover-icon-arrow) {
    position: absolute;
    display: none;
  }
  /* top/bottom 系显示水平箭头；left/right 系显示垂直箭头 */
  :global(.cd-popover-wrapper[x-placement^='top']) :global(.cd-popover-icon-arrow--h),
  :global(.cd-popover-wrapper[x-placement^='bottom']) :global(.cd-popover-icon-arrow--h) {
    display: block;
    inline-size: var(--cd-width-popover-arrow);
    block-size: var(--cd-height-popover-arrow);
  }
  :global(.cd-popover-wrapper[x-placement^='left']) :global(.cd-popover-icon-arrow--v),
  :global(.cd-popover-wrapper[x-placement^='right']) :global(.cd-popover-icon-arrow--v) {
    display: block;
    inline-size: var(--cd-width-popover-arrow-vertical);
    block-size: var(--cd-height-popover-arrow-vertical);
  }

  /* top 系：箭头在下缘 */
  :global(.cd-popover-wrapper[x-placement='top']) :global(.cd-popover-icon-arrow--h) {
    inset-inline-start: var(--cd-tooltip-arrow-offset-x, 50%);
    transform: translateX(-50%);
    inset-block-end: calc(-1 * var(--cd-height-popover-arrow) + var(--cd-spacing-tooltip-arrow-offset-y));
  }
  :global(.cd-popover-wrapper[x-placement='topLeft']) :global(.cd-popover-icon-arrow--h) {
    inset-block-end: calc(-1 * var(--cd-height-popover-arrow) + var(--cd-spacing-tooltip-arrow-offset-y));
    inset-inline-start: var(--cd-spacing-popover-arrow-adjusted-offset-x);
  }
  :global(.cd-popover-wrapper[x-placement='topRight']) :global(.cd-popover-icon-arrow--h) {
    inset-block-end: calc(-1 * var(--cd-height-popover-arrow) + var(--cd-spacing-tooltip-arrow-offset-y));
    inset-inline-end: var(--cd-spacing-popover-arrow-adjusted-offset-x);
  }
  /* bottom 系：箭头在上缘，旋转 180° */
  :global(.cd-popover-wrapper[x-placement='bottom']) :global(.cd-popover-icon-arrow--h) {
    inset-block-start: calc(-1 * var(--cd-height-popover-arrow) + var(--cd-spacing-tooltip-arrow-offset-y));
    inset-inline-start: var(--cd-tooltip-arrow-offset-x, 50%);
    transform: translateX(-50%) rotate(180deg);
  }
  :global(.cd-popover-wrapper[x-placement='bottomLeft']) :global(.cd-popover-icon-arrow--h) {
    inset-block-start: calc(-1 * var(--cd-height-popover-arrow) + var(--cd-spacing-tooltip-arrow-offset-y));
    inset-inline-start: var(--cd-spacing-popover-arrow-adjusted-offset-x);
    transform: rotate(180deg);
  }
  :global(.cd-popover-wrapper[x-placement='bottomRight']) :global(.cd-popover-icon-arrow--h) {
    inset-block-start: calc(-1 * var(--cd-height-popover-arrow) + var(--cd-spacing-tooltip-arrow-offset-y));
    inset-inline-end: var(--cd-spacing-popover-arrow-adjusted-offset-x);
    transform: rotate(180deg);
  }
  /* left 系：箭头在右缘 */
  :global(.cd-popover-wrapper[x-placement='left']) :global(.cd-popover-icon-arrow--v),
  :global(.cd-popover-wrapper[x-placement='leftTop']) :global(.cd-popover-icon-arrow--v),
  :global(.cd-popover-wrapper[x-placement='leftBottom']) :global(.cd-popover-icon-arrow--v) {
    inset-inline-end: calc(-1 * var(--cd-width-popover-arrow-vertical) + var(--cd-spacing-tooltip-arrow-offset-x));
  }
  :global(.cd-popover-wrapper[x-placement='left']) :global(.cd-popover-icon-arrow--v) {
    inset-block-start: var(--cd-tooltip-arrow-offset-y, 50%);
    transform: translateY(-50%);
  }
  :global(.cd-popover-wrapper[x-placement='leftTop']) :global(.cd-popover-icon-arrow--v) {
    inset-block-start: var(--cd-spacing-popover-arrow-adjusted-offset-y);
  }
  :global(.cd-popover-wrapper[x-placement='leftBottom']) :global(.cd-popover-icon-arrow--v) {
    inset-block-end: var(--cd-spacing-popover-arrow-adjusted-offset-y);
  }
  /* right 系：箭头在左缘，旋转 180° */
  :global(.cd-popover-wrapper[x-placement='right']) :global(.cd-popover-icon-arrow--v),
  :global(.cd-popover-wrapper[x-placement='rightTop']) :global(.cd-popover-icon-arrow--v),
  :global(.cd-popover-wrapper[x-placement='rightBottom']) :global(.cd-popover-icon-arrow--v) {
    inset-inline-start: calc(-1 * var(--cd-width-popover-arrow-vertical) + var(--cd-spacing-tooltip-arrow-offset-x));
  }
  :global(.cd-popover-wrapper[x-placement='right']) :global(.cd-popover-icon-arrow--v) {
    inset-block-start: var(--cd-tooltip-arrow-offset-y, 50%);
    transform: translateY(-50%) rotate(180deg);
  }
  :global(.cd-popover-wrapper[x-placement='rightTop']) :global(.cd-popover-icon-arrow--v) {
    inset-block-start: var(--cd-spacing-popover-arrow-adjusted-offset-y);
    transform: rotate(180deg);
  }
  :global(.cd-popover-wrapper[x-placement='rightBottom']) :global(.cd-popover-icon-arrow--v) {
    inset-block-end: var(--cd-spacing-popover-arrow-adjusted-offset-y);
    transform: rotate(180deg);
  }
</style>
