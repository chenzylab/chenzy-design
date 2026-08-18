<!--
  NavSubPopup — 浮层子导航（horizontal 顶部 / vertical 折叠态），对齐 Semi SubNav.tsx wrapDropdown()。
  复用本库 Dropdown：sub-title 作触发器（children），浮层内容为 <Dropdown.Menu> 包裹的子项
  （NavPopupNode 递归渲染，叶子=Dropdown.Item、子导航=嵌套 Dropdown）。
  DOM：div.cd-dropdown > div.cd-dropdown-content > ul.cd-dropdown-menu[role=menu] > li.cd-dropdown-item[role=menuitem]。
  方向：horizontal 顶层 bottomStart（Semi bottomLeft），其余 rightStart（Semi rightTop）。
  延迟：mouseEnterDelay=subNavOpenDelay / mouseLeaveDelay=subNavCloseDelay（trigger='hover'）。
  openKeys 受控时：trigger='custom' + visible=isOpen（对齐 Semi）。禁用时不包 Dropdown（无浮层）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getNavContext } from './context.js';
  import type { NavItemDef } from './types.js';
  import { normalizeNavItems } from './nav-foundation.js';
  import { Dropdown } from '../dropdown/index.js';
  import NavPopupNode from './NavPopupNode.svelte';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import { DEFAULT_TOOLTIP_HIDE_DELAY, DEFAULT_TOOLTIP_SHOW_DELAY } from './constants.js';

  interface Props {
    item: NavItemDef;
    level: number;
    /** 是否处于某个 SubNav 内部（决定浮层弹出方向）。 */
    inSubNav?: boolean;
    /** sub-title 内部内容（图标 + 文案 + toggle 箭头，由 NavItemRender 提供）。 */
    titleContent: Snippet;
  }

  let { item, inSubNav = false, titleContent }: Props = $props();

  const ctx = getNavContext()!;

  const selected = $derived(ctx.isSelected(item.itemKey));
  const itemDisabled = $derived(!!item.disabled);
  const open = $derived(ctx.isOpen(item.itemKey));
  const childItems = $derived(normalizeNavItems(item.items));

  // horizontal 顶层向下（bottomStart≈Semi bottomLeft），其余向右（rightStart≈Semi rightTop）。
  const position = $derived<'bottomStart' | 'rightStart'>(
    ctx.mode === 'horizontal' && !inSubNav ? 'bottomStart' : 'rightStart',
  );
</script>

