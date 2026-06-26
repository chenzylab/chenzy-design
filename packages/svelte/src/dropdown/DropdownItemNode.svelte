<!--
  DropdownItemNode — 单个 Dropdown 菜单项（递归）。
  叶子: 普通 menuitem; SubMenu: title + hover/聚焦 弹出浮层 (use:floating, rightStart→溢出翻转 leftStart)。
  divider: role=separator 水平线; group: 不可聚焦组标题 + 其下始终展开子项。
  浮层内继续递归本组件，形成多层嵌套子菜单。
  hover 意图: 进入 title 延迟开、离开 title 与浮层组延迟关；指针移入浮层取消关闭计时，避免缝隙抖动。
  键盘: →/Enter/Space 进入子菜单首项, ←/Esc 返回/关闭本级 (红线 #3: 定时器/floating 命令式 + cleanup)。
-->
<script lang="ts">
  import { tick, getContext } from 'svelte';
  import { floating } from '../_floating/use-floating.js';
  import {
    isDropdownDivider,
    isDropdownGroup,
    hasDropdownChildren,
  } from './types.js';
  import { DROPDOWN_CTX, type DropdownContext } from './context.js';
  import type { DropdownItem, DropdownItemNode, DropdownKey } from './types.js';
  import Self from './DropdownItemNode.svelte';

  interface Props {
    item: DropdownItem;
    /** 选中叶子项回调（向上传到 Dropdown 顶层处理 onSelect/closeOnSelect） */
    onSelectLeaf: (key: DropdownKey) => void;
    /** 选中叶子后自顶向下逐级关闭所有子浮层 */
    onCloseAll: () => void;
    openDelay?: number;
    closeDelay?: number;
  }

  let {
    item,
    onSelectLeaf,
    onCloseAll,
    openDelay = 100,
    closeDelay = 200,
  }: Props = $props();

  // 子菜单浮层挂同顶层容器（getPopupContainer，经 Dropdown context 透传）；
  // showTick 控制叶子项是否显示勾选标记。
  const ddCtx = getContext<DropdownContext | undefined>(DROPDOWN_CTX);
  const showTick = $derived(ddCtx?.showTick ?? false);

  // 分隔符/分组在模板顶层单独处理；此处窄化为普通项节点供派生使用。
  const node = $derived(item as DropdownItemNode);
  const hasChildren = $derived(hasDropdownChildren(node));

  let titleEl = $state<HTMLButtonElement | null>(null);
  let subEl = $state<HTMLUListElement | null>(null);
  let open = $state(false);

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
    if (node.disabled || !hasChildren) return;
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
    if (node.disabled) return;
    onSelectLeaf(node.key);
    onCloseAll();
  }

  // → / Enter / Space：展开子菜单并把焦点移入首个可聚焦子项。
  async function openAndFocusFirst() {
    if (!hasChildren || node.disabled) return;
    open = true;
    await tick();
    const first = subEl?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])');
    first?.focus();
  }

  function onTitleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowRight':
      case 'Enter':
      case ' ':
        e.preventDefault();
        void openAndFocusFirst();
        break;
      case 'ArrowLeft':
      case 'Escape':
        if (open) {
          e.preventDefault();
          // 仅关闭本级子浮层并把焦点收回标题（← 逐层返回）。
          e.stopPropagation();
          closeNow();
          titleEl?.focus();
        }
        break;
      default:
        break;
    }
  }

  // 子浮层内按 ←/Esc：关本级、焦点回父标题（逐层返回）。
  function onSubKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closeNow();
      titleEl?.focus();
    }
  }

  // 卸载兜底清理定时器。
  $effect(() => clearTimers);
</script>

