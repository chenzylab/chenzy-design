<!--
  ModalContent — 严格镜像 Semi Design semi-ui/modal/ModalContent.tsx 的 DOM 渲染层：
  mask + wrap（滚动/遮罩点击判定） + dialog 尺寸壳 + content（header/body/footer）。
  Modal.svelte 对应 Semi Modal.tsx：管 visible/shouldRender/z-index/portal，构建 footer
  按钮行后作为 snippet 传入本组件（对齐 Semi renderFooter 传 footer prop 的模式）。
  contentEl 通过 $bindable 回传给 Modal.svelte，供其 focus-trap/dismiss/scroll-lock/inert
  命令式副作用消费（Svelte 无 React componentDidMount，效果时机由父层 $effect 统一管理）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconClose } from '@chenzy-design/icons';
  import { IconButton } from '../iconbutton/index.js';
  import { Title } from '../typography/index.js';
  import { useLocale } from '../locale-provider/index.js';

  type ModalSize = 'small' | 'medium' | 'large' | 'full-width';

  interface Props {
    mask: boolean;
    maskStyle?: string | undefined;
    maskClosable: boolean;
    isPopup: boolean;
    centered: boolean;
    sizeClass: string;
    motion: boolean;
    modalStyle?: string | undefined;
    contentCls: string;
    contentEl?: HTMLElement | null;
    titleId: string;
    bodyId: string;
    hasHeaderProp: boolean;
    header?: Snippet | null | undefined;
    title?: string | Snippet | undefined;
    hasHeader: boolean;
    hasIcon: boolean;
    icon?: Snippet | undefined;
    closable: boolean;
    closeIcon?: Snippet | undefined;
    ariaLabel?: string | undefined;
    bodyStyle?: string | undefined;
    children?: Snippet | undefined;
    footer?: Snippet<[]> | null;
    footerFill: boolean;
    onClose: () => void;
    /** 对齐 Semi modalRender：只包裹 content div，不含 .cd-modal 尺寸壳。 */
    modalRender?: Snippet<[Snippet]> | undefined;
  }

  let {
    mask,
    maskStyle,
    maskClosable,
    isPopup,
    centered,
    sizeClass,
    motion,
    modalStyle,
    contentCls,
    contentEl = $bindable(null),
    titleId,
    bodyId,
    hasHeaderProp,
    header,
    title,
    hasHeader,
    hasIcon,
    icon,
    closable,
    closeIcon,
    ariaLabel,
    bodyStyle,
    children,
    footer,
    footerFill,
    onClose,
    modalRender,
  }: Props = $props();

  const loc = useLocale();

  // 遮罩点击关闭：仅当按下与抬起都在 wrap 本身（非面板内），对齐 Semi 的 mousedown/up 判定，
  // 避免在面板内选中文本拖到遮罩误触关闭。
  let mouseDownOnWrap = false;
  function onWrapMouseDown(e: MouseEvent) {
    mouseDownOnWrap = e.target === e.currentTarget;
  }
  function onWrapClick(e: MouseEvent) {
    if (maskClosable && e.target === e.currentTarget && mouseDownOnWrap) {
      onClose();
    }
    mouseDownOnWrap = false;
  }

  const modalCls = $derived(
    ['cd-modal', sizeClass, centered ? 'cd-modal-centered' : '', motion ? 'cd-modal-motion' : '']
      .filter(Boolean)
      .join(' '),
  );
</script>

