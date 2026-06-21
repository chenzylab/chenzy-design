<!--
  SideSheet — 侧边滑出浮层。see specs/components/feedback/SideSheet.spec.md
  从视口四边（left/right/top/bottom）滑入的浮层容器，承载次要任务流/详情/筛选/表单。
  与 Modal 同构复用浮层基建：portal 到 body（或 getContainer）脱离父层叠上下文，
  role=dialog（mask 时 aria-modal），useFocusTrap 焦点捕获+归还（仅 mask）、
  useDismiss Esc 关闭、mask 时 useScrollLock 锁背景滚动，
  堆叠 z-index 复用 modal/z-stack 模块级计数器（与 Modal 统一层栈，后开者在上）。
  滑入过渡：CSS transform/opacity（token 时长缓动），reduced-motion / motionDisabled 退化为即时显隐。
  受控 open（红线 #1）：不回写 open，仅经 onOpenChange({open, reason}) 通知。
  mask=true 模态：遮罩 + focus trap + scroll lock；mask=false 非模态：无遮罩、不锁滚动、
  不抢焦点（不启用 focus trap），outsideClosable 时点击外部关闭。
  lazyMount：首开前惰性挂载；destroyOnClose：关闭即卸载内容（出场过渡结束后），重开重建。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, useFocusTrap, useDismiss, useScrollLock } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { acquireZIndex } from '../modal/z-stack.js';

  type Placement = 'left' | 'right' | 'top' | 'bottom';
  type Size = 'small' | 'default' | 'large';
  type Reason = 'esc' | 'mask' | 'outside' | 'closeButton' | 'programmatic';

  interface Props {
    open?: boolean;
    placement?: Placement;
    size?: Size;
    width?: number | string;
    height?: number | string;
    title?: string;
    /** 自定义标题区，覆盖 title prop。 */
    titleSnippet?: Snippet;
    /** Header 右侧额外操作（关闭按钮之前）。 */
    headerExtra?: Snippet;
    /** 自定义关闭图标。 */
    closeIcon?: Snippet;
    mask?: boolean;
    maskClosable?: boolean;
    /** mask=false 时点击面板外部是否关闭。默认 false。 */
    outsideClosable?: boolean;
    closeOnEsc?: boolean;
    closable?: boolean;
    /** 首次打开前是否惰性挂载内容。默认 true。 */
    lazyMount?: boolean;
    /** keepDOM=false 等价于 lazyMount=true 的反义（保留 DOM）。lazyMount 优先。 */
    keepDOM?: boolean;
    /** 关闭后是否销毁内部内容（释放资源）。默认 false。 */
    destroyOnClose?: boolean;
    /** Portal 挂载容器，缺省 document.body。 */
    getContainer?: () => HTMLElement | null;
    zIndex?: number;
    /** 强制不锁背景滚动（即便 mask=true）。 */
    disableScrollLock?: boolean;
    /** 关闭后焦点返回目标，缺省为打开时的触发元素。 */
    returnFocusTo?: HTMLElement | (() => HTMLElement | null) | null;
    /** 关闭进出动效（独立于 reduced-motion）。 */
    motionDisabled?: boolean;
    /** Footer 操作区；提供 close() 以便按钮关闭面板。未提供不渲染。 */
    footer?: Snippet<[{ close: () => void }]> | null;
    children?: Snippet;
    /** 无可见标题时的 aria-label 兜底。 */
    ariaLabel?: string;
    class?: string;
    bodyClass?: string;
    maskClass?: string;
    /** 显隐意图变化（受控，需外部回写 open）。 */
    onOpenChange?: (e: { open: boolean; reason: Reason }) => void;
    /** 进入动效结束、内容完全可见后触发。 */
    onAfterOpen?: () => void;
    /** 退出动效结束、DOM 卸载（如适用）后触发。 */
    onAfterClose?: () => void;
    /** 用户主动取消（Esc/遮罩/外部/关闭按钮）的语义快捷事件。 */
    onCancel?: (e: { reason: Reason }) => void;
  }

  let {
    open,
    placement = 'right',
    size = 'default',
    width,
    height,
    title,
    titleSnippet,
    headerExtra,
    closeIcon,
    mask = true,
    maskClosable = true,
    outsideClosable = false,
    closeOnEsc = true,
    closable = true,
    lazyMount = true,
    keepDOM,
    destroyOnClose = false,
    getContainer,
    zIndex,
    disableScrollLock = false,
    returnFocusTo,
    motionDisabled = false,
    footer,
    children,
    ariaLabel,
    class: className,
    bodyClass,
    maskClass,
    onOpenChange,
    onAfterOpen,
    onAfterClose,
    onCancel,
  }: Props = $props();

  const loc = useLocale();
  const titleId = useId('cd-sidesheet-title');

  // --- 受控 open (红线 #1)：不无条件回写 open，仅经 onOpenChange/onCancel 通知 ---
  const isControlled = $derived(open !== undefined);
  let innerOpen = $state(false);
  const isOpen = $derived(isControlled ? !!open : innerOpen);

  const hasTitle = $derived(Boolean(titleSnippet) || Boolean(title));
  const isHorizontal = $derived(placement === 'left' || placement === 'right');

  const panelCls = $derived(
    ['cd-sidesheet__panel', `cd-sidesheet__panel--${placement}`, className]
      .filter(Boolean)
      .join(' '),
  );

  // --- 尺寸解析 (红线 #2 纯函数派生)：width/height 显式优先于 size 预设 token ---
  const sizeToken = $derived(
    size === 'small'
      ? isHorizontal
        ? 'var(--cd-sidesheet-width-small)'
        : 'var(--cd-sidesheet-height-small)'
      : size === 'large'
        ? isHorizontal
          ? 'var(--cd-sidesheet-width-large)'
          : 'var(--cd-sidesheet-height-large)'
        : isHorizontal
          ? 'var(--cd-sidesheet-width)'
          : 'var(--cd-sidesheet-height)',
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

  // 出场过渡时长：从 CSS 读取 token（reduced-motion 下为 0）；motionDisabled 强制 0。
  function motionDurationMs(): number {
    if (motionDisabled) return 0;
    if (typeof window === 'undefined' || !rootEl) return 0;
    const raw = getComputedStyle(rootEl)
      .getPropertyValue('--cd-sidesheet-motion-duration')
      .trim();
    if (!raw) return 0;
    if (raw.endsWith('ms')) return parseFloat(raw) || 0;
    if (raw.endsWith('s')) return (parseFloat(raw) || 0) * 1000;
    return parseFloat(raw) || 0;
  }

  // --- lazyMount / destroyOnClose / 出场过渡 ---
  // lazyMount=true（默认）：首开前不挂载；keepDOM=true 显式禁用惰性。
  const lazy = $derived(keepDOM === true ? false : lazyMount);
  let hasBeenOpened = $state(false);
  let exiting = $state(false);
  let entered = $state(false);

  // 单一 open 边沿副作用 (红线 #3)：仅依赖 isOpen，内部不读所写状态（hasBeenOpened/
  // entered/exiting 只写不在依赖图触发自身重入），避免重入循环。
  // entered 驱动 --open，入场下一帧置 true 触发位移过渡；动效时长从 CSS 读取（非响应式）。
  $effect(() => {
    const opening = isOpen;
    let raf = 0;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    if (opening) {
      hasBeenOpened = true;
      exiting = false;
      if (motionDisabled) {
        entered = true;
        onAfterOpen?.();
      } else {
        // 下一帧再切到开启态，确保起始（贴边收起）态先绘制再过渡。
        // motionDurationMs() 读 rootEl，必须在 raf 回调（非响应式作用域）内调用，
        // 否则 open 分支把 rootEl 纳入依赖、与挂载形成回环（effect_update_depth_exceeded）。
        raf = requestAnimationFrame(() => {
          raf = requestAnimationFrame(() => {
            entered = true;
            const ms = motionDurationMs();
            openTimer = setTimeout(() => onAfterOpen?.(), ms);
          });
        });
      }
    } else {
      entered = false;
      if (hasBeenOpened) {
        const ms = motionDisabled ? 0 : motionDurationMs();
        closeTimer = setTimeout(() => {
          if (destroyOnClose) hasBeenOpened = false;
          exiting = false;
          onAfterClose?.();
        }, ms);
        if (destroyOnClose) exiting = true;
      }
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (closeTimer) clearTimeout(closeTimer);
      if (openTimer) clearTimeout(openTimer);
    };
  });

  // 渲染条件：lazy 且从未打开 → 不渲染（关闭态零成本）；
  // destroyOnClose → 仅开/出场期间；否则首开后常驻（仅切换显隐）。
  const shouldRender = $derived(
    destroyOnClose
      ? isOpen || exiting
      : lazy
        ? isOpen || hasBeenOpened
        : true,
  );

  function emitClose(reason: Reason) {
    if (!isControlled) innerOpen = false;
    onOpenChange?.({ open: false, reason });
    if (reason !== 'programmatic') onCancel?.({ reason });
  }

  // footer snippet 暴露的 close()：语义为程序化关闭。
  function close() {
    emitClose('programmatic');
  }

  function onMaskClick(e: MouseEvent) {
    if (mask && maskClosable && e.target === e.currentTarget) {
      emitClose('mask');
    }
  }

  // --- 浮层命令式编排 (红线 #3)：open 且面板就绪时，
  //     mask 时 activate focus-trap（捕获/归还焦点）、加 scroll-lock；
  //     绑 dismiss（Esc + 非模态外部点击）；cleanup 里逐一释放。 ---
  let panelEl = $state<HTMLElement | null>(null);
  let triggerEl: HTMLElement | null = null;

  function resolveReturnFocus(): HTMLElement | null {
    if (typeof returnFocusTo === 'function') return returnFocusTo();
    if (returnFocusTo) return returnFocusTo;
    return triggerEl;
  }

  $effect(() => {
    if (!isOpen || !panelEl) return;
    const el = panelEl;

    // 记录触发元素以便关闭归还焦点（mask=false 不抢焦点，故仅 mask 时记录）。
    triggerEl =
      typeof document !== 'undefined'
        ? (document.activeElement as HTMLElement | null)
        : null;

    // focus trap 仅 mask=true 启用；mask=false 允许焦点离开（非模态）。
    const trap = mask ? useFocusTrap(el) : null;
    trap?.activate();

    // scroll lock 仅 mask=true 且未 disableScrollLock。
    const releaseScroll = mask && !disableScrollLock ? useScrollLock() : () => {};

    // dismiss：Esc（closeOnEsc）+ 非模态外部点击（outsideClosable）。
    const wantOutside = !mask && outsideClosable;
    let undismiss = () => {};
    if (closeOnEsc || wantOutside) {
      undismiss = useDismiss(el, {
        onDismiss: (r) => emitClose(r === 'esc' ? 'esc' : 'outside'),
        escape: closeOnEsc,
        outsideClick: wantOutside,
      });
    }

    return () => {
      undismiss();
      releaseScroll();
      if (trap) {
        // 归还焦点：默认触发元素 / returnFocusTo。trap.deactivate 默认归还到
        // 记录的 previouslyFocused（即触发元素）；若显式指定 returnFocusTo 则覆盖。
        trap.deactivate();
        const target = resolveReturnFocus();
        if (target && target !== triggerEl) target.focus();
      }
      triggerEl = null;
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
      stackZ !== undefined ? `--cd-sidesheet-z:${stackZ}` : undefined,
      zIndex !== undefined && stackZ === undefined
        ? `--cd-sidesheet-z:${zIndex}`
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

  const bodyCls = $derived(
    ['cd-sidesheet__body', bodyClass].filter(Boolean).join(' '),
  );
  const maskCls = $derived(
    ['cd-sidesheet__mask', maskClass].filter(Boolean).join(' '),
  );
</script>

{#if shouldRender}
  <!-- use:portal 命令式挂载到 getContainer()/body，脱离父层叠上下文。
       cd-sidesheet--open 由 isOpen && entered 驱动 transform/opacity 过渡。 -->
  <div
    bind:this={rootEl}
    class="cd-sidesheet cd-sidesheet--{placement}"
    class:cd-sidesheet--open={isOpen && entered}
    class:cd-sidesheet--no-mask={!mask}
    class:cd-sidesheet--no-motion={motionDisabled}
    style={rootStyle}
    use:portal
  >
    {#if mask}
      <!-- 遮罩 role=presentation：点击关闭为鼠标增强，键盘等价为 Esc -->
      <div class={maskCls} onclick={onMaskClick} role="presentation"></div>
    {/if}
    <div
      class={panelCls}
      bind:this={panelEl}
      role="dialog"
      aria-modal={mask ? 'true' : undefined}
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-label={hasTitle ? undefined : ariaLabel}
      style={panelStyle}
    >
      {#if hasTitle || closable || headerExtra}
        <header class="cd-sidesheet__header">
          {#if hasTitle}
            <h2 id={titleId} class="cd-sidesheet__title">
              {#if titleSnippet}
                {@render titleSnippet()}
              {:else}
                {title}
              {/if}
            </h2>
          {:else}
            <span></span>
          {/if}
          <div class="cd-sidesheet__header-actions">
            {#if headerExtra}
              {@render headerExtra()}
            {/if}
            {#if closable}
              <button
                type="button"
                class="cd-sidesheet__close"
                aria-label={loc().t('SideSheet.closeAriaLabel')}
                onclick={() => emitClose('closeButton')}
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
      {/if}

      <div class={bodyCls}>
        {@render children?.()}
      </div>

      {#if footer}
        <footer class="cd-sidesheet__footer">
          {@render footer({ close })}
        </footer>
      {/if}
    </div>
  </div>
{/if}

<style>
  .cd-sidesheet {
    position: fixed;
    inset: 0;
    z-index: var(--cd-sidesheet-z);
  }
  /* mask=false 时容器不拦截指针，仅面板可交互（协作式非模态） */
  .cd-sidesheet--no-mask {
    pointer-events: none;
  }
  .cd-sidesheet--no-mask .cd-sidesheet__panel {
    pointer-events: auto;
  }
  .cd-sidesheet__mask {
    position: absolute;
    inset: 0;
    background: var(--cd-sidesheet-mask-bg);
    pointer-events: auto;
    opacity: 0;
    transition: opacity var(--cd-sidesheet-motion-duration)
      var(--cd-motion-ease-standard, ease);
  }
  .cd-sidesheet--open .cd-sidesheet__mask {
    opacity: 1;
  }
  .cd-sidesheet__panel {
    position: absolute;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--cd-sidesheet-bg);
    color: var(--cd-sidesheet-color);
    box-shadow: var(--cd-sidesheet-shadow);
    transition:
      transform var(--cd-sidesheet-motion-duration)
        var(--cd-motion-ease-standard, ease),
      opacity var(--cd-sidesheet-motion-duration)
        var(--cd-motion-ease-standard, ease);
    will-change: transform, opacity;
    opacity: 0;
  }
  /* 朝向内容侧圆角：仅贴边对侧 */
  .cd-sidesheet__panel--right {
    inset-block: 0;
    inset-inline-end: 0;
    block-size: 100%;
    max-inline-size: 100vw;
    transform: translateX(100%);
    border-start-start-radius: var(--cd-sidesheet-radius);
    border-end-start-radius: var(--cd-sidesheet-radius);
  }
  .cd-sidesheet__panel--left {
    inset-block: 0;
    inset-inline-start: 0;
    block-size: 100%;
    max-inline-size: 100vw;
    transform: translateX(-100%);
    border-start-end-radius: var(--cd-sidesheet-radius);
    border-end-end-radius: var(--cd-sidesheet-radius);
  }
  .cd-sidesheet__panel--top {
    inset-inline: 0;
    inset-block-start: 0;
    inline-size: 100%;
    max-block-size: 100vh;
    transform: translateY(-100%);
    border-end-start-radius: var(--cd-sidesheet-radius);
    border-end-end-radius: var(--cd-sidesheet-radius);
  }
  .cd-sidesheet__panel--bottom {
    inset-inline: 0;
    inset-block-end: 0;
    inline-size: 100%;
    max-block-size: 100vh;
    transform: translateY(100%);
    border-start-start-radius: var(--cd-sidesheet-radius);
    border-start-end-radius: var(--cd-sidesheet-radius);
  }
  /* RTL：left/right 贴边随书写方向镜像，translateX 方向需翻转 */
  :global([dir='rtl']) .cd-sidesheet__panel--right {
    transform: translateX(-100%);
  }
  :global([dir='rtl']) .cd-sidesheet__panel--left {
    transform: translateX(100%);
  }
  .cd-sidesheet--open .cd-sidesheet__panel {
    transform: translateX(0) translateY(0);
    opacity: 1;
  }
  /* 窄视口近铺满 */
  @media (max-width: 480px) {
    .cd-sidesheet__panel--left,
    .cd-sidesheet__panel--right {
      inline-size: 100vw !important;
    }
    .cd-sidesheet__panel--top,
    .cd-sidesheet__panel--bottom {
      block-size: 100vh !important;
    }
  }
  .cd-sidesheet__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-spacing-3, 12px);
    padding: var(--cd-sidesheet-header-padding);
    border-block-end: 1px solid var(--cd-sidesheet-border);
  }
  .cd-sidesheet__title {
    margin: 0;
    overflow: hidden;
    color: var(--cd-sidesheet-title-color);
    font-size: var(--cd-sidesheet-title-size);
    font-weight: 600;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cd-sidesheet__header-actions {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--cd-spacing-2, 8px);
  }
  .cd-sidesheet__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 28px;
    block-size: 28px;
    padding: 0;
    border: none;
    border-radius: var(--cd-radius-2, 4px);
    background: transparent;
    color: var(--cd-sidesheet-close-color);
    cursor: pointer;
  }
  .cd-sidesheet__close:hover {
    background: var(--cd-sidesheet-close-hover-bg);
    color: var(--cd-sidesheet-close-color-hover);
  }
  .cd-sidesheet__close:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-sidesheet__body {
    flex: 1;
    overflow: auto;
    padding: var(--cd-sidesheet-padding);
    color: var(--cd-sidesheet-color);
  }
  .cd-sidesheet__footer {
    position: sticky;
    inset-block-end: 0;
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    gap: var(--cd-spacing-2, 8px);
    padding: var(--cd-sidesheet-footer-padding);
    background: var(--cd-sidesheet-bg);
    border-block-start: 1px solid var(--cd-sidesheet-border);
  }

  /* reduced-motion / motionDisabled：禁用位移过渡，立即显隐 */
  .cd-sidesheet--no-motion .cd-sidesheet__panel,
  .cd-sidesheet--no-motion .cd-sidesheet__mask {
    transition: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-sidesheet__panel,
    .cd-sidesheet__mask {
      transition: none;
    }
  }
</style>