<!-- sub-wrap 外层 li：承载 role=menuitem 的 sub-title（对齐 Semi Item.tsx li）。 -->
{#snippet subTitle()}
  <div
    class="cd-nav-sub-title"
    class:cd-nav-sub-title-selected={selected}
    class:cd-nav-sub-title-disabled={itemDisabled}
    role="menuitem"
    tabindex={itemDisabled ? -1 : 0}
    aria-expanded={open}
    aria-disabled={itemDisabled || undefined}
  >
    <div class="cd-nav-item-inner">{@render titleContent()}</div>
  </div>
{/snippet}

<!-- sub-wrap li 为 role=none（呈现性）：内部 div[role=menuitem] 由外层 role=menu 直接拥有。 -->
<li class="cd-nav-item cd-nav-item-sub cd-nav-sub-wrap" role="none" class:cd-nav-item-disabled={itemDisabled}>
  {#if itemDisabled}
    <!-- 折叠态禁用子导航：无 Dropdown 可弹出，用 Tooltip 提示文案（对齐 Semi isCollapsed && isSubNav && disabled）。 -->
    {#if ctx.collapsed}
      <Tooltip
        content={item.text}
        position="right"
        trigger="hover"
        triggerStyle="display: block; width: 100%;"
        mouseEnterDelay={item.tooltipShowDelay ?? ctx.tooltipShowDelay ?? DEFAULT_TOOLTIP_SHOW_DELAY}
        mouseLeaveDelay={item.tooltipHideDelay ?? ctx.tooltipHideDelay ?? DEFAULT_TOOLTIP_HIDE_DELAY}
      >
        {@render subTitle()}
      </Tooltip>
    {:else}
      {@render subTitle()}
    {/if}
  {:else}
    <Dropdown
      className="cd-navigation-popover"
      triggerStyle="display: block; width: 100%;"
      {position}
      trigger={ctx.openKeysIsControlled ? 'custom' : 'hover'}
      {...ctx.openKeysIsControlled ? { visible: open } : {}}
      mouseEnterDelay={ctx.subNavOpenDelay}
      mouseLeaveDelay={ctx.subNavCloseDelay}
      {...ctx.getPopupContainer ? { getPopupContainer: ctx.getPopupContainer } : {}}
      {...ctx.subDropdownProps ?? {}}
      {...item.dropdownProps ?? {}}
      {...item.dropdownStyle !== undefined ? { style: item.dropdownStyle } : {}}
    >
      {#snippet render()}
        <Dropdown.Menu>
          {#each childItems as child (child.itemKey)}
            <NavPopupNode item={child} />
          {/each}
        </Dropdown.Menu>
      {/snippet}
      {@render subTitle()}
    </Dropdown>
  {/if}
</li>

<style>
  /* 浮层子导航标题（折叠态 / 水平模式）盒模型，镜像 NavItemRender.svelte 的同名规则
     ——Svelte scoped CSS 不跨文件生效，此文件自身渲染 sub-wrap/sub-title/item-inner，
     故需在本文件重复声明（对齐 Semi navigation.scss，非本库自造）。 */
  .cd-nav-sub-wrap {
    display: block;
    padding: 0;
    margin-bottom: 0;
    border-radius: 0;
  }
  /* 折叠态禁用子导航 Tooltip 内层触发 span 无官方 style 口子，外层已用 triggerStyle 撑满
     （见 tooltip-trigger-wrapper-shrinks-use-triggerstyle 记忆）。 */
  :global(.cd-tooltip-trigger:has(> .cd-nav-sub-title)) {
    display: block;
    width: 100%;
  }
  .cd-nav-sub-title {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    cursor: pointer;
    width: 100%;
    height: var(--cd-height-navigation-item-base);
    border-radius: var(--cd-width-navigation-item-borderradius);
    padding: var(--cd-spacing-navigation-item-paddingy) var(--cd-spacing-navigation-item-paddingx);
    margin-bottom: var(--cd-spacing-navigation-sub-title-marginbottom);
    font-size: var(--cd-font-size-regular);
    font-weight: var(--cd-font-weight-bold);
    color: var(--cd-color-navigation-iteml1-text-default);
  }
  .cd-nav-item-inner {
    display: flex;
    align-items: center;
    width: 100%;
    flex: 0 0 auto;
  }

  .cd-nav-sub-title:hover:not(.cd-nav-sub-title-selected):not(.cd-nav-sub-title-disabled) {
    background: var(--cd-color-navigation-iteml1-bg-hover);
  }
  .cd-nav-sub-title:active:not(.cd-nav-sub-title-selected):not(.cd-nav-sub-title-disabled) {
    background: var(--cd-color-navigation-iteml1-bg-active);
  }
  .cd-nav-sub-title-selected {
    font-weight: var(--cd-font-weight-bold);
    color: var(--cd-color-navigation-iteml1-selected-text-default);
  }
  .cd-nav-sub-title-disabled {
    cursor: not-allowed;
    color: var(--cd-color-navigation-iteml1-disabled-text-default);
  }
  .cd-nav-sub-title:focus-visible {
    outline: var(--cd-width-navigation-outline) solid var(--cd-color-navigation-outline-focus);
    outline-offset: var(--cd-width-navigation-outlineoffset);
  }

  /* 折叠态：sub-title 内容居中，图标居中于图标轨（与 NavItemRender 叶子一致）。 */
  :global(.cd-nav-collapsed) .cd-nav-sub-title,
  :global(.cd-nav-collapsed) .cd-nav-sub-title .cd-nav-item-inner {
    justify-content: center;
  }

  /* 水平模式：一级项无背景、仅文字深浅区分选中（对齐 Semi horizontal）。 */
  :global(.cd-nav-horizontal) .cd-nav-sub-title {
    width: auto;
    margin-bottom: 0;
    color: var(--cd-color-navigation-horizontal-iteml1-text-default);
  }
</style>
