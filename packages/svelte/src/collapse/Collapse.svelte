<!--
  Collapse — see specs/components/show/Collapse.spec.md
  两种用法择一（与 Timeline / Form 复合组件同模式）:
    - 数据驱动：传 panels 数组（向后兼容，行为完全不变）。
    - 声明式：不传 panels，改在 children 内写 <Collapse.Panel itemKey header>...</Collapse.Panel>。
  父子状态经 context.ts 传递：父提供展开态派生函数 + toggle 回调，子 Panel 消费判断自身
  展开/渲染与点击切换。两模式渲染同一套 .cd-collapse__item 结构，故声明式复用父级全部
  grid 动画 / 箭头 / 边框样式（样式用 .cd-collapse :global(.cd-collapse__*) 跨子组件作用域）。

  红线遵守:
  #1 受控 activeKey 不回写 prop：isControlled = $derived(prop !== undefined)，
     内部 SvelteSet $state 兜底，current = $derived(...)，变更只 onChange（声明式同样经 toggle 落实）。
  #2 展开状态用本地 SvelteSet $state，不依赖挂载 registry，render 期不读 effect 写入的数组；
     isActive/shouldRender 为纯派生函数，经 context 传给子 Panel 只读。
  #3 展开动画用 CSS grid-template-rows 0fr↔1fr 过渡，不 JS 测量 DOM 几何。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { useId } from '@chenzy-design/core';
  import type { CollapsePanel } from './types.js';
  import { setCollapseContext } from './context.js';

  type Size = 'small' | 'default' | 'large';
  type IconPosition = 'left' | 'right';

  interface Props {
    panels?: CollapsePanel[];
    activeKey?: string | string[];
    defaultActiveKey?: string | string[];
    accordion?: boolean;
    size?: Size;
    expandIconPosition?: IconPosition;
    bordered?: boolean;
    disabled?: boolean;
    motion?: boolean;
    /** 首次展开后才渲染面板内容 */
    lazyRender?: boolean;
    /** 展开过的面板内容保留 DOM（收起后不卸载），与 lazyRender 配合 */
    keepDOM?: boolean;
    onChange?: (keys: string[]) => void;
    /** 某面板被展开后触发（spec §4：on:expand）。 */
    onExpand?: (detail: { key: string }) => void;
    /** 某面板被收起后触发（spec §4：on:collapse）。 */
    onCollapse?: (detail: { key: string }) => void;
    /** Header 被点击时触发（spec §4：on:headerClick，在 disabled 拦截前发出，可用于埋点）。 */
    onHeaderClick?: (detail: { key: string; event: MouseEvent }) => void;
    /**
     * 数据驱动模式：按 key 渲染面板内容 Snippet<[{ key }]>。
     * 声明式模式（不传 panels）：内嵌 <Collapse.Panel> 列表，普通 Snippet。
     */
    children?: Snippet<[{ key: string }]> | Snippet;
  }

  let {
    panels = [],
    activeKey,
    defaultActiveKey,
    accordion = false,
    size = 'default',
    expandIconPosition = 'right',
    bordered = true,
    disabled = false,
    motion = true,
    lazyRender = false,
    keepDOM = true,
    onChange,
    onExpand,
    onCollapse,
    onHeaderClick,
    children,
  }: Props = $props();

  const idBase = useId('cd-collapse');

  function normalize(value: string | string[] | undefined): string[] {
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
  }

  function getInitialKeys(): SvelteSet<string> {
    return new SvelteSet(normalize(defaultActiveKey));
  }

  // 红线 #1: 受控判定 + 内部 SvelteSet 兜底
  const isControlled = $derived(activeKey !== undefined);
  // 红线 #2: 本地 SvelteSet $state，不依赖挂载 registry
  const innerKeys = $state<SvelteSet<string>>(getInitialKeys());

  // 受控时读 prop（归一化），非受控读本地 set
  const currentKeys = $derived<string[]>(
    isControlled ? normalize(activeKey) : [...innerKeys],
  );

  // 记录曾展开过的面板（lazyRender + keepDOM 用）。初值为初始展开集。
  const everExpanded = $state<SvelteSet<string>>(getInitialEverExpanded());
  function getInitialEverExpanded(): SvelteSet<string> {
    return new SvelteSet(normalize(defaultActiveKey ?? activeKey));
  }
  // 当前激活的也并入「曾展开」（受控场景：active 推进 everExpanded，effect 内写不在 render 期）。
  $effect(() => {
    for (const k of currentKeys) everExpanded.add(k);
  });

  function isActive(key: string): boolean {
    return currentKeys.includes(key);
  }

  // 渲染策略：
  // - 非 lazyRender：始终渲染（内容常驻，配合 grid 动画）。
  // - lazyRender + keepDOM：首次展开才渲染，之后保留 DOM。
  // - lazyRender 非 keepDOM：仅当前展开渲染（收起卸载）。
  function shouldRender(key: string): boolean {
    if (!lazyRender) return true;
    return keepDOM ? everExpanded.has(key) : isActive(key);
  }

  function toggle(key: string, panelDisabled?: boolean) {
    if (disabled || panelDisabled) return;

    const isOpen = currentKeys.includes(key);
    let nextArr: string[];
    if (isOpen) {
      nextArr = currentKeys.filter((k) => k !== key);
    } else if (accordion) {
      nextArr = [key];
    } else {
      nextArr = [...currentKeys, key];
    }

    // 红线 #1: 受控不回写 prop，仅 onChange；非受控更新本地 set
    if (!isControlled) {
      innerKeys.clear();
      for (const k of nextArr) innerKeys.add(k);
    }
    onChange?.(nextArr);
    // spec §4：展开/收起后分别发出 on:expand / on:collapse（key 级语义事件）。
    if (isOpen) onCollapse?.({ key });
    else onExpand?.({ key });
  }

  // spec §4 on:headerClick：Header 被点击即发出（在 disabled 拦截前，可用于埋点），
  // 随后再走 toggle（disabled / panelDisabled 在 toggle 内拦截，不影响本事件发出）。
  function headerClick(event: MouseEvent, key: string, panelDisabled?: boolean) {
    onHeaderClick?.({ key, event });
    toggle(key, panelDisabled);
  }

  const cls = $derived(
    [
      'cd-collapse',
      `cd-collapse--${size}`,
      `cd-collapse--icon-${expandIconPosition}`,
      bordered && 'cd-collapse--bordered',
      disabled && 'cd-collapse--disabled',
      motion && 'cd-collapse--motion',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 声明式优先级低于 panels：仅在未传 panels 时渲染 children 内的 <Collapse.Panel>。
  const useDeclarative = $derived(panels.length === 0 && children != null);

  // 经 context 暴露给子 Panel：全部 getter / 纯派生函数，红线 #1#2 落实在父级。
  setCollapseContext({
    isActive,
    shouldRender,
    toggle,
    headerClick,
    getDisabled: () => disabled,
    getSize: () => size,
    getIconPosition: () => expandIconPosition,
    getIdBase: () => idBase,
  });
</script>

<div class={cls}>
  {#if useDeclarative}
    {@render (children as Snippet)?.()}
  {:else}
  {#each panels as panel (panel.key)}
    {@const active = isActive(panel.key)}
    {@const itemDisabled = disabled || panel.disabled}
    {@const headerId = `${idBase}-h-${panel.key}`}
    {@const regionId = `${idBase}-r-${panel.key}`}
    <div class="cd-collapse__item" class:cd-collapse__item--active={active}>
      <button
        type="button"
        id={headerId}
        class="cd-collapse__header"
        aria-expanded={active}
        aria-controls={regionId}
        disabled={itemDisabled || undefined}
        onclick={(e) => headerClick(e, panel.key, panel.disabled)}
      >
        <span class="cd-collapse__arrow" class:cd-collapse__arrow--open={active} aria-hidden="true">
          <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
            <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
          </svg>
        </span>
        <span class="cd-collapse__title">{panel.header}</span>
      </button>
      <div
        id={regionId}
        class="cd-collapse__region"
        role="region"
        aria-labelledby={headerId}
        hidden={!active}
      >
        <div class="cd-collapse__region-inner">
          <div class="cd-collapse__content">
            {#if shouldRender(panel.key)}
              {@render (children as Snippet<[{ key: string }]>)?.({ key: panel.key })}
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/each}
  {/if}
</div>

<style>
  /*
    .cd-collapse 根（<div>）保留组件作用域哈希；其下各 .cd-collapse__* 后代用 :global 包裹，
    使同一套结构样式既覆盖本组件 panels 渲染的 .cd-collapse__item，也覆盖 <Collapse.Panel>
    在子组件作用域内渲染的相同结构（参考 Timeline）。
  */
  .cd-collapse {
    inline-size: 100%;
  }
  .cd-collapse--bordered {
    border: 1px solid var(--cd-collapse-border);
    border-radius: var(--cd-radius-1);
  }
  .cd-collapse :global(.cd-collapse__item + .cd-collapse__item) {
    border-block-start: 1px solid var(--cd-collapse-border);
  }
  .cd-collapse :global(.cd-collapse__header) {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-2);
    inline-size: 100%;
    padding: var(--cd-collapse-header-padding);
    border: none;
    background: transparent;
    color: var(--cd-collapse-header-color);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .cd-collapse :global(.cd-collapse__header:hover:not(:disabled)) {
    background: var(--cd-collapse-header-bg-hover);
  }
  .cd-collapse :global(.cd-collapse__header:focus-visible) {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-collapse :global(.cd-collapse__header:disabled) {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-collapse--icon-right :global(.cd-collapse__header) {
    flex-direction: row-reverse;
  }
  .cd-collapse--icon-right :global(.cd-collapse__title) {
    flex: 1 1 auto;
  }
  .cd-collapse :global(.cd-collapse__arrow) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-collapse-arrow-color);
    transition: transform var(--cd-collapse-motion-duration) var(--cd-motion-ease-standard);
  }
  .cd-collapse :global(.cd-collapse__arrow--open) {
    transform: rotate(90deg);
  }

  /* 红线 #3: CSS grid-template-rows 0fr↔1fr 过渡，不 JS 测高 */
  .cd-collapse :global(.cd-collapse__region) {
    display: grid;
    grid-template-rows: 1fr;
  }
  .cd-collapse :global(.cd-collapse__region[hidden]) {
    display: grid;
    grid-template-rows: 0fr;
  }
  .cd-collapse--motion :global(.cd-collapse__region) {
    transition: grid-template-rows var(--cd-collapse-motion-duration) var(--cd-motion-ease-standard);
  }
  .cd-collapse :global(.cd-collapse__region-inner) {
    overflow: hidden;
    min-block-size: 0;
  }
  .cd-collapse :global(.cd-collapse__content) {
    padding: var(--cd-collapse-content-padding);
    color: var(--cd-collapse-content-color);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-collapse--motion :global(.cd-collapse__region),
    .cd-collapse :global(.cd-collapse__arrow) {
      transition: none;
    }
  }
</style>