{#if isDropdownDivider(item)}
  <li class="cd-dropdown__divider" role="separator"></li>
{:else if isDropdownGroup(item)}
  <li class="cd-dropdown__group" role="none">
    <div class="cd-dropdown__group-title">{item.label}</div>
    <ul class="cd-dropdown__group-list" role="group" aria-label={item.label}>
      {#each item.children as child, i (isDropdownDivider(child) || isDropdownGroup(child) ? `__cd-dd-grp-${i}` : child.key)}
        <Self item={child} {onSelectLeaf} {onCloseAll} {openDelay} {closeDelay} />
      {/each}
    </ul>
  </li>
{:else if hasChildren}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <li
    class="cd-dropdown__item-wrap cd-dropdown__item-wrap--submenu"
    role="none"
    onpointerenter={scheduleOpen}
    onpointerleave={scheduleClose}
  >
    <button
      type="button"
      class="cd-dropdown__item cd-dropdown__item--submenu"
      class:cd-dropdown__item--danger={node.danger}
      role="menuitem"
      tabindex="-1"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-disabled={node.disabled || undefined}
      disabled={node.disabled || undefined}
      bind:this={titleEl}
      onclick={() => void openAndFocusFirst()}
      onkeydown={onTitleKeydown}
    >
      <span class="cd-dropdown__label">{node.label}</span>
      <span class="cd-dropdown__arrow" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="10" height="10" focusable="false">
          <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
        </svg>
      </span>
    </button>

    {#if open && titleEl}
      <ul
        class="cd-dropdown__sub"
        role="menu"
        tabindex="-1"
        bind:this={subEl}
        use:floating={{ trigger: titleEl, placement: 'rightStart', offset: 2, autoAdjust: true, getContainer: ddCtx?.getContainer }}
        onpointerenter={keepOpen}
        onpointerleave={scheduleClose}
        onkeydown={onSubKeydown}
      >
        {#each node.children ?? [] as child, i (isDropdownDivider(child) || isDropdownGroup(child) ? `__cd-dd-sub-${i}` : child.key)}
          <Self
            item={child}
            {onSelectLeaf}
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
  <li class="cd-dropdown__item-wrap" role="none">
    <button
      type="button"
      class="cd-dropdown__item"
      class:cd-dropdown__item--danger={node.danger}
      class:cd-dropdown__item--selected={node.selected}
      role={showTick ? 'menuitemcheckbox' : 'menuitem'}
      tabindex="-1"
      aria-checked={showTick ? (node.selected ?? false) : undefined}
      aria-disabled={node.disabled || undefined}
      disabled={node.disabled || undefined}
      onclick={onLeafClick}
    >
      <span class="cd-dropdown__label">{node.label}</span>
      {#if showTick}
        <span class="cd-dropdown__tick" aria-hidden="true">
          {#if node.selected}
            <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
              <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M2.5 8.5l4 4 7-8" />
            </svg>
          {/if}
        </span>
      {/if}
    </button>
  </li>
{/if}

<style>
  .cd-dropdown__item-wrap,
  .cd-dropdown__group {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-dropdown__item-wrap--submenu {
    position: relative;
  }
  /* 分隔符：水平细线，不可交互 */
  .cd-dropdown__divider {
    block-size: 1px;
    margin-block: var(--cd-spacing-1);
    background: var(--cd-color-border);
  }
  /* 分组：始终展开的分区标题 + 组内项 */
  .cd-dropdown__group-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-dropdown__group-title {
    display: flex;
    align-items: center;
    padding: var(--cd-dropdown-item-padding);
    color: var(--cd-dropdown-item-color-disabled);
    font-size: var(--cd-font-size-1);
    cursor: default;
    user-select: none;
  }
  .cd-dropdown__item {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    inline-size: 100%;
    margin: 0;
    padding: var(--cd-dropdown-item-padding);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .cd-dropdown__item:hover,
  .cd-dropdown__item:focus-visible {
    background: var(--cd-dropdown-item-bg-hover);
  }
  .cd-dropdown__item:focus-visible {
    outline: none;
  }
  .cd-dropdown__item--submenu[aria-expanded='true'] {
    background: var(--cd-dropdown-item-bg-hover);
  }
  .cd-dropdown__item--danger {
    color: var(--cd-color-danger);
  }
  .cd-dropdown__item--danger:hover,
  .cd-dropdown__item--danger:focus-visible {
    background: var(--cd-color-danger-light-default, var(--cd-dropdown-item-bg-hover));
  }
  .cd-dropdown__item[aria-disabled='true'] {
    color: var(--cd-dropdown-item-color-disabled);
    cursor: not-allowed;
  }
  .cd-dropdown__label {
    flex: 1 1 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /* showTick：勾选标记占位区，保证宽度一致（有/无标记时均保留空间） */
  .cd-dropdown__tick {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    inline-size: 14px;
    block-size: 14px;
    color: var(--cd-color-primary, #165dff);
  }
  .cd-dropdown__item--selected {
    color: var(--cd-color-primary, #165dff);
  }
  .cd-dropdown__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-color-text-2);
  }
  /* hover/聚焦 弹出的子菜单浮层：独立卡片，portal 到 body 由 floating 定位 */
  .cd-dropdown__sub {
    margin: 0;
    padding: 0;
    list-style: none;
    z-index: var(--cd-dropdown-z);
    min-inline-size: var(--cd-dropdown-min-width);
    padding-block: var(--cd-spacing-1);
    background: var(--cd-dropdown-bg);
    border-radius: var(--cd-dropdown-radius);
    box-shadow: var(--cd-dropdown-shadow);
  }
</style>
