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
  响应式 column：column 除 number 外支持断点对象 { xs?, sm?, md?, lg?, xl?, xxl? }，
    按视口宽度选列数——复用 grid 的 useBreakpoint（resize 监听 + cleanup，红线 #3）+ core
    resolveResponsiveValue（纯函数 mobile-first 级联，红线 #2）。这里用视口断点而非容器查询：
    避免上批 Breadcrumb 容器查询「只作用后代、container-type 层级错配」的坑。
  align：内容（value）水平对齐 left/center/right，纯 CSS class（红线 #2）。
  justify：每个 item 内 label 与 value 的排布对齐 start/center/end/between，纯 CSS class。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    resolveActiveBreakpoint,
    resolveResponsiveValue,
    type Breakpoint,
  } from '@chenzy-design/core';
  import type { DescriptionItem } from './types.js';
  import { setDescriptionsContext } from './context.js';

  type Layout = 'inline' | 'row';
  type Direction = 'horizontal' | 'vertical';
  type Size = 'small' | 'default' | 'large';
  type Align = 'left' | 'center' | 'right';
  type Justify = 'start' | 'center' | 'end' | 'between';
  /** 列数：number 或断点对象（按视口宽自动选列，mobile-first 向下级联）。 */
  type ColumnProp = number | Partial<Record<Breakpoint, number>>;

  interface Props {
    data?: DescriptionItem[];
    layout?: Layout;
    direction?: Direction;
    /** 列数；可传断点对象 { xs?, sm?, md?, lg?, xl?, xxl? } 按视口宽响应。 */
    column?: ColumnProp;
    size?: Size;
    bordered?: boolean;
    colon?: boolean;
    /** 内容（value）水平对齐。 */
    align?: Align;
    /** 每个 item 内 label 与 value 的排布对齐。 */
    justify?: Justify;
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
    align = 'left',
    justify = 'start',
    title,
    emptyText = '-',
    class: className = '',
    children,
  }: Props = $props();

  // 声明式优先级低于 data：仅在未传 data 时渲染 children。
  const useDeclarative = $derived(data.length === 0 && children != null);

  const SUPPORTS_DOM = typeof window !== 'undefined';

  // 当前视口断点：resize 监听（rAF 节流）+ cleanup（红线 #3）。仅 column 为对象时才订阅，
  // 避免固定列数场景下无谓监听。SSR 安全：先以真实/最小宽度落定再校正。
  let activeBp = $state<Breakpoint>(
    SUPPORTS_DOM ? resolveActiveBreakpoint(window.innerWidth) : 'xs',
  );
  const responsive = $derived(typeof column === 'object' && column !== null);

  $effect(() => {
    if (!SUPPORTS_DOM || !responsive) return;
    let frame = 0;
    const measure = (): void => {
      frame = 0;
      const next = resolveActiveBreakpoint(window.innerWidth);
      if (next !== activeBp) activeBp = next;
    };
    const onResize = (): void => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('resize', onResize);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  });

  // 有效列数：number 直用；对象按当前断点 mobile-first 级联解析（纯函数，红线 #2）。
  const effectiveColumn = $derived(
    typeof column === 'number'
      ? column
      : resolveResponsiveValue(column, activeBp, 3),
  );

  // 通过 context 向 <Descriptions.Item> 暴露父级布局配置（getter 保持响应性）。
  // column 暴露解析后的有效列数，使声明式 span 钳制随响应式列数实时更新。
  setDescriptionsContext({
    getColumn: () => effectiveColumn,
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
    return Math.min(span, effectiveColumn);
  }

  const cls = $derived(
    [
      'cd-descriptions',
      `cd-descriptions--${layout}`,
      `cd-descriptions--${direction}`,
      `cd-descriptions--${size}`,
      `cd-descriptions--align-${align}`,
      `cd-descriptions--justify-${justify}`,
      bordered && 'cd-descriptions--bordered',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const gridStyle = $derived(
    `grid-template-columns: repeat(${effectiveColumn}, minmax(0, 1fr));`,
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

  /*
    align：内容（value）水平对齐。horizontal 下 value 仍随 flex 流排在 label 后，
    text-align 控制其文本对齐；vertical 下 value 独占一行，text-align 直接生效。
  */
  .cd-descriptions--align-center :global(.cd-descriptions__value) {
    text-align: center;
  }
  .cd-descriptions--align-right :global(.cd-descriptions__value) {
    text-align: end;
  }

  /*
    justify：每个 item 内 label 与 value 的排布对齐（沿主轴）。horizontal 主轴为行，
    vertical 主轴为列。between 让 label 与 value 两端对齐、撑开剩余空间。
  */
  .cd-descriptions--justify-center :global(.cd-descriptions__item) {
    justify-content: center;
  }
  .cd-descriptions--justify-end :global(.cd-descriptions__item) {
    justify-content: flex-end;
  }
  .cd-descriptions--justify-between :global(.cd-descriptions__item) {
    justify-content: space-between;
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
