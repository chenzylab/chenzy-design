<!--
  Collapse — see specs/components/show/Collapse.spec.md
  基础子集: 数据驱动 panels + 受控 activeKey、accordion、展开动画、
    箭头位置、bordered、lazyRender/keepDOM 内容挂载策略。
  TODO(延后): 声明式 Panel 子组件、disabled 单面板细节。

  红线遵守:
  #1 受控 activeKey 不回写 prop：isControlled = $derived(prop !== undefined)，
     内部 SvelteSet $state 兜底，current = $derived(...)，变更只 onChange。
  #2 展开状态用本地 SvelteSet $state，不依赖挂载 registry，render 期不读 effect 写入的数组。
  #3 展开动画用 CSS grid-template-rows 0fr↔1fr 过渡，不 JS 测量 DOM 几何。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { useId } from '@chenzy-design/core';
  import type { CollapsePanel } from './types.js';

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
    children?: Snippet<[{ key: string }]>;
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

  function toggle(panel: CollapsePanel) {
    if (disabled || panel.disabled) return;

    const isOpen = currentKeys.includes(panel.key);
    let nextArr: string[];
    if (isOpen) {
      nextArr = currentKeys.filter((k) => k !== panel.key);
    } else if (accordion) {
      nextArr = [panel.key];
    } else {
      nextArr = [...currentKeys, panel.key];
    }

    // 红线 #1: 受控不回写 prop，仅 onChange；非受控更新本地 set
    if (!isControlled) {
      innerKeys.clear();
      for (const k of nextArr) innerKeys.add(k);
    }
    onChange?.(nextArr);
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
</script>

<div class={cls}>
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
        onclick={() => toggle(panel)}
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
              {@render children?.({ key: panel.key })}
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .cd-collapse {
    inline-size: 100%;
  }
  .cd-collapse--bordered {
    border: 1px solid var(--cd-collapse-border);
    border-radius: var(--cd-radius-1);
  }
  .cd-collapse__item + .cd-collapse__item {
    border-block-start: 1px solid var(--cd-collapse-border);
  }
  .cd-collapse__header {
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
  .cd-collapse__header:hover:not(:disabled) {
    background: var(--cd-collapse-header-bg-hover);
  }
  .cd-collapse__header:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-collapse__header:disabled {
    color: var(--cd-color-text-3);
    cursor: not-allowed;
  }
  .cd-collapse--icon-right .cd-collapse__header {
    flex-direction: row-reverse;
  }
  .cd-collapse--icon-right .cd-collapse__title {
    flex: 1 1 auto;
  }
  .cd-collapse__arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--cd-collapse-arrow-color);
    transition: transform var(--cd-collapse-motion-duration) var(--cd-motion-ease-standard);
  }
  .cd-collapse__arrow--open {
    transform: rotate(90deg);
  }

  /* 红线 #3: CSS grid-template-rows 0fr↔1fr 过渡，不 JS 测高 */
  .cd-collapse__region {
    display: grid;
    grid-template-rows: 1fr;
  }
  .cd-collapse__region[hidden] {
    display: grid;
    grid-template-rows: 0fr;
  }
  .cd-collapse--motion .cd-collapse__region {
    transition: grid-template-rows var(--cd-collapse-motion-duration) var(--cd-motion-ease-standard);
  }
  .cd-collapse__region-inner {
    overflow: hidden;
    min-block-size: 0;
  }
  .cd-collapse__content {
    padding: var(--cd-collapse-content-padding);
    color: var(--cd-collapse-content-color);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-collapse--motion .cd-collapse__region,
    .cd-collapse__arrow {
      transition: none;
    }
  }
</style>
