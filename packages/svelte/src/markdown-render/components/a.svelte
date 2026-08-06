<!--
  a — MarkdownRender 默认 a 覆盖（严格对齐 Semi markdownRender/components/a.tsx）。
  Semi：<Typography.Text link={{ ...props }} {...props} />（props 双重展开：一份进 link 对象透传给内部 <a>，
  一份直接 spread 到 Text 组件本身）。
  额外：外链（http(s):// 或 //）自动补 rel=noopener + target=_blank（安全默认，Semi Text link 也支持透传）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Text } from '../../typography/index.js';

  interface Props {
    href?: string | number | boolean;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { href, children, ...rest }: Props = $props();

  const hrefStr = $derived(typeof href === 'string' ? href : undefined);
  const isExternal = $derived(!!hrefStr && /^(https?:)?\/\//.test(hrefStr));

  // link 属性对象透传给内部 <a>（对齐 Semi link={{...props}}）。
  const linkProps = $derived({
    href: hrefStr,
    ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    ...Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined && v !== null && v !== false),
    ),
  });
</script>

<Text link={linkProps} {...rest}>
  {#if children}{@render children()}{/if}
</Text>
