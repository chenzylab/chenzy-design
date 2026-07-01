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
  import { useId, nextRovingIndex, rovingKeyFromEvent } from '@chenzy-design/core';
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
    /** Header 包裹元素的 aria-level（role=heading），默认 3。 */
    headingLevel?: number;
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
    /** 自定义展开图标，替换默认箭头 SVG；参数为 {isExpanded: boolean}。 */
    expandIcon?: Snippet<[{ isExpanded: boolean }]>;
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
    headingLevel = 3,
    lazyRender = false,
    keepDOM = true,
    onChange,
    onExpand,
    onCollapse,
    onHeaderClick,
    expandIcon,
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

  // --- roving tabindex（a11y §6 / APG Accordion）：Header 组为单一 Tab 停靠点。 ---
  // rootEl 普通引用（bind:this），命令式 focus() 用，非 render 期读 DOM；
  // 声明式 <Collapse.Panel> 也渲染进同一 rootEl，故按 DOM 顺序统一漫游（红线 #2：
  // 不用 $state 数组收集子项，避免 effect 自循环）。
  let rootEl = $state<HTMLElement | null>(null);
  // 当前焦点 Header 的 key；null = 尚无焦点 -> 首个未禁用 Header 作为 Tab 停靠点。
  let focusedKey = $state<string | null>(null);

  // 查询 rootEl 下所有未禁用的 Header 按钮（DOM 顺序），roving 在其中漫游。
  function focusableHeaders(): HTMLButtonElement[] {
    if (!rootEl) return [];
    return [
      ...rootEl.querySelectorAll<HTMLButtonElement>(
        '.cd-collapse__header[data-collapse-key]:not([disabled])',
      ),
    ];
  }

  // 纯派生 tabindex：焦点 Header（或无焦点时首个未禁用 Header）为 0，其余 -1。
  // 不在 render 期写 $state（红线 #2）。整体 disabled 时所有 Header tabindex=-1。
  function headerTabindex(key: string, panelDisabled?: boolean): 0 | -1 {
    if (disabled || panelDisabled) return -1;
    if (focusedKey != null) return focusedKey === key ? 0 : -1;
    // 无焦点：首个未禁用 Header 为停靠点。数据驱动模式下用 panels 推断首个可聚焦项。
    const firstKey = firstFocusableKey();
    return firstKey === key ? 0 : -1;
  }

  // 首个未禁用 Header 的 key：数据驱动用 panels 派生；声明式回退到 DOM 查询。
  function firstFocusableKey(): string | undefined {
    if (panels.length > 0) {
      return panels.find((p) => !(disabled || p.disabled))?.key;
    }
    return focusableHeaders()[0]?.dataset.collapseKey;
  }

  function focusHeaderByKey(key: string): void {
    rootEl
      ?.querySelector<HTMLElement>(
        `.cd-collapse__header[data-collapse-key="${CSS.escape(key)}"]`,
      )
      ?.focus();
  }

  // Header keydown：↑↓ roving（纯函数 nextRovingIndex 派生，跳过禁用项）、Home/End 跳首尾。
  // Enter/Space 交给原生 <button>（向后兼容 toggle）。
  function onHeaderKeydown(e: KeyboardEvent, key: string): void {
    const intent = rovingKeyFromEvent(e.key);
    if (!intent) return;
    const headers = focusableHeaders();
    if (headers.length === 0) return;
    e.preventDefault();
    const keys = headers.map((h) => h.dataset.collapseKey ?? '');
    const cur = keys.indexOf(key);
    const next = nextRovingIndex(cur, keys.length, intent, false);
    const nextKey = keys[next];
    if (nextKey) {
      focusedKey = nextKey;
      focusHeaderByKey(nextKey);
    }
  }

  function onHeaderFocus(key: string): void {
    focusedKey = key;
  }

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
    getHeadingLevel: () => headingLevel,
    headerTabindex,
    onHeaderKeydown,
    onHeaderFocus,
    getExpandIcon: () => expandIcon,
  });
</script>

<div class={cls} bind:this={rootEl}>
  {#if useDeclarative}
    {@render (children as Snippet)?.()}
  {:else}
  {#each panels as panel (panel.key)}
    {@const active = isActive(panel.key)}
    {@const itemDisabled = disabled || panel.disabled}
    {@const headerId = `${idBase}-h-${panel.key}`}
    {@const regionId = `${idBase}-r-${panel.key}`}
    <div class="cd-collapse__item" class:cd-collapse__item--active={active}>
      <!-- APG Accordion：Header 触发器外层 role=heading + aria-level。 -->
      <span role="heading" aria-level={headingLevel} class="cd-collapse__heading">
      <button
        type="button"
        id={headerId}
        class="cd-collapse__header"
        data-collapse-key={panel.key}
        aria-expanded={active}
        aria-controls={regionId}
        aria-disabled={itemDisabled || undefined}
        disabled={itemDisabled || undefined}
        tabindex={headerTabindex(panel.key, panel.disabled)}
        onclick={(e) => headerClick(e, panel.key, panel.disabled)}
        onkeydown={(e) => onHeaderKeydown(e, panel.key)}
        onfocus={() => onHeaderFocus(panel.key)}
      >
        {#if expandIcon}
          <span class="cd-collapse__arrow" class:cd-collapse__arrow--open={active} aria-hidden="true">
            {@render expandIcon({ isExpanded: active })}
          </span>
        {:else}
          <span class="cd-collapse__arrow" class:cd-collapse__arrow--open={active} aria-hidden="true">
            <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
              <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
            </svg>
          </span>
        {/if}
        <span class="cd-collapse__title">{panel.header}</span>
      </button>
      </span>
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
    border-radius: var(--cd-border-radius-small);
  }
  .cd-collapse :global(.cd-collapse__item + .cd-collapse__item) {
    border-block-start: 1px solid var(--cd-collapse-border);
  }
  /* role=heading 包裹元素：消除 inline 默认行为，让内部 button 占满宽度。 */
  .cd-collapse :global(.cd-collapse__heading) {
    display: block;
    margin: 0;
    font: inherit;
  }
  .cd-collapse :global(.cd-collapse__header) {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-tight);
    inline-size: 100%;
    padding: var(--cd-collapse-header-padding);
    border: none;
    background: transparent;
    color: var(--cd-collapse-header-color);
    font: inherit;
    font-weight: var(--cd-collapse-header-weight); /* 对齐 Semi 标题字重 bold */
    text-align: start;
    cursor: pointer;
  }
  .cd-collapse :global(.cd-collapse__header:hover:not(:disabled)) {
    background: var(--cd-collapse-header-bg-hover);
  }
  .cd-collapse :global(.cd-collapse__header:active:not(:disabled)) {
    background: var(--cd-collapse-header-bg-active);
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
