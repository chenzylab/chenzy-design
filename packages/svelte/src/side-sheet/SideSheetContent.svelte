<!--
  SideSheetContent — SideSheet 的纯渲染内容层。对应 Semi semi-ui/sideSheet/SideSheetContent.tsx。
  只负责 mask + dialog(header/body/footer) 的 DOM 结构与内联样式，不含状态机/动画编排/Portal/
  z-index/scroll-lock/Esc（这些留在 SideSheet.svelte，对应 Semi index.tsx）。

  DOM 结构（对齐 Semi getMaskElement + getDialogElement）：
    .cd-sidesheet-mask（mask=true 时；aria-hidden；maskClosable 时点击关闭）
    .cd-sidesheet-inner.cd-sidesheet-inner-wrap.cd-sidesheet-size-{size}[.动画类]（role=dialog tabindex=-1）
      └ .cd-sidesheet-content
          ├ .cd-sidesheet-header（role=heading aria-level=1；有 title 或 closable 时渲染）
          │    ├ .cd-sidesheet-title
          │    └ IconButton.cd-sidesheet-close
          ├ .cd-sidesheet-body
          └ .cd-sidesheet-footer（footer 时）

  mask=false 时 dialog 内联 width 强制 100%（宽度改落在 wrapper 上，避免百分比宽度重复累加，
  对齐 Semi getDialogElement 注释）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconClose } from '@chenzy-design/icons';
  import { IconButton } from '../iconbutton/index.js';

  type Size = 'small' | 'medium' | 'large';

  interface Props {
    mask: boolean;
    maskStyle?: string | undefined;
    maskClosable: boolean;
    maskAnimCls: string;
    title?: string | undefined;
    titleSnippet?: Snippet | undefined;
    titleId: string;
    hasTitle: boolean;
    closable: boolean;
    closeIcon?: Snippet | null | undefined;
    closeAriaLabel: string;
    headerStyle?: string | undefined;
    ariaLabel?: string | undefined;
    innerCls: string;
    innerStyle?: string | undefined;
    bodyStyle?: string | undefined;
    footer?: Snippet<[{ close: () => void }]> | null | undefined;
    children?: Snippet | undefined;
    onMaskMouseDown: (e: MouseEvent) => void;
    onMaskClick: (e: MouseEvent) => void;
    onAnimationEnd: () => void;
    onClose: (e: MouseEvent) => void;
    close: () => void;
  }

  let {
    mask,
    maskStyle,
    maskClosable,
    maskAnimCls,
    title,
    titleSnippet,
    titleId,
    hasTitle,
    closable,
    closeIcon,
    closeAriaLabel,
    headerStyle,
    ariaLabel,
    innerCls,
    innerStyle,
    bodyStyle,
    footer,
    children,
    onMaskMouseDown,
    onMaskClick,
    onAnimationEnd,
    onClose,
    close,
  }: Props = $props();
</script>

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
            aria-label={closeAriaLabel}
            onclick={onClose}
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

<style>
  /* 严格镜像 Semi semi-foundation/sideSheet/sideSheet.scss。变量 → --cd-*-side-sheet-* 对齐层。
     本文件是 SideSheet.svelte（wrapper）渲染的子组件，负责 mask/inner/content/header/body/
     footer/title 与进出场动画类的具体样式。 */

  /* —— title（对齐 Semi -title）—— */
  .cd-sidesheet-title {
    flex: 1 0 auto;
    margin: var(--cd-spacing-side-sheet-title-margin);
    color: var(--cd-color-side-sheet-main-text);
    font-weight: var(--cd-font-side-sheet-title-fontweight);
    font-size: var(--cd-font-side-sheet-title-fontsize);
    /* Semi sideSheet.scss:77 @include font-size-header-5 → 24px */
    line-height: var(--cd-line-height-header-5);
    text-align: left;
  }

  /* —— inner（对齐 Semi -inner）；position:absolute 由 -inner-wrap 规则提供（见 SideSheet.svelte，
     DOM 上该元素同时带 -inner 与 -inner-wrap 两个 class，与 Semi sideSheet.scss 结构一致）—— */
  .cd-sidesheet-inner {
    z-index: 1;
    overflow: auto;
    background-color: var(--cd-color-side-sheet-bg);
    backdrop-filter: var(--cd-filter-side-sheet-bg);
    border: 0;
  }
  .cd-sidesheet-inner:focus,
  .cd-sidesheet-content:focus {
    outline: none;
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
