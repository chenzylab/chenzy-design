<!--
  Anchor — MarkdownRender 默认 `a` 覆盖。外链自动补 rel=noopener + target=_blank（对齐 Semi 安全默认）。
  外链判定：href 以 http(s):// 或 // 开头。相对 / 锚点链接不加。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Element } from 'hast';

  interface Props {
    node?: Element;
    href?: string | number | boolean;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { node, href, children, ...rest }: Props = $props();

  const hrefStr = $derived(typeof href === 'string' ? href : undefined);
  const isExternal = $derived(!!hrefStr && /^(https?:)?\/\//.test(hrefStr));

  // 过滤掉不透传给 <a> 的键（node/children 已解构；其余透传）。
  const passthrough = $derived(
    Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined && v !== null && v !== false),
    ),
  );
</script>

<a
  href={hrefStr}
  target={isExternal ? '_blank' : undefined}
  rel={isExternal ? 'noopener noreferrer' : undefined}
  {...passthrough}
>
  {#if children}{@render children()}{/if}
</a>
