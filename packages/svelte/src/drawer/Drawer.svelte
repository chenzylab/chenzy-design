<!--
  Drawer / SideSheet — 抽屉浮层，四方向贴边滑入。
  复用 Modal 浮层基建：portal 到 body（或 getContainer）脱离父层叠上下文，
  role=dialog aria-modal，useFocusTrap 焦点捕获+归还、useDismiss Esc 关闭、
  useScrollLock 锁背景滚动，遮罩点击关闭、closable 关闭按钮、自定义尾部。
  堆叠 z-index 由 modal/z-stack 模块级计数器分配（与 Modal 统一层栈，后开者在上）。
  滑入过渡：CSS transform/opacity 过渡（token 时长缓动），reduced-motion 退化。
  destroyOnClose：关闭即卸载内容（{#if}），重开重建；出场过渡结束后 onAfterClose。
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
  import { useLocale } from '../locale-provider/index.js';
  import { acquireZIndex } from '../modal/z-stack.js';

  type Placement = 'left' | 'right' | 'top' | 'bottom';
  type Size = 'small' | 'default' | 'large';

  interface Props {
    open?: boolean;
    placement?: Placement;
    size?: Size;
    width?: number | string;
    height?: number | string;
    title?: string;
    titleSnippet?: Snippet;
    /** Header 右侧额外操作区域（关闭按钮左侧）。 */
    extra?: Snippet;
    /** 自定义关闭图标；null 时隐藏关闭按钮。 */
    closeIcon?: Snippet | null;
    mask?: boolean;
    maskClosable?: boolean;
    closeOnEsc?: boolean;
    /** 键盘交互总开关；false 时停用 Esc 关闭与焦点陷阱键盘行为（覆盖 closeOnEsc）。 */
    keyboard?: boolean;
    closable?: boolean;
    /** 关闭即卸载内部内容；重开重建。默认 false（保留 DOM 仅隐藏）。 */
    destroyOnClose?: boolean;
    /** 关闭时保留 DOM（destroyOnClose 的反义别名）；true 时覆盖 destroyOnClose=true。 */
    keepDOM?: boolean;
    /** Portal 容器，缺省 document.body。脱离父层叠上下文。 */
    getContainer?: () => HTMLElement | null;
    /** 弹层 z-index 基准值，传给最外层容器。 */
    zIndex?: number;
    /** 是否启用动画过渡。false 时等价于强制 reduced-motion。默认 true。 */
    motion?: boolean;
    /** 打开时给 body 加 overflow:hidden 防背景滚动。默认 true。 */
    disableScroll?: boolean;
    /** 内容区域 style 字符串。 */
    bodyStyle?: string;
    /** Header 区域 style 字符串。 */
    headerStyle?: string;
    /** 遮罩 style 字符串。 */
    maskStyle?: string;
    footer?: Snippet | null;
    children?: Snippet;
    ariaLabel?: string;
    onOpenChange?: (open: boolean) => void;
    onClose?: () => void;
    /** 出场过渡结束（DOM 卸载后）触发，适合配合 destroyOnClose 清理。 */
    onAfterClose?: () => void;
    /** 动画结束后（入场或出场）触发，isVisible 为当前可见状态。 */
    afterVisibleChange?: (isVisible: boolean) => void;
    class?: string;
  }

  let {
    open,
    placement = 'right',
    size = 'default',
    width,
    height,
    title,
    titleSnippet,
    extra,
    closeIcon = undefined,
    mask = true,
    maskClosable = true,
    closeOnEsc = true,
    keyboard = true,
    closable = true,
    destroyOnClose = false,
    keepDOM = false,
    getContainer,
    zIndex,
    motion = true,
    disableScroll = true,
    bodyStyle,
    headerStyle,
    maskStyle,
    footer,
    children,
    ariaLabel,
    onOpenChange,
    onClose,
    onAfterClose,
    afterVisibleChange,
    class: className,
  }: Props = $props();

  const loc = useLocale();

  const titleId = useId('cd-drawer-title');

  // --- 受控 open (红线 #1)：不无条件回写 open，仅 onOpenChange/onClose ---
  const isControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isControlled ? !!open : innerOpen);

  function getInitialOpen(): boolean {
    return false;
  }

  const hasTitle = $derived(Boolean(titleSnippet) || Boolean(title));

  // keepDOM=true 覆盖 destroyOnClose：保留 DOM 优先。
  const effectiveDestroyOnClose = $derived(keepDOM ? false : destroyOnClose);

  const isHorizontal = $derived(placement === 'left' || placement === 'right');

  const panelCls = $derived(
    ['cd-drawer__panel', `cd-drawer__panel--${placement}`, className]
      .filter(Boolean)
      .join(' '),
  );

  // --- 尺寸解析：width/height 优先于 size 预设 token ---
  const sizeToken = $derived(
    size === 'small'
      ? isHorizontal
        ? 'var(--cd-drawer-width-small)'
        : 'var(--cd-drawer-height-small)'
      : size === 'large'
        ? isHorizontal
          ? 'var(--cd-drawer-width-large)'
          : 'var(--cd-drawer-height-large)'
        : isHorizontal
          ? 'var(--cd-drawer-width)'
          : 'var(--cd-drawer-height)',
  );

  const explicit = $derived(isHorizontal ? width : height);

  const sizeValue = $derived(
    explicit === undefined
      ? sizeToken
      : typeof explicit === 'number'
        ? `${explicit}px`
        : explicit,
  );

  const panelStyle = $derived(
    isHorizontal ? `inline-size: ${sizeValue}` : `block-size: ${sizeValue}`,
  );

  let rootEl = $state<HTMLElement | null>(null);

  function motionDurationMs(): number {
    if (!motion) return 0;
    if (typeof window === 'undefined' || !rootEl) return 0;
    const raw = getComputedStyle(rootEl)
      .getPropertyValue('--cd-drawer-motion-duration')
      .trim();
    if (!raw) return 0;
    if (raw.endsWith('ms')) return parseFloat(raw) || 0;
    if (raw.endsWith('s')) return (parseFloat(raw) || 0) * 1000;
    return parseFloat(raw) || 0;
  }

  // --- destroyOnClose / 出场过渡：默认 false 首开后保留 DOM（仅 isOpen 切换显隐 +
  //     CSS 过渡）；true 时关闭等出场过渡结束再卸载（{#if}），重开重建。
  //     entered 驱动 --open：入场时下一帧才置 true，触发位移过渡。
  //     全程不写死时长，从 CSS 读取 --cd-drawer-motion-duration，reduced-motion 即 0。 ---
  let hasBeenOpened = $state(false);
  let exiting = $state(false);
  let entered = $state(false);

  // 单一 open 边沿副作用：仅依赖 isOpen，内部不读所写状态，避免重入循环（红线 #3）。
  $effect(() => {
    const opening = isOpen;
    let raf = 0;
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    if (opening) {
      hasBeenOpened = true;
      exiting = false;
      if (!motion) {
        entered = true;
        afterVisibleChange?.(true);
      } else {
        // 下一帧再切到开启态，确保起始（贴边收起）态先绘制再过渡
        raf = requestAnimationFrame(() => {
          raf = requestAnimationFrame(() => {
            entered = true;
            const ms = motionDurationMs();
            openTimer = setTimeout(() => afterVisibleChange?.(true), ms);
          });
        });
      }
    } else {
      entered = false;
      if (hasBeenOpened) {
        const ms = motionDurationMs();
        closeTimer = setTimeout(() => {
          if (effectiveDestroyOnClose) hasBeenOpened = false;
          exiting = false;
          onAfterClose?.();
          afterVisibleChange?.(false);
        }, ms);
        if (effectiveDestroyOnClose) exiting = true;
      }
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (openTimer) clearTimeout(openTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
  });

  // disableScroll：打开时给 body 加 overflow:hidden，关闭时还原。
  $effect(() => {
    if (!isOpen || !disableScroll || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  });

  // effectiveDestroyOnClose=true：仅在开/出场期间渲染；false：首开后常驻
  const shouldRender = $derived(
    effectiveDestroyOnClose ? isOpen || exiting : isOpen || hasBeenOpened,
  );

  function close() {
    if (!isControlled) innerOpen = false;
    onOpenChange?.(false);
    onClose?.();
  }

  function onMaskClick(e: MouseEvent) {
    if (mask && maskClosable && e.target === e.currentTarget) {
      close();
    }
  }

  // --- 浮层命令式编排 (红线 #3)：open 且面板就绪时，
  //     activate focus-trap、绑 dismiss(Esc)、加 scroll-lock(仅 mask)；
  //     cleanup 里 deactivate(归还焦点)、解绑 dismiss、release scroll-lock ---
  let panelEl = $state<HTMLElement | null>(null);

  $effect(() => {
    if (!isOpen || !panelEl) return;
    // keyboard 总开关：false 时停用 Tab 焦点循环捕获（仍保留进场聚焦与归还焦点）。
    const trap = useFocusTrap(panelEl, { trapTab: keyboard });
    trap.activate();
    const releaseScroll = (mask && disableScroll) ? useScrollLock() : () => {};
    // 模态（mask=true）时背景内容对 SR/键盘 inert+aria-hidden（spec §6）；
    // 以 portal 根 rootEl 为锚隐藏其兄弟。非模态（mask=false）不抢占背景，跳过。
    const releaseInert = mask && rootEl ? useInertBackground(rootEl) : () => {};
    let undismiss = () => {};
    // keyboard 总开关节制 Esc：keyboard=false 时即便 closeOnEsc=true 也不绑 Esc。
    if (keyboard && closeOnEsc) {
      undismiss = useDismiss(panelEl, {
        onDismiss: () => close(),
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

  // --- 堆叠 z-index (红线 #3)：每次打开向 modal/z-stack 计数器申请一层，关闭回收。
  //     与 Modal、命令式 modal.confirm 共享同一计数器，多层叠放后开者在上。
  //     zIndex prop 作为 CSS var 基准（栈内自动递增叠加）。 ---
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

  const rootStyle = $derived(
    [
      stackZ !== undefined ? `--cd-drawer-z:${stackZ}` : undefined,
      zIndex !== undefined && stackZ === undefined
        ? `--cd-drawer-z:${zIndex}`
        : undefined,
    ]
      .filter(Boolean)
      .join('; ') || undefined,
  );

  // --- portal action (红线 #3)：命令式 appendChild 到 getContainer()/body，
  //     脱离父 DOM 层叠上下文；destroy 时 removeChild 归还/清理。 ---
  function portal(node: HTMLElement) {
    if (typeof document === 'undefined') {
      return { destroy() {} };
    }
    const target = getContainer?.() ?? document.body;
    target.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  }
</script>

{#if shouldRender}
  <!-- use:portal 命令式挂载到 getContainer()/body，脱离父层叠上下文。
       cd-drawer--open 由 isOpen 驱动 transform/opacity 过渡；
       destroyOnClose=false 时关闭以 transform 滑出并保留 DOM。 -->
  <div
    bind:this={rootEl}
    class="cd-drawer cd-drawer--{placement}"
    class:cd-drawer--open={isOpen && entered}
    class:cd-drawer--no-mask={!mask}
    class:cd-drawer--no-motion={!motion}
    style={rootStyle}
    use:portal
  >
    {#if mask}
      <!-- 遮罩 role=presentation：点击关闭为鼠标增强，键盘等价为 Esc -->
      <div
        class="cd-drawer__mask"
        style={maskStyle}
        onclick={onMaskClick}
        role="presentation"
      ></div>
    {/if}
    <div
      class={panelCls}
      bind:this={panelEl}
      role="dialog"
      aria-modal={mask}
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-label={hasTitle ? undefined : ariaLabel}
      style={panelStyle}
    >
      <header class="cd-drawer__header" style={headerStyle}>
        <h2 id={titleId} class="cd-drawer__title">
          {#if titleSnippet}
            {@render titleSnippet()}
          {:else}
            {title}
          {/if}
        </h2>
        <div class="cd-drawer__header-actions">
          {#if extra}
            {@render extra()}
          {/if}
          {#if closable && closeIcon !== null}
            <button
              type="button"
              class="cd-drawer__close"
              aria-label={loc().t('Drawer.close')}
              onclick={close}
            >
              {#if closeIcon}
                {@render closeIcon()}
              {:else}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              {/if}
            </button>
          {/if}
        </div>
      </header>

      <div class="cd-drawer__body" style={bodyStyle}>
        {@render children?.()}
      </div>

      {#if footer}
        <footer class="cd-drawer__footer">
          {@render footer()}
        </footer>
      {/if}
    </div>
  </div>
{/if}

<style>
  .cd-drawer {
    position: fixed;
    inset: 0;
    z-index: var(--cd-drawer-z);
  }
  /* mask=false 时容器不拦截指针，仅面板可交互 */
  .cd-drawer--no-mask {
    pointer-events: none;
  }
  .cd-drawer--no-mask .cd-drawer__panel {
    pointer-events: auto;
  }
  .cd-drawer__mask {
    position: absolute;
    inset: 0;
    background: var(--cd-drawer-mask-bg);
    pointer-events: auto;
    opacity: 0;
    transition: opacity var(--cd-drawer-motion-duration)
      var(--cd-motion-ease-standard, ease);
  }
  .cd-drawer--open .cd-drawer__mask {
    opacity: 1;
  }
  .cd-drawer__panel {
    position: absolute;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--cd-drawer-bg);
    box-shadow: var(--cd-drawer-shadow);
    transition: transform var(--cd-drawer-motion-duration)
      var(--cd-motion-ease-standard, ease);
    will-change: transform;
  }
  .cd-drawer__panel--right {
    inset-block: 0;
    inset-inline-end: 0;
    block-size: 100%;
    max-inline-size: 100vw;
    transform: translateX(100%);
  }
  .cd-drawer__panel--left {
    inset-block: 0;
    inset-inline-start: 0;
    block-size: 100%;
    max-inline-size: 100vw;
    transform: translateX(-100%);
  }
  .cd-drawer__panel--top {
    inset-inline: 0;
    inset-block-start: 0;
    inline-size: 100%;
    max-block-size: 100vh;
    transform: translateY(-100%);
  }
  .cd-drawer__panel--bottom {
    inset-inline: 0;
    inset-block-end: 0;
    inline-size: 100%;
    max-block-size: 100vh;
    transform: translateY(100%);
  }
  /* RTL：left/right 贴边随书写方向镜像，translateX 方向需翻转 */
  :global([dir='rtl']) .cd-drawer__panel--right {
    transform: translateX(-100%);
  }
  :global([dir='rtl']) .cd-drawer__panel--left {
    transform: translateX(100%);
  }
  .cd-drawer--open .cd-drawer__panel {
    transform: translateX(0) translateY(0);
  }
  .cd-drawer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--cd-drawer-header-padding);
    border-block-end: 1px solid var(--cd-drawer-border);
  }
  .cd-drawer__title {
    margin: 0;
    color: var(--cd-drawer-title-color);
    font-size: var(--cd-drawer-title-size);
    font-weight: 600;
    line-height: 1.4;
  }
  .cd-drawer__header-actions {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--cd-spacing-tight, 8px);
  }
  .cd-drawer__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 28px;
    block-size: 28px;
    padding: 0;
    border: none;
    border-radius: var(--cd-radius-sm, 4px);
    background: transparent;
    color: var(--cd-drawer-close-color);
    cursor: pointer;
  }
  .cd-drawer__close:hover {
    background: var(--cd-drawer-close-hover-bg);
    color: var(--cd-drawer-close-color-hover);
  }
  .cd-drawer__close:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-drawer__body {
    flex: 1;
    overflow: auto;
    padding: var(--cd-drawer-body-padding);
    color: var(--cd-drawer-color-text);
  }
  .cd-drawer__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--cd-drawer-footer-gap, 8px);
    padding: var(--cd-drawer-footer-padding);
    border-block-start: 1px solid var(--cd-drawer-border);
  }

  /* motion=false：强制禁用所有过渡动画 */
  .cd-drawer--no-motion * {
    transition: none !important;
  }

  /* reduced-motion：禁用位移过渡，仅保留极短透明度切换，打开后立即可用 */
  @media (prefers-reduced-motion: reduce) {
    .cd-drawer__panel,
    .cd-drawer__mask {
      transition: none;
    }
  }
</style>
