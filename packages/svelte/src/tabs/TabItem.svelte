<!--
  TabItem — 单个标签按钮，对齐 Semi packages/semi-ui/tabs/TabItem.tsx。
  DOM 结构/aria/data 属性严格镜像：role=tab、id=cdTab${itemKey}、data-tabkey、
  aria-disabled/aria-selected/aria-controls，图标 span 包裹，关闭叉 IconClose。
  data-sortable-item：对齐本库 sortable action 统一约定（见 Transfer.svelte/TagInput.svelte），
  使 TabItem 在自定义 renderTabBar + use:sortable 场景下开箱可拖拽——不加这个标记，
  action 内部 defaultGetRows/defaultResolveIndex 找不到行边界，拖拽会完全不生效。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconClose } from '@chenzy-design/icons';
  import type { TabKey, TabType, TabSize, TabPosition } from './interface.js';

  interface Props {
    tab?: string | undefined;
    icon?: Snippet | undefined;
    size: TabSize;
    type: TabType;
    tabPosition: TabPosition;
    selected: boolean;
    closable?: boolean | undefined;
    disabled?: boolean | undefined;
    itemKey: TabKey;
    /** 稳定 id（默认按 itemKey 生成，需与外层面板 aria-controls/aria-labelledby 关联时由调用方传入）。 */
    tabId?: string | undefined;
    panelId?: string | undefined;
    /** 对齐 Semi TabItemProps.handleKeyDown：内部 Tabs 消费时必传；独立使用（如自定义 renderTabBar）时可选。 */
    onTabKeyDown?: ((event: KeyboardEvent, itemKey: TabKey, closable: boolean) => void) | undefined;
    /** 对齐 Semi TabItemProps.deleteTabItem。 */
    deleteTabItem?: ((key: TabKey, event: MouseEvent) => void) | undefined;
    onClick?: ((itemKey: TabKey, e: MouseEvent) => void) | undefined;
    closeAriaLabel?: string | undefined;
    /** 根节点自定义类名（对齐 Semi TabItem 独立使用时的 className 透传场景，如拖拽排序 demo）。 */
    class?: string | undefined;
    /** 根节点自定义内联样式（对齐 Semi TabItem ref/style 透传，供第三方拖拽库注入 transform）。 */
    style?: string | undefined;
    /** 根节点 DOM 引用（对齐 Semi forwardRef，供第三方拖拽库如 dnd-kit 的 setNodeRef 使用）。 */
    ref?: HTMLDivElement | null;
  }

  let {
    tab,
    icon,
    size,
    type,
    tabPosition,
    selected,
    closable = false,
    disabled = false,
    itemKey,
    tabId,
    panelId,
    onTabKeyDown,
    deleteTabItem,
    onClick,
    closeAriaLabel = 'Close',
    class: className,
    style,
    ref = $bindable(null),
  }: Props = $props();

  const resolvedTabId = $derived(tabId ?? `cdTab${itemKey}`);
  const resolvedPanelId = $derived(panelId ?? `cdTabPanel${itemKey}`);

  function handleKeyDown(event: KeyboardEvent): void {
    onTabKeyDown?.(event, itemKey, closable);
  }

  function handleClick(e: MouseEvent): void {
    if (!disabled) onClick?.(itemKey, e);
  }

  function handleClose(e: MouseEvent): void {
    e.stopPropagation();
    deleteTabItem?.(itemKey, e);
  }

  const cls = $derived(
    [
      className ?? '',
      'cd-tabs-tab',
      `cd-tabs-tab-${type}`,
      `cd-tabs-tab-${tabPosition}`,
      'cd-tabs-tab-single',
      selected ? 'cd-tabs-tab-active' : '',
      disabled ? 'cd-tabs-tab-disabled' : '',
      size === 'small' ? 'cd-tabs-tab-small' : '',
      size === 'medium' ? 'cd-tabs-tab-medium' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div
  bind:this={ref}
  role="tab"
  id={resolvedTabId}
  data-tabkey={resolvedTabId}
  data-sortable-item
  aria-controls={resolvedPanelId}
  aria-disabled={disabled ? 'true' : 'false'}
  aria-selected={selected ? 'true' : 'false'}
  tabindex={selected ? 0 : -1}
  {style}
  onkeydown={handleKeyDown}
  onclick={handleClick}
  class={cls}
>
  {#if icon}
    <span class="cd-tabs-bar-icon">{@render icon()}</span>
  {/if}
  {tab}
  {#if closable}
    <IconClose
      aria-label={closeAriaLabel}
      role="button"
      class="cd-tabs-tab-icon-close"
      onclick={handleClose}
    />
  {/if}
</div>

<style>
  /* ============================================================
     标签容器与按钮基座（对齐 Semi tabs.scss .tab-single 段）
     ============================================================ */
  .cd-tabs-tab {
    cursor: pointer;
    box-sizing: border-box;
    position: relative;
    /* 对齐 Semi tabs.scss：display:block + float:left（非 inline-block）。tabBarExtraContent
       靠这套浮动流实现「贴在标签末尾同行」（Semi TabBar.tsx renderExtra 内联 style:{float:'right'}，
       不是 flex 容器 + margin-left:auto 那套，此前用 flex 补丁在 extra 上加 margin-inline-start:auto
       但父容器没设 display:flex，两边假设不自洽导致 extra 被挤到下一行）。tabPosition=left 时
       外层 .cd-tabs-bar-left 是 flex 容器，float 在 flex item 上依规范失效，天然不冲突。 */
    display: block;
    float: left;
    font-size: var(--cd-font-tabs-tab-fontsize);
    font-weight: var(--cd-font-tabs-tab-fontweight);
    color: var(--cd-color-tabs-tab-line-text-default);
    user-select: none;
  }
  .cd-tabs-tab :global(.cd-icon):not(.cd-tabs-tab-icon-close) {
    position: relative;
    margin-inline-end: var(--cd-spacing-tabs-tab-icon-marginright);
    inset-block-start: 3px;
    color: var(--cd-color-tabs-tab-icon-default);
    transition: color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs-tab :global(.cd-tabs-tab-icon-close) {
    margin-inline-end: 0;
    margin-inline-start: 10px;
    font-size: 14px;
    color: var(--cd-color-tabs-tab-line-text-default);
    cursor: pointer;
  }
  .cd-tabs-tab:hover:not(.cd-tabs-tab-disabled) {
    color: var(--cd-color-tabs-tab-line-text-hover);
  }
  .cd-tabs-tab:hover:not(.cd-tabs-tab-disabled) :global(.cd-icon):not(.cd-tabs-tab-icon-close) {
    color: var(--cd-color-tabs-tab-icon-hover);
  }
  .cd-tabs-tab:active:not(.cd-tabs-tab-disabled) {
    color: var(--cd-color-tabs-tab-line-text-active);
  }
  .cd-tabs-tab:active:not(.cd-tabs-tab-disabled) :global(.cd-icon):not(.cd-tabs-tab-icon-close) {
    color: var(--cd-color-tabs-tab-icon-active);
  }
  .cd-tabs-tab-active,
  .cd-tabs-tab-active:hover {
    cursor: default;
    font-weight: var(--cd-font-tabs-tab-active-fontweight);
    color: var(--cd-color-tabs-tab-line-selected-text-default);
  }
  .cd-tabs-tab-active :global(.cd-icon):not(.cd-tabs-tab-icon-close),
  .cd-tabs-tab-active:hover :global(.cd-icon):not(.cd-tabs-tab-icon-close) {
    color: var(--cd-color-tabs-tab-selected-icon-default);
  }
  .cd-tabs-tab-disabled {
    cursor: not-allowed;
    color: var(--cd-color-tabs-tab-line-disabled-text-default);
  }
  .cd-tabs-tab-disabled:hover {
    color: var(--cd-color-tabs-tab-line-disabled-text-default);
  }
  .cd-tabs-tab:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }

  /* ============================================================
     type=line 线条式（top 横向 / left 垂直）
     ============================================================ */
  .cd-tabs-tab-line.cd-tabs-tab-top {
    padding: var(--cd-spacing-tabs-bar-line-tab-paddingtop) var(--cd-spacing-tabs-bar-line-tab-paddingx)
      var(--cd-spacing-tabs-bar-line-tab-paddingbottom);
    border-block-end: var(--cd-width-tabs-bar-line-tab-border) solid transparent;
    transition: border-block-end-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs-tab-line.cd-tabs-tab-top.cd-tabs-tab-small {
    padding: var(--cd-spacing-tabs-bar-line-tab-small-paddingtop) var(--cd-spacing-tabs-bar-line-tab-paddingx)
      var(--cd-spacing-tabs-bar-line-tab-small-paddingbottom);
  }
  .cd-tabs-tab-line.cd-tabs-tab-top.cd-tabs-tab-medium {
    padding: var(--cd-spacing-tabs-bar-line-tab-medium-paddingtop) var(--cd-spacing-tabs-bar-line-tab-paddingx)
      var(--cd-spacing-tabs-bar-line-tab-medium-paddingbottom);
  }
  .cd-tabs-tab-line.cd-tabs-tab-top:hover {
    border-block-end-color: var(--cd-color-tabs-tab-line-border-hover);
  }
  .cd-tabs-tab-line.cd-tabs-tab-top:active {
    border-block-end-color: var(--cd-color-tabs-tab-line-border-active);
  }
  .cd-tabs-tab-line.cd-tabs-tab-top.cd-tabs-tab-active,
  .cd-tabs-tab-line.cd-tabs-tab-top.cd-tabs-tab-active:hover {
    border-block-end-color: var(--cd-color-tabs-tab-line-selected-indicator-default);
  }

  .cd-tabs-tab-line.cd-tabs-tab-left {
    padding: var(--cd-spacing-tabs-bar-line-tab-left-padding);
    border-inline-start: var(--cd-width-tabs-bar-line-tab-border) solid transparent;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs-tab-line.cd-tabs-tab-left.cd-tabs-tab-small {
    padding: var(--cd-spacing-tabs-bar-line-tab-left-small-padding);
  }
  .cd-tabs-tab-line.cd-tabs-tab-left.cd-tabs-tab-medium {
    padding: var(--cd-spacing-tabs-bar-line-tab-left-medium-padding);
  }
  .cd-tabs-tab-line.cd-tabs-tab-left:hover {
    border-inline-start-color: var(--cd-color-tabs-tab-line-border-hover);
    background-color: var(--cd-color-tabs-tab-line-vertical-bg-hover);
  }
  .cd-tabs-tab-line.cd-tabs-tab-left:active {
    border-inline-start-color: var(--cd-color-tabs-tab-line-border-active);
    background-color: var(--cd-color-tabs-tab-line-vertical-bg-active);
  }
  .cd-tabs-tab-line.cd-tabs-tab-left.cd-tabs-tab-active,
  .cd-tabs-tab-line.cd-tabs-tab-left.cd-tabs-tab-active:hover {
    border-inline-start-color: var(--cd-color-tabs-tab-line-selected-indicator-default);
    background-color: var(--cd-color-tabs-tab-line-vertical-selected-bg-default);
  }

  /* ============================================================
     type=card 卡片式
     ============================================================ */
  .cd-tabs-tab-card.cd-tabs-tab-top {
    border: var(--cd-width-tabs-bar-card-border) solid transparent;
    border-block-end: none;
    border-radius: var(--cd-radius-tabs-tab-card);
  }
  .cd-tabs-tab-card.cd-tabs-tab-top:hover {
    border-block-end: none;
  }
  .cd-tabs-tab-card.cd-tabs-tab-top.cd-tabs-tab-active,
  .cd-tabs-tab-card.cd-tabs-tab-top.cd-tabs-tab-active:hover {
    padding-block-end: var(--cd-spacing-tabs-bar-card-tab-active-paddingbottom);
    border: var(--cd-width-tabs-bar-card-border) solid var(--cd-color-tabs-tab-card-selected-indicator-default);
    border-block-end: var(--cd-width-tabs-bar-card-border) solid var(--cd-color-tabs-tab-card-selected-bg-default);
    background: transparent;
  }
  .cd-tabs-tab-card.cd-tabs-tab-left {
    border: var(--cd-width-tabs-bar-card-border) solid transparent;
    border-inline-end: none;
    border-radius: var(--cd-radius-tabs-tab-card-left);
  }
  .cd-tabs-tab-card.cd-tabs-tab-left:hover {
    border-inline-end: none;
  }
  .cd-tabs-tab-card.cd-tabs-tab-left.cd-tabs-tab-active {
    position: relative;
  }
  .cd-tabs-tab-card.cd-tabs-tab-left.cd-tabs-tab-active::after {
    content: '';
    position: absolute;
    inset-block: 0;
    inset-inline-end: -1px;
    inline-size: 1px;
    background: var(--cd-color-tabs-tab-card-selected-bg-default);
  }
  .cd-tabs-tab-card.cd-tabs-tab-left.cd-tabs-tab-active,
  .cd-tabs-tab-card.cd-tabs-tab-left.cd-tabs-tab-active:hover {
    border: var(--cd-width-tabs-bar-card-border) solid var(--cd-color-tabs-tab-card-selected-indicator-default);
    border-inline-end: none;
    background: transparent;
  }
  .cd-tabs-tab-card {
    padding: var(--cd-spacing-tabs-bar-card-tab-paddingy) var(--cd-spacing-tabs-bar-card-tab-paddingx);
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs-tab-card:hover {
    background: var(--cd-color-tabs-tab-card-bg-hover);
  }
  .cd-tabs-tab-card:active {
    background: var(--cd-color-tabs-tab-card-bg-active);
  }

  /* ============================================================
     type=button 分段按钮式
     ============================================================ */
  .cd-tabs-tab-button {
    padding: var(--cd-spacing-tabs-bar-button-tab-paddingy) var(--cd-spacing-tabs-bar-button-tab-paddingx);
    border-radius: var(--cd-radius-tabs-tab-button);
    color: var(--cd-color-tabs-tab-button-text-default);
    border: none;
    transition: background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs-tab-button:hover {
    border: none;
    background-color: var(--cd-color-tabs-tab-button-bg-hover);
  }
  .cd-tabs-tab-button:active {
    background-color: var(--cd-color-tabs-tab-button-bg-active);
  }
  .cd-tabs-tab-button.cd-tabs-tab-active,
  .cd-tabs-tab-button.cd-tabs-tab-active:hover {
    color: var(--cd-color-tabs-tab-button-selected-text-default);
    border: none;
    background-color: var(--cd-color-tabs-tab-button-selected-bg-default);
  }

  /* ============================================================
     type=slash 斜线式（仅横向；相邻标签间插对角线分割线）
     ============================================================ */
  .cd-tabs-tab-slash {
    padding: var(--cd-spacing-tabs-bar-slash-tab-paddingy) var(--cd-spacing-tabs-bar-slash-tab-paddingx);
  }
</style>
