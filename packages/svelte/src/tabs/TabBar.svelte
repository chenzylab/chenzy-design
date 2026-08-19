<!--
  TabBar — 标签栏容器，对齐 Semi packages/semi-ui/tabs/TabBar.tsx。
  三种渲染路径（对齐 Semi render()）：
  - effectiveCollapsible（collapsible=true，或 'auto' 且已检测到溢出）：
    renderCollapsedTab，复用本库 OverflowList（renderMode='scroll'）实现滚动折叠 +
    前/后箭头下拉，严格镜像 Semi OverflowList 算法（IntersectionObserver 判可见性）。
    'auto' 额外在 componentDidMount/list 变化时 checkOverflow（换行检测 + ResizeObserver）。
  - more（数字或对象）：renderWithMoreTrigger，末尾若干标签手动切片进「更多」Dropdown。
  - 都不满足：renderTabComponents，全量平铺 TabItem。
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import {
    IconChevronRight,
    IconChevronLeft,
    IconChevronDown,
  } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import { Dropdown } from '../dropdown/index.js';
  import { Button } from '../button/index.js';
  import { OverflowList } from '../overflow-list/index.js';
  import ResizeObserverComp from '../resize-observer/ResizeObserver.svelte';
  import TabItem from './TabItem.svelte';
  import type { TabBarProps, PlainTab, TabKey } from './interface.js';

  let {
    activeKey,
    className,
    collapsible = false,
    list,
    onTabClick,
    showRestInDropdown = true,
    size,
    style,
    tabBarExtraContent,
    tabPosition,
    type,
    deleteTabItem,
    onTabKeyDown,
    more,
    onVisibleTabsChange,
    visibleTabsStyle,
    arrowPosition = 'both',
    renderArrow,
    dropdownProps,
    tabId,
    panelId,
  }: TabBarProps = $props();

  const loc = useLocale();

  function isActive(key: TabKey): boolean {
    return key === activeKey;
  }

  // --- collapsible='auto' 换行检测（对齐 Semi isTabsWrapped + checkOverflow） ---
  let shouldCollapseAuto = $state(false);
  let tabBarEl = $state<HTMLElement | null>(null);
  let firstShowInViewport = true;

  function isTabsWrapped(el: HTMLElement): boolean {
    if (tabPosition === 'left') return false;
    const nodes = Array.from(el.querySelectorAll<HTMLElement>('.cd-tabs-tab'));
    if (nodes.length <= 1) return false;
    const firstTop = nodes[0]?.offsetTop;
    if (typeof firstTop !== 'number') return false;
    return nodes.some((n) => n.offsetTop !== firstTop);
  }

  function checkOverflow(): void {
    if (collapsible !== 'auto' || shouldCollapseAuto) return;
    const el = tabBarEl;
    if (!el) return;
    const hasOverflow = isTabsWrapped(el) || el.scrollWidth > el.clientWidth + 1;
    if (hasOverflow !== shouldCollapseAuto) shouldCollapseAuto = hasOverflow;
  }

  $effect(() => {
    if (collapsible !== 'auto') return;
    requestAnimationFrame(() => checkOverflow());
  });
  $effect(() => {
    void list.length;
    if (collapsible !== 'auto') return;
    untrack(() => checkOverflow());
  });

  const effectiveCollapsible = $derived(
    collapsible === 'auto' ? shouldCollapseAuto : Boolean(collapsible),
  );

  // --- 滚动到指定标签（对齐 Semi scrollTabItemIntoViewByKey / scrollActiveTabItemIntoView） ---
  function scrollTabItemIntoViewByKey(
    key: TabKey,
    logicalPosition: ScrollLogicalPosition = 'nearest',
    behavior: ScrollBehavior = 'smooth',
  ): void {
    // effectiveCollapsible（OverflowList scroll 模式）：data-scrollkey 挂在 OverflowList
    // 包裹层，非 .cd-tabs-tab 本身；否则（more/平铺模式）直接找 tab 按钮用其 id 定位。
    const el = effectiveCollapsible
      ? tabBarEl?.querySelector(`[data-scrollkey="${String(key)}"]`)
      : document.getElementById(tabId(key));
    el?.scrollIntoView({ behavior, block: logicalPosition, inline: logicalPosition });
  }

  function scrollActiveTabItemIntoView(logicalPosition?: ScrollLogicalPosition, behavior?: ScrollBehavior): void {
    if (activeKey === undefined) return;
    scrollTabItemIntoViewByKey(activeKey, logicalPosition, behavior);
  }

  let prevActiveKeyForScroll: TabKey | undefined;
  $effect(() => {
    const key = activeKey;
    if (!effectiveCollapsible) {
      prevActiveKeyForScroll = key;
      return;
    }
    if (prevActiveKeyForScroll !== undefined && prevActiveKeyForScroll !== key) {
      scrollActiveTabItemIntoView();
    }
    prevActiveKeyForScroll = key;
  });

  // --- renderTabItem（对齐 Semi renderTabItem） ---
  function handleItemClick(key: TabKey, e: MouseEvent): void {
    onTabClick(key, e);
  }

  // --- renderCollapsedTab：OverflowList renderMode='scroll' + 前/后箭头下拉 ---
  interface OverflowItem extends PlainTab {
    key: TabKey;
    active: boolean;
  }

  const overflowListItems = $derived<OverflowItem[]>(
    list.map((item) => ({ ...item, key: item.itemKey, active: isActive(item.itemKey) })),
  );

  function handleArrowClick(items: OverflowItem[], pos: 'start' | 'end'): void {
    const target = pos === 'start' ? items[items.length - 1] : items[0];
    if (!target) return;
    scrollTabItemIntoViewByKey(target.itemKey);
  }

  function handleVisibleStateChange(visibleState: Map<string, boolean>): void {
    if (firstShowInViewport) {
      const isShowInViewport = Array.from(visibleState.values()).some(Boolean);
      if (isShowInViewport) {
        scrollActiveTabItemIntoView('nearest', 'auto');
        firstShowInViewport = false;
      }
    }
    if (collapsible === 'auto') {
      const isShowInViewport = Array.from(visibleState.values()).some(Boolean);
      if (isShowInViewport) {
        const hasOverflow = Array.from(visibleState.values()).some((v) => !v);
        if (hasOverflow !== shouldCollapseAuto) shouldCollapseAuto = hasOverflow;
      }
    }
    const keyed = new Map<TabKey, boolean>();
    visibleState.forEach((v, k) => keyed.set(k, v));
    onVisibleTabsChange?.(Array.from(keyed.entries()).filter(([, v]) => v).map(([k]) => k));
  }

  function dropdownPositionFor(pos: 'start' | 'end'): 'bottomStart' | 'bottomEnd' {
    return pos === 'start' ? 'bottomStart' : 'bottomEnd';
  }
