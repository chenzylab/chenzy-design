<!--
  Popover — 气泡卡片（严格对齐 Semi Design semi-ui/popover）。
  架构：Popover 封装 Tooltip（对齐 Semi `Popover extends Tooltip`）——定位/触发/焦点/
       dismiss/箭头/12方位全部委托 Tooltip，自身仅：
       - variant='popover' 切浅色浮层视觉（bg-3 白底 + 阴影）
       - content={popCard} 渲染 .cd-popover > (.cd-popover-title?) + .cd-popover-content
         （承 Semi renderPopCard 的 .popover / .popover-content 结构）
       - role 派生：click/custom → dialog（承可交互富内容）；hover/focus → tooltip
       - spacing 默认按 showArrow 切换：4（无箭头）/ 10（有箭头，对齐 Semi SPACING/SPACING_WITH_ARROW）
       - content 支持函数形态：({ initialFocusRef }) => ...，打开时自动聚焦（对齐 Semi 2.8.0）
  注意事项同 Semi：Popover 需将事件监听器应用到 children，children 应能承载事件与定位。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { Tooltip, type Position } from '../tooltip/index.js';
  import { useLocale } from '../locale-provider/index.js';

  type TriggerKind = 'hover' | 'focus' | 'click' | 'custom';

  /** content 带参 Snippet 入参：将 initialFocusRef action 绑定到浮层内可聚焦元素，打开时自动聚焦。
   *  （对齐 Semi content 函数形态 ({ initialFocusRef }) => …，Svelte 中即带参数 Snippet） */
  interface RenderContentProps {
    initialFocusRef: (node: HTMLElement) => void;
  }

  /** 箭头颜色定制（对齐 Semi arrowStyle）。 */
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
    /** 箭头颜色定制（border/bg/opacity） */
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

  // role 派生（对齐 Semi）：click/custom 承载可交互富内容 → dialog；hover/focus → tooltip。
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
</script>

<Tooltip
  variant="popover"
  {role}
  {position}
  {visible}
  {defaultVisible}
  {trigger}
  {autoAdjustOverflow}
  {showArrow}
  {arrowPointAtCenter}
  {arrowStyle}
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
  /* 对齐 Semi .popover / .popover-content 结构：Popover 内层承载 padding，
     浮层视觉（bg/阴影/圆角）由 Tooltip variant=popover 提供。 */
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
    color: var(--cd-popover-title-color);
    font-weight: var(--cd-font-weight-bold);
  }
  /* 内容区：Semi .popover-content 无固定内边距（由用户 content 自带），此处不加 padding。 */
  .cd-popover-content {
    min-inline-size: 0;
  }
</style>
