<!--
  Modal — 严格镜像 Semi Design（semi-foundation/modal + semi-ui/modal/ModalContent）。
  DOM 结构对齐 Semi：
    .cd-modal-fixed（最外，getPopupContainer!==body 时 .cd-modal-popup）
      └ .cd-modal-mask（遮罩）
      └ .cd-modal-wrap（role=none，负责滚动与遮罩点击，centered 时 -wrap-center）
          └ .cd-modal（尺寸类 -small/-medium/-large/-full-width，centered 时 -centered）
              └ .cd-modal-content（role=dialog aria-modal，背景/圆角/阴影；modalRender 包裹此节点）
                  ├ .cd-modal-header（icon + Typography.Title + 关闭 IconButton）
                  ├ .cd-modal-body / .cd-modal-body-wrapper（无 header 时 icon+body+closer）
                  └ .cd-modal-footer
  API 严格镜像 Semi 名：visible / closeOnEsc / getPopupContainer / afterClose / motion /
    okType(5 种) / size(small|medium|large|full-width) / header(Snippet) / footerFill 等。
  ReactNode→Snippet、className→class（本库 Svelte 惯例）。拖拽经 modalRender + <DragMove>（Semi 同）。
  命令式浮层编排（红线 #3）：open 且面板就绪时 activate focus-trap、绑 Esc dismiss、scroll-lock、
    背景 inert；cleanup 归还。堆叠 z-index 由模块级计数器分配（声明式与命令式共享）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    useId,
    useFocusTrap,
    useDismiss,
    useScrollLock,
    useInertBackground,
  } from '@chenzy-design/core';
  import { IconClose } from '@chenzy-design/icons';
  import { Button } from '../button/index.js';
  import { IconButton } from '../iconbutton/index.js';
  import { Title } from '../typography/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import { getGlobalPopupContainer } from '../config-provider/index.js';
  import { acquireZIndex } from './z-stack.js';

  type OkType = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
  type ModalSize = 'small' | 'medium' | 'large' | 'full-width';

  interface Props {
    /** 对话框是否可见（受控；受控时不回写）。对齐 Semi visible。 */
    visible?: boolean;
    /** 标题（string 或 Snippet）。对齐 Semi title(ReactNode)。 */
    title?: string | Snippet;
    /** 自定义头部（Snippet），设为 null 不展示头部。对齐 Semi header(ReactNode)。 */
    header?: Snippet | null;
    /** 宽度。对齐 Semi width。 */
    width?: number | string;
    /** 高度。对齐 Semi height。 */
    height?: number | string;
    /** 预设宽度尺寸：small(448)/medium(684)/large(920)/full-width(100vw-64px)。对齐 Semi size。 */
    size?: ModalSize;
    /** 垂直居中。对齐 Semi centered。 */
    centered?: boolean;
    /** 右上角关闭按钮。对齐 Semi closable。 */
    closable?: boolean;
    /** 自定义关闭图标（Snippet）。对齐 Semi closeIcon。 */
    closeIcon?: Snippet;
    /** 点遮罩关闭。对齐 Semi maskClosable。 */
    maskClosable?: boolean;
    /** Esc 关闭。对齐 Semi closeOnEsc。 */
    closeOnEsc?: boolean;
    /** 确认按钮 loading。对齐 Semi confirmLoading。 */
    confirmLoading?: boolean;
    /** 确认按钮文字。对齐 Semi okText。 */
    okText?: string;
    /** 取消按钮文字。对齐 Semi cancelText。 */
    cancelText?: string;
    /** 确认按钮类型：primary/secondary/tertiary/warning/danger。对齐 Semi okType。 */
    okType?: OkType;
    /** 透传给确认按钮的额外 props。对齐 Semi okButtonProps。 */
    okButtonProps?: Record<string, unknown>;
    /** 透传给取消按钮的额外 props。对齐 Semi cancelButtonProps。 */
    cancelButtonProps?: Record<string, unknown>;
    /** 是否显示取消按钮。对齐 Semi hasCancel。 */
    hasCancel?: boolean;
    /** 自定义底部（Snippet），设为 null 不展示底部按钮。对齐 Semi footer(ReactNode)。 */
    footer?: Snippet<[{ ok: () => void; cancel: () => void }]> | null;
    /** 底部按钮撑满。对齐 Semi footerFill。 */
    footerFill?: boolean;
    /** 是否显示遮罩。对齐 Semi mask。 */
    mask?: boolean;
    /** 遮罩内联样式。对齐 Semi maskStyle。 */
    maskStyle?: string;
    /** 内容区内联样式。对齐 Semi bodyStyle。 */
    bodyStyle?: string;
    /** 根节点内联样式（如 top）。对齐 Semi style。 */
    style?: string;
    /** 根节点类名。对齐 Semi className。 */
    class?: string;
    /** 内容区类名。对齐 Semi modalContentClass。 */
    modalContentClass?: string;
    /** 全屏（覆盖 width/height）。对齐 Semi fullScreen。 */
    fullScreen?: boolean;
    /** 动画开关。对齐 Semi motion。 */
    motion?: boolean;
    /** 指定父级 DOM。对齐 Semi getPopupContainer。 */
    getPopupContainer?: () => HTMLElement | null;
    /** z-index。对齐 Semi zIndex。 */
    zIndex?: number;
    /** 关闭时保留 DOM 不销毁。对齐 Semi keepDOM。 */
    keepDOM?: boolean;
    /** 配合 keepDOM：为 true 时挂载时不渲染对话框。对齐 Semi lazyRender。 */
    lazyRender?: boolean;
    /** 命令式类型图标（Snippet）。对齐 Semi icon。 */
    icon?: Snippet;
    /** 自定义渲染 Modal content（对齐 Semi modalRender）。接收默认 content Snippet，返回包裹结构。 */
    modalRender?: Snippet<[Snippet]>;
    /** 内容主体。 */
    children?: Snippet;
    ariaLabel?: string;
    /**
     * 指示浏览器是否应滚动文档以显示新聚焦的元素，作用于组件内的 focus 方法。
     * 对齐 Semi preventScroll。
     */
    preventScroll?: boolean;
    /**
     * 点击确认。返回 Promise 时确认按钮自动 loading（pending 期间）。对齐 Semi onOk。
     * 返回类型放宽为 unknown：`void | Promise` 的 union 会让 `() => (x = false)` 这类
     * 简写箭头（返回赋值表达式值）在 TS 下报错。
     */
    onOk?: () => unknown;
    /** 取消/关闭。返回 Promise 时取消按钮自动 loading（pending 期间）。对齐 Semi onCancel。 */
    onCancel?: () => unknown;
    /** 对话框完全关闭后回调。对齐 Semi afterClose。 */
    afterClose?: () => void;
    /** 显隐变化通知（本库补充，便于非受控回写）。 */
    onVisibleChange?: (visible: boolean) => void;
    /**
     * 遮罩是否 position:fixed（对齐 Semi maskFixed，配合 getPopupContainer 局部弹层）。默认 true。
     */
    maskFixed?: boolean;
  }

  let {
    visible,
    title,
    header,
    width = 448,
    height,
    size,
    centered = false,
    closable = true,
    closeIcon,
    maskClosable = true,
    closeOnEsc = true,
    confirmLoading = false,
    okText,
    cancelText,
    okType = 'primary',
    okButtonProps,
    cancelButtonProps,
    hasCancel = true,
    footer,
    footerFill = false,
    mask = true,
    maskStyle,
    bodyStyle,
    style,
    class: className,
    modalContentClass,
    fullScreen = false,
    motion = true,
    getPopupContainer,
    zIndex,
    keepDOM = false,
    lazyRender = true,
    icon,
    modalRender,
    children,
    ariaLabel,
    preventScroll = false,
    onOk,
    onCancel,
    afterClose,
    onVisibleChange,
    maskFixed = true,
  }: Props = $props();

  const titleId = useId('cd-modal-title');
  const bodyId = useId('cd-modal-body');
  const loc = useLocale();
  const globalPopupContainer = getGlobalPopupContainer();

  // 受控 visible（红线 #1）：不无条件回写，仅 onVisibleChange/onCancel 通知。
  const isControlled = $derived(visible !== undefined);
  let innerOpen = $state(false);
  const isOpen = $derived(isControlled ? !!visible : innerOpen);

  // header 存在性：header prop 传入（含 null）时以其为准；否则看 title。
  const hasHeaderProp = $derived(header !== undefined);
  const hasHeader = $derived(hasHeaderProp ? header !== null : title != null);
  const hasIcon = $derived(Boolean(icon));

  // 尺寸类与宽度（对齐 Semi：size 生成 -small/-medium/... 类，width 走内联 style）。
  const sizeClass = $derived(size ? `cd-modal-${size}` : '');
  const widthStyle = $derived(
    size || fullScreen ? '' : typeof width === 'number' ? `${width}px` : (width ?? ''),
  );
  const heightStyle = $derived(
    height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : '',
  );

  const okBtnType = $derived(okType);

  // destroyOnClose 语义：Semi 用 keepDOM 控制关闭是否保留 DOM。默认关闭即卸载 wrap（{#if}）。
  let hasBeenOpened = $state(false);
  $effect(() => {
    if (isOpen) hasBeenOpened = true;
  });
  const shouldRender = $derived(keepDOM ? !lazyRender || hasBeenOpened : isOpen);

  // onOk/onCancel 返回 Promise 时对应按钮 loading（对齐 Semi onOKReturnPromiseStatus pending）。
  let okPending = $state(false);
  let cancelPending = $state(false);

  function isPromise(v: unknown): v is Promise<unknown> {
    return !!v && typeof (v as Promise<unknown>).then === 'function';
  }

  function notifyCancelClose() {
    if (!isControlled) innerOpen = false;
    onVisibleChange?.(false);
    if (afterClose) queueMicrotask(() => afterClose?.());
  }

  function cancel() {
    const result = onCancel?.();
    if (isPromise(result)) {
      // Promise：pending 期间取消按钮 loading（对齐 Semi）；非受控 resolve 后才关闭（reject 保持打开）。
      cancelPending = true;
      result.then(
        () => {
          cancelPending = false;
          notifyCancelClose();
        },
        () => (cancelPending = false),
      );
      return;
    }
    notifyCancelClose();
  }

  function ok() {
    const result = onOk?.();
    if (isPromise(result)) {
      okPending = true;
      result.then(
        () => {
          okPending = false;
          if (!isControlled) {
            innerOpen = false;
            onVisibleChange?.(false);
          }
        },
        () => (okPending = false),
      );
      return;
    }
    if (!isControlled) {
      innerOpen = false;
      onVisibleChange?.(false);
    }
  }

  // 遮罩点击关闭：仅当按下与抬起都在 wrap 本身（非面板内），对齐 Semi 的 mousedown/up 判定，
  // 避免在面板内选中文本拖到遮罩误触关闭。
  let mouseDownOnWrap = false;
  function onWrapMouseDown(e: MouseEvent) {
    mouseDownOnWrap = e.target === e.currentTarget;
  }
  function onWrapClick(e: MouseEvent) {
    if (maskClosable && e.target === e.currentTarget && mouseDownOnWrap) {
      cancel();
    }
    mouseDownOnWrap = false;
  }

  // 命令式浮层编排（红线 #3）。
  let contentEl = $state<HTMLElement | null>(null);
  let rootEl = $state<HTMLElement | null>(null);

  $effect(() => {
    if (!isOpen || !contentEl) return;
    const trap = useFocusTrap(contentEl, { preventScroll });
    trap.activate();
    const releaseScroll = useScrollLock();
    const releaseInert = rootEl ? useInertBackground(rootEl) : () => {};
    let undismiss = () => {};
    if (closeOnEsc) {
      undismiss = useDismiss(contentEl, {
        onDismiss: () => cancel(),
        escape: true,
        outsideClick: false,
      });
    }
    return () => {
      undismiss();
      releaseInert();
      releaseScroll();
      trap.deactivate();
    };
  });

  // 堆叠 z-index：zIndex prop 优先，否则模块计数器分配。
  let stackZ = $state<number | undefined>(undefined);
  $effect(() => {
    if (!isOpen) return;
    if (zIndex !== undefined) {
      stackZ = zIndex;
      return;
    }
    const { zIndex: z, release } = acquireZIndex();
    stackZ = z;
    return () => {
      stackZ = undefined;
      release();
    };
  });
  const effectiveZ = $derived(zIndex ?? stackZ);

  // popup 模式：getPopupContainer 指向非 body 时，mask/wrap 用 absolute（对齐 Semi -popup）。
  const isPopup = $derived(
    !maskFixed && typeof getPopupContainer === 'function' && getPopupContainer() != null,
  );

  // portal（红线 #3）：命令式挂到 getPopupContainer()/body，脱离父层叠上下文。
  function portal(node: HTMLElement) {
    if (typeof document === 'undefined') return { destroy() {} };
    const target = getPopupContainer?.() ?? globalPopupContainer?.() ?? document.body;
    target.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  }

  const rootCls = $derived(
    [
      maskFixed && !isPopup ? 'cd-modal-fixed' : '',
      isPopup ? 'cd-modal-popup' : '',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const modalCls = $derived(
    [
      'cd-modal',
      sizeClass,
      centered ? 'cd-modal-centered' : '',
      motion ? 'cd-modal-motion' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  const contentCls = $derived(
    [
      'cd-modal-content',
      fullScreen ? 'cd-modal-content-fullscreen' : '',
      heightStyle ? 'cd-modal-content-height-set' : '',
      modalContentClass,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const modalStyle = $derived(
    [
      // 全屏：外壳撑满视口 + 去外边距（对齐 Semi ModalContent getDialogElement
      // isFullScreen 分支 width/height:100% + margin:unset）。
      fullScreen ? 'width:100%' : widthStyle ? `width:${widthStyle}` : '',
      fullScreen ? 'height:100%' : heightStyle ? `height:${heightStyle}` : '',
      fullScreen ? 'margin:0' : '',
      style ?? '',
    ]
      .filter(Boolean)
      .join(';'),
  );
</script>

{#if shouldRender}
  <!-- 根：portal 到容器，脱离父层叠上下文。effectiveZ 经 --cd-modal-content-z / -mask-z 覆盖基线。 -->
  <div
    class={rootCls}
    class:cd-modal-hidden={!isOpen}
    bind:this={rootEl}
    style={effectiveZ !== undefined
      ? `--cd-modal-content-z:${effectiveZ + 1};--cd-modal-mask-z:${effectiveZ}`
      : undefined}
    use:portal
  >
    {#if mask}
      <div
        class="cd-modal-mask"
        class:cd-modal-mask-absolute={isPopup}
        style={maskStyle}
      ></div>
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
          {@render modalRender(modalContent)}
        {:else}
          {@render modalContent()}
        {/if}
      </div>
    </div>
  </div>
{/if}

{#snippet modalContent()}
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
        {#if footer}
          {@render footer({ ok, cancel })}
        {:else}
          {#if hasCancel}
            <!-- 对齐 Semi getCancelButton：type=tertiary（浅色无边框）+ block=footerFill。
                 Semi 的 autoFocus 由本库 useFocusTrap 进场聚焦首个可聚焦元素（此取消按钮）等效实现。 -->
            <Button
              type="tertiary"
              block={footerFill}
              onclick={cancel}
              loading={cancelPending}
              {...(cancelButtonProps ?? {})}>{cancelText ?? loc().t('Modal.cancelText')}</Button
            >
          {/if}
          <!-- 对齐 Semi 确认按钮：type=okType + theme=solid（实心）+ block=footerFill -->
          <Button
            type={okBtnType}
            theme="solid"
            block={footerFill}
            onclick={ok}
            loading={confirmLoading || okPending}
            {...(okButtonProps ?? {})}>{okText ?? loc().t('Modal.okText')}</Button
          >
        {/if}
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
    ariaLabel={loc().t('Modal.close')}
    onclick={cancel}
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
    inset: 0;
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
    inset: 0;
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

  /* keepDOM 且关闭：保留 DOM 仅隐藏 */
  .cd-modal-hidden {
    display: none;
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
