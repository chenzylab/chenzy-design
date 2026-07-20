<!--
  NavItemRender — Nav 导航项递归渲染（Nav 独立渲染核心，不依赖 Menu）。
  一个 NavItemDef 渲染为：
   - 叶子项：<li> 或含 link 时内含 <a>；点击选中。
   - 子导航（含 items）：
     · 内联模式（vertical 展开）：sub-title + 展开时内联渲染子 <ul>（motion 动画）。
     · 浮层模式（horizontal 或 vertical 折叠）：委托 NavSubPopup 弹出浮层。
  图标 / 文案 / toggle 箭头 / 多级缩进占位 / 选中 / 禁用 / a11y 均对齐 Semi navigation。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconChevronDown, IconChevronRight } from '@chenzy-design/icons';
  import { getNavContext } from './context.js';
  import { hasSubNav, normalizeNavItems, type NavItemDef } from './types.js';
  import NavSubPopup from './NavSubPopup.svelte';
  import Self from './NavItemRender.svelte';

  interface Props {
    item: NavItemDef;
    /** 嵌套层级（0 = 一级）。 */
    level: number;
    /** 是否处于某个 SubNav 内部（由父级 SubNav 递归下传，替代 context 里的 isInSubNav）。 */
    inSubNav?: boolean;
  }

  let { item, level, inSubNav = false }: Props = $props();

  const ctx = getNavContext()!;

  const isSub = $derived(hasSubNav(item));
  // 子项归一（string→对象），供内联/浮层递归渲染。
  const childItems = $derived(normalizeNavItems(item.items));
  const selected = $derived(ctx.isSelected(item.itemKey));
  const open = $derived(ctx.isOpen(item.itemKey));
  const itemDisabled = $derived(!!item.disabled);

  // 浮层模式：horizontal，或 vertical 折叠态。内联模式：vertical 展开态。
  const popupMode = $derived(ctx.mode === 'horizontal' || ctx.collapsed);

  // 多级缩进占位数量（对齐 Semi：limitIndent=false 且 vertical 展开时按层级补占位图标）。
  // 有图标且非 indent 时占位数 = level，否则 level - 1（对齐 Semi Item.tsx/SubNav.tsx iconAmount）。
  // 层级取显式 item.level（声明式手动传，对齐 Semi）优先，否则用递归下传的 level。
  const effectiveLevel = $derived(item.level ?? level);
  const placeholderCount = $derived.by(() => {
    if (ctx.limitIndent || ctx.collapsed || ctx.mode !== 'vertical') return 0;
    const n = item.icon && !item.indent ? effectiveLevel : effectiveLevel - 1;
    return n > 0 ? n : 0;
  });

  function onLeafClick(e: MouseEvent): void {
    if (itemDisabled) return;
    item.onClick?.({ itemKey: item.itemKey, domEvent: e, isOpen: false });
    ctx.selectLeaf(item, e);
  }

  function onSubTitleClick(e: MouseEvent): void {
    if (itemDisabled) return;
    ctx.toggleOpen(item, !open, e);
  }

  function onSubTitleKeydown(e: KeyboardEvent): void {
    if (itemDisabled) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
      if (!open) {
        e.preventDefault();
        ctx.toggleOpen(item, true, e);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ctx.toggleOpen(item, false, e);
      }
    } else if (e.key === 'ArrowLeft') {
      if (open) {
        e.preventDefault();
        ctx.toggleOpen(item, false, e);
      }
    }
  }
</script>

