<!--
  Card — 卡片容器，对齐 Semi Design Card。
  DOM 顺序（同 Semi）：header → cover → body(含 actions) → footer。
  - header：header snippet 优先，否则 headerExtraContent(左) + title(右)，wrapper row-reverse 使视觉为 title 左 / extra 右。
  - title 为 string 时用 Typography.Title heading=6 + 单行省略 + tooltip（同 Semi）。
  - body：loading 时用 Skeleton 占位（Title + Paragraph rows=3），仅在有 children 时渲染。
  - actions：body 内底部操作区，用 Space spacing=12 逐项排布（同 Semi）。
  - footer：自定义页脚，footerLine 控制其与 body 的上分隔线（默认 false，同 Semi）。
  shadows：'hover' | 'always'（无 never，同 Semi）；bordered 默认 true。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { Typography } from '../typography/index.js';
  import { Skeleton, SkeletonTitle, SkeletonParagraph } from '../skeleton/index.js';
  import { Space } from '../space/index.js';

  export type Shadows = 'hover' | 'always';

  export interface Props {
    /** 卡片标题；string 时用 Typography.Title heading=6 渲染并关联 aria-labelledby。 */
    title?: string | Snippet;
    /** header 右侧的额外内容（对齐 Semi headerExtraContent）。 */
    headerExtraContent?: Snippet;
    /** 自定义头部，传入将覆盖 title 与 headerExtraContent（对齐 Semi header）。 */
    header?: Snippet;
    /** 头部与内容区是否有分隔线。 */
    headerLine?: boolean;
    /** 头部区内联样式透传。 */
    headerStyle?: string;
    /** 卡片封面（出血）。 */
    cover?: Snippet;
    /** 内容区内联样式透传。 */
    bodyStyle?: string;
    /** 卡片内容区底部的操作组，以 12px 水平间距排布。 */
    actions?: Snippet;
    /** 自定义页脚。 */
    footer?: Snippet;
    /** 页脚区与内容区是否有分隔线（默认 false）。 */
    footerLine?: boolean;
    /** 页脚区内联样式透传。 */
    footerStyle?: string;
    /** 是否有外边框。 */
    bordered?: boolean;
    /** 阴影显示时机；不设则无阴影。 */
    shadows?: Shadows;
    /** 内容区是否显示加载占位。 */
    loading?: boolean;
    /** 根节点自定义类名。 */
    class?: string;
    /** 根节点自定义内联样式。 */
    style?: string;
    /** 根节点 aria-label，表述该 Card 的作用。 */
    ariaLabel?: string;
    /** 卡片正文。 */
    children?: Snippet;
  }

  let {
    title,
    headerExtraContent,
    header,
    headerLine = true,
    headerStyle,
    cover,
    bodyStyle,
    actions,
    footer,
    footerLine = false,
    footerStyle,
    bordered = true,
    shadows,
    loading = false,
    class: className,
    style,
    ariaLabel,
    children,
  }: Props = $props();

  const titleId = useId('cd-card-title');
  const titleIsString = $derived(typeof title === 'string');
  const titleText = $derived(typeof title === 'string' ? title : undefined);
  const titleSnippet = $derived(typeof title === 'function' ? title : undefined);
  const hasTitle = $derived(title !== undefined);
  const hasHeader = $derived(header !== undefined || headerExtraContent !== undefined || hasTitle);

  const cls = $derived(
    [
      'cd-card',
      bordered && 'cd-card--bordered',
      shadows && 'cd-card--shadows',
      shadows && `cd-card--shadows-${shadows}`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div
  class={cls}
  {style}
  role={hasTitle ? 'region' : undefined}
  aria-label={ariaLabel}
  aria-labelledby={titleIsString && !ariaLabel ? titleId : undefined}
  aria-busy={loading || undefined}
>
  {#if hasHeader}
    <div
      class={['cd-card__header', headerLine && 'cd-card__header--bordered']
        .filter(Boolean)
        .join(' ')}
      style={headerStyle}
    >
      {#if header}
        {@render header()}
      {:else}
        <div class="cd-card__header-wrapper">
          {#if headerExtraContent}
            <div class="cd-card__header-wrapper-extra">{@render headerExtraContent()}</div>
          {/if}
          {#if hasTitle}
            <div
              class={[
                'cd-card__header-wrapper-title',
                headerExtraContent && 'cd-card__header-wrapper-spacing',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {#if titleText !== undefined}
                <div id={titleId}>
                  <Typography.Title
                    heading={6}
                    ellipsis={{ showTooltip: true, rows: 1 }}
                  >
                    {titleText}
                  </Typography.Title>
                </div>
              {:else if titleSnippet}
                {@render titleSnippet()}
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if cover}
    <div class="cd-card__cover">{@render cover()}</div>
  {/if}

  <div class="cd-card__body" style={bodyStyle}>
    {#if children}
      {#if loading}
        <Skeleton loading active>
          {#snippet placeholder()}
            <SkeletonTitle />
            <br />
            <SkeletonParagraph rows={3} />
          {/snippet}
          {@render children()}
        </Skeleton>
      {:else}
        {@render children()}
      {/if}
    {/if}
    {#if actions}
      <div class="cd-card__body-actions">
        <Space spacing={12}>
          {@render actions()}
        </Space>
      </div>
    {/if}
  </div>

  {#if footer}
    <div
      class={['cd-card__footer', footerLine && 'cd-card__footer--bordered']
        .filter(Boolean)
        .join(' ')}
      style={footerStyle}
    >
      {@render footer()}
    </div>
  {/if}
</div>

<style>
  .cd-card {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border-radius: var(--cd-card-radius);
    border: var(--cd-card-border-width) solid transparent;
    overflow: hidden;
    background-color: var(--cd-card-bg);
    color: var(--cd-card-body-color);
    font-size: var(--cd-card-default-size);
    font-weight: var(--cd-card-default-weight);
    line-height: var(--cd-card-default-lineheight);
    letter-spacing: 0;
  }
  .cd-card--bordered {
    border-color: var(--cd-card-border-color);
  }

  /* shadows：hover 时悬停显示、always 常显；shadows 存在即 cursor:pointer（同 Semi）。 */
  .cd-card--shadows {
    cursor: pointer;
    transition: box-shadow var(--cd-card-transition-duration);
  }
  .cd-card--shadows-hover:hover {
    box-shadow: var(--cd-card-shadow);
    /* 避免网格型卡片组 shadow 被相邻卡覆盖 */
    z-index: var(--cd-card-z-hover);
  }
  .cd-card--shadows-always {
    box-shadow: var(--cd-card-shadow);
  }

  .cd-card__header {
    padding: var(--cd-card-padding);
  }
  .cd-card__header--bordered {
    border-bottom: var(--cd-card-border-width) solid var(--cd-card-border-color);
  }
  .cd-card__header-wrapper {
    display: flex;
    align-items: flex-start;
    flex-direction: row-reverse;
    justify-content: space-between;
  }
  .cd-card__header-wrapper-spacing {
    margin-inline-end: var(--cd-card-margin);
  }
  .cd-card__header-wrapper-title {
    inline-size: 100%;
    overflow: hidden;
    color: var(--cd-card-title-color);
    font-weight: var(--cd-card-title-weight);
    font-size: var(--cd-card-title-size);
    line-height: var(--cd-card-title-lineheight);
  }
  .cd-card__header-wrapper-extra {
    flex-shrink: 0;
    font-size: var(--cd-card-extra-size);
    font-weight: var(--cd-card-extra-weight);
    color: var(--cd-card-extra-color);
    letter-spacing: 0;
  }

  .cd-card__cover :global(> *) {
    display: block;
    inline-size: 100%;
  }

  .cd-card__body {
    padding: var(--cd-card-padding);
    font-size: var(--cd-card-default-size);
    font-weight: var(--cd-card-default-weight);
    line-height: var(--cd-card-default-lineheight);
    color: var(--cd-card-body-color);
    letter-spacing: 0;
  }
  .cd-card__body-actions {
    margin-block-start: var(--cd-card-margin);
    padding-block-start: var(--cd-card-padding);
    border-top: var(--cd-card-border-width) solid var(--cd-card-border-color);
  }

  .cd-card__footer {
    padding: var(--cd-card-padding);
  }
  .cd-card__footer--bordered {
    border-top: var(--cd-card-border-width) solid var(--cd-card-border-color);
  }
</style>
