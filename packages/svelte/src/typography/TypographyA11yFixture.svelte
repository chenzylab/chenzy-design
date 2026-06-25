<!--
  Typography a11y 测试夹具：为 Text/Title/Link 提供真实文本 children。
  自带 LocaleProvider，故测试直接 render 本夹具。variant 选择子组件。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Text from './Text.svelte';
  import Title from './Title.svelte';
  import Link from './Link.svelte';

  interface Props {
    variant?: 'text' | 'title' | 'link';
    text?: string;
    props?: Record<string, unknown>;
  }
  let { variant = 'text', text = 'Hello', props = {} }: Props = $props();
</script>

<LocaleProvider locale="en_US">
  {#if variant === 'title'}
    <Title {...props}>{text}</Title>
  {:else if variant === 'link'}
    <Link {...props}>{text}</Link>
  {:else}
    <Text {...props}>{text}</Text>
  {/if}
</LocaleProvider>
