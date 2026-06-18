<!--
  Descriptions — see specs/components/show/Descriptions.spec.md
  基础子集: data 数据驱动、inline/row 布局、column 数字、bordered、colon、
    horizontal/vertical direction、span 跨列。
  TODO(延后): 声明式 Item 子组件、响应式 column 对象、align justify。
-->
<script lang="ts">
  import type { DescriptionItem } from './types.js';

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
  }: Props = $props();

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
  </dl>
</div>

<style>
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
  .cd-descriptions__item {
    display: flex;
    min-inline-size: 0;
  }
  .cd-descriptions--horizontal .cd-descriptions__item {
    flex-direction: row;
    align-items: baseline;
    gap: var(--cd-spacing-1);
  }
  .cd-descriptions--vertical .cd-descriptions__item {
    flex-direction: column;
    gap: var(--cd-spacing-1);
  }
  .cd-descriptions__label {
    color: var(--cd-descriptions-label-color);
    white-space: nowrap;
  }
  .cd-descriptions__colon {
    margin-inline-start: 0.125em;
  }
  .cd-descriptions__value {
    margin: 0;
    color: var(--cd-descriptions-value-color);
    min-inline-size: 0;
    overflow-wrap: break-word;
  }

  /* row layout: table-like cells */
  .cd-descriptions--row .cd-descriptions__content {
    gap: 0;
  }
  .cd-descriptions--row .cd-descriptions__item {
    align-items: stretch;
  }

  /* bordered cells */
  .cd-descriptions--bordered .cd-descriptions__content {
    gap: 0;
    border-block-start: 1px solid var(--cd-descriptions-border);
    border-inline-start: 1px solid var(--cd-descriptions-border);
  }
  .cd-descriptions--bordered .cd-descriptions__label,
  .cd-descriptions--bordered .cd-descriptions__value {
    padding: var(--cd-descriptions-cell-padding);
    border-block-end: 1px solid var(--cd-descriptions-border);
    border-inline-end: 1px solid var(--cd-descriptions-border);
  }
  .cd-descriptions--bordered .cd-descriptions__label {
    background: var(--cd-descriptions-label-bg);
  }
  .cd-descriptions--bordered.cd-descriptions--horizontal .cd-descriptions__value {
    flex: 1 1 auto;
  }
</style>
