<!--
  List — 严格对齐 Semi Design（@douyinfe/semi-ui/list）。
  DOM/API/class/token 一比一镜像 semi-ui/list/index.tsx + semi-foundation/list/list.scss。

  API（与 Semi List 完全一致）：
    bordered / className(class) / dataSource / renderItem / emptyContent / footer /
    header / layout('vertical'|'horizontal') / loadMore / loading / size / split /
    style / onClick / onRightClick / children。
    grid：复用 Grid（Row/Col），gutter/align/justify/wrap → Row，span/offset/xs.. → Col。
    loading：复用 Spin 包裹列表体。emptyContent 缺省回退 locale List.emptyText。

  结构：<div.cd-list [-flex|-size|-grid|-split|-bordered]>
          <div.cd-list-header>?  →  Spin{ Row|ul.cd-list-items{ items|children } }  →  <div.cd-list-footer>?  →  loadMore?

  破坏性重写（无向后兼容）：移除 selectable/virtualized/pagination/skeleton/rowKey/
  List.Meta 等 Semi List 本体不存在的能力——这些在 Semi 里都是组合其他组件/第三方库的
  demo，不是 List 组件的 prop。
-->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  import { Row } from '../grid/index.js';
  import Spin from '../spin/Spin.svelte';
  import { useLocale } from '../locale-provider/index.js';
  import { setListContext, type ListGrid } from './context.js';

  type ListSize = 'small' | 'default' | 'large';
  type Layout = 'vertical' | 'horizontal';

  // 泛型组件 props 用内联类型而非具名 interface：declaration:true 下引用泛型 T 的
  // 具名 interface 会被当作私有名泄漏进 .d.ts 公共签名而报错。
  let {
    bordered = false,
    dataSource,
    renderItem,
    emptyContent,
    footer,
    header,
    layout = 'vertical',
    loadMore,
    loading = false,
    size = 'default',
    split = true,
    grid,
    style,
    onClick,
    onRightClick,
    children,
    class: className = '',
  }: {
    /** 是否显示外框。 */
    bordered?: boolean;
    /** 列表数据源。 */
    dataSource?: T[];
    /** 使用 dataSource 时自定义渲染列表项。 */
    renderItem?: Snippet<[item: T, index: number]>;
    /** 空列表展示内容（string 或 Snippet），缺省回退 locale List.emptyText。 */
    emptyContent?: string | Snippet;
    /** 列表底部（string 或 Snippet）。 */
    footer?: string | Snippet;
    /** 列表头部（string 或 Snippet）。 */
    header?: string | Snippet;
    /** 列表布局：vertical（默认）/ horizontal。 */
    layout?: Layout;
    /** 加载更多按钮区（Snippet）。 */
    loadMore?: Snippet;
    /** 是否处于加载中，为 true 时列表体外包裹 Spin。 */
    loading?: boolean;
    /** 列表尺寸：small / default / large。 */
    size?: ListSize;
    /** 是否展示分割线。 */
    split?: boolean;
    /** 栅格配置：复用 Grid（Row/Col），传入即启用栅格列表。 */
    grid?: ListGrid;
    /** 根容器行内样式。 */
    style?: string;
    /** 列表项点击回调（经 context 下发给 Item 作为回退）。 */
    onClick?: (e: MouseEvent) => void;
    /** 列表项右键回调（经 context 下发给 Item 作为回退）。 */
    onRightClick?: (e: MouseEvent) => void;
    /** 声明式用法：直接内嵌 <List.Item>（不传 dataSource 时）。 */
    children?: Snippet;
    /** 根类名。 */
    class?: string;
  } = $props();

  const loc = useLocale();

  function isSnippet(v: unknown): v is Snippet {
    return typeof v === 'function';
  }

  const hasData = $derived(!!dataSource && dataSource.length > 0);
  // 无数据且无声明式 children 时展示空态（对齐 Semi renderEmpty 触发条件）。
  const showEmpty = $derived(!hasData && !children);

  // grid 拆分：gutter/align/justify/wrap 归 Row；其余（span/offset/xs..）经 context 给 Col。
  const rowProps = $derived.by(() => {
    if (!grid) return undefined;
    const { gutter, align, justify, wrap } = grid;
    const p: Record<string, unknown> = {};
    if (gutter !== undefined) p.gutter = gutter;
    if (align !== undefined) p.align = align;
    if (justify !== undefined) p.justify = justify;
    if (wrap !== undefined) p.wrap = wrap;
    return p;
  });

  // 向 <List.Item> 下发 grid 与 List 级 onClick/onRightClick（getter 保持响应性）。
  setListContext({
    getGrid: () => grid,
    getOnClick: () => onClick,
    getOnRightClick: () => onRightClick,
  });

  // 对齐 semi-ui/list/index.tsx wrapperCls：-flex(horizontal)/-size/-grid/-split/-bordered。
  const cls = $derived(
    [
      'cd-list',
      layout === 'horizontal' && 'cd-list-flex',
      size && `cd-list-${size}`,
      grid && 'cd-list-grid',
      split && 'cd-list-split',
      bordered && 'cd-list-bordered',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const emptyText = $derived(loc().t('List.emptyText'));
</script>

<div class={cls} {style}>
  {#if header !== undefined}
    <div class="cd-list-header">
      {#if isSnippet(header)}{@render header()}{:else}{header}{/if}
    </div>
  {/if}

  <Spin spinning={loading} size="large">
    {#if showEmpty}
      <div class="cd-list-empty">
        {#if isSnippet(emptyContent)}
          {@render emptyContent()}
        {:else if emptyContent !== undefined}
          {emptyContent}
        {:else}
          {emptyText}
        {/if}
      </div>
    {:else if grid}
      <!-- 栅格列表：复用 Row 容器，Item 自身用 Col 包裹（经 context）。 -->
      <Row {...rowProps}>
        {#if hasData && renderItem}
          {#each dataSource! as item, index (index)}
            {@render renderItem(item, index)}
          {/each}
        {/if}
        {@render children?.()}
      </Row>
    {:else}
      <ul class="cd-list-items">
        {#if hasData && renderItem}
          {#each dataSource! as item, index (index)}
            {@render renderItem(item, index)}
          {/each}
        {/if}
        {@render children?.()}
      </ul>
    {/if}
  </Spin>

  {#if footer !== undefined}
    <div class="cd-list-footer">
      {#if isSnippet(footer)}{@render footer()}{:else}{footer}{/if}
    </div>
  {/if}

  {#if loadMore}{@render loadMore()}{/if}
</div>

<style>
  /* 严格镜像 semi-foundation/list/list.scss。字号用常规正文（Semi @include font-size-regular）。 */
  .cd-list {
    font-size: var(--cd-font-size-regular, 14px);
    line-height: var(--cd-line-height-regular, 20px);
  }

  .cd-list-items {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .cd-list-header,
  .cd-list-footer {
    padding: var(--cd-spacing-list-footer-paddingx) var(--cd-spacing-list-footer-paddingy);
  }

  .cd-list-empty {
    padding: var(--cd-spacing-list-empty-paddingx) var(--cd-spacing-list-empty-paddingy);
    color: var(--cd-color-list-empty-text-default);
    width: 100%;
    text-align: center;
  }

  /* split：行/头/尾分隔线用列表描边色（对齐 &-split &-item / &-header / &-footer）。 */
  .cd-list-split :global(.cd-list-item) {
    border-bottom: 1px solid var(--cd-color-list-default-border-default);
  }
  .cd-list-split :global(.cd-list-item:last-child) {
    border-bottom: none;
  }
  .cd-list-split .cd-list-header {
    border-bottom: 1px solid var(--cd-color-list-default-border-default);
  }
  .cd-list-split .cd-list-footer {
    border-top: 1px solid var(--cd-color-list-default-border-default);
  }

  /* 尺寸：item padding（header/footer 在 small/large 下同步，对齐 scss）。 */
  .cd-list-small :global(.cd-list-item),
  .cd-list-small .cd-list-header,
  .cd-list-small .cd-list-footer {
    padding: var(--cd-spacing-list-small-paddingx) var(--cd-spacing-list-small-paddingy);
  }
  .cd-list-large :global(.cd-list-item),
  .cd-list-large .cd-list-header,
  .cd-list-large .cd-list-footer {
    padding: var(--cd-spacing-list-large-paddingx) var(--cd-spacing-list-large-paddingy);
  }

  /* grid：item 去内边距（由 Row/Col gutter 控距）。 */
  .cd-list-grid :global(.cd-list-item) {
    padding: 0;
  }

  .cd-list-bordered {
    border: 1px solid var(--cd-color-list-default-border-default);
  }

  /* horizontal(-flex)：items 横向排列；split 改右边框。 */
  .cd-list-flex .cd-list-items {
    display: flex;
  }
  .cd-list-flex.cd-list-split :global(.cd-list-item) {
    border-bottom: none;
    border-right: 1px solid var(--cd-color-list-default-border-default);
  }
  .cd-list-flex.cd-list-split :global(.cd-list-item:last-child) {
    border-right: none;
  }
</style>
