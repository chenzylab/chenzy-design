<!--
  Highlight — see specs/components/show/Highlight.spec.md
  纯展示文本高亮：sourceString 中标记 searchWords。纯文本输出（不解析 HTML）。
  基础子集：单/多关键词、大小写敏感、highlightAll、autoEscape、自定义 component/类名/样式、unstyled。
  TODO(延后): highlight/chunk slot 自定义片段渲染、重叠区间合并、aria-describedby id。
-->
<script lang="ts">
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
  }: Props = $props();

  type Chunk = { text: string; match: boolean };

  function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function normalizeWords(words: string | string[]): string[] {
    const arr = Array.isArray(words) ? words : [words];
    return arr.filter((w) => typeof w === 'string' && w.length > 0);
  }

  function buildChunks(
    source: string,
    words: string[],
    opts: { caseSensitive: boolean; highlightAll: boolean; autoEscape: boolean },
  ): Chunk[] {
    if (!source) return [];
    if (words.length === 0) return [{ text: source, match: false }];

    const sources = words.map((w) => (opts.autoEscape ? escapeRegExp(w) : w));
    const pattern = `(${sources.join('|')})`;
    const flags = `${opts.caseSensitive ? '' : 'i'}${opts.highlightAll ? 'g' : ''}`;

    let re: RegExp;
    try {
      re = new RegExp(pattern, flags);
    } catch {
      // 非法正则源（autoEscape=false 误用）→ 不高亮，原样输出
      return [{ text: source, match: false }];
    }

    const chunks: Chunk[] = [];
    let lastIndex = 0;

    if (opts.highlightAll) {
      let m: RegExpExecArray | null;
      // 全局匹配：手动管理游标，空匹配时强制前进以避免死循环
      while ((m = re.exec(source)) !== null) {
        const start = m.index;
        const matched = m[0];
        if (matched.length === 0) {
          re.lastIndex += 1;
          continue;
        }
        if (start > lastIndex) {
          chunks.push({ text: source.slice(lastIndex, start), match: false });
        }
        chunks.push({ text: matched, match: true });
        lastIndex = start + matched.length;
      }
    } else {
      // 仅首个匹配（非全局正则，exec 一次即可）
      const m = re.exec(source);
      if (m && m[0].length > 0) {
        const start = m.index;
        if (start > lastIndex) {
          chunks.push({ text: source.slice(lastIndex, start), match: false });
        }
        chunks.push({ text: m[0], match: true });
        lastIndex = start + m[0].length;
      }
    }

    if (lastIndex < source.length) {
      chunks.push({ text: source.slice(lastIndex), match: false });
    }
    return chunks;
  }

  const words = $derived(normalizeWords(searchWords));
  const chunks = $derived(
    buildChunks(sourceString, words, { caseSensitive, highlightAll, autoEscape }),
  );

  const rootClass = $derived(['cd-highlight', className].filter(Boolean).join(' '));
  const markClass = $derived(
    ['cd-highlight__mark', unstyled && 'cd-highlight__mark--unstyled', highlightClassName]
      .filter(Boolean)
      .join(' '),
  );
</script>

<span class={rootClass} style={style || undefined}>
  {#each chunks as chunk, i (i)}
    {#if chunk.match}
      <svelte:element
        this={component}
        class={markClass}
        style={highlightStyle || undefined}>{chunk.text}</svelte:element>
    {:else}{chunk.text}{/if}
  {/each}
</span>

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
