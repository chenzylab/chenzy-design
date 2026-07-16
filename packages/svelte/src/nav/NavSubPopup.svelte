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
  import { normalizeNavItems, type NavItemDef } from './types.js';
  import { Dropdown } from '../dropdown/index.js';
  import NavPopupNode from './NavPopupNode.svelte';

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
    class="cd-nav__sub-title"
    class:cd-nav__sub-title-selected={selected}
    class:cd-nav__sub-title-disabled={itemDisabled}
    role="menuitem"
    tabindex={itemDisabled ? -1 : 0}
    aria-expanded={open}
    aria-disabled={itemDisabled || undefined}
  >
    <div class="cd-nav__item-inner">{@render titleContent()}</div>
  </div>
{/snippet}

<!-- sub-wrap li 为 role=none（呈现性）：内部 div[role=menuitem] 由外层 role=menu 直接拥有。 -->
<li class="cd-nav__item cd-nav__item-sub cd-nav__sub-wrap" role="none" class:cd-nav__item-disabled={itemDisabled}>
  {#if itemDisabled}
    {@render subTitle()}
  {:else}
    <Dropdown
      className="cd-navigation-popover"
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
  /* 折叠态：sub-title 内容居中，图标居中于图标轨（与 NavItemRender 叶子一致）。 */
  :global(.cd-nav--collapsed) .cd-nav__sub-title .cd-nav__item-inner {
    justify-content: center;
  }
</style>
