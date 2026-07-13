<!--
  MenuPopupNode — vertical 模式下的单个菜单项（递归）。
  叶子: 普通 menuitem; SubMenu: title + hover 弹出浮层 (use:floating, rightStart)。
  浮层内继续递归 MenuPopupNode，形成多级 hover 子菜单。
  hover 意图: 进入 title 延迟开、离开 title 与浮层组延迟关 (closeDelay)，
  指针移入浮层时取消关闭计时，避免 title→浮层 缝隙抖动。
  定时器/floating 均命令式管理 + cleanup (红线 #3)。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { floating } from '../_floating/use-floating.js';
  import type { Placement } from '@chenzy-design/core';
  import { isDivider, isGroup } from './types.js';
  import type { MenuItemDef, MenuItemNode, MenuKey } from './types.js';
  import Self from './MenuPopupNode.svelte';
  import { Tooltip } from '../tooltip/index.js';
  import type { Position as TooltipPosition } from '../tooltip/placement.js';

  interface TooltipProps {
    content?: string;
    position?: TooltipPosition;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
  }

  interface Props {
    item: MenuItemDef;
    /** 顶层节点用 bottomStart 弹出向下，嵌套层用 rightStart 向右 */
    placement: Placement;
    isSelected: (key: MenuKey) => boolean;
    onSelectLeaf: (item: MenuItemNode) => void;
    /** 选中叶子后自顶向下逐级关闭浮层 */
    onCloseAll: () => void;
    openDelay?: number;
    closeDelay?: number;
    /** 折叠图标轨：仅本节点（顶层）隐藏文字 label、只显图标，浮层内子项不受影响 */
    collapsed?: boolean;
    /** 多选模式：选中叶子显勾选标记并用 aria-checked/menuitemcheckbox 语义 */
    multiple?: boolean;
    /** navigation 用途：含 href 叶子渲染原生 <a href>，结构去除 menu/menuitem role（原生链接语义） */
    navigation?: boolean;
    /** 浮层子菜单触发方式：'hover'（默认）随悬停开合 / 'click' 点击 title 切换 */
    trigger?: 'hover' | 'click';
    /** 浮层子菜单挂载容器（透传 floating action getContainer） */
    getPopupContainer?: (() => HTMLElement | null | undefined) | undefined;
    /** 整体禁用（来自父 Menu disabled）：叠加单项 disabled */
    parentDisabled?: boolean;
    /** 浮层隐藏时是否卸载内容 DOM（默认 false：保留 DOM 仅隐藏，重显不重建） */
    destroyOnHide?: boolean;
    /**
     * 折叠模式下顶层项的 Tooltip 配置。content 默认为项 label；
     * position→placement、theme、mouseEnterDelay、mouseLeaveDelay 透传给 Tooltip。
     */
    tooltipProps?: TooltipProps;
    /**
     * 自定义每个叶子项内容的包裹 Snippet，接收 { item, children }。
     * children 为默认的 <a> 或 <button> 内容 snippet。
     */
    renderWrapper?: Snippet<[{ item: MenuItemNode; children: Snippet }]>;
  }

  let {
    item,
    placement,
    isSelected,
    onSelectLeaf,
    onCloseAll,
    openDelay = 100,
    closeDelay = 200,
    collapsed = false,
    multiple = false,
    navigation = false,
    trigger = 'hover',
    getPopupContainer,
    parentDisabled = false,
    destroyOnHide = false,
    tooltipProps,
    renderWrapper,
  }: Props = $props();

  // 分隔符/分组在模板顶层单独处理；此处统一窄化为普通项节点供后续派生使用。
  const node = $derived(item as MenuItemNode);
  // 折叠态无图标时取 label 首字符兜底显示，保证轨上仍有可视标识。
  const firstChar = $derived([...(node.label ?? '')][0] ?? '');

  const hasChildren = $derived(!!node.children && node.children.length > 0);
  // 整体 disabled（parentDisabled）叠加单项 disabled。
  const itemDisabled = $derived(parentDisabled || !!node.disabled);

  // 折叠 Tooltip 的可选透传项：exactOptionalPropertyTypes 下不能把 undefined 显式传给
  // 值域不含 undefined 的可选 prop，故仅在有值时纳入（content/placement 始终有兜底另传）。
  const tooltipPass = $derived({
    content: tooltipProps?.content ?? node.label,
    position: tooltipProps?.position ?? 'right',
    ...(tooltipProps?.mouseEnterDelay !== undefined
      ? { mouseEnterDelay: tooltipProps.mouseEnterDelay }
      : {}),
    ...(tooltipProps?.mouseLeaveDelay !== undefined
      ? { mouseLeaveDelay: tooltipProps.mouseLeaveDelay }
      : {}),
  });

  let titleEl = $state<HTMLButtonElement | null>(null);
  let open = $state(false);

  // destroyOnHide=false（默认）时浮层首开后保留 DOM 仅隐藏；true 时随 open 卸载/重建。
  let hasOpened = $state(false);
  $effect(() => {
    if (open) hasOpened = true;
  });
  // 浮层是否渲染：destroyOnHide=true 仅 open 时渲染；false 时首开后持续渲染（隐藏由 class 控制）。
  const shouldRenderSub = $derived(
    !!titleEl && (destroyOnHide ? open : open || hasOpened),
  );

  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  function clearTimers() {
    if (openTimer !== undefined) {
      clearTimeout(openTimer);
      openTimer = undefined;
    }
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  }

  function scheduleOpen() {
    if (trigger !== 'hover' || itemDisabled || !hasChildren) return;
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
    if (open) return;
    openTimer = setTimeout(() => {
      open = true;
      openTimer = undefined;
    }, openDelay);
  }

  function scheduleClose() {
    if (trigger !== 'hover') return;
    if (openTimer !== undefined) {
      clearTimeout(openTimer);
      openTimer = undefined;
    }
    if (!open) return;
    closeTimer = setTimeout(() => {
      open = false;
      closeTimer = undefined;
    }, closeDelay);
  }

  // 指针移入浮层 → 取消关闭计时，保持打开。
  function keepOpen() {
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  }

  function closeNow() {
    clearTimers();
    open = false;
  }

  function onLeafClick() {
    if (itemDisabled) return;
    onSelectLeaf(node);
    onCloseAll();
  }

  // click 触发模式：点击 title 切换浮层开合（hover 模式下点击不接管）。
  function onTitleClick() {
    if (trigger !== 'click' || itemDisabled || !hasChildren) return;
    open = !open;
  }

  // 卸载兜底清理定时器。
  $effect(() => clearTimers);
</script>

{#if isDivider(item)}
  <li class="cd-menu__divider" role={navigation ? undefined : 'separator'}></li>
{:else if isGroup(item)}
  <li class="cd-menu__item cd-menu__item--group" role={navigation ? undefined : 'none'}>
    {#if !collapsed}
      <div class="cd-menu__group-title">{item.label}</div>
    {/if}
    <ul class="cd-menu__group-list" role={navigation ? undefined : 'group'} aria-label={item.label}>
      {#each item.children as child, i (child.key ?? `__cd-menu-grp-${i}`)}
        <Self
          item={child}
          {placement}
          {collapsed}
          {isSelected}
          {multiple}
          {navigation}
          {trigger}
          {getPopupContainer}
          {parentDisabled}
          {destroyOnHide}
          {...(tooltipProps !== undefined ? { tooltipProps } : {})}
          {...(renderWrapper !== undefined ? { renderWrapper } : {})}
          {onSelectLeaf}
          {onCloseAll}
          {openDelay}
          {closeDelay}
        />
      {/each}
    </ul>
  </li>
{:else if hasChildren}
  <li
    class="cd-menu__item cd-menu__item--submenu"
    role={navigation ? undefined : 'none'}
    onpointerenter={scheduleOpen}
    onpointerleave={scheduleClose}
  >
    {#snippet titleButton()}
      <button
        type="button"
        class="cd-menu__title"
        class:cd-menu__title--collapsed={collapsed}
        role={navigation ? undefined : 'menuitem'}
        aria-haspopup="true"
        aria-expanded={open}
        aria-disabled={itemDisabled || undefined}
        aria-label={collapsed ? node.label : undefined}
        disabled={itemDisabled || undefined}
        bind:this={titleEl}
        onclick={onTitleClick}
        onkeydown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (hasChildren && !itemDisabled) open = true;
          } else if (e.key === 'ArrowLeft' || e.key === 'Escape') {
            closeNow();
          }
        }}
      >
        {#if node.icon}<span class="cd-menu__icon" aria-hidden="true">{@render node.icon()}</span>{:else if collapsed}<span class="cd-menu__icon cd-menu__icon--char" aria-hidden="true">{firstChar}</span>{/if}
        {#if !collapsed}<span class="cd-menu__label">{node.label}</span>
        <span class="cd-menu__arrow cd-menu__arrow--popup" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="10" height="10" focusable="false">
            <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
          </svg>
        </span>{/if}
      </button>
    {/snippet}
    {#if collapsed}
      <Tooltip {...tooltipPass}>
        {@render titleButton()}
      </Tooltip>
    {:else}
      {@render titleButton()}
    {/if}

    {#if shouldRenderSub}
      <ul
        class="cd-menu__sub cd-menu__sub--popup"
        class:cd-menu__sub--hidden={!open}
        role={navigation ? undefined : 'menu'}
        aria-hidden={!open || undefined}
        use:floating={{ trigger: titleEl, placement, offset: 2, autoAdjust: true, getContainer: getPopupContainer, open }}
        onpointerenter={keepOpen}
        onpointerleave={scheduleClose}
      >
        {#each node.children ?? [] as child, i (child.key ?? `__cd-menu-sub-${i}`)}
          <Self
            item={child}
            placement="rightStart"
            {isSelected}
            {multiple}
            {navigation}
            {trigger}
            {getPopupContainer}
            {destroyOnHide}
            parentDisabled={parentDisabled}
            {onSelectLeaf}
            {...(renderWrapper !== undefined ? { renderWrapper } : {})}
            onCloseAll={() => {
              closeNow();
              onCloseAll();
            }}
            {openDelay}
            {closeDelay}
          />
        {/each}
      </ul>
    {/if}
  </li>
{:else}
  {@const selected = isSelected(node.key)}
  <li class="cd-menu__item" role={navigation ? undefined : 'none'}>
    {#if navigation && node.href !== undefined}
      <!-- navigation 用途：含 href 叶子渲染原生 <a>，原生链接 + Tab 键序 -->
      {#snippet leafLink()}
        <a
          class="cd-menu__link"
          class:cd-menu__link--selected={selected}
          class:cd-menu__link--collapsed={collapsed}
          href={itemDisabled ? undefined : node.href}
          target={node.target}
          rel={node.rel}
          aria-current={selected ? 'page' : undefined}
          aria-disabled={itemDisabled || undefined}
          aria-label={collapsed ? node.label : undefined}
          onclick={onLeafClick}
        >
          {#if node.icon}<span class="cd-menu__icon" aria-hidden="true">{@render node.icon()}</span>{:else if collapsed}<span class="cd-menu__icon cd-menu__icon--char" aria-hidden="true">{firstChar}</span>{/if}
          {#if !collapsed}<span class="cd-menu__label">{node.label}</span>{/if}
        </a>
      {/snippet}
      {#if collapsed}
        <Tooltip {...tooltipPass}>
          {#if renderWrapper}
            {@render renderWrapper({ item: node, children: leafLink })}
          {:else}
            {@render leafLink()}
          {/if}
        </Tooltip>
      {:else if renderWrapper}
        {@render renderWrapper({ item: node, children: leafLink })}
      {:else}
        {@render leafLink()}
      {/if}
    {:else}
      {#snippet leafButton()}
        <button
          type="button"
          class="cd-menu__link"
          class:cd-menu__link--selected={selected}
          class:cd-menu__link--collapsed={collapsed}
          role={navigation ? undefined : multiple ? 'menuitemcheckbox' : 'menuitem'}
          aria-current={!navigation && !multiple && selected ? 'true' : undefined}
          aria-checked={!navigation && multiple ? selected : undefined}
          aria-disabled={itemDisabled || undefined}
          aria-label={collapsed ? node.label : undefined}
          disabled={itemDisabled || undefined}
          onclick={onLeafClick}
        >
          {#if node.icon}<span class="cd-menu__icon" aria-hidden="true">{@render node.icon()}</span>{:else if collapsed}<span class="cd-menu__icon cd-menu__icon--char" aria-hidden="true">{firstChar}</span>{/if}
          {#if !collapsed}<span class="cd-menu__label">{node.label}</span>{/if}
          {#if multiple && !collapsed && !navigation}
            <span class="cd-menu__check" class:cd-menu__check--on={selected} aria-hidden="true">
              <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
                <path fill="none" stroke="currentColor" stroke-width="2" d="M3 8.5l3.5 3.5L13 5" />
              </svg>
            </span>
          {/if}
        </button>
      {/snippet}
      {#if collapsed}
        <Tooltip {...tooltipPass}>
          {#if renderWrapper}
            {@render renderWrapper({ item: node, children: leafButton })}
          {:else}
            {@render leafButton()}
          {/if}
        </Tooltip>
      {:else if renderWrapper}
        {@render renderWrapper({ item: node, children: leafButton })}
      {:else}
        {@render leafButton()}
      {/if}
    {/if}
  </li>
{/if}

<style>
  .cd-menu__item {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* 分隔符：水平细线，不可交互 */
  .cd-menu__divider {
    block-size: 1px;
    margin-block: var(--cd-spacing-extra-tight);
    background: var(--cd-menu-border-color);
  }
  /* 分组：始终展开的分区标题 + 组内项 */
  .cd-menu__group-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-menu__group-title {
    display: flex;
    align-items: center;
    block-size: var(--cd-menu-item-height);
    padding-inline: var(--cd-menu-item-padding);
    color: var(--cd-menu-item-color-disabled);
    font-size: var(--cd-font-size-small);
    cursor: default;
    user-select: none;
  }
  .cd-menu__link,
  .cd-menu__title {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    inline-size: 100%;
    block-size: var(--cd-menu-item-height);
    padding-inline: var(--cd-menu-item-padding);
    border: none;
    background: transparent;
    color: var(--cd-menu-item-color);
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition: background var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  /* navigation 叶子用 <a> 渲染：抹平默认下划线/颜色，复用 link 视觉 */
  a.cd-menu__link {
    text-decoration: none;
  }
  a.cd-menu__link[aria-disabled='true'] {
    color: var(--cd-menu-item-color-disabled);
    cursor: not-allowed;
    pointer-events: none;
  }
  .cd-menu__link:hover,
  .cd-menu__title:hover {
    background: var(--cd-menu-item-bg-hover);
  }
  .cd-menu__link:focus-visible,
  .cd-menu__title:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  /* 对齐 Semi：选中态深色文字 + 蓝底块，无左侧指示条 */
  .cd-menu__link--selected {
    position: relative;
    color: var(--cd-menu-item-color-selected);
    background: var(--cd-menu-item-bg-selected);
  }
  .cd-menu__link--selected :global(.cd-menu__icon) {
    color: var(--cd-menu-item-icon-color-selected);
  }
  .cd-menu__link[aria-disabled='true'],
  .cd-menu__title[aria-disabled='true'] {
    color: var(--cd-menu-item-color-disabled);
    cursor: not-allowed;
  }
  .cd-menu__label {
    flex: 1 1 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-menu__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 1rem;
    block-size: 1rem;
    color: var(--cd-menu-item-color);
  }
  .cd-menu__icon--char {
    font-weight: 600;
  }
  /* 折叠图标轨：顶层项只显图标、居中、无文字与箭头 */
  .cd-menu__title--collapsed,
  .cd-menu__link--collapsed {
    justify-content: center;
    gap: 0;
    padding-inline: 0;
  }
  /* 折叠态项被 Tooltip 包裹，其触发器默认 inline-block 会收缩到图标宽度，
     导致选中背景/点击区只有 16px。强制 Tooltip 链路撑满 li 宽度，
     使图标居中、选中背景填满整条图标轨。 */
  .cd-menu__item :global(.cd-tooltip),
  .cd-menu__item :global(.cd-tooltip__trigger) {
    display: block;
    inline-size: 100%;
  }
  .cd-menu__check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 1rem;
    block-size: 1rem;
    color: var(--cd-menu-item-icon-color-selected);
    opacity: 0;
  }
  .cd-menu__check--on {
    opacity: 1;
  }
  .cd-menu__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-menu-submenu-arrow-color);
  }
  /* hover 浮层子菜单：脱离内联缩进，独立卡片 */
  .cd-menu__sub--popup {
    margin: 0;
    padding: 0;
    list-style: none;
    min-inline-size: 8rem;
    padding-block: var(--cd-spacing-extra-tight);
    background: var(--cd-menu-bg);
    border-radius: var(--cd-select-dropdown-radius, var(--cd-border-radius-medium));
    box-shadow: var(--cd-select-dropdown-shadow, var(--cd-shadow-elevated));
    z-index: var(--cd-select-dropdown-z, 1050);
  }
  /* destroyOnHide=false 隐藏浮层时保留 DOM 但不可见、不可交互、不占位 */
  .cd-menu__sub--hidden {
    display: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-menu__link,
    .cd-menu__title {
      transition: none;
    }
  }
</style>
