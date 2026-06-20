<!--
  Tabs — see specs/components/navigation/Tabs.spec.md
  基础子集：line/card 类型、top 位置、数据驱动 tabList + 声明式 TabPane、
  roving tabindex + 键盘、closable。
  溢出滚动：标签超出容器主轴时显示前/后滚动箭头（top/bottom 横向 scrollLeft、
  left/right 纵向 scrollTop），激活标签自动滚到可视区；几何测量 + ResizeObserver +
  滚动操作全部命令式 + cleanup（红线 #3）。addable：末尾「+」按钮触发 onAdd（红线 #1 受控）。
  TODO(延后): overflow dropdown 收纳、button 类型、renderTabBar、纯声明式自动收集标签。

  约束：声明式 TabPane 仅提供「内容」，标签栏始终由 tabList 数据驱动；
  使用声明式 TabPane 时同样需传 tabList 定义标签（避免挂载时写响应式数组 → render 期读取
  造成 effect_update_depth_exceeded 死循环，见红线 #2）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { setTabsContext } from './context.js';
  import { useLocale } from '../locale-provider/index.js';
  import type { TabItem } from './types.js';

  type TabKey = string | number;
  type TabType = 'line' | 'card';
  type TabSize = 'small' | 'default' | 'large';
  type TabPosition = 'top' | 'bottom' | 'left' | 'right';
  type KeyboardActivation = 'auto' | 'manual';

  interface Props {
    value?: TabKey;
    defaultValue?: TabKey;
    type?: TabType;
    size?: TabSize;
    tabPosition?: TabPosition;
    tabList?: TabItem[];
    closable?: boolean;
    keyboardActivation?: KeyboardActivation;
    /** 首次激活后才挂载面板内容 */
    lazy?: boolean;
    /** 激活过的面板切走后保留 DOM（display:none），而非卸载 */
    keepDOM?: boolean;
    /** 标签栏末尾显示「+」按钮，点击触发 onAdd（受控数据，由父组件追加） */
    addable?: boolean;
    onChange?: (key: TabKey) => void;
    onTabClose?: (key: TabKey) => void;
    /** addable=true 时点击「+」按钮回调（红线 #1：组件内部不改 tabList） */
    onAdd?: () => void;
    children?: Snippet;
  }

  let {
    value,
    defaultValue,
    type = 'line',
    size = 'default',
    tabPosition = 'top',
    tabList = [],
    closable = false,
    keyboardActivation = 'auto',
    lazy = false,
    keepDOM = false,
    addable = false,
    onChange,
    onTabClose,
    onAdd,
    children,
  }: Props = $props();

  const baseId = useId('cd-tabs');
  const loc = useLocale();

  // top/bottom 为横向滚动（主轴 = inline / scrollLeft）；left/right 为纵向（scrollTop）。
  const isVertical = $derived(tabPosition === 'left' || tabPosition === 'right');

  // --- 受控 value (红线 #1)：不无条件回写 value，仅 onChange ---
  const isControlled = $derived(value !== undefined);
  let inner = $state<TabKey | undefined>(getInitialValue());

  function getInitialValue(): TabKey | undefined {
    if (defaultValue !== undefined) return defaultValue;
    return tabList[0]?.itemKey;
  }

  const activeKey = $derived<TabKey | undefined>(isControlled ? value : inner);

  function setActive(key: TabKey) {
    if (key === activeKey) return;
    if (!isControlled) inner = key;
    onChange?.(key);
  }

  // 声明式 TabPane 通过 context 读取激活 key 决定显隐（红线 #2：getter，非数组注册）。
  // lazy/keepDOM 也经 context 暴露给 TabPane 决定挂载/保留策略。
  setTabsContext({
    getActiveKey: () => activeKey,
    getLazy: () => lazy,
    getKeepDOM: () => keepDOM,
  });

  function tabId(key: TabKey): string {
    return `${baseId}-tab-${key}`;
  }
  function panelId(key: TabKey): string {
    return `${baseId}-panel-${key}`;
  }

  function isClosable(item: TabItem): boolean {
    return item.closable ?? closable;
  }

  function onTabClick(item: TabItem) {
    if (item.disabled) return;
    setActive(item.itemKey);
  }

  function closeTab(e: MouseEvent, item: TabItem) {
    e.stopPropagation();
    if (item.disabled) return;
    onTabClose?.(item.itemKey);
  }

  // --- 键盘导航 (红线 #2)：roving tabindex 仅由 activeKey 决定，不读挂载数组 ---
  // tablist 内移动焦点到相邻未禁用 tab；auto 聚焦即激活，manual 需 Enter/Space。
  function enabledIndexes(): number[] {
    const out: number[] = [];
    for (let i = 0; i < tabList.length; i += 1) {
      if (!tabList[i]?.disabled) out.push(i);
    }
    return out;
  }

  function focusTab(index: number) {
    const item = tabList[index];
    if (!item) return;
    const el = document.getElementById(tabId(item.itemKey));
    el?.focus();
    if (keyboardActivation === 'auto') setActive(item.itemKey);
  }

  function onTabKeydown(e: KeyboardEvent, item: TabItem) {
    const enabled = enabledIndexes();
    if (enabled.length === 0) return;
    const currentIdx = enabled.indexOf(tabList.indexOf(item));
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        const next = enabled[(currentIdx + 1) % enabled.length];
        if (next !== undefined) focusTab(next);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        const prev = enabled[(currentIdx - 1 + enabled.length) % enabled.length];
        if (prev !== undefined) focusTab(prev);
        break;
      }
      case 'Home': {
        e.preventDefault();
        const first = enabled[0];
        if (first !== undefined) focusTab(first);
        break;
      }
      case 'End': {
        e.preventDefault();
        const lastIdx = enabled[enabled.length - 1];
        if (lastIdx !== undefined) focusTab(lastIdx);
        break;
      }
      case 'Enter':
      case ' ': {
        if (keyboardActivation === 'manual') {
          e.preventDefault();
          setActive(item.itemKey);
        }
        break;
      }
      default:
        break;
    }
  }

  // --- 溢出滚动 (红线 #3)：几何测量/ResizeObserver/滚动操作全部命令式 + cleanup ---
  // navEl = 滚动视口（overflow:hidden，scrollLeft/scrollTop 在其上）；listEl = 内部 role=tablist。
  // 横向比 scrollWidth>clientWidth，纵向比 scrollHeight>clientHeight 判断是否溢出。
  let navEl = $state<HTMLElement | null>(null);
  let listEl = $state<HTMLElement | null>(null);

  // 几何 $state（红线 #2）：仅由命令式 measure() 写入，render 期只读，
  // 绝不在 render/$derived 里读 DOM 几何。
  let overflowing = $state(false); // 是否溢出（决定箭头是否渲染）
  let canScrollPrev = $state(false); // 前向箭头可用态
  let canScrollNext = $state(false); // 后向箭头可用态

  // 普通（非响应式）变量：rAF 句柄。
  let rafId = 0;

  // 每次滚动按钮点击的滚动步长（视口主轴尺寸的 ~80%）。
  const SCROLL_RATIO = 0.8;

  /** 命令式测量：读视口几何 → 写 overflowing / canScrollPrev / canScrollNext $state。 */
  function measure(): void {
    const nav = navEl;
    if (!nav) return;
    let viewport: number;
    let scrollSize: number;
    let scrollPos: number;
    if (isVertical) {
      viewport = nav.clientHeight;
      scrollSize = nav.scrollHeight;
      scrollPos = nav.scrollTop;
    } else {
      viewport = nav.clientWidth;
      scrollSize = nav.scrollWidth;
      scrollPos = nav.scrollLeft;
    }
    // 1px 容差，避免亚像素抖动。
    const over = scrollSize - viewport > 1;
    const prev = over && scrollPos > 1;
    const next = over && scrollPos < scrollSize - viewport - 1;
    if (over !== overflowing) overflowing = over;
    if (prev !== canScrollPrev) canScrollPrev = prev;
    if (next !== canScrollNext) canScrollNext = next;
  }

  function scheduleMeasure(): void {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      measure();
    });
  }

  /** 命令式滚动一步（dir=-1 前 / 1 后）。 */
  function scrollByStep(dir: -1 | 1): void {
    const nav = navEl;
    if (!nav) return;
    if (isVertical) {
      const step = nav.clientHeight * SCROLL_RATIO * dir;
      nav.scrollTo({ top: nav.scrollTop + step, behavior: 'smooth' });
    } else {
      const step = nav.clientWidth * SCROLL_RATIO * dir;
      nav.scrollTo({ left: nav.scrollLeft + step, behavior: 'smooth' });
    }
    // 滚动后箭头可用态由 scroll 事件回调更新。
  }

  /** 把激活标签命令式滚动到可视区（若不在视口内）。 */
  function scrollActiveIntoView(): void {
    const nav = navEl;
    if (!nav || activeKey === undefined) return;
    const el = document.getElementById(tabId(activeKey));
    if (!el) return;
    if (isVertical) {
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      const viewTop = nav.scrollTop;
      const viewBottom = viewTop + nav.clientHeight;
      if (top < viewTop) nav.scrollTo({ top, behavior: 'smooth' });
      else if (bottom > viewBottom)
        nav.scrollTo({ top: bottom - nav.clientHeight, behavior: 'smooth' });
    } else {
      const left = el.offsetLeft;
      const right = left + el.offsetWidth;
      const viewLeft = nav.scrollLeft;
      const viewRight = viewLeft + nav.clientWidth;
      if (left < viewLeft) nav.scrollTo({ left, behavior: 'smooth' });
      else if (right > viewRight)
        nav.scrollTo({ left: right - nav.clientWidth, behavior: 'smooth' });
    }
  }

  // ResizeObserver：命令式创建 + observe(navEl) + observe(listEl)，
  // 视口或内容尺寸变 → rAF 合批 measure；nav 滚动事件直接 measure。
  // 不依赖 overflowing/canScroll* $state，故 measure 写它们不会重跑此 effect（零循环）。
  $effect(() => {
    const nav = navEl;
    const list = listEl;
    if (!nav) return;
    measure();
    const ro = new ResizeObserver(() => scheduleMeasure());
    ro.observe(nav);
    if (list) ro.observe(list);
    const onScroll = (): void => measure();
    nav.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      ro.disconnect();
      nav.removeEventListener('scroll', onScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
  });

  // tabList 内容变化重测（仅依赖 tabList.length，不依赖几何 $state）。
  $effect(() => {
    void tabList.length;
    scheduleMeasure();
  });

  // 激活 key 变化时把激活标签滚到可视区（仅依赖 activeKey）。
  $effect(() => {
    void activeKey;
    requestAnimationFrame(() => scrollActiveIntoView());
  });

  const cls = $derived(
    [
      'cd-tabs',
      `cd-tabs--${type}`,
      `cd-tabs--${size}`,
      `cd-tabs--${tabPosition}`,
      overflowing ? 'cd-tabs--scrollable' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls}>
  <div class="cd-tabs__bar">
    {#if overflowing}
      <button
        type="button"
        class="cd-tabs__scroll-btn cd-tabs__scroll-btn--prev"
        aria-label={loc().t('Tabs.scrollPrev')}
        disabled={!canScrollPrev}
        tabindex="-1"
        onclick={() => scrollByStep(-1)}
      >
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M10.5 3.2 5.7 8l4.8 4.8 1.1-1.1L7.9 8l3.7-3.7-1.1-1.1Z" />
        </svg>
      </button>
    {/if}

    <div class="cd-tabs__nav" bind:this={navEl}>
      <div class="cd-tabs__list" role="tablist" bind:this={listEl}>
        {#each tabList as item (item.itemKey)}
          {@const selected = item.itemKey === activeKey}
          <div
            class="cd-tabs__tab"
            class:cd-tabs__tab--active={selected}
            class:cd-tabs__tab--disabled={item.disabled}
          >
            <button
              type="button"
              class="cd-tabs__tab-btn"
              role="tab"
              id={tabId(item.itemKey)}
              aria-selected={selected}
              aria-controls={panelId(item.itemKey)}
              tabindex={selected ? 0 : -1}
              disabled={item.disabled ?? false}
              onclick={() => onTabClick(item)}
              onkeydown={(e) => onTabKeydown(e, item)}
            >
              {item.tab}
            </button>
            {#if isClosable(item)}
              <button
                type="button"
                class="cd-tabs__close"
                aria-label={`关闭 ${item.tab}`}
                tabindex={selected ? 0 : -1}
                onclick={(e) => closeTab(e, item)}
              >
                <svg
                  viewBox="0 0 16 16"
                  width="10"
                  height="10"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fill="currentColor"
                    d="M9.1 8l3.2-3.2-1.1-1.1L8 6.9 4.8 3.7 3.7 4.8 6.9 8l-3.2 3.2 1.1 1.1L8 9.1l3.2 3.2 1.1-1.1L9.1 8Z"
                  />
                </svg>
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    {#if overflowing}
      <button
        type="button"
        class="cd-tabs__scroll-btn cd-tabs__scroll-btn--next"
        aria-label={loc().t('Tabs.scrollNext')}
        disabled={!canScrollNext}
        tabindex="-1"
        onclick={() => scrollByStep(1)}
      >
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M5.5 3.2 10.3 8l-4.8 4.8-1.1-1.1L8.1 8 4.4 4.3l1.1-1.1Z" />
        </svg>
      </button>
    {/if}

    {#if addable}
      <button
        type="button"
        class="cd-tabs__add"
        aria-label={loc().t('Tabs.add')}
        onclick={() => onAdd?.()}
      >
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M8.8 7.2V2.5H7.2v4.7H2.5v1.6h4.7v4.7h1.6V8.8h4.7V7.2H8.8Z" />
        </svg>
      </button>
    {/if}
  </div>

  {#if children}
    <div class="cd-tabs__content">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .cd-tabs {
    display: flex;
    flex-direction: column;
    font-size: var(--cd-tabs-tab-font-size);
  }
  .cd-tabs__bar {
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }
  .cd-tabs--line .cd-tabs__bar {
    border-block-end: 1px solid var(--cd-tabs-bar-border);
  }

  /* 滚动视口：裁剪溢出，主轴可滚动；隐藏原生滚动条（滚动由箭头驱动）。 */
  .cd-tabs__nav {
    flex: 1 1 auto;
    min-inline-size: 0;
    overflow: hidden;
  }
  .cd-tabs__list {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
  }

  /* 滚动箭头 + 新增按钮：不收缩，垂直居中对齐标签栏。 */
  .cd-tabs__scroll-btn,
  .cd-tabs__add {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--cd-spacing-1);
    border: none;
    background: transparent;
    color: var(--cd-tabs-tab-color);
    cursor: pointer;
    transition: color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs__scroll-btn:hover:not(:disabled),
  .cd-tabs__add:hover {
    color: var(--cd-tabs-tab-color-active);
  }
  .cd-tabs__scroll-btn:disabled {
    color: var(--cd-tabs-tab-color-disabled);
    cursor: not-allowed;
  }
  .cd-tabs__scroll-btn:focus-visible,
  .cd-tabs__add:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }

  /* --- tabPosition: bottom（bar 在内容下方）--- */
  .cd-tabs--bottom {
    flex-direction: column-reverse;
  }
  .cd-tabs--bottom.cd-tabs--line .cd-tabs__bar {
    border-block-end: none;
    border-block-start: 1px solid var(--cd-tabs-bar-border);
  }
  .cd-tabs--bottom.cd-tabs--line .cd-tabs__tab-btn {
    border-block-end: none;
    border-block-start: var(--cd-tabs-ink-height) solid transparent;
  }
  .cd-tabs--bottom.cd-tabs--line .cd-tabs__tab--active .cd-tabs__tab-btn {
    border-block-start-color: var(--cd-tabs-ink-color);
  }
  .cd-tabs--bottom .cd-tabs__content {
    padding-block-start: 0;
    padding-block-end: var(--cd-spacing-3);
  }

  /* --- tabPosition: left / right（bar 竖向在侧）--- */
  .cd-tabs--left,
  .cd-tabs--right {
    flex-direction: row;
  }
  .cd-tabs--right {
    flex-direction: row-reverse;
  }
  .cd-tabs--left .cd-tabs__bar,
  .cd-tabs--right .cd-tabs__bar {
    flex-direction: column;
    align-items: stretch;
    /* 纵向滚动需要可约束的高度：随内容/父容器，溢出时由 nav 裁剪滚动。 */
    max-block-size: 100%;
  }
  /* 纵向：nav 沿块轴裁剪滚动，list 纵向排列。 */
  .cd-tabs--left .cd-tabs__nav,
  .cd-tabs--right .cd-tabs__nav {
    flex: 1 1 auto;
    min-block-size: 0;
    min-inline-size: 0;
  }
  .cd-tabs--left .cd-tabs__list,
  .cd-tabs--right .cd-tabs__list {
    flex-direction: column;
    align-items: stretch;
  }
  .cd-tabs--left.cd-tabs--line .cd-tabs__bar {
    border-block-end: none;
    border-inline-end: 1px solid var(--cd-tabs-bar-border);
  }
  .cd-tabs--right.cd-tabs--line .cd-tabs__bar {
    border-block-end: none;
    border-inline-start: 1px solid var(--cd-tabs-bar-border);
  }
  .cd-tabs--left .cd-tabs__tab-btn,
  .cd-tabs--right .cd-tabs__tab-btn {
    inline-size: 100%;
    text-align: start;
  }
  .cd-tabs--left.cd-tabs--line .cd-tabs__tab-btn {
    border-block-end: none;
    border-inline-end: var(--cd-tabs-ink-height) solid transparent;
  }
  .cd-tabs--right.cd-tabs--line .cd-tabs__tab-btn {
    border-block-end: none;
    border-inline-start: var(--cd-tabs-ink-height) solid transparent;
  }
  .cd-tabs--left.cd-tabs--line .cd-tabs__tab--active .cd-tabs__tab-btn {
    border-inline-end-color: var(--cd-tabs-ink-color);
  }
  .cd-tabs--right.cd-tabs--line .cd-tabs__tab--active .cd-tabs__tab-btn {
    border-inline-start-color: var(--cd-tabs-ink-color);
  }
  .cd-tabs--left .cd-tabs__content,
  .cd-tabs--right .cd-tabs__content {
    flex: 1 1 auto;
    padding-block-start: 0;
    padding-inline: var(--cd-spacing-4);
  }
  .cd-tabs__tab {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-1);
    white-space: nowrap;
  }
  .cd-tabs--card .cd-tabs__tab {
    background: var(--cd-tabs-card-bg);
    border-radius: var(--cd-tabs-card-radius) var(--cd-tabs-card-radius) 0 0;
  }
  .cd-tabs--card .cd-tabs__tab--active {
    background: var(--cd-tabs-card-bg-active);
  }
  .cd-tabs__tab-btn {
    margin: 0;
    padding: var(--cd-tabs-tab-padding);
    border: none;
    background: transparent;
    color: var(--cd-tabs-tab-color);
    font: inherit;
    cursor: pointer;
    transition: color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs--line .cd-tabs__tab-btn {
    border-block-end: var(--cd-tabs-ink-height) solid transparent;
  }
  .cd-tabs__tab--active .cd-tabs__tab-btn {
    color: var(--cd-tabs-tab-color-active);
  }
  .cd-tabs--line .cd-tabs__tab--active .cd-tabs__tab-btn {
    border-block-end-color: var(--cd-tabs-ink-color);
  }
  .cd-tabs__tab-btn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  .cd-tabs__tab--disabled .cd-tabs__tab-btn {
    color: var(--cd-tabs-tab-color-disabled);
    cursor: not-allowed;
  }
  .cd-tabs__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-inline-end: var(--cd-spacing-2);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-tabs-tab-color);
    cursor: pointer;
  }
  .cd-tabs__close:hover {
    color: var(--cd-tabs-tab-color-active);
  }
  .cd-tabs__close:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  .cd-tabs__content {
    padding-block-start: var(--cd-spacing-3);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-tabs__tab-btn {
      transition: none;
    }
  }
</style>
