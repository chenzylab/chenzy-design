<!--
  Modal — 严格镜像 Semi Design semi-ui/modal/Modal.tsx（文件拆分对齐 Semi Modal.tsx / ModalContent.tsx
  两文件职责边界）：本文件管 props/visible-state/z-index 堆叠/portal/静态方法族，DOM 渲染（mask/wrap/
  dialog 尺寸壳/content 的 header-body-footer/focus-trap/遮罩点击判定）拆到 ModalContent.svelte
  （对应 Semi ModalContent.tsx）。footer 按钮行（renderFooter 等价物）在本文件构建后作为 snippet
  传给 ModalContent（对齐 Semi Modal.tsx renderFooter 传 footer prop 给 ModalContent 的模式）。
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
    resolveDefault,
  } from '@chenzy-design/core';
  import { Button } from '../button/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import { getGlobalPopupContainer, getConfigContext } from '../config-provider/index.js';
  import { acquireZIndex } from './z-stack.js';
  import ModalContent from './ModalContent.svelte';

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
    'aria-label'?: string;
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
    centered: centeredProp,
    closable: closableProp,
    closeIcon,
    maskClosable: maskClosableProp,
    closeOnEsc: closeOnEscProp,
    confirmLoading = false,
    okText,
    cancelText,
    okType: okTypeProp,
    okButtonProps,
    cancelButtonProps,
    hasCancel: hasCancelProp,
    footer,
    footerFill = false,
    mask: maskProp,
    maskStyle,
    bodyStyle,
    style,
    class: className,
    modalContentClass,
    fullScreen: fullScreenProp,
    motion: motionProp,
    getPopupContainer,
    zIndex,
    keepDOM: keepDOMProp,
    lazyRender: lazyRenderProp,
    icon,
    modalRender,
    children,
    'aria-label': ariaLabel,
    preventScroll = false,
    onOk,
    onCancel,
    afterClose,
    onVisibleChange,
    maskFixed: maskFixedProp,
  }: Props = $props();
  // cdGlobal 全局默认 props（对齐 Semi semiGlobal.config.overrideDefaultProps）：
  // 优先级 = 显式传值 > cdGlobal['Modal'] > 组件内置默认值。
  const motion = $derived(resolveDefault(motionProp, 'Modal', 'motion', true));
  const mask = $derived(resolveDefault(maskProp, 'Modal', 'mask', true));
  const centered = $derived(resolveDefault(centeredProp, 'Modal', 'centered', false));
  const closable = $derived(resolveDefault(closableProp, 'Modal', 'closable', true));
  const okType = $derived(resolveDefault(okTypeProp, 'Modal', 'okType', 'primary'));
  const maskClosable = $derived(resolveDefault(maskClosableProp, 'Modal', 'maskClosable', true));
  const hasCancel = $derived(resolveDefault(hasCancelProp, 'Modal', 'hasCancel', true));
  const maskFixed = $derived(resolveDefault(maskFixedProp, 'Modal', 'maskFixed', true));
  const closeOnEsc = $derived(resolveDefault(closeOnEscProp, 'Modal', 'closeOnEsc', true));
  const keepDOM = $derived(resolveDefault(keepDOMProp, 'Modal', 'keepDOM', false));
  const lazyRender = $derived(resolveDefault(lazyRenderProp, 'Modal', 'lazyRender', true));
  const fullScreen = $derived(resolveDefault(fullScreenProp, 'Modal', 'fullScreen', false));

  const titleId = useId('cd-modal-title');
  const bodyId = useId('cd-modal-body');
  const loc = useLocale();
  const globalPopupContainer = getGlobalPopupContainer();
  // Svelte context 随组件实例树传播、不受 use:portal 命令式 DOM 搬迁影响（对齐 Semi
  // ConfigContext 跨 React Portal 生效同理），故 Modal 的 RTL 镜像不受"浮层挂到 body 脱离
  // .cd-rtl 包裹层"限制（与 DatePicker/TimePicker 面板走祖先选择器的已知限制不同）。
  const isRtl = $derived(getConfigContext().direction === 'rtl');

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
      isRtl ? 'cd-modal-rtl' : '',
      className,
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
    <ModalContent
      {mask}
      {maskStyle}
      {maskClosable}
      {isPopup}
      {centered}
      {sizeClass}
      {motion}
      modalStyle={modalStyle || undefined}
      {contentCls}
      bind:contentEl
      {titleId}
      {bodyId}
      {hasHeaderProp}
      {header}
      {title}
      {hasHeader}
      {hasIcon}
      {icon}
      {closable}
      {closeIcon}
      {ariaLabel}
      {bodyStyle}
      {children}
      footer={footer !== null ? footerContent : null}
      {footerFill}
      onClose={cancel}
      {modalRender}
    />
  </div>
{/if}

{#snippet footerContent()}
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
        {...(cancelButtonProps ?? {})}>{cancelText ?? loc().t('Modal.cancel')}</Button
      >
    {/if}
    <!-- 对齐 Semi 确认按钮：type=okType + theme=solid（实心）+ block=footerFill -->
    <Button
      type={okBtnType}
      theme="solid"
      block={footerFill}
      onclick={ok}
      loading={confirmLoading || okPending}
      {...(okButtonProps ?? {})}>{okText ?? loc().t('Modal.confirm')}</Button
    >
  {/if}
{/snippet}

<style>
  /* keepDOM 且关闭：保留 DOM 仅隐藏（对齐 Semi .semi-modal-displayNone，挂在最外层 portal 节点）。 */
  .cd-modal-hidden {
    display: none;
  }
</style>
