<!--
  SideBarContainer — SideBar 的可伸缩浮层壳（P0）。see specs/components/show/SideBar.spec.md §4.2。
  贴视口右侧（RTL 贴左）的浮层：role=dialog + aria-labelledby(title)，打开移焦 + useFocusTrap
  焦点捕获/归还 + useDismiss Esc 关闭，堆叠 z-index 复用 modal/z-stack 计数器（与 Modal/SideSheet
  统一层栈，后开者在上）。resizable 时左边缘（RTL 右边缘）把手拖拽调宽——复用 core createResizeDrag
  （axis:'x' 单轴 + clamp minWidth/maxWidth），绝不手写 document 监听；把手 role=separator +
  aria-orientation=vertical + aria-valuenow + 键盘 ←→ 调宽（复用 Resizable 同套 a11y）。
  motion 展开/收起为 CSS transition（reduced-motion / motion=false 退化即时显隐）。
  受控 visible（红线 #1）：不回写，仅经 onCancel 通知。首帧动效延后到下一帧（红线 #3：
  motion 时长从 CSS 读取，非响应式作用域内调用，避免把 rootEl 纳入 open 分支依赖成回环）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    useId,
    useFocusTrap,
    useDismiss,
    createResizeDrag,
    parseSideBarWidth,
    clampSideBarWidth,
    type ResizeDragController,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { acquireZIndex } from '../modal/z-stack.js';

  interface Props {
    /** 是否可见（受控，不回写；仅经 onCancel 通知取消意图）。 */
    visible?: boolean;
    /** 标题（string 或自定义 Snippet）。 */
    title?: string | Snippet;
    /** 关闭回调（Esc / 关闭按钮触发）。 */
    onCancel?: (e: Event) => void;
    /** 动画结束后（入场或出场）触发，v 为当前可见状态。 */
    afterVisibleChange?: (v: boolean) => void;
    /** 展开/收起动画。默认 true。 */
    motion?: boolean;
    /** 宽度可拖拽。默认 true。 */
    resizable?: boolean;
    /** 最小宽度。默认 150。 */
    minWidth?: string | number;
    /** 最大宽度。 */
    maxWidth?: string | number;
    /** 默认尺寸（当前仅消费 width）。 */
    defaultSize?: { width?: string | number; height?: string | number };
    /** 显示关闭按钮。默认 true。 */
    showClose?: boolean;
    /** 自定义头部（覆盖 title + 关闭按钮）。 */
    renderHeader?: Snippet;
    /** 面板自定义类名。 */
    class?: string;
    /** 面板自定义内联样式。 */
    style?: string;
    /** 主内容区。 */
    children?: Snippet;
  }

  let {
    visible,
    title,
    onCancel,
    afterVisibleChange,
    motion = true,
    resizable = true,
    minWidth = 150,
    maxWidth,
    defaultSize,
    showClose = true,
    renderHeader,
    class: className,
    style,
    children,
  }: Props = $props();

  const loc = useLocale();
  const titleId = useId('cd-sidebar-title');

  // 受控 visible（红线 #1）：不回写，仅经 onCancel 通知。
  const isOpen = $derived(!!visible);

  const isTitleSnippet = $derived(typeof title === 'function');
  const hasTitle = $derived(Boolean(title));

  // —— 宽度：非受控本地宽（拖拽/键盘命令式写入）。默认取 defaultSize.width，否则 token 默认宽。——
  const minPx = $derived(parseSideBarWidth(minWidth));
  const maxPx = $derived(parseSideBarWidth(maxWidth));
  let localWidth = $state<number | undefined>(
    parseSideBarWidth(defaultSize?.width),
  );

  const toCss = (v: number | undefined): string =>
    v == null ? 'var(--cd-sidebar-width)' : `${v}px`;

  let rootEl = $state<HTMLElement | null>(null);
  let panelEl = $state<HTMLElement | null>(null);

  // 当前面板宽度 px 读数（命令式，红线 #3：不在 effect/derived 里读几何）。
  function readWidth(): number {
    if (localWidth != null) return localWidth;
    if (panelEl) return panelEl.offsetWidth;
    return parseSideBarWidth('400px') ?? 400;
  }

  // —— 出场过渡：motion 时长从 CSS 读取（reduced-motion 下为 0）。——
  function motionDurationMs(): number {
    if (!motion) return 0;
    if (typeof window === 'undefined' || !panelEl) return 0;
    const raw = getComputedStyle(panelEl)
      .getPropertyValue('--cd-sidebar-motion-duration')
      .trim();
    if (!raw) return 0;
    if (raw.endsWith('ms')) return parseFloat(raw) || 0;
    if (raw.endsWith('s')) return (parseFloat(raw) || 0) * 1000;
    return parseFloat(raw) || 0;
  }

  // —— open 边沿副作用（红线 #3）：仅依赖 isOpen；entered 驱动 --open 位移过渡，
  //    入场下一帧置 true；动效时长从 CSS 读取（非响应式作用域，避免 rootEl 入依赖成回环）。——
  let hasBeenOpened = $state(false);
  let entered = $state(false);

  $effect(() => {
    const opening = isOpen;
    let raf1 = 0;
    let raf2 = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (opening) {
      hasBeenOpened = true;
      if (!motion) {
        entered = true;
        afterVisibleChange?.(true);
      } else {
        raf1 = requestAnimationFrame(() => {
          raf2 = requestAnimationFrame(() => {
            entered = true;
            const ms = motionDurationMs();
            timer = setTimeout(() => afterVisibleChange?.(true), ms);
          });
        });
      }
    } else {
      entered = false;
      if (hasBeenOpened) {
        const ms = motion ? motionDurationMs() : 0;
        timer = setTimeout(() => afterVisibleChange?.(false), ms);
      }
    }
    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      if (timer) clearTimeout(timer);
    };
  });

  // 关闭态零成本：首开后常驻（仅切显隐）；首开前不渲染。
  const shouldRender = $derived(isOpen || hasBeenOpened);

  function emitCancel(e: Event): void {
    onCancel?.(e);
  }

  // —— 浮层命令式编排（红线 #3）：open 且面板就绪 → focus-trap 捕获/归还 + dismiss(Esc)。——
  $effect(() => {
    if (!isOpen || !panelEl) return;
    const el = panelEl;
    const trap = useFocusTrap(el);
    trap.activate();
    const undismiss = useDismiss(el, {
      onDismiss: (r) => {
        if (r === 'esc') emitCancel(new KeyboardEvent('keydown', { key: 'Escape' }));
      },
      escape: true,
      outsideClick: false,
    });
    return () => {
      undismiss();
      trap.deactivate();
    };
  });

  // —— 堆叠 z-index（红线 #3）：每次打开向 modal/z-stack 申请一层，关闭回收。——
  let stackZ = $state<number | undefined>(undefined);
  $effect(() => {
    if (!isOpen) return;
    const { zIndex, release } = acquireZIndex();
    stackZ = zIndex;
    return () => {
      stackZ = undefined;
      release();
    };
  });

  // —— 拖拽把手：复用 core createResizeDrag（axis:'x' 单轴 + clamp）。每次 pointerdown
  //    新建控制器（始终读最新 props），卸载兜底解绑。RTL 时把手在右边缘，direction 需翻转。——
  let activeDrag: ResizeDragController | null = null;

  function isRtl(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!rootEl &&
      getComputedStyle(rootEl).direction === 'rtl'
    );
  }

  function handlePointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    activeDrag?.destroy();
    // LTR 面板贴右，左边缘把手向左拖动加宽 → direction 'left'。
    // RTL 面板贴左，右边缘把手向右拖动加宽 → direction 'right'。
    const direction = isRtl() ? 'right' : 'left';
    activeDrag = createResizeDrag({
      axis: 'x',
      direction,
      getStart: () => ({ width: readWidth() }),
      min: { min: minPx },
      max: { max: maxPx },
      onMove: (s) => {
        localWidth = clampSideBarWidth(s.width, minPx, maxPx);
      },
      onEnd: () => {
        activeDrag = null;
      },
    });
    activeDrag.start(event, direction);
  }

  // 卸载兜底：拖拽中卸载时解绑遗留全局监听（红线 #3）。
  $effect(() => () => activeDrag?.destroy());

  // 键盘：把手聚焦后 ←→ 调宽（RTL 镜像）。
  const KEYBOARD_STEP = 10;
  function handleKeydown(event: KeyboardEvent): void {
    const rtl = isRtl();
    let dw = 0;
    switch (event.key) {
      case 'ArrowRight':
        dw = rtl ? -KEYBOARD_STEP : KEYBOARD_STEP;
        break;
      case 'ArrowLeft':
        dw = rtl ? KEYBOARD_STEP : -KEYBOARD_STEP;
        break;
      case 'Home':
        dw = (minPx ?? 0) - readWidth();
        break;
      case 'End':
        if (maxPx != null) dw = maxPx - readWidth();
        break;
      default:
        return;
    }
    if (dw === 0) return;
    event.preventDefault();
    localWidth = clampSideBarWidth(readWidth() + dw, minPx, maxPx);
  }

  const panelStyle = $derived(
    [`inline-size:${toCss(localWidth)}`, style ?? ''].filter(Boolean).join(';'),
  );

  const rootStyle = $derived(
    stackZ !== undefined ? `--cd-sidebar-z:${stackZ}` : undefined,
  );

  const panelCls = $derived(
    ['cd-sidebar-container__panel', className].filter(Boolean).join(' '),
  );

  const handleLabel = $derived(loc().t('Resizable.handleAriaLabel'));
  const closeLabel = $derived(loc().t('SideBar.close'));
