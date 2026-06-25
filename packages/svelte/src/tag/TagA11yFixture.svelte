<!--
  Tag a11y 测试夹具：提供真实文本 children（createRawSnippet 在 harness 下不渲染文本）。
  自带 LocaleProvider，故测试直接 render 本夹具。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Tag from './Tag.svelte';

  interface Props {
    text?: string;
    props?: Record<string, unknown>;
  }
  let { text = 'Done', props = {} }: Props = $props();
</script>

<LocaleProvider locale="en_US">
  <Tag {...props}>{text}</Tag>
</LocaleProvider>
