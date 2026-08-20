<!--
  Descriptions — 镜像 Semi descriptions/index.tsx。
  DOM：<div.cd-descriptions[modifiers]><table><tbody> … </tbody></table></div>
  两种数据源（择一）：
    - data 数组（{ key, value, hidden, span, keyStyle }，value 可为函数）。
    - 声明式 children（<Descriptions.Item>）。
  布局：
    - vertical（默认）：每项自成一行 <tr>（由 Item 渲染）。
    - horizontal：data 模式下按 getHorizontalList 分组，每组一个 <tr>，column 控每行总列数。
      （对齐 Semi：children 模式的 horizontal 不做分组，Item 各自渲染。）
  align：center（默认）/justify/left/plain —— 纯 class，映射 Semi 同名 modifier；row=true 时 align 失效。
  row（双行）：small/medium/large（默认 medium）—— tbody flex-wrap，key/value 各占一行、value 加粗放大。
  样式与 token 全量镜像 semi-foundation/descriptions/descriptions.scss + variables.scss，
    直接消费原始层 --cd-*-descriptions-*（无中间变量）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { DescriptionData } from './types.js';
  import Item from './DescriptionsItem.svelte';
  import {
    setDescriptionsContext,
    type DescriptionsAlign,
    type DescriptionsLayout,
    type DescriptionsItemEntry,
  } from './context.js';

  type Size = 'small' | 'medium' | 'large';

  interface Props {
    /** 对齐方式（row=true 时失效）。 */
    align?: DescriptionsAlign;
    /** 是否双行显示。 */
    row?: boolean;
    /** 双行显示时的大小。 */
    size?: Size;
    /** 列表数据（不传时渲染 children 内的 <Descriptions.Item>）。 */
    data?: DescriptionData[];
    /** 布局模式。 */
    layout?: DescriptionsLayout;
    /** horizontal 布局下每行的总列数。 */
    column?: number;
    class?: string;
    style?: string;
    /** 声明式用法：内嵌 <Descriptions.Item>。 */
    children?: Snippet;
  }

  let {
    align = 'center',
    row = false,
    size = 'medium',
    data = [],
    layout = 'vertical',
    column = 3,
    class: className = '',
    style,
    children,
  }: Props = $props();

  // 镜像 Semi foundation.getHorizontalList：按 span 累加分组，达到 column 换行；
  // 尾组若最后一项无 span 且总 span 不足 column，补足使其撑满该行。
  // 复用于 data 与 children（收集自 Descriptions.Item）两种数据源（对齐 Semi getColumns）。
  function getHorizontalList<T extends { hidden?: boolean | undefined; span?: number | undefined }>(
    items: T[],
  ): T[][] {
    const visible = items.filter((item) => !item.hidden);
    const list: T[][] = [];
    let itemList: T[] = [];
    let totalSpan = 0;
    for (const item of visible) {
      totalSpan += item.span || 1;
      itemList.push(item);
      if (totalSpan >= column) {
        list.push(itemList);
        itemList = [];
        totalSpan = 0;
      }
    }
    if (itemList.length !== 0) {
      const last = itemList[itemList.length - 1]!;
      if (last.span == null || Number.isNaN(last.span)) {
        let total = 0;
        for (const item of itemList) {
          total += item.span != null && !Number.isNaN(item.span) ? item.span : 1;
        }
        if (total < column) last.span = column - total + 1;
      }
      list.push(itemList);
    }
    return list;
  }

  // horizontal + 无 data（children 声明式模式）：收集 <Descriptions.Item> 元信息，交由本组件统一分组渲染
  // （对齐 Semi getColumns 从 React children 提取后走同一 getHorizontalList；Item 自身在此模式下不渲染 DOM）。
  // Map + version：Item 在 $effect 中按注册顺序 register/unregister（纯写，无副作用读），
  // version 冒泡触发 $derived.by 只读重建快照（同 Table Column 收集模式，避免在 $derived 中做有副作用的注册）。
  const registry = new Map<string, DescriptionsItemEntry>();
  let order: string[] = [];
  let version = $state(0);
  const usesChildrenCollector = $derived(layout === 'horizontal' && !(data && data.length));

  function registerItem(id: string, entry: DescriptionsItemEntry): void {
    if (!registry.has(id)) order.push(id);
    registry.set(id, entry);
    version++;
  }
  function unregisterItem(id: string): void {
    if (registry.delete(id)) {
      order = order.filter((existing) => existing !== id);
      version++;
    }
  }

  setDescriptionsContext({
    getAlign: () => align,
    getLayout: () => layout,
    isCollecting: () => usesChildrenCollector,
    registerItem,
    unregisterItem,
  });

  const collectedItems = $derived.by(() => {
    void version;
    return order.map((id) => registry.get(id)!);
  });

  const horizontalList = $derived(
    layout === 'horizontal' && data && data.length ? getHorizontalList(data) : [],
  );
  const horizontalChildrenList = $derived(
    usesChildrenCollector ? getHorizontalList(collectedItems) : [],
  );
  const verticalData = $derived(data.filter((item) => !item.hidden));

  // data.value 为函数时按 Snippet 处理（对齐 Semi value?: () => ReactNode，可渲染富内容）。
  function isSnippet(value: unknown): value is Snippet {
    return typeof value === 'function';
  }

  const cls = $derived(
    [
      'cd-descriptions',
      !row && `cd-descriptions-${align}`,
      row && 'cd-descriptions-double',
      row && `cd-descriptions-double-${size}`,
      layout === 'horizontal' && 'cd-descriptions-horizontal',
      layout === 'vertical' && 'cd-descriptions-vertical',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#snippet collectedPlainCell(item: DescriptionsItemEntry)}
  <td class="cd-descriptions-item" colspan={item.span || 1}>
    <span class="cd-descriptions-key" style={item.keyStyle}>{item.itemKey}:</span>
    <span class="cd-descriptions-value">{@render item.children?.()}</span>
  </td>
{/snippet}

{#snippet collectedAlignCell(item: DescriptionsItemEntry)}
  <th class="cd-descriptions-item cd-descriptions-item-th">
    <span class="cd-descriptions-key" style={item.keyStyle}>{item.itemKey}</span>
  </th>
  <td class="cd-descriptions-item cd-descriptions-item-td" colspan={item.span ? item.span * 2 - 1 : 1}>
    <span class="cd-descriptions-value">{@render item.children?.()}</span>
  </td>
{/snippet}

<div class={cls} {style}>
  <table>
    <tbody>
      {#if usesChildrenCollector}
        <!-- children 收集模式：渲染 children 触发各 Item 向父级注册（自身静默不出 DOM），
             再按分组统一输出 tr（对齐 Semi getColumns 从 children 提取后走 getHorizontalList）。 -->
        {@render children?.()}
        {#each horizontalChildrenList as rowItems, rIndex (rIndex)}
          <tr>
            {#each rowItems as item, iIndex (iIndex)}
              {#if align === 'plain'}
                {@render collectedPlainCell(item)}
              {:else}
                {@render collectedAlignCell(item)}
              {/if}
            {/each}
          </tr>
        {/each}
      {:else if data && data.length}
        {#if layout === 'horizontal'}
          {#each horizontalList as rowItems, rIndex (rIndex)}
            <tr>
              {#each rowItems as item, iIndex (iIndex)}
                <Item
                  itemKey={item.key}
                  span={item.span}
                  keyStyle={item.keyStyle}
                >
                  {#if isSnippet(item.value)}{@render (item.value as Snippet)()}{:else}{item.value}{/if}
                </Item>
              {/each}
            </tr>
          {/each}
        {:else}
          {#each verticalData as item, index (index)}
            <Item itemKey={item.key} span={item.span} keyStyle={item.keyStyle}>
              {#if isSnippet(item.value)}{@render (item.value as Snippet)()}{:else}{item.value}{/if}
            </Item>
          {/each}
        {/if}
      {:else}
        {@render children?.()}
      {/if}
    </tbody>
  </table>
</div>

<style>
  /* 镜像 semi-foundation/descriptions/descriptions.scss（$module = cd-descriptions）。 */
  .cd-descriptions {
    line-height: var(--cd-font-descriptions-lineheight);
  }
  .cd-descriptions :global(table),
  .cd-descriptions :global(tr),
  .cd-descriptions :global(th),
  .cd-descriptions :global(td) {
    margin: 0;
    padding: 0;
    border: 0;
  }
  .cd-descriptions :global(th) {
    padding-right: var(--cd-spacing-descriptions-th-paddingright);
  }
  .cd-descriptions :global(.cd-descriptions-item) {
    margin: 0;
    padding-bottom: var(--cd-spacing-descriptions-item-paddingbottom);
    text-align: left;
    vertical-align: top;
  }
  .cd-descriptions :global(.cd-descriptions-key) {
    font-weight: normal;
    font-size: var(--cd-font-size-regular);
    line-height: var(--cd-line-height-regular);
    min-height: var(--cd-font-size-regular);
    white-space: nowrap;
    color: var(--cd-color-descriptions-key-text-default);
  }
  .cd-descriptions :global(.cd-descriptions-value) {
    font-weight: normal;
    font-size: var(--cd-font-size-regular);
    line-height: var(--cd-line-height-regular);
    color: var(--cd-color-descriptions-value-text-default);
  }

  /* align: center —— key(th) 右对齐、value(td) 左对齐。 */
  .cd-descriptions-center :global(.cd-descriptions-item-th) {
    text-align: right;
  }
  .cd-descriptions-center :global(.cd-descriptions-item-td) {
    text-align: left;
  }
  /* align: left —— 均左对齐。 */
  .cd-descriptions-left :global(.cd-descriptions-item-th),
  .cd-descriptions-left :global(.cd-descriptions-item-td) {
    text-align: left;
  }
  /* align: justify —— key 左、value 右（两端对齐）。 */
  .cd-descriptions-justify :global(.cd-descriptions-item-th) {
    text-align: left;
  }
  .cd-descriptions-justify :global(.cd-descriptions-item-td) {
    text-align: right;
  }
  /* align: plain —— key/value 同排 inline-block，value 左侧留距；tag 垂直居中。 */
  .cd-descriptions-plain :global(.cd-descriptions-key),
  .cd-descriptions-plain :global(.cd-descriptions-value) {
    display: inline-block;
  }
  .cd-descriptions-plain :global(.cd-descriptions-value) {
    padding-left: var(--cd-spacing-descriptions-value-plain-paddingleft);
  }

  /* row=true：双行显示。 */
  .cd-descriptions-double :global(tbody) {
    display: flex;
    flex-wrap: wrap;
  }
  .cd-descriptions-double :global(tr) {
    display: inline-flex;
    flex-direction: column;
  }
  .cd-descriptions-double :global(.cd-descriptions-item) {
    padding: var(--cd-spacing-descriptions-item-double-padding);
    flex: 1;
  }
  .cd-descriptions-double :global(.cd-descriptions-value) {
    font-weight: var(--cd-font-descriptions-value-fontweight);
  }
  /* row size: small */
  .cd-descriptions-double-small :global(.cd-descriptions-item) {
    padding-right: var(--cd-spacing-descriptions-item-small-paddingright);
  }
  .cd-descriptions-double-small :global(.cd-descriptions-key) {
    font-size: var(--cd-font-descriptions-key-small-fontsize);
    line-height: var(--cd-line-height-small);
    padding-bottom: 0;
  }
  .cd-descriptions-double-small :global(.cd-descriptions-value) {
    font-size: var(--cd-font-descriptions-value-small-fontsize);
    line-height: var(--cd-line-height-header-6);
  }
  /* row size: medium */
  .cd-descriptions-double-medium :global(.cd-descriptions-item) {
    padding-right: var(--cd-spacing-descriptions-item-medium-paddingright);
  }
  .cd-descriptions-double-medium :global(.cd-descriptions-key) {
    padding-bottom: var(--cd-spacing-descriptions-key-medium-paddingbottom);
    font-size: var(--cd-font-descriptions-key-medium-fontsize);
  }
  .cd-descriptions-double-medium :global(.cd-descriptions-value) {
    font-size: var(--cd-font-descriptions-value-medium-fontsize);
    line-height: var(--cd-line-height-header-4);
  }
  /* row size: large */
  .cd-descriptions-double-large :global(.cd-descriptions-item) {
    padding-right: var(--cd-spacing-descriptions-item-large-paddingright);
  }
  .cd-descriptions-double-large :global(.cd-descriptions-key) {
    padding-bottom: var(--cd-spacing-descriptions-key-large-paddingbottom);
    font-size: var(--cd-font-descriptions-key-large-fontsize);
  }
  .cd-descriptions-double-large :global(.cd-descriptions-value) {
    font-size: var(--cd-font-descriptions-value-large-fontsize);
    line-height: var(--cd-line-height-header-2);
  }

  /* horizontal 布局：表格定宽、撑满。 */
  .cd-descriptions-horizontal :global(table) {
    table-layout: fixed;
  }
  .cd-descriptions-horizontal :global(table),
  .cd-descriptions-horizontal :global(tbody) {
    width: 100%;
  }
  .cd-descriptions-horizontal :global(.cd-descriptions-item) {
    flex: 0;
  }

  /* —— RTL（逐条对齐 Semi descriptions/rtl.scss）——
     四种 align 的 text-align 与 th/value 的物理内边距整体换边。 */
  :global(.cd-rtl) .cd-descriptions {
    direction: rtl;
  }
  :global(.cd-rtl) .cd-descriptions :global(th) {
    padding-right: 0;
    padding-left: var(--cd-spacing-descriptions-th-paddingright);
  }
  :global(.cd-rtl) .cd-descriptions :global(.cd-descriptions-item) {
    text-align: right;
  }
  :global(.cd-rtl) .cd-descriptions-center :global(.cd-descriptions-item-th) {
    text-align: left;
  }
  :global(.cd-rtl) .cd-descriptions-center :global(.cd-descriptions-item-td) {
    text-align: right;
  }
  :global(.cd-rtl) .cd-descriptions-left :global(.cd-descriptions-item-th),
  :global(.cd-rtl) .cd-descriptions-left :global(.cd-descriptions-item-td) {
    text-align: left;
  }
  :global(.cd-rtl) .cd-descriptions-justify :global(.cd-descriptions-item-th) {
    text-align: right;
  }
  :global(.cd-rtl) .cd-descriptions-justify :global(.cd-descriptions-item-td) {
    text-align: left;
  }
  :global(.cd-rtl) .cd-descriptions-plain :global(.cd-descriptions-value) {
    padding-left: 0;
    padding-right: var(--cd-spacing-descriptions-value-plain-paddingleft);
  }
</style>
