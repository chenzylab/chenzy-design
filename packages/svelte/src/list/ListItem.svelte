<!--
  List.Item — 声明式列表项容器。
  - 默认（非 selectable）：渲染 <li role="listitem">，与 dataSource 模式同结构，复用父 List
    的 split/size 样式。
  - selectable：读父 List context（getListContext），渲染 role="option" + aria-selected，
    左侧内置 checkbox/radio 视觉，点击/键盘触发 ctx.toggle（仅回调 onSelectionChange，
    红线 #1：不回写 selectedKeys）。
  default 主内容 + extra（右侧附加区） + actions（底部操作区）三段插槽，对齐 spec。
  无 effect 自循环：选中态来自父 context 派生（受控 selectedKeys），本组件不写 $state。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ListKey } from '@chenzy-design/core';
  import { Checkbox } from '../checkbox/index.js';
  import { getListContext } from './context.js';

  interface Props {
    /** selectable 模式下本项的唯一 key（用于选中态判定与回调）。 */
    itemKey?: ListKey;
    /** item 头部（字符串或 Snippet）。 */
    header?: string | Snippet;
    /** item 主要内容区（语义化 slot，与 children 不互斥）。 */
    main?: Snippet;
    /** 右侧附加内容区（如缩略图、统计数字）。 */
    extra?: Snippet;
    /** 底部操作区（按钮组）。 */
    actions?: Snippet;
    class?: string;
    /** 主内容（通用插槽）。 */
    children?: Snippet;
  }

  let { itemKey, header, main, extra, actions, class: className = '', children }: Props = $props();

  function isSnippet(v: unknown): v is Snippet {
    return typeof v === 'function';
  }

  const ctx = getListContext();

  const selectable = $derived(ctx?.getSelectable() ?? false);
  const selected = $derived(
    selectable && itemKey !== undefined ? !!ctx?.isSelected(itemKey) : false,
  );
  const multiple = $derived(selectable === 'multiple');

  function activate(shiftKey: boolean) {
    if (!selectable || itemKey === undefined) return;
    ctx?.toggle(itemKey, shiftKey);
  }

  function onClick(e: MouseEvent) {
    activate(e.shiftKey);
  }

  // roving tabindex 由父派生（红线 #2：本组件只读不写父级 $state）。
  const tabindex = $derived(
    selectable && itemKey !== undefined ? (ctx?.rowTabindex(itemKey) ?? 0) : undefined,
  );

  function onKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      activate(e.shiftKey);
      return;
    }
    // ↑↓ / Home/End / PageUp/Down roving 交父按 DOM 顺序处理。
    if (itemKey !== undefined) ctx?.onRowKeydown(e, itemKey);
  }

  const cls = $derived(
    [
      'cd-list__item',
      selectable && 'cd-list__item--selectable',
      selected && 'cd-list__item--selected',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#snippet itemInner()}
  {#if header !== undefined}
    <div class="cd-list__item-header">
      {#if isSnippet(header)}{@render header()}{:else}{header}{/if}
    </div>
  {/if}
  <div class="cd-list__item-row">
    <div class="cd-list__item-content">
      {#if main}{@render main()}{/if}
      {@render children?.()}
    </div>
    {#if extra}<div class="cd-list__item-extra">{@render extra()}</div>{/if}
  </div>
  {#if actions}<div class="cd-list__item-actions">{@render actions()}</div>{/if}
{/snippet}

{#if selectable}
  <li
    class={cls}
    role="option"
    aria-selected={selected}
    data-list-key={itemKey}
    {tabindex}
    onclick={onClick}
    onkeydown={onKeydown}
    onfocus={() => itemKey !== undefined && ctx?.onRowFocus(itemKey)}
  >
    <span class="cd-list__item-selector" aria-hidden="true">
      <Checkbox checked={selected} />
    </span>
    <div class="cd-list__item-main">
      {@render itemInner()}
    </div>
  </li>
{:else}
  <li class={cls}>
    <div class="cd-list__item-main">
      {@render itemInner()}
    </div>
  </li>
{/if}

<style>
  .cd-list__item-main {
    flex: 1;
    min-inline-size: 0;
  }
  .cd-list__item-header {
    font-weight: var(--cd-font-weight-medium, 500);
    margin-block-end: var(--cd-spacing-extra-tight, 4px);
    color: var(--cd-color-text-0);
  }
  .cd-list__item-row {
    display: flex;
    align-items: flex-start;
    gap: var(--cd-spacing-base-tight, 12px);
  }
  .cd-list__item-content {
    flex: 1;
    min-inline-size: 0;
  }
  .cd-list__item-extra {
    flex: none;
  }
  .cd-list__item-actions {
    display: flex;
    gap: var(--cd-spacing-base-tight, 12px);
    margin-block-start: var(--cd-spacing-tight, 8px);
  }

  .cd-list__item--selectable {
    display: flex;
    align-items: flex-start;
    gap: var(--cd-spacing-tight, 8px);
    cursor: pointer;
    outline: none;
  }
  .cd-list__item--selectable:hover {
    background: var(--cd-color-fill-0, rgba(0, 0, 0, 0.03));
  }
  .cd-list__item--selectable:focus-visible {
    box-shadow: inset 0 0 0 2px var(--cd-color-primary, #0066ff);
  }
  .cd-list__item--selected {
    background: var(--cd-color-primary-light-default, rgba(0, 102, 255, 0.1));
  }
  .cd-list__item-selector {
    flex: none;
    display: flex;
    align-items: center;
    pointer-events: none;
  }
</style>
