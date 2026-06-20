<!--
  Highlight — see specs/components/show/Highlight.spec.md
  纯展示文本高亮：sourceString 中标记 searchWords。纯文本输出（不解析 HTML）。
  片段分割 / 重叠区间合并为纯函数（@chenzy-design/core highlightChunks，红线 #2），
  渲染派生：默认 <mark>，可由 highlight/chunk snippet 自定义。
  支持单/多关键词、大小写敏感、highlightAll、autoEscape、自定义 component/类名/样式、
  unstyled、命中片段 id + aria 关联。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { highlightChunks, useId } from '@chenzy-design/core';

  interface Props {
    sourceString?: string;
    searchWords?: string | string[];
    caseSensitive?: boolean;
    highlightAll?: boolean;
    autoEscape?: boolean;
    component?: string;
    highlightClassName?: string;
    highlightStyle?: string;
    className?: string;
    style?: string;
    unstyled?: boolean;
    /** 自定义命中片段渲染（覆盖默认 <mark>）。 */
    highlight?: Snippet<[{ chunk: string; index: number }]>;
    /** 自定义非命中片段渲染（默认裸文本）。 */
    chunk?: Snippet<[{ chunk: string; index: number }]>;
    /** 命中片段 id 前缀，用于 aria 关联；省略则自动生成。 */
    idPrefix?: string;
    /** 追加到每个命中片段的 aria-describedby（指向外部说明元素）。 */
    describedById?: string;
    /** 命中片段的 aria-label（默认不加，避免逐字播报噪音）。 */
    highlightAriaLabel?: string;
  }

  let {
    sourceString = '',
    searchWords = [],
    caseSensitive = false,
    highlightAll = true,
    autoEscape = true,
    component = 'mark',
    highlightClassName = '',
    highlightStyle = '',
    className = '',
    style = '',
    unstyled = false,
    highlight,
    chunk,
    idPrefix,
    describedById,
    highlightAriaLabel,
  }: Props = $props();

  // 稳定前缀：仅在未显式传入时生成一次，render 期只读（红线 #2）。
  const autoPrefix = useId('cd-highlight');
  const prefix = $derived(idPrefix || autoPrefix);

  // 片段分割 + 重叠区间合并：纯函数（core），渲染只读派生（红线 #2）。
  const chunks = $derived(
    highlightChunks(sourceString, searchWords, { caseSensitive, highlightAll, autoEscape }),
  );

  const rootClass = $derived(['cd-highlight', className].filter(Boolean).join(' '));
  const markClass = $derived(
    ['cd-highlight__mark', unstyled && 'cd-highlight__mark--unstyled', highlightClassName]
      .filter(Boolean)
      .join(' '),
  );
</script>

<span class={rootClass} style={style || undefined}
  >{#each chunks as item, i (i)}{#if item.matched}{#if highlight}{@render highlight({ chunk: item.text, index: i })}{:else}<svelte:element
          this={component}
          id={`${prefix}-${i}`}
          class={markClass}
          style={highlightStyle || undefined}
          aria-label={highlightAriaLabel || undefined}
          aria-describedby={describedById || undefined}>{item.text}</svelte:element>{/if}{:else if chunk}{@render chunk({ chunk: item.text, index: i })}{:else}{item.text}{/if}{/each}</span
>

<style>
  .cd-highlight {
    color: inherit;
  }
  .cd-highlight__mark {
    padding-inline: 2px;
    border-radius: var(--cd-radius-small);
    background: var(--cd-highlight-bg);
    color: var(--cd-highlight-color);
    font-weight: inherit;
  }
  .cd-highlight__mark--unstyled {
    padding-inline: 0;
    background: transparent;
    color: inherit;
  }
</style>
