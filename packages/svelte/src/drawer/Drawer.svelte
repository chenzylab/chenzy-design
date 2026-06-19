<!--
  Drawer / SideSheet — 抽屉浮层，四方向贴边。
  复用 Modal 浮层模式：fixed 容器 + 面板（无 portal），role=dialog aria-modal，
  useFocusTrap 焦点捕获+归还、useDismiss Esc 关闭、useScrollLock 锁背景滚动，
  遮罩点击关闭、closable 关闭按钮、自定义尾部。
  本子集：贴边静态显示（无滑入动画，reduced-motion 友好）。
  TODO(延后): 滑入过渡动画、嵌套层栈管理、destroyOnClose、portal-to-body。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, useFocusTrap, useDismiss, useScrollLock } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

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
    mask?: boolean;
    maskClosable?: boolean;
    closeOnEsc?: boolean;
    closable?: boolean;
    footer?: Snippet | null;
    children?: Snippet;
    ariaLabel?: string;
    onOpenChange?: (open: boolean) => void;
    onClose?: () => void;
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
    mask = true,
    maskClosable = true,
    closeOnEsc = true,
    closable = true,
    footer,
    children,
    ariaLabel,
    onOpenChange,
    onClose,
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
    const trap = useFocusTrap(panelEl);
    trap.activate();
    const releaseScroll = mask ? useScrollLock() : () => {};
    let undismiss = () => {};
    if (closeOnEsc) {
      undismiss = useDismiss(panelEl, {
        onDismiss: () => close(),
        escape: true,
        outsideClick: false,
      });
    }
    return () => {
      undismiss();
      releaseScroll();
      trap.deactivate();
    };
  });
</script>

{#if isOpen}
  <div class="cd-drawer cd-drawer--{placement}" class:cd-drawer--no-mask={!mask}>
    {#if mask}
      <!-- 遮罩 role=presentation：点击关闭为鼠标增强，键盘等价为 Esc -->
      <div class="cd-drawer__mask" onclick={onMaskClick} role="presentation"></div>
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
      <header class="cd-drawer__header">
        <h2 id={titleId} class="cd-drawer__title">
          {#if titleSnippet}
            {@render titleSnippet()}
          {:else}
            {title}
          {/if}
        </h2>
        {#if closable}
          <button
            type="button"
            class="cd-drawer__close"
            aria-label={loc().t('Drawer.close')}
            onclick={close}
          >
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
          </button>
        {/if}
      </header>

      <div class="cd-drawer__body">
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
  }
  .cd-drawer__panel {
    position: absolute;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--cd-drawer-bg);
    box-shadow: var(--cd-drawer-shadow);
  }
  .cd-drawer__panel--right {
    inset-block: 0;
    inset-inline-end: 0;
    block-size: 100%;
    max-inline-size: 100vw;
  }
  .cd-drawer__panel--left {
    inset-block: 0;
    inset-inline-start: 0;
    block-size: 100%;
    max-inline-size: 100vw;
  }
  .cd-drawer__panel--top {
    inset-inline: 0;
    inset-block-start: 0;
    inline-size: 100%;
    max-block-size: 100vh;
  }
  .cd-drawer__panel--bottom {
    inset-inline: 0;
    inset-block-end: 0;
    inline-size: 100%;
    max-block-size: 100vh;
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
</style>
