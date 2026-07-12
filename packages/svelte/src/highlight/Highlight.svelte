<!--
  Highlight — see specs/components/show/Highlight.spec.md
  纯展示文本高亮：镜像 Semi Highlight。sourceString 中标记 searchWords，命中片段默认用
  <mark class="cd-highlight-tag"> 包裹，非命中片段原样输出纯文本（不解析 HTML）。
  片段分割 / 重叠区间合并 / 差异化样式载荷为纯函数（@chenzy-design/core highlightChunks）。

  对齐 Semi（semi-ui/highlight/index.tsx）：
  - 无外层 wrapper，直接输出片段序列（Semi render 返回数组）。
  - highlightClassName 追加到高亮 tag（Semi: cls({semi-highlight-tag:true}, highlightClassName)）。
  - searchWords 支持对象数组 { text, className, style }（Semi v2.71 差异化样式）；每词 style/className
    与组件级 highlightStyle/highlightClassName 合并（chunk 优先，对齐 Semi {...highlightStyle, ...chunk.style}）。
  - component 指定高亮标签（默认 mark）。caseSensitive / autoEscape 透传匹配算法。
-->
<script lang="ts">
  import { highlightChunks, type HighlightWord } from '@chenzy-design/core';

  interface Props {
    /** 源文本（纯文本，HTML 会被转义而非解析）。 */
    sourceString?: string;
    /** 需高亮的关键词；string / string[]，或对象数组 { text, className, style } 差异化样式。 */
    searchWords?: string | string[] | HighlightWord | HighlightWord[];
    /** 是否大小写敏感匹配（默认 false）。 */
    caseSensitive?: boolean;
    /** 是否对关键词做正则转义（默认 true）；关闭后 searchWords 视为正则源。 */
    autoEscape?: boolean;
    /** 高亮片段包裹标签名（默认 mark）。 */
    component?: string;
    /** 追加到每个高亮片段的类名。 */
    highlightClassName?: string;
    /** 追加到每个高亮片段的内联样式（字符串）。 */
    highlightStyle?: string;
  }

  let {
    sourceString = '',
    searchWords = [],
    caseSensitive = false,
    autoEscape = true,
    component = 'mark',
    highlightClassName = '',
    highlightStyle = '',
  }: Props = $props();

  // 片段分割 + 重叠区间合并 + 差异化样式载荷：纯函数（core），渲染只读派生。
  const chunks = $derived(highlightChunks(sourceString, searchWords, { caseSensitive, autoEscape }));

  // 高亮 tag class：cd-highlight-tag + highlightClassName + chunk 各自 className（对齐 Semi cls 拼接）。
  function tagClass(chunkClassName?: string): string {
    return ['cd-highlight-tag', highlightClassName, chunkClassName].filter(Boolean).join(' ');
  }

  // style 对象（差异化样式，React camelCase）→ CSS 字符串；与 highlightStyle 合并，chunk 优先。
  function tagStyle(chunkStyle?: Record<string, string | number>): string | undefined {
    const parts: string[] = [];
    if (highlightStyle) parts.push(highlightStyle.trim().replace(/;\s*$/, ''));
    if (chunkStyle) {
      for (const [k, v] of Object.entries(chunkStyle)) {
        const prop = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        parts.push(`${prop}: ${typeof v === 'number' ? `${v}px` : v}`);
      }
    }
    return parts.length ? `${parts.join('; ')};` : undefined;
  }
</script>

{#each chunks as item, i (i)}{#if item.highlight}<svelte:element
      this={component}
      class={tagClass(item.className)}
      style={tagStyle(item.style)}>{item.text}</svelte:element
    >{:else}{item.text}{/if}{/each}

<style>
  /* 镜像 Semi .semi-highlight-tag：仅 color / background-color / font-weight，无 padding、无 radius。 */
  :global(.cd-highlight-tag) {
    color: var(--cd-highlight-color);
    background-color: var(--cd-highlight-bg);
    font-weight: var(--cd-highlight-font-weight);
  }
</style>
