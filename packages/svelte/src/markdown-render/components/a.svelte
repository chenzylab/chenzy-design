<!--
  a — MarkdownRender 默认 a 覆盖（严格对齐 Semi markdownRender/components/a.tsx）。
  Semi：<Typography.Text link={{ ...props }} {...props} />（props 双重展开：一份进 link 对象透传给内部 <a>，
  一份直接 spread 到 Text 组件本身）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Text } from '../../typography/index.js';

  interface Props {
    children?: Snippet;
    [key: string]: unknown;
  }

  let { children, ...rest }: Props = $props();
</script>

<Text link={{ ...rest }} {...rest}>
  {#if children}{@render children()}{/if}
</Text>
