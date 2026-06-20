<!--
  Descriptions — see specs/components/show/Descriptions.spec.md
  基础子集: data 数据驱动、inline/row 布局、column 数字、bordered、colon、
    horizontal/vertical direction、span 跨列。
  两种用法择一：
    - 数据驱动：传 data 数组（向后兼容，行为不变）。
    - 声明式：不传 data，改在 children 内写 <Descriptions.Item>（可放富内容）。
  布局复用：父子渲染同一套 .cd-descriptions__item 结构。父用 CSS grid（grid-template-columns
    repeat(column)），子项靠 grid-column: span N 自排——声明式下父级无需预先知道 children，
    Item 经 context 读取 column 做 span 钳制即可自动换行/跨列。故后代样式用 :global 包裹，
    既覆盖本组件 data 渲染的 item，也覆盖 <Descriptions.Item> 跨组件边界渲染的 item。
  TODO(延后): 响应式 column 对象、align justify。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { DescriptionItem } from './types.js';
  import { setDescriptionsContext } from './context.js';

  type Layout = 'inline' | 'row';
  type Direction = 'horizontal' | 'vertical';
  type Size = 'small' | 'default' | 'large';

  interface Props {
    data?: DescriptionItem[];
    layout?: Layout;
    direction?: Direction;
    column?: number;
    size?: Size;
    bordered?: boolean;
    colon?: boolean;
    title?: string;
    emptyText?: string;
    class?: string;
    /** 声明式用法：内嵌 <Descriptions.Item> 列表（不传 data 时生效）。 */
    children?: Snippet;
  }

  let {
    data = [],
    layout = 'inline',
    direction = 'horizontal',
    column = 3,
    size = 'default',
    bordered = false,
    colon = true,
    title,
    emptyText = '-',
    class: className = '',
    children,
  }: Props = $props();

  // 声明式优先级低于 data：仅在未传 data 时渲染 children。
  const useDeclarative = $derived(data.length === 0 && children != null);

  // 通过 context 向 <Descriptions.Item> 暴露父级布局配置（getter 保持响应性）。
  setDescriptionsContext({
    getColumn: () => column,
    getDirection: () => direction,
    getColon: () => colon,
    getEmptyText: () => emptyText,
  });

  function isEmptyValue(value: unknown): boolean {
    return value === null || value === undefined || value === '';
  }

  function displayValue(value: unknown): string {
    return isEmptyValue(value) ? emptyText : String(value);
  }

  function clampSpan(span: number | undefined): number {
    if (!span || span < 1) return 1;
    return Math.min(span, column);
  }

  const cls = $derived(
    [
      'cd-descriptions',
      `cd-descriptions--${layout}`,
      `cd-descriptions--${direction}`,
      `cd-descriptions--${size}`,
      bordered && 'cd-descriptions--bordered',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const gridStyle = $derived(
    `grid-template-columns: repeat(${column}, minmax(0, 1fr));`,
  );
</script>

<div class={cls}>
  {#if title}
    <div class="cd-descriptions__title">{title}</div>
  {/if}
  <dl class="cd-descriptions__content" style={gridStyle}>
    {#if useDeclarative}
      {@render children?.()}
    {:else}
      {#each data as item, index (item.key ?? index)}
        <div
          class="cd-descriptions__item"
          style="grid-column: span {clampSpan(item.span)};"
        >
          <dt class="cd-descriptions__label">
            {item.label}{#if colon && direction === 'horizontal'}<span
                class="cd-descriptions__colon"
                aria-hidden="true">:</span
              >{/if}
          </dt>
          <dd class="cd-descriptions__value">{displayValue(item.value)}</dd>
        </div>
      {/each}
    {/if}
  </dl>
</div>

<style>
  /*
    .cd-descriptions 根保留组件作用域哈希；其下 .cd-descriptions__* 后代用 :global 包裹，
    使同一套结构样式既覆盖本组件 data 渲染的 item，也覆盖 <Descriptions.Item> 在子组件中
    渲染的 item（跨组件边界）。grid 由父级 dl 定义，子项靠 grid-column: span 自排。
  */
  .cd-descriptions {
    inline-size: 100%;
  }
  .cd-descriptions__title {
    margin-block-end: var(--cd-descriptions-row-gap);
    color: var(--cd-descriptions-label-color);
    font-weight: 600;
  }
  .cd-descriptions__content {
    display: grid;
    gap: var(--cd-descriptions-row-gap);
    margin: 0;
  }
  .cd-descriptions :global(.cd-descriptions__item) {
    display: flex;
    min-inline-size: 0;
  }
  .cd-descriptions--horizontal :global(.cd-descriptions__item) {
    flex-direction: row;
    align-items: baseline;
    gap: var(--cd-spacing-1);
  }
  .cd-descriptions--vertical :global(.cd-descriptions__item) {
    flex-direction: column;
    gap: var(--cd-spacing-1);
  }
  .cd-descriptions :global(.cd-descriptions__label) {
    color: var(--cd-descriptions-label-color);
    white-space: nowrap;
  }
  .cd-descriptions :global(.cd-descriptions__colon) {
    margin-inline-start: 0.125em;
  }
  .cd-descriptions :global(.cd-descriptions__value) {
    margin: 0;
    color: var(--cd-descriptions-value-color);
    min-inline-size: 0;
    overflow-wrap: break-word;
  }

  /* row layout: table-like cells */
  .cd-descriptions--row .cd-descriptions__content {
    gap: 0;
  }
  .cd-descriptions--row :global(.cd-descriptions__item) {
    align-items: stretch;
  }

  /* bordered cells */
  .cd-descriptions--bordered .cd-descriptions__content {
    gap: 0;
    border-block-start: 1px solid var(--cd-descriptions-border);
    border-inline-start: 1px solid var(--cd-descriptions-border);
  }
  .cd-descriptions--bordered :global(.cd-descriptions__label),
  .cd-descriptions--bordered :global(.cd-descriptions__value) {
    padding: var(--cd-descriptions-cell-padding);
    border-block-end: 1px solid var(--cd-descriptions-border);
    border-inline-end: 1px solid var(--cd-descriptions-border);
  }
  .cd-descriptions--bordered :global(.cd-descriptions__label) {
    background: var(--cd-descriptions-label-bg);
  }
  .cd-descriptions--bordered.cd-descriptions--horizontal :global(.cd-descriptions__value) {
    flex: 1 1 auto;
  }
</style>