</script>

{#if shouldRender}
  <div
    bind:this={rootEl}
    class="cd-sidebar-container"
    class:cd-sidebar-container--open={isOpen && entered}
    class:cd-sidebar-container--no-motion={!motion}
    style={rootStyle}
  >
    <div
      bind:this={panelEl}
      class={panelCls}
      style={panelStyle}
      role="dialog"
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-label={hasTitle ? undefined : closeLabel}
    >
      {#if resizable}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div
          class="cd-sidebar-container__handle"
          role="separator"
          tabindex="0"
          aria-orientation="vertical"
          aria-label={handleLabel}
          aria-valuenow={Math.round(readWidth())}
          aria-valuemin={minPx}
          aria-valuemax={maxPx}
          onpointerdown={handlePointerDown}
          onkeydown={handleKeydown}
        ></div>
      {/if}

      {#if renderHeader}
        {@render renderHeader()}
      {:else if hasTitle || showClose}
        <header class="cd-sidebar-container__header">
          {#if hasTitle}
            <h2 id={titleId} class="cd-sidebar-container__title">
              {#if isTitleSnippet}
                {@render (title as Snippet)()}
              {:else}
                {title}
              {/if}
            </h2>
          {:else}
            <span></span>
          {/if}
          {#if showClose}
            <button
              type="button"
              class="cd-sidebar-container__close"
              aria-label={closeLabel}
              onclick={(e) => emitCancel(e)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          {/if}
        </header>
      {/if}

      <div class="cd-sidebar-container__body">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}

<style>
  .cd-sidebar-container {
    position: fixed;
    inset-block: 0;
    inset-inline-end: 0;
    z-index: var(--cd-sidebar-z);
    display: flex;
    pointer-events: none;
  }
  .cd-sidebar-container__panel {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    block-size: 100%;
    max-inline-size: 100vw;
    overflow: hidden;
    pointer-events: auto;
    background: var(--cd-sidebar-bg);
    color: var(--cd-sidebar-color);
    border-inline-start: 1px solid var(--cd-sidebar-border);
    box-shadow: var(--cd-sidebar-shadow);
    border-start-start-radius: var(--cd-sidebar-radius);
    border-end-start-radius: var(--cd-sidebar-radius);
    transform: translateX(100%);
    opacity: 0;
    transition:
      transform var(--cd-sidebar-motion-duration) var(--cd-motion-ease-standard, ease),
      opacity var(--cd-sidebar-motion-duration) var(--cd-motion-ease-standard, ease);
    will-change: transform, opacity;
  }
  /* RTL：面板贴左，圆角/边框镜像，位移方向翻转。 */
  :global([dir='rtl']) .cd-sidebar-container {
    inset-inline-end: auto;
    inset-inline-start: 0;
  }
  :global([dir='rtl']) .cd-sidebar-container__panel {
    transform: translateX(-100%);
  }
  .cd-sidebar-container--open .cd-sidebar-container__panel {
    transform: translateX(0);
    opacity: 1;
  }
  /* 把手：贴内容侧边缘（LTR 左、RTL 右），命中区 ≥12px 满足触控。 */
  .cd-sidebar-container__handle {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    z-index: 1;
    inline-size: max(var(--cd-resizable-handle-size), 12px);
    cursor: ew-resize;
    touch-action: none;
    transform: translateX(-50%);
  }
  :global([dir='rtl']) .cd-sidebar-container__handle {
    inset-inline-start: auto;
    inset-inline-end: 0;
    transform: translateX(50%);
  }
  .cd-sidebar-container__handle::after {
    content: '';
    position: absolute;
    inset-block: 0;
    inset-inline-start: 50%;
    inline-size: 1px;
    transform: translateX(-50%);
    background: var(--cd-resizable-handle-color);
    transition: background-color 0.15s;
  }
  .cd-sidebar-container__handle:hover::after {
    background: var(--cd-resizable-handle-color-hover);
  }
  .cd-sidebar-container__handle:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--cd-resizable-handle-color-focus);
  }
  .cd-sidebar-container__header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    gap: var(--cd-spacing-base-tight, 12px);
    padding: var(--cd-sidebar-header-padding);
    border-block-end: 1px solid var(--cd-sidebar-border);
  }
  .cd-sidebar-container__title {
    margin: 0;
    overflow: hidden;
    color: var(--cd-sidebar-title-color);
    font-size: var(--cd-sidebar-title-size);
    font-weight: var(--cd-sidebar-title-weight);
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cd-sidebar-container__close {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    inline-size: 28px;
    block-size: 28px;
    padding: 0;
    border: none;
    border-radius: var(--cd-sidebar-close-radius);
    background: transparent;
    color: var(--cd-sidebar-close-color);
    cursor: pointer;
  }
  .cd-sidebar-container__close:hover {
    background: var(--cd-sidebar-close-hover-bg);
  }
  .cd-sidebar-container__close:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-sidebar-container__body {
    flex: 1;
    overflow: auto;
    padding: var(--cd-sidebar-body-padding);
  }
  .cd-sidebar-container--no-motion .cd-sidebar-container__panel {
    transition: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-sidebar-container__panel {
      transition: none;
    }
  }
</style>
