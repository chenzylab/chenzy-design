<!--
  List.Item — 严格对齐 Semi Design（@douyinfe/semi-ui/list/item.tsx）。

  API（与 Semi List.Item 完全一致）：
    header / main / extra / align('flex-start'|'flex-end'|'center'|'baseline'|'stretch') /
    className(class) / children / style / onClick / onRightClick / onMouseEnter / onMouseLeave。

  结构：<li.cd-list-item>
          <div.cd-list-item-body [.-body-{align}]>
            <div.cd-list-item-body-header>{header}</div>?
            <div.cd-list-item-body-main>{main}</div>?
          </div>?
          {children}
          <div.cd-list-item-extra>{extra}</div>?
        </li>
  仅当 header || main 存在时渲染 body。onClick/onRightClick 自带优先，否则回退 List context。
  grid 存在时（context）用 <Col> 包裹整个 li（Col props 来自 grid 去掉 Row 专属项）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Col } from '../grid/index.js';
  import { getListContext, type ListGrid } from './context.js';

  type Align = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';

  interface Props {
    /** 列表项头内容（string 或 Snippet）。 */
    header?: string | Snippet;
    /** 列表项主体内容（string 或 Snippet）。 */
    main?: string | Snippet;
    /** 列表项附加内容（右侧，string 或 Snippet）。 */
    extra?: string | Snippet;
    /** header 与 main 的垂直对齐方式。 */
    align?: Align;
    /** 项内主内容（通用插槽，与 header/main/extra 并存）。 */
    children?: Snippet;
    /** 行内样式。 */
    style?: string;
    /** 点击回调（自带优先，否则回退 List.onClick）。 */
    onClick?: (e: MouseEvent) => void;
    /** 右键回调（自带优先，否则回退 List.onRightClick）。 */
    onRightClick?: (e: MouseEvent) => void;
    /** 鼠标移入。 */
    onMouseEnter?: (e: MouseEvent) => void;
    /** 鼠标移出。 */
    onMouseLeave?: (e: MouseEvent) => void;
    /** 根类名。 */
    class?: string;
  }

  let {
    header,
    main,
    extra,
    align = 'flex-start',
    children,
    style,
    onClick,
    onRightClick,
    onMouseEnter,
    onMouseLeave,
    class: className = '',
  }: Props = $props();

  function isSnippet(v: unknown): v is Snippet {
    return typeof v === 'function';
  }

  const ctx = getListContext();
  const grid = $derived<ListGrid | undefined>(ctx?.getGrid());

  // click/contextmenu 回退到 List 级（对齐 Semi handleClick / handleContextMenu）。
  function handleClick(e: MouseEvent) {
    (onClick ?? ctx?.getOnClick())?.(e);
  }
  function handleContextMenu(e: MouseEvent) {
    (onRightClick ?? ctx?.getOnRightClick())?.(e);
  }

  const hasBody = $derived(header !== undefined || main !== undefined);
  const bodyCls = $derived(`cd-list-item-body cd-list-item-body-${align}`);
  const cls = $derived(['cd-list-item', className].filter(Boolean).join(' '));

  // grid → Col props：从 grid 去掉 Row 专属（gutter/align/justify/wrap），其余给 Col。
  const colProps = $derived.by(() => {
    if (!grid) return undefined;
    const { gutter, align: _a, justify, wrap, ...rest } = grid;
    return rest as Record<string, unknown>;
  });
</script>

{#snippet li()}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
  <li
    class={cls}
    {style}
    onclick={handleClick}
    oncontextmenu={handleContextMenu}
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
  >
    {#if hasBody}
      <div class={bodyCls}>
        {#if header !== undefined}
          <div class="cd-list-item-body-header">
            {#if isSnippet(header)}{@render header()}{:else}{header}{/if}
          </div>
        {/if}
        {#if main !== undefined}
          <div class="cd-list-item-body-main">
            {#if isSnippet(main)}{@render main()}{:else}{main}{/if}
          </div>
        {/if}
      </div>
    {/if}
    {@render children?.()}
    {#if extra !== undefined}
      <div class="cd-list-item-extra">
        {#if isSnippet(extra)}{@render extra()}{:else}{extra}{/if}
      </div>
    {/if}
  </li>
{/snippet}

{#if grid}
  <Col {...colProps}>
    {@render li()}
  </Col>
{:else}
  {@render li()}
{/if}

<style>
  /* 严格镜像 semi-foundation/list/list.scss 的 &-item 块（默认尺寸 padding 在此）。 */
  .cd-list-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    box-sizing: border-box;
    padding: var(--cd-spacing-list-item-paddingx) var(--cd-spacing-list-item-paddingy);
    margin: 0;
    list-style: none;
  }

  .cd-list-item-body {
    flex: 1;
    display: flex;
  }
  .cd-list-item-body-header {
    margin-right: var(--cd-spacing-list-header-marginright);
  }

  .cd-list-item-body-flex-start {
    align-items: flex-start;
  }
  .cd-list-item-body-flex-end {
    align-items: flex-end;
  }
  .cd-list-item-body-center {
    align-items: center;
  }
  .cd-list-item-body-stretch {
    align-items: stretch;
  }
  .cd-list-item-body-baseline {
    align-items: baseline;
  }

  .cd-list-item-extra {
    flex: 0 0 auto;
    margin-left: var(--cd-spacing-list-extra-marginleft);
  }
</style>
