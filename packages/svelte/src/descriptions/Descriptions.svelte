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

  setDescriptionsContext({
    getAlign: () => align,
    getLayout: () => layout,
  });

  // 镜像 Semi foundation.getHorizontalList：按 span 累加分组，达到 column 换行；
  // 尾组若最后一项无 span 且总 span 不足 column，补足使其撑满该行。
  function getHorizontalList(items: DescriptionData[]): DescriptionData[][] {
    const visible = items.filter((item) => !item.hidden);
    const list: DescriptionData[][] = [];
    let itemList: DescriptionData[] = [];
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

  const horizontalList = $derived(
    layout === 'horizontal' ? getHorizontalList(data) : [],
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

<div class={cls} {style}>
  <table>
    <tbody>
      {#if data && data.length}
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
</style>