<!-- 缩进占位图标（多级缩进）：仅结构占位，无语义。 -->
{#snippet placeholders()}
  {#each { length: placeholderCount } as _, i (i)}
    <i class="cd-nav__item-icon cd-nav__item-icon-info" aria-hidden="true"></i>
  {/each}
{/snippet}

{#snippet toggleArrow()}
  <i
    class="cd-nav__item-icon cd-nav__item-icon-toggle-{ctx.toggleIconPosition}"
    class:cd-nav__icon-rotate-180={open && !popupMode}
    aria-hidden="true"
  >
    {#if ctx.expandIcon}
      {@render ctx.expandIcon()}
    {:else if popupMode && inSubNav}
      <!-- 浮层内嵌子导航：向右箭头（对齐 Semi IconChevronRight） -->
      <IconChevronRight size="small" aria-hidden="true" />
    {:else}
      <!-- 展开箭头：向下（内联/浮层顶层，对齐 Semi IconChevronDown）；open 内联态由外层 <i> rotate 180° -->
      <IconChevronDown size="small" aria-hidden="true" />
    {/if}
  </i>
{/snippet}

<!-- 叶子/子导航标题的内部内容（图标 + 文案 + toggle 箭头）。 -->
{#snippet innerContent(withToggle: boolean)}
  {@render placeholders()}
  {#if withToggle && ctx.toggleIconPosition === 'left'}{@render toggleArrow()}{/if}
  {#if item.icon}
    <i class="cd-nav__item-icon cd-nav__item-icon-info" aria-hidden="true">{@render item.icon()}</i>
  {:else if ctx.renderIcon && !withToggle}
    <!-- 数据驱动图标：叶子项未自带 icon 时用 Nav 级 renderIcon(item) 渲染（如按组件名取图标）。
         子导航标题（withToggle）无图标时不占图标位，对齐 Semi（Sub 标题文字与叶子图标左对齐）。 -->
    <i class="cd-nav__item-icon cd-nav__item-icon-info" aria-hidden="true">{@render ctx.renderIcon(item)}</i>
  {:else if item.indent || (inSubNav && !popupMode)}
    <!-- indent 或内联子导航项无图标：保留占位对齐（对齐 Semi icon||indent||isInSubNav 占位）。 -->
    <i class="cd-nav__item-icon cd-nav__item-icon-info" aria-hidden="true"></i>
  {/if}
  <span class="cd-nav__item-text">
    {#if typeof item.text === 'string'}{item.text}{:else}{@render item.text()}{/if}
  </span>
  {#if withToggle && ctx.toggleIconPosition === 'right'}{@render toggleArrow()}{/if}
{/snippet}

<!-- 叶子项内容：含 link 时包 <a>（Semi Item.tsx；叶子直挂内容，无 item-inner 包裹）。 -->
{#snippet leafInner()}
  {#if item.link !== undefined}
    <a
      class="cd-nav__item-link"
      href={itemDisabled ? undefined : item.link}
      aria-disabled={itemDisabled || undefined}
      tabindex="-1"
      {...item.linkOptions ?? {}}
    >
      {@render innerContent(false)}
    </a>
  {:else}
    {@render innerContent(false)}
  {/if}
{/snippet}

{#if isSub && popupMode}
  <!-- 浮层子导航（horizontal / 折叠）：委托 NavSubPopup。 -->
  <NavSubPopup {item} {level} {inSubNav}>
    {#snippet titleContent()}{@render innerContent(true)}{/snippet}
  </NavSubPopup>
{:else if isSub}
  <!-- 内联子导航（vertical 展开）。sub-title 用 role=menuitem（对齐 Semi SubNav.tsx:238）。 -->
  {#snippet subWrap()}
    <!-- sub-wrap li 为 role=none（呈现性）：内部 div[role=menuitem] 由外层 role=menu 直接拥有，
         避免 li 作为 menu 的非 menuitem 子元素破坏 aria-required-children。 -->
    <li class="cd-nav__item cd-nav__item-sub cd-nav__sub-wrap" role="none" class:cd-nav__item-disabled={itemDisabled}>
      <div
        class="cd-nav__sub-title"
        class:cd-nav__sub-title-selected={selected}
        class:cd-nav__sub-title-disabled={itemDisabled}
        role="menuitem"
        tabindex={itemDisabled ? -1 : 0}
        aria-expanded={open}
        aria-disabled={itemDisabled || undefined}
        onclick={onSubTitleClick}
        onkeydown={onSubTitleKeydown}
        onmouseenter={item.onMouseEnter}
        onmouseleave={item.onMouseLeave}
      >
        <div class="cd-nav__item-inner">{@render innerContent(true)}</div>
      </div>
      {#if open}
        <!-- 内联子菜单同样 role=menu，使嵌套 li[role=menuitem] 有合规 menu 父级。 -->
        <ul class="cd-nav__sub" role="menu" aria-orientation="vertical" class:cd-nav__sub--motion={ctx.subNavMotion}>
          {#each childItems as child (child.itemKey)}
            <Self item={child} level={level + 1} inSubNav={true} />
          {/each}
        </ul>
      {/if}
    </li>
  {/snippet}
  {#if ctx.renderWrapper}
    {@render ctx.renderWrapper({ item, isSubNav: true, isInSubNav: inSubNav, props: item, children: subWrap })}
  {:else}
    {@render subWrap()}
  {/if}
{:else}
  <!-- 叶子项：li[role=menuitem]（对齐 Semi Item.tsx:283-286，选中靠 -selected class，无 aria-current）。
       含 link 时走原生链接键序；无 link 时以 tabindex + Enter/Space 支持键盘激活。 -->
  {#snippet leaf()}
    <li
      class="cd-nav__item cd-nav__item-normal"
      class:cd-nav__item-selected={selected}
      class:cd-nav__item-disabled={itemDisabled}
      class:cd-nav__item-has-link={item.link !== undefined}
      role="menuitem"
      tabindex={itemDisabled ? -1 : 0}
      aria-disabled={itemDisabled || undefined}
      onclick={onLeafClick}
      onkeydown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && item.link === undefined) {
          e.preventDefault();
          onLeafClick(e as unknown as MouseEvent);
        }
      }}
      onmouseenter={item.onMouseEnter}
      onmouseleave={item.onMouseLeave}
    >
      {@render leafInner()}
    </li>
  {/snippet}
  {#if ctx.renderWrapper}
    {@render ctx.renderWrapper({ item, isSubNav: false, isInSubNav: inSubNav, props: item, children: leaf })}
  {:else}
    {@render leaf()}
  {/if}
{/if}

<style>
  /* 导航项 / 子导航标题公共盒模型。对齐 Semi navigation.scss。 */
  .cd-nav__item,
  .cd-nav__sub-title {
    box-sizing: border-box;
    display: flex;
    cursor: pointer;
    inline-size: 100%;
    border-radius: var(--cd-width-navigation-item-borderradius);
    padding: var(--cd-spacing-navigation-item-paddingy) var(--cd-spacing-navigation-item-paddingx);
    margin-block-end: var(--cd-spacing-navigation-item-marginbottom);
    font-size: var(--cd-font-size-regular);
    color: var(--cd-color-navigation-iteml1-text-default);
    /* 背景切换无动画（对齐 Semi $transition_duration-navigation_itemL1-bg = transition_duration-none）。 */
  }
  /* sub-wrap 是承载子导航的 li：本身不作交互盒，内部 sub-title 才是。 */
  .cd-nav__sub-wrap {
    display: block;
    padding: 0;
    margin-block-end: 0;
    border-radius: 0;
  }
  .cd-nav__sub-title {
    align-items: center;
    block-size: var(--cd-height-navigation-item-base);
    margin-block-end: var(--cd-spacing-navigation-item-marginbottom);
    font-weight: var(--cd-font-weight-bold);
  }

  .cd-nav__item-inner {
    display: flex;
    align-items: center;
    inline-size: 100%;
    flex: 0 0 auto;
  }
  .cd-nav__item-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: opacity var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }

  /* 含 link 时 padding 移到 <a> 上，使整行可点。 */
  .cd-nav__item-has-link {
    padding: 0;
  }
  .cd-nav__item-link {
    display: flex;
    inline-size: 100%;
    align-items: center;
    color: inherit;
    text-decoration: none;
    padding: var(--cd-spacing-navigation-item-paddingy) var(--cd-spacing-navigation-item-paddingx);
  }

  /* 图标：信息图标（左） / toggle 箭头（左右）。 */
  .cd-nav__item-icon-info {
    display: inline-flex;
    align-items: center;
    color: var(--cd-color-navigation-iteml1-icon-default);
    margin-inline-end: var(--cd-width-navigation-icon-text-between);
    min-inline-size: var(--cd-width-navigation-icon-left-minwidth);
  }
  .cd-nav__item-icon-toggle-left {
    display: inline-flex;
    align-items: center;
    color: var(--cd-color-navigation-iteml1-icon-default);
    margin-inline-end: var(--cd-width-navigation-icon-text-between);
  }
  .cd-nav__item-icon-toggle-right {
    display: inline-flex;
    align-items: center;
    color: var(--cd-color-navigation-iteml1-icon-default);
    margin-inline-start: auto;
  }
  .cd-nav__icon-rotate-180 {
    transition: transform var(--cd-motion-duration-mid) var(--cd-motion-ease-standard);
    transform: rotate(-180deg);
  }

  /* hover / active（非选中、非禁用）。 */
  .cd-nav__item-normal:hover:not(.cd-nav__item-selected):not(.cd-nav__item-disabled),
  .cd-nav__sub-title:hover:not(.cd-nav__sub-title-selected):not(.cd-nav__sub-title-disabled) {
    background: var(--cd-color-navigation-iteml1-bg-hover);
  }
  .cd-nav__item-normal:active:not(.cd-nav__item-selected):not(.cd-nav__item-disabled),
  .cd-nav__sub-title:active:not(.cd-nav__sub-title-selected):not(.cd-nav__sub-title-disabled) {
    background: var(--cd-color-navigation-iteml1-bg-active);
  }

  /* 选中态：一级项浅蓝底 + 图标品牌色；sub-title 选中仅文字加粗深色。 */
  .cd-nav__item-selected {
    background: var(--cd-color-navigation-iteml1-selected-bg-default);
    color: var(--cd-color-navigation-iteml1-selected-text-default);
  }
  .cd-nav__item-selected .cd-nav__item-icon-info {
    color: var(--cd-color-navigation-iteml1-selected-icon-default);
  }
  .cd-nav__sub-title-selected {
    font-weight: var(--cd-font-weight-bold);
    color: var(--cd-color-navigation-iteml1-selected-text-default);
  }

  /* 禁用态。 */
  .cd-nav__item-disabled,
  .cd-nav__sub-title-disabled {
    cursor: not-allowed;
    color: var(--cd-color-navigation-iteml1-disabled-text-default);
  }
  .cd-nav__item-disabled .cd-nav__item-icon-info,
  .cd-nav__sub-title-disabled .cd-nav__item-icon-info {
    color: var(--cd-color-navigation-iteml1-disabled-text-default);
  }

  /* 选中 + 禁用复合态（对齐 Semi $color-navigation_itemL1_selected_disabled-*）。 */
  .cd-nav__item-selected.cd-nav__item-disabled {
    background: var(--cd-color-navigation-iteml1-selected-disabled-bg-default);
    color: var(--cd-color-navigation-iteml1-selected-disabled-text-default);
  }
  .cd-nav__item-selected.cd-nav__item-disabled .cd-nav__item-icon-info {
    color: var(--cd-color-navigation-iteml1-selected-disabled-icon-default);
  }

  /* 焦点可见描边（对齐 Semi outline）。 */
  .cd-nav__item:focus-visible,
  .cd-nav__sub-title:focus-visible {
    outline: var(--cd-width-navigation-outline) solid var(--cd-color-navigation-outline-focus);
    outline-offset: var(--cd-width-navigation-outlineoffset);
  }

  /* 内联子导航列表。 */
  .cd-nav__sub {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* 子级项无图标时文字左缩进补偿，与有图标项对齐（对齐 Semi `-sub .-item-text:first-child` margin-left
     = $spacing-base-tight + $width-navigation_icon_left + $width-navigation_icon_text_between）。 */
  .cd-nav__sub .cd-nav__item-text:first-child {
    margin-inline-start: calc(
      var(--cd-spacing-base-tight) + var(--cd-width-navigation-icon-left) +
        var(--cd-width-navigation-icon-text-between)
    );
  }
  .cd-nav__sub--motion {
    animation: cd-nav-sub-in var(--cd-motion-duration-fast) var(--cd-motion-ease-standard) both;
  }
  @keyframes cd-nav-sub-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-nav__sub--motion {
      animation: none;
    }
    .cd-nav__icon-rotate-180 {
      transition: none;
    }
  }

  /* 折叠态：隐藏文案与 toggle 箭头，仅留信息图标。
     用 display:none 而非 opacity+width:0——文案 span 是 inline，inline-size 对其无效，
     残留宽度会把居中的图标挤偏。 */
  :global(.cd-nav--collapsed) .cd-nav__item-text,
  :global(.cd-nav--collapsed) .cd-nav__item-icon-toggle-right,
  :global(.cd-nav--collapsed) .cd-nav__item-icon-toggle-left {
    display: none;
  }
  /* 折叠态：item 内容水平居中，图标 margin 归零 → 选中/hover 块填满图标轨、图标居中。
     叶子 li 直挂内容（无 item-inner），故 li 自身居中；sub-title 内 item-inner 亦居中。 */
  :global(.cd-nav--collapsed) .cd-nav__item-normal,
  :global(.cd-nav--collapsed) .cd-nav__item-link,
  :global(.cd-nav--collapsed) .cd-nav__item-inner {
    justify-content: center;
  }
  :global(.cd-nav--collapsed) .cd-nav__item-icon-info {
    margin-inline-end: 0;
    min-inline-size: 0;
  }

  /* 水平模式：一级项无背景、仅文字深浅区分选中（对齐 Semi horizontal）。 */
  :global(.cd-nav--horizontal) .cd-nav__item,
  :global(.cd-nav--horizontal) .cd-nav__sub-title {
    inline-size: auto;
    margin-block-end: 0;
    margin-inline-end: var(--cd-spacing-navigation-item-paddingx);
    color: var(--cd-color-navigation-horizontal-iteml1-text-default);
  }
  :global(.cd-nav--horizontal) .cd-nav__item-normal:hover:not(.cd-nav__item-selected) {
    background: transparent;
    color: var(--cd-color-navigation-horizontal-iteml1-text-hover);
  }
  :global(.cd-nav--horizontal) .cd-nav__item-selected {
    background: transparent;
    color: var(--cd-color-navigation-horizontal-iteml1-selected-text-default);
  }
  :global(.cd-nav--horizontal) .cd-nav__item-selected .cd-nav__item-icon-info {
    color: var(--cd-color-navigation-horizontal-iteml1-selected-text-default);
  }
</style>
