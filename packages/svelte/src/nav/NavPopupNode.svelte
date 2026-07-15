<!--
  NavPopupNode — 浮层子导航内的单个节点（对齐 Semi Item.tsx 的 Dropdown.Item 分支
  与 SubNav.tsx 的嵌套 wrapDropdown）。

  在浮层（horizontal 顶层 dropdown 或 collapsed dropdown）内部：
   - 叶子项 → <Dropdown.Item active={selected} disabled onClick>，DOM 为 li.cd-dropdown-item[role=menuitem]。
   - 含 items 的子导航 → 嵌套 <Dropdown>（触发器为一个 Dropdown.Item 作 sub-title），render 内递归本组件。
  嵌套浮层方向为 rightStart（对齐 Semi rightTop）。
-->
<script lang="ts">
  import { getNavContext } from './context.js';
  import { hasSubNav, type NavItemDef } from './types.js';
  import { Dropdown } from '../dropdown/index.js';
  import { IconChevronRight } from '@chenzy-design/icons';
  import Self from './NavPopupNode.svelte';

  interface Props {
    item: NavItemDef;
  }

  let { item }: Props = $props();

  const ctx = getNavContext()!;

  const isSub = $derived(hasSubNav(item));
  const selected = $derived(ctx.isSelected(item.itemKey));
  const itemDisabled = $derived(ctx.disabled || !!item.disabled);
  const open = $derived(ctx.isOpen(item.itemKey));

  function onLeafClick(e: MouseEvent): void {
    if (itemDisabled) return;
    item.onClick?.({ itemKey: item.itemKey, domEvent: e, isOpen: false });
    ctx.selectLeaf(item, e);
  }
</script>

{#snippet textNode()}
  {#if typeof item.text === 'string'}{item.text}{:else}{@render item.text()}{/if}
{/snippet}

{#snippet iconNode()}
  {#if item.icon}
    <i class="cd-nav__item-icon cd-nav__item-icon-info" aria-hidden="true">{@render item.icon()}</i>
  {/if}
{/snippet}

{#if isSub}
  <!-- 嵌套子导航：Dropdown.Item 作触发器，render 内递归。方向向右（rightStart）。 -->
  <Dropdown
    className="cd-navigation-popover"
    position="rightStart"
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
        {#each item.items ?? [] as child (child.itemKey)}
          <Self item={child} />
        {/each}
      </Dropdown.Menu>
    {/snippet}
    <Dropdown.Item
      class="cd-nav__item-sub"
      active={selected}
      disabled={itemDisabled}
    >
      {@render iconNode()}
      <span class="cd-nav__item-text">{@render textNode()}</span>
      <i class="cd-nav__item-icon cd-nav__item-icon-toggle-right" aria-hidden="true">
        <IconChevronRight size="default" />
      </i>
    </Dropdown.Item>
  </Dropdown>
{:else}
  <Dropdown.Item
    active={selected}
    disabled={itemDisabled}
    onClick={onLeafClick}
    {...item.onMouseEnter ? { onMouseEnter: item.onMouseEnter } : {}}
    {...item.onMouseLeave ? { onMouseLeave: item.onMouseLeave } : {}}
  >
    {@render iconNode()}
    <span class="cd-nav__item-text">{@render textNode()}</span>
  </Dropdown.Item>
{/if}

<style>
  /* 浮层内项：图标 + 文案排布（Dropdown.Item 已是 flex + align-items:center）。 */
  .cd-nav__item-icon-info {
    display: inline-flex;
    align-items: center;
    color: var(--cd-color-navigation-iteml1-icon-default);
    margin-inline-end: var(--cd-width-navigation-icon-text-between);
    min-inline-size: var(--cd-width-navigation-icon-left-minwidth);
  }
  .cd-nav__item-icon-toggle-right {
    display: inline-flex;
    align-items: center;
    margin-inline-start: auto;
    padding-inline-start: var(--cd-width-navigation-icon-text-between);
    color: var(--cd-color-navigation-iteml1-icon-default);
  }
  .cd-nav__item-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /* 浮层选中项字重回退为 normal（对齐 Semi $font-navigation_popover_nav_item_selected-fontWeight）。 */
  :global(.cd-navigation-popover .cd-dropdown-item.cd-dropdown-item-active) {
    font-weight: var(--cd-font-navigation-popover-nav-item-selected-fontweight);
  }
</style>