{#if mask}
  <div class="cd-modal-mask" class:cd-modal-mask-absolute={isPopup} style={maskStyle}></div>
{/if}
<!-- wrap：role=none，负责滚动与遮罩点击（对齐 Semi -wrap / -wrap-center）。 -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="cd-modal-wrap"
  class:cd-modal-wrap-center={centered}
  class:cd-modal-wrap-absolute={isPopup}
  role="none"
  onmousedown={maskClosable ? onWrapMouseDown : undefined}
  onclick={maskClosable ? onWrapClick : undefined}
>
  <div class={modalCls} style={modalStyle || undefined}>
    {#if modalRender}
      {@render modalRender(dialogContent)}
    {:else}
      {@render dialogContent()}
    {/if}
  </div>
</div>

{#snippet dialogContent()}
  <div
    class={contentCls}
    bind:this={contentEl}
    role="dialog"
    aria-modal="true"
    aria-labelledby={hasHeader ? titleId : undefined}
    aria-label={hasHeader ? undefined : ariaLabel}
    aria-describedby={bodyId}
  >
    {#if hasHeaderProp}
      {#if header}
        {@render header()}
      {/if}
    {:else if title != null}
      <!-- 默认头部：icon + Typography.Title + 关闭按钮（对齐 Semi renderHeader）。 -->
      <div class="cd-modal-header">
        {#if hasIcon}
          <span class="cd-modal-icon-wrapper">{@render icon?.()}</span>
        {/if}
        <Title heading={5} class="cd-modal-title" id={titleId}>
          {#if typeof title === 'function'}{@render title()}{:else}{title}{/if}
        </Title>
        {#if closable}
          {@render closeBtn()}
        {/if}
      </div>
    {/if}

    <!-- body：有 header 时普通 body；无 header 时 body-wrapper（icon + body + 关闭），对齐 Semi renderBody。 -->
    {#if hasHeader}
      <div
        class={['cd-modal-body', hasIcon ? 'cd-modal-withIcon' : ''].filter(Boolean).join(' ')}
        id={bodyId}
        style={bodyStyle}
      >
        {@render children?.()}
      </div>
    {:else}
      <div class="cd-modal-body-wrapper">
        {#if hasIcon}
          <span class="cd-modal-icon-wrapper">{@render icon?.()}</span>
        {/if}
        <div class="cd-modal-body" id={bodyId} style={bodyStyle}>
          {@render children?.()}
        </div>
        {#if closable}
          {@render closeBtn()}
        {/if}
      </div>
    {/if}

    {#if footer !== null}
      <div class="cd-modal-footer" class:cd-modal-footerfill={footerFill}>
        {@render footer?.()}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet closeBtn()}
  <IconButton
    class="cd-modal-close"
    type="tertiary"
    theme="borderless"
    size="small"
    aria-label={loc().t('Modal.close')}
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
{/snippet}

<style>
  /* —— 遮罩（对齐 Semi .semi-modal-mask）—— */
  .cd-modal-mask {
    position: fixed;
    top: var(--cd-spacing-modal-mask-top);
    right: var(--cd-spacing-modal-mask-right);
    bottom: var(--cd-spacing-modal-mask-bottom);
    left: var(--cd-spacing-modal-mask-left);
    height: 100%;
    z-index: var(--cd-modal-mask-z, var(--cd-z-modal-mask));
    background-color: var(--cd-color-modal-mask-bg);
  }
  .cd-modal-mask-absolute {
    position: absolute;
  }

  /* —— wrap（对齐 Semi .semi-modal-wrap）：滚动 + 遮罩点击 —— */
  .cd-modal-wrap {
    position: fixed;
    top: var(--cd-spacing-modal-wrap-top);
    right: var(--cd-spacing-modal-wrap-right);
    bottom: var(--cd-spacing-modal-wrap-bottom);
    left: var(--cd-spacing-modal-wrap-left);
    z-index: var(--cd-modal-content-z, var(--cd-z-modal));
    overflow: auto;
    outline: 0;
    -webkit-overflow-scrolling: touch;
  }
  .cd-modal-wrap-absolute {
    position: absolute;
  }
  /* Semi：wrap-center 用 flex-start + margin:auto 实现「内容适配时居中、溢出时顶对齐可滚」 */
  .cd-modal-wrap-center {
    display: flex;
    align-items: flex-start;
  }

  /* —— .cd-modal（尺寸壳，对齐 Semi .semi-modal）—— */
  .cd-modal {
    position: relative;
    margin: var(--cd-spacing-modal-marginy) var(--cd-spacing-modal-marginx);
    color: var(--cd-color-modal-main-text);
  }
  .cd-modal-centered {
    margin: auto;
  }
  .cd-modal-small {
    width: var(--cd-width-modal-small);
  }
  .cd-modal-medium {
    width: var(--cd-width-modal-medium);
  }
  .cd-modal-large {
    width: var(--cd-width-modal-large);
  }
  .cd-modal-full-width {
    width: var(--cd-width-modal-full-width);
  }

  /* —— content（对齐 Semi .semi-modal-content）—— */
  .cd-modal-content {
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: var(--cd-width-modal-content);
    height: var(--cd-height-modal-content);
    padding: var(--cd-spacing-modal-content-paddingy) var(--cd-spacing-modal-content-paddingx);
    background-color: var(--cd-color-modal-bg);
    border: var(--cd-width-modal-content-border) solid var(--cd-color-modal-content-border);
    border-radius: var(--cd-radius-modal-content);
    background-clip: padding-box;
    box-shadow: var(--cd-shadow-modal-content);
    overflow: hidden;
  }
  .cd-modal-content-height-set {
    height: 100%;
  }
  .cd-modal-content-fullscreen {
    top: var(--cd-spacing-modal-content-fullscreen-top);
    height: 100%;
    border: none;
    border-radius: var(--cd-radius-modal-content-fullscreen);
  }

  /* —— header（对齐 Semi .semi-modal-header）——
     font-size 作用于 header 容器（影响非 Title 文本），标题字号由 Title heading={5} 自身决定
     （对齐 Semi：.semi-modal-title 无 font-size，不覆盖 Typography.Title 的 16px）。 */
  .cd-modal-header {
    display: flex;
    align-items: flex-start;
    margin: var(--cd-spacing-modal-header-marginy) var(--cd-spacing-modal-header-marginx);
    font-size: var(--cd-font-modal-header-fontsize);
    font-weight: var(--cd-font-modal-header-fontweight);
    background-color: var(--cd-color-modal-header-bg);
    color: var(--cd-color-modal-main-text);
    border-bottom: var(--cd-width-modal-header-border) solid var(--cd-color-modal-header-border);
  }
  /* 对齐 Semi .semi-modal-title：仅布局，不设 font-size（保留 Title heading=5 的 16px）。 */
  .cd-modal-header :global(.cd-modal-title) {
    flex: 1 1 auto;
    width: 100%;
    margin: 0;
  }

  /* 关闭按钮定位：header/body-wrapper 里靠右（Semi 用 flex，close 在 title 后） */
  .cd-modal-header :global(.cd-modal-close),
  .cd-modal-body-wrapper :global(.cd-modal-close) {
    flex: none;
    margin-inline-start: auto;
  }

  /* —— icon-wrapper（命令式类型图标，对齐 Semi .semi-modal-icon-wrapper）—— */
  .cd-modal-icon-wrapper {
    display: inline-flex;
    flex: none;
    margin-right: var(--cd-spacing-modal-icon-wrapper-marginright);
    width: var(--cd-width-icon-extra-large);
    font-size: var(--cd-width-icon-extra-large);
  }

  /* —— body（对齐 Semi .semi-modal-body / -body-wrapper）—— */
  .cd-modal-body-wrapper {
    display: flex;
    align-items: flex-start;
    margin: var(--cd-spacing-modal-body-wrapper-marginy) var(--cd-spacing-modal-body-wrapper-marginx);
  }
  .cd-modal-body {
    flex: 1 1 auto;
  }
  .cd-modal-withIcon {
    margin-left: var(--cd-spacing-modal-content-withicon-marginleft);
  }

  /* —— footer（对齐 Semi .semi-modal-footer）—— */
  .cd-modal-footer {
    margin: var(--cd-spacing-modal-footer-marginy) var(--cd-spacing-modal-footer-marginx);
    text-align: right;
    background-color: var(--cd-color-modal-footer-bg);
    border-top: var(--cd-width-modal-footer-border) solid var(--cd-color-modal-footer-border);
    border-radius: var(--cd-radius-modal-footer);
  }
  /* 对齐 Semi .semi-modal-footer .semi-button（本库 Button class 为 cd-button 非 cd-btn）。 */
  .cd-modal-footer :global(.cd-button) {
    margin-left: var(--cd-spacing-modal-footer-button-marginleft);
    margin-right: 0;
  }
  .cd-modal-footerfill {
    display: flex;
  }
  .cd-modal-footerfill :global(.cd-button) {
    flex: 1;
  }

  /* —— RTL（对齐 Semi rtl.scss，镜像与 Modal.svelte 挂在 portal 根节点的 .cd-modal-rtl 联动）——
     :global(.cd-modal-rtl) 是根级祖先选择器（挂在 Modal.svelte 自身根节点，非本组件作用域
     内），direction 经 Svelte context 跨 use:portal 命令式 DOM 搬迁依旧生效（对齐 Semi
     ConfigContext 跨 React Portal 生效同理），不受浮层挂 body 脱离 .cd-rtl 包裹层的限制
     （与 DatePicker/TimePicker 面板走祖先选择器的已知限制不同，见 rtl-scope 闸门说明）。 */
  :global(.cd-modal-rtl) {
    direction: rtl;
  }
  :global(.cd-modal-rtl) .cd-modal-icon-wrapper {
    margin-right: 0;
    margin-left: var(--cd-spacing-modal-icon-wrapper-marginright);
  }
  :global(.cd-modal-rtl) .cd-modal-withIcon {
    margin-left: 0;
    margin-right: var(--cd-spacing-modal-content-withicon-marginleft);
  }
  :global(.cd-modal-rtl) .cd-modal-footer {
    text-align: left;
  }
  :global(.cd-modal-rtl) .cd-modal-footer :global(.cd-button) {
    margin-left: 0;
    margin-right: var(--cd-spacing-modal-footer-button-marginleft);
  }

  /* —— 动画（对齐 Semi content/mask keyframe；reduced-motion 抑制）—— */
  .cd-modal-motion .cd-modal-content {
    animation: cd-modal-content-show 120ms cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
  }
  @keyframes cd-modal-content-show {
    0% {
      opacity: 0;
      transform: scale(0.7);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-modal-motion .cd-modal-content {
      animation: none;
    }
  }
</style>