</script>

{#snippet arrowIconStart()}<IconChevronLeft />{/snippet}
{#snippet arrowIconEnd()}<IconChevronRight />{/snippet}

{#snippet arrowCollapse(items: OverflowItem[], pos: 'start' | 'end')}
  {@const disabled = items.length === 0}
  {@const custom = dropdownProps?.[pos] ?? {}}
  {@const iconSnippet = pos === 'start' ? arrowIconStart : arrowIconEnd}
  {@const arrowLabel = loc().t(pos === 'start' ? 'Tabs.scrollPrev' : 'Tabs.scrollNext')}
  {#if disabled}
    <div role="presentation" class="cd-tabs-bar-arrow cd-tabs-bar-arrow-{pos}">
      <Button disabled icon={iconSnippet} theme="borderless" aria-label={arrowLabel} />
    </div>
  {:else if showRestInDropdown}
    <div
      role="presentation"
      class="cd-tabs-bar-arrow cd-tabs-bar-arrow-{pos}"
      onclick={() => handleArrowClick(items, pos)}
    >
      <Dropdown
        className="cd-tabs-bar-dropdown"
        clickToHide
        trigger="hover"
        position={dropdownPositionFor(pos)}
        showTick
        disableFocusListener
        {...custom}
      >
        <Button disabled={false} icon={iconSnippet} theme="borderless" aria-label={arrowLabel} />
        {#snippet render()}
          <Dropdown.Menu>
            {#each items as panel (panel.itemKey)}
              <Dropdown.Item
                key={panel.itemKey}
                active={isActive(panel.itemKey)}
                onClick={(e: MouseEvent) => handleItemClick(panel.itemKey, e)}
              >
                {#if panel.icon}<span class="cd-tabs-bar-icon">{@render panel.icon()}</span>{/if}
                {panel.tab}
              </Dropdown.Item>
            {/each}
          </Dropdown.Menu>
        {/snippet}
      </Dropdown>
    </div>
  {:else}
    <div role="presentation" class="cd-tabs-bar-arrow cd-tabs-bar-arrow-{pos}" onclick={() => handleArrowClick(items, pos)}>
      <Button disabled={false} icon={iconSnippet} theme="borderless" aria-label={arrowLabel} />
    </div>
  {/if}
{/snippet}

{#snippet overflowEnds(items: OverflowItem[], pos: 'start' | 'end')}
  {#snippet defaultArrowNode()}
    {@render arrowCollapse(items, pos)}
  {/snippet}
  {#if renderArrow}
    {@render renderArrow({
      type: pos,
      items,
      onClick: () => handleArrowClick(items, pos),
      defaultNode: defaultArrowNode,
    })}
  {:else}
    {@render arrowCollapse(items, pos)}
  {/if}
{/snippet}

{#snippet tabItemSnippet(item: OverflowItem, _index: number)}
  <TabItem
    tab={item.tab}
    icon={item.icon}
    {size}
    {type}
    {tabPosition}
    selected={isActive(item.itemKey)}
    closable={item.closable}
    disabled={item.disabled}
    itemKey={item.itemKey}
    tabId={tabId(item.itemKey)}
    panelId={panelId(item.itemKey)}
    {onTabKeyDown}
    {deleteTabItem}
    onClick={handleItemClick}
    closeAriaLabel={loc().t('Tabs.closeTab', { tab: item.tab ?? '' })}
  />
{/snippet}

{#snippet moreTrigger()}
  <div class="cd-tabs-bar-more-trigger cd-tabs-bar-more-trigger-{type}">
    <div class="cd-tabs-bar-more-trigger-content">
      <div>{loc().t('Tabs.more')}</div>
      <IconChevronDown class="cd-tabs-bar-more-trigger-content-icon" />
    </div>
  </div>
{/snippet}

{#snippet barContent()}
  {@const classNames = [
    className ?? '',
    'cd-tabs-bar',
    type === 'line' ? 'cd-tabs-bar-line' : '',
    type === 'card' ? 'cd-tabs-bar-card' : '',
    type === 'button' ? 'cd-tabs-bar-button' : '',
    type === 'slash' ? 'cd-tabs-bar-slash' : '',
    `cd-tabs-bar-${tabPosition}`,
    effectiveCollapsible ? 'cd-tabs-bar-collapse' : '',
  ]
    .filter(Boolean)
    .join(' ')}
  <div
    role="tablist"
    aria-orientation={tabPosition === 'left' ? 'vertical' : 'horizontal'}
    class={classNames}
    {style}
    bind:this={tabBarEl}
  >
    {#if effectiveCollapsible}
      <OverflowList
        items={overflowListItems}
        renderMode="scroll"
        class="cd-tabs-bar-overflow-list"
        wrapperStyle={visibleTabsStyle ?? ''}
        itemKey={(item: OverflowItem) => item.key}
        onVisibleStateChange={handleVisibleStateChange}
        visibleItemRenderer={tabItemSnippet}
        overflowRenderer={overflowEnds}
        overflowRenderDirection={arrowPosition}
      />
    {:else if more !== undefined}
      {@const keepCount = (() => {
        if (typeof more === 'number') return list.length - Math.min(more, list.length);
        if (typeof more === 'object' && more !== null)
          return list.length - Math.min(more.count ?? 0, list.length);
        return list.length;
      })()}
      {#each list.slice(0, keepCount) as item, idx (item.itemKey)}
        {@render tabItemSnippet({ ...item, key: item.itemKey, active: isActive(item.itemKey) }, idx)}
      {/each}
      {@const overflowPanels = list.slice(keepCount)}
      {@const moreDropdownProps = typeof more === 'object' && more !== null ? (more.dropdownProps ?? {}) : {}}
      <Dropdown
        trigger="hover"
        showTick
        position="bottomStart"
        className="cd-tabs-bar-more-dropdown-{type}"
        clickToHide
        {...moreDropdownProps}
      >
        {#if typeof more === 'object' && more !== null && more.render}
          {@render more.render()}
        {:else}
          {@render moreTrigger()}
        {/if}
        {#snippet render()}
          <Dropdown.Menu>
            {#each overflowPanels as panel (panel.itemKey)}
              <Dropdown.Item
                key={panel.itemKey}
                active={isActive(panel.itemKey)}
                onClick={(e: MouseEvent) => handleItemClick(panel.itemKey, e)}
              >
                {#if panel.icon}<span class="cd-tabs-bar-icon">{@render panel.icon()}</span>{/if}
                {panel.tab}
              </Dropdown.Item>
            {/each}
          </Dropdown.Menu>
        {/snippet}
      </Dropdown>
    {:else}
      {#each list as item, idx (item.itemKey)}
        {@render tabItemSnippet({ ...item, key: item.itemKey, active: isActive(item.itemKey) }, idx)}
      {/each}
    {/if}

    {#if tabBarExtraContent}
      {@const extraCls = [
        'cd-tabs-bar-extra',
        `cd-tabs-bar-${type}-extra`,
        `cd-tabs-bar-${type}-extra-${size}`,
      ].join(' ')}
      <!-- float:right 内联样式（对齐 Semi TabBar.tsx renderExtra 的
           tabBarExtraContentDefaultStyle={float:'right'}）：与 .cd-tabs-tab 的 float:left
           同属一套浮动流，天然贴在标签末尾同行，不依赖父容器是否为 flex。 -->
      <div class={extraCls} style="float: right;">
        {@render tabBarExtraContent()}
      </div>
    {/if}
  </div>
{/snippet}

{#if collapsible === 'auto'}
  <ResizeObserverComp onResize={() => checkOverflow()}>
    {#snippet children()}{@render barContent()}{/snippet}
  </ResizeObserverComp>
{:else}
  {@render barContent()}
{/if}

<style>
  /* ============================================================
     标签栏容器基座（对齐 Semi tabs.scss .bar 段）
     ============================================================ */
  .cd-tabs-bar {
    position: relative;
    white-space: nowrap;
    outline: none;
  }
  .cd-tabs-bar-left {
    display: flex;
    flex-direction: column;
  }
  /* :global 必须——.cd-tabs-tab 是 float:left（对齐 Semi），任何容器只要含浮动的
     .cd-tabs-tab 子元素就必须清除浮动，否则高度塌陷成 0，后续兄弟内容会围绕上去
     （真实翻车：renderTabBar 场景下手写 class="cd-tabs-bar" 的自定义标签栏容器，
     不是 TabBar.svelte 组件实例，吃不到 scoped 的 ::after，导致 Tabs 内容区
     "跑到标签栏旁边"而非另起一行）。加 :global 后任何用了这个 class 名的元素
     （不论是不是本组件渲染出的）都能获得浮动清除，对齐 Semi 该规则本就是全局
     样式表的事实。 */
  :global(.cd-tabs-bar)::after {
    content: '';
    block-size: 0;
    display: block;
    clear: both;
  }

  /* ============================================================
     type=line：底部轨道线 + 首项去左内边距、相邻右外边距（top）/ 下外边距（left）
     ============================================================ */
  .cd-tabs-bar-line.cd-tabs-bar-top {
    border-block-end: var(--cd-width-tabs-bar-line-border) solid var(--cd-color-tabs-tab-line-border-default);
  }
  .cd-tabs-bar-line.cd-tabs-bar-top :global(.cd-tabs-tab:first-of-type) {
    padding-inline-start: 0;
  }
  .cd-tabs-bar-line.cd-tabs-bar-top :global(.cd-tabs-tab:not(:last-of-type)) {
    margin-inline-end: var(--cd-spacing-tabs-bar-line-tab-marginright);
  }
  .cd-tabs-bar-line.cd-tabs-bar-left {
    border-inline-end: var(--cd-width-tabs-bar-line-border) solid var(--cd-color-tabs-tab-line-border-default);
  }

  /* ============================================================
     type=card：容器底部长线（top）/ 右侧长线（left）+ 相邻外边距
     ============================================================ */
  .cd-tabs-bar-card.cd-tabs-bar-top {
    position: relative;
  }
  .cd-tabs-bar-card.cd-tabs-bar-top::before {
    content: '';
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    border-block-end: var(--cd-width-tabs-bar-card-border) solid var(--cd-color-tabs-tab-card-border-default);
  }
  .cd-tabs-bar-card.cd-tabs-bar-top :global(.cd-tabs-tab:not(:last-of-type)) {
    margin-inline-end: var(--cd-spacing-tabs-bar-card-tab-marginright);
  }
  .cd-tabs-bar-card.cd-tabs-bar-left {
    border-inline-end: var(--cd-width-tabs-bar-card-border) solid var(--cd-color-tabs-tab-line-border-default);
  }
  .cd-tabs-bar-card.cd-tabs-bar-left :global(.cd-tabs-tab:not(:last-of-type)) {
    margin-block-end: var(--cd-spacing-tabs-bar-card-tab-left-marginbottom);
  }

  /* ============================================================
     type=button：相邻外边距（top=右外边距 / left=下外边距）
     ============================================================ */
  .cd-tabs-bar-button {
    border: none;
  }
  .cd-tabs-bar-button.cd-tabs-bar-top :global(.cd-tabs-tab:not(:last-of-type)) {
    margin-inline-end: var(--cd-spacing-tabs-bar-button-tab-marginright);
  }
  .cd-tabs-bar-button.cd-tabs-bar-left :global(.cd-tabs-tab:not(:last-of-type)) {
    margin-block-end: var(--cd-spacing-tabs-bar-button-tab-marginbottom);
  }

  /* ============================================================
     type=slash：首项去左内边距 + 相邻对角线分割线（对齐 Semi tabs.scss .bar-slash）
     ============================================================ */
  .cd-tabs-bar-slash :global(.cd-tabs-tab:first-of-type) {
    padding-inline-start: 0;
  }
  .cd-tabs-bar-slash :global(.cd-tabs-tab:not(:last-of-type)) {
    margin-inline-end: var(--cd-spacing-tabs-bar-slash-marginright);
  }
  .cd-tabs-bar-slash :global(.cd-tabs-tab:not(:last-of-type)::after) {
    content: '';
    display: inline-block;
    margin-inline-start: var(--cd-spacing-tabs-bar-slash-line-marginleft);
    margin-block: var(--cd-spacing-tabs-bar-slash-line-marginy);
    inline-size: var(--cd-width-tabs-tab-slash-line);
    block-size: var(--cd-height-tabs-tab-slash-line);
    vertical-align: bottom;
    background: linear-gradient(
      to bottom right,
      transparent 0%,
      transparent calc(50% - 1px),
      var(--cd-color-tabs-tab-slash-line) 50%,
      transparent calc(50% + 1px),
      transparent 100%
    );
  }

  .cd-tabs-bar-collapse,
  .cd-tabs-bar-collapse :global(.cd-tabs-bar-overflow-list) {
    display: flex;
    align-items: center;
  }
  .cd-tabs-bar-collapse :global(.cd-overflow-list) {
    flex: 1;
    min-inline-size: 0;
  }
  .cd-tabs-bar-collapse :global(.cd-overflow-list-scroll-wrapper) {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .cd-tabs-bar-collapse :global(.cd-overflow-list-scroll-wrapper::-webkit-scrollbar) {
    display: none;
    inline-size: 0;
    block-size: 0;
  }
  .cd-tabs-bar-arrow-start {
    margin-inline-end: var(--cd-spacing-tabs-overflow-icon-marginright);
  }
  .cd-tabs-bar-arrow-end {
    margin-inline-start: var(--cd-spacing-tabs-overflow-icon-marginleft);
  }
  .cd-tabs-bar-dropdown {
    max-block-size: 300px;
    overflow-y: auto;
  }
  .cd-tabs-bar-more-trigger {
    display: inline-block;
    cursor: pointer;
    color: var(--cd-color-tabs-tab-line-text-default);
  }
  .cd-tabs-bar-more-trigger-content {
    display: flex;
    align-content: center;
  }
  .cd-tabs-bar-more-trigger-content :global(.cd-tabs-bar-more-trigger-content-icon) {
    margin-inline-start: var(--cd-spacing-tabs-overflow-icon-marginleft);
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  .cd-tabs-bar-more-trigger-line {
    padding: var(--cd-spacing-tabs-bar-line-tab-paddingtop) var(--cd-spacing-tabs-bar-line-tab-paddingx)
      var(--cd-spacing-tabs-bar-line-tab-paddingbottom);
  }
  .cd-tabs-bar-more-trigger-card {
    padding: var(--cd-spacing-tabs-bar-card-tab-paddingy) var(--cd-spacing-tabs-bar-card-tab-paddingx);
  }
  .cd-tabs-bar-more-trigger-button {
    padding: var(--cd-spacing-tabs-bar-button-tab-paddingy) var(--cd-spacing-tabs-bar-button-tab-paddingx);
  }
  .cd-tabs-bar-extra {
    padding: var(--cd-spacing-tabs-bar-extra-paddingy) var(--cd-spacing-tabs-bar-extra-paddingx);
  }
  .cd-tabs-bar-icon {
    display: inline-flex;
    align-items: center;
  }
</style>
