<!--
  Modal — see specs/components/feedback/Modal.spec.md
  fixed 遮罩+面板，portal 到 body（或 getContainer），role=dialog aria-modal，
  useFocusTrap 焦点捕获+归还、useDismiss Esc 关闭、useScrollLock 锁背景滚动，
  遮罩点击关闭、ok/cancel 按钮、自定义尾部、reduced-motion。
  堆叠 z-index 由 z-stack 模块级计数器分配（声明式 + 命令式共享）。
  destroyOnClose：关闭即卸载内容（{#if}），重开重建。
  命令式工厂 Modal.confirm/info/... 见 command.svelte.ts（已 Object.assign 到 Modal）。
  draggable：按住标题栏拖动面板，偏移 $state 派生为 transform 叠加在居中/距顶定位上，
  pointermove/up 绑 window 命令式 + cleanup，重开偏移重置。
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
  import { Button } from '../button/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import { getGlobalPopupContainer } from '../config-provider/index.js';
  import { acquireZIndex } from './z-stack.js';

  type OkType = 'primary' | 'danger';

  interface Props {
    open?: boolean;
    title?: string;
    titleSnippet?: Snippet;
    width?: number | string;
    centered?: boolean;
    closable?: boolean;
    maskClosable?: boolean;
    keyboard?: boolean;
    /** 为真时按住标题栏可拖动整个对话框。默认 false。 */
    draggable?: boolean;
    confirmLoading?: boolean;
    okText?: string;
    cancelText?: string;
    okType?: OkType;
    /** 关闭即卸载内部内容；重开重建。默认 false（保留 DOM 仅隐藏 via {#if isOpen}）。 */
    destroyOnClose?: boolean;
    /** Portal 容器，缺省 document.body。脱离父层叠上下文。 */
    getContainer?: () => HTMLElement | null;
    footer?: Snippet<[{ ok: () => void; cancel: () => void }]> | null;
    children?: Snippet;
    ariaLabel?: string;
    onOk?: () => void;
    onCancel?: () => void;
    onOpenChange?: (open: boolean) => void;
    onAfterClose?: () => void;
    class?: string;
  }

  let {
    open,
    title,
    titleSnippet,
    width = 448,
    centered = false,
    closable = true,
    maskClosable = true,
    keyboard = true,
    draggable = false,
    confirmLoading = false,
    okText,
    cancelText,
    okType = 'primary',
    destroyOnClose = false,
    getContainer,
    footer,
    children,
    ariaLabel,
    onOk,
    onCancel,
    onOpenChange,
    onAfterClose,
    class: className,
  }: Props = $props();

  const titleId = useId('cd-modal-title');
  const loc = useLocale();
  // ConfigProvider 全局浮层容器默认；自身 getContainer prop 优先，未传时回退此值（再回退 body）。
  const globalPopupContainer = getGlobalPopupContainer();

  // --- 受控 open (红线 #1)：不无条件回写 open，仅 onOpenChange/onCancel ---
  const isControlled = $derived(open !== undefined);
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isControlled ? !!open : innerOpen);

  function getInitialOpen(): boolean {
    return false;
  }

  const hasTitle = $derived(Boolean(titleSnippet) || Boolean(title));

  const widthStyle = $derived(typeof width === 'number' ? `${width}px` : width);

  const panelCls = $derived(['cd-modal', className].filter(Boolean).join(' '));

  // --- destroyOnClose：默认 false 时首开后保留 DOM（仅 isOpen 切换显隐），
  //     true 时关闭即从 DOM 卸载（{#if isOpen}），重开重建。 ---
  let hasBeenOpened = $state(false);
  $effect(() => {
    if (isOpen) hasBeenOpened = true;
  });
  const shouldRender = $derived(destroyOnClose ? isOpen : isOpen || hasBeenOpened);

  function cancel() {
    if (!isControlled) innerOpen = false;
    onOpenChange?.(false);
    onCancel?.();
    if (onAfterClose) queueMicrotask(() => onAfterClose?.());
  }

  function ok() {
    onOk?.();
    // 折中：非受控模式 ok 后自动关闭；受控模式由 onOk 回调控制 open
    if (!isControlled) {
      innerOpen = false;
      onOpenChange?.(false);
    }
  }

  function onMaskClick(e: MouseEvent) {
    if (maskClosable && e.target === e.currentTarget) {
      cancel();
    }
  }

  // --- 浮层命令式编排 (红线 #3)：open 且面板就绪时，
  //     activate focus-trap、绑 dismiss(Esc)、加 scroll-lock；
  //     cleanup 里 deactivate(归还焦点)、解绑 dismiss、release scroll-lock ---
  let panelEl = $state<HTMLElement | null>(null);
  // portal 根（遮罩）—— 背景 inert 以它为锚，对兄弟节点（页面其余内容/下层浮层）生效。
  let maskEl = $state<HTMLElement | null>(null);

  $effect(() => {
    if (!isOpen || !panelEl) return;
    const trap = useFocusTrap(panelEl);
    trap.activate();
    const releaseScroll = useScrollLock();
    // 背景内容对 SR/键盘 inert+aria-hidden（spec §6）；以遮罩为锚隐藏其兄弟节点。
    const releaseInert = maskEl ? useInertBackground(maskEl) : () => {};
    let undismiss = () => {};
    if (keyboard) {
      undismiss = useDismiss(panelEl, {
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

  // --- 堆叠 z-index (红线 #3)：每次打开向模块计数器申请一层，关闭回收。
  //     与命令式 modal.confirm 共享计数器，多层叠放后开者在上。 ---
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

  // --- 拖拽 (红线 #2/#3)：偏移量存 $state，派生为 transform；
  //     pointerdown 在 header 起拖，pointermove/up 绑 window 命令式 + cleanup，
  //     以便拖出 header 仍跟随、松手在视口外亦能结束。重开偏移重置。 ---
  let dragX = $state(0);
  let dragY = $state(0);

  // 偏移叠加在现有居中/距顶定位之上（红线 #2：纯函数派生）。
  const panelTransform = $derived(
    draggable && (dragX !== 0 || dragY !== 0)
      ? `transform: translate(${dragX}px, ${dragY}px)`
      : undefined,
  );

  // 重开（isOpen 由 false→true）时重置偏移。
  let wasOpen = false;
  $effect(() => {
    if (isOpen && !wasOpen) {
      dragX = 0;
      dragY = 0;
    }
    wasOpen = isOpen;
  });

  function onHeaderPointerDown(e: PointerEvent) {
    if (!draggable) return;
    // 仅主键拖拽；避免拖到关闭按钮等交互元素时误触。
    if (e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('.cd-modal__close')) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const baseX = dragX;
    const baseY = dragY;

    function onMove(ev: PointerEvent) {
      let nextX = baseX + (ev.clientX - startX);
      let nextY = baseY + (ev.clientY - startY);
      // 边界：保留面板至少一部分可见（不让标题栏完全拖出视口）。
      if (panelEl) {
        const rect = panelEl.getBoundingClientRect();
        const margin = 40;
        const minX = -(rect.left - baseX) - rect.width + margin;
        const maxX = window.innerWidth - (rect.left - baseX) - margin;
        const minY = -(rect.top - baseY);
        const maxY = window.innerHeight - (rect.top - baseY) - margin;
        nextX = Math.min(Math.max(nextX, minX), maxX);
        nextY = Math.min(Math.max(nextY, minY), maxY);
      }
      dragX = nextX;
      dragY = nextY;
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  // --- portal action (红线 #3)：命令式 appendChild 到 getContainer()/body，
  //     脱离父 DOM 层叠上下文；destroy 时 removeChild 归还/清理。 ---
  function portal(node: HTMLElement) {
    if (typeof document === 'undefined') {
      return { destroy() {} };
    }
    const target = getContainer?.() ?? globalPopupContainer?.() ?? document.body;
    target.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  }
</script>

{#if shouldRender}
  <!-- 遮罩 role=presentation：点击关闭为鼠标增强，键盘等价为 Esc（focus-trap + useDismiss 提供）
       use:portal 命令式挂载到 getContainer()/body，脱离父层叠上下文；
       !isOpen 时（destroyOnClose=false 保留 DOM）以 hidden class 隐藏。 -->
  <div
    class="cd-modal-mask"
    class:cd-modal-mask--centered={centered}
    class:cd-modal-mask--hidden={!isOpen}
    bind:this={maskEl}
    style={stackZ !== undefined ? `--cd-modal-z:${stackZ}` : undefined}
    onclick={onMaskClick}
    role="presentation"
    use:portal
  >
    <div
      class={panelCls}
      bind:this={panelEl}
      role="dialog"
      aria-modal="true"
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-label={hasTitle ? undefined : ariaLabel}
      style="inline-size: {widthStyle}{panelTransform ? `; ${panelTransform}` : ''}"
    >
      {#if hasTitle || closable}
        <!-- draggable：标题栏起拖。pointerdown 命令式绑 window move/up（见脚本）。
             拖拽是鼠标增强，键盘/焦点陷阱不受影响；header role=presentation 与遮罩同理
             （内部 h2/关闭按钮各自保留语义角色），满足静态元素交互的 a11y 规则。 -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <header
          class="cd-modal__header"
          class:cd-modal__header--draggable={draggable}
          onpointerdown={draggable ? onHeaderPointerDown : undefined}
        >
          {#if hasTitle}
            <h2 id={titleId} class="cd-modal__title">
              {#if titleSnippet}
                {@render titleSnippet()}
              {:else}
                {title}
              {/if}
            </h2>
          {:else}
            <span></span>
          {/if}
          {#if closable}
            <button
              type="button"
              class="cd-modal__close"
              aria-label={loc().t('Modal.close')}
              onclick={cancel}
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
      {/if}

      <div class="cd-modal__body">
        {@render children?.()}
      </div>

      {#if footer !== null}
        <footer class="cd-modal__footer">
          {#if footer}
            {@render footer({ ok, cancel })}
          {:else}
            <Button onclick={cancel}>{cancelText ?? loc().t('Modal.cancelText')}</Button>
            <Button type={okType} onclick={ok} loading={confirmLoading}>
              {okText ?? loc().t('Modal.okText')}
            </Button>
          {/if}
        </footer>
      {/if}
    </div>
  </div>
{/if}

<style>
  .cd-modal-mask {
    position: fixed;
    inset: 0;
    z-index: var(--cd-modal-z);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: var(--cd-modal-padding);
    background: var(--cd-modal-mask-bg);
    overflow: auto;
  }
  .cd-modal-mask--centered {
    align-items: center;
  }
  /* destroyOnClose=false 时关闭仅隐藏、保留 DOM 与内部状态 */
  .cd-modal-mask--hidden {
    display: none;
  }
  .cd-modal {
    box-sizing: border-box;
    max-inline-size: 90vw;
    max-block-size: 90vh;
    margin-block-start: 100px;
    padding: var(--cd-modal-padding);
    background: var(--cd-modal-bg);
    border-radius: var(--cd-modal-radius);
    box-shadow: var(--cd-modal-shadow);
    overflow: auto;
  }
  .cd-modal-mask--centered .cd-modal {
    margin-block-start: 0;
  }
  .cd-modal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--cd-modal-header-gap);
    margin-block-end: var(--cd-modal-header-gap);
  }
  .cd-modal__header--draggable {
    cursor: move;
    user-select: none;
    touch-action: none;
  }
  /* 关闭按钮区域保留默认指针，避免落在「可拖拽」视觉上 */
  .cd-modal__header--draggable .cd-modal__close {
    cursor: pointer;
  }
  .cd-modal__title {
    margin: 0;
    color: var(--cd-modal-title-color);
    font-size: var(--cd-modal-title-size);
    font-weight: 600;
    line-height: 1.4;
  }
  .cd-modal__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 28px;
    block-size: 28px;
    padding: 0;
    border: none;
    border-radius: var(--cd-modal-radius);
    background: transparent;
    color: var(--cd-modal-close-color);
    cursor: pointer;
  }
  .cd-modal__close:hover {
    background: var(--cd-modal-close-hover-bg);
  }
  .cd-modal__close:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-modal__body {
    color: var(--cd-modal-body-color);
  }
  .cd-modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--cd-modal-footer-gap);
    margin-block-start: var(--cd-modal-padding);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-modal-mask,
    .cd-modal {
      animation: none;
    }
  }
</style>
