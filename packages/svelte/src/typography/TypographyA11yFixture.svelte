<!--
  Typography a11y 测试夹具：为 Text/Title/link 提供真实文本 children。
  自带 LocaleProvider，故测试直接 render 本夹具。variant 选择子组件；
  link variant 用 Text 的 link prop（对齐 Semi，无独立 Link 组件）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Text from './Text.svelte';
  import Title from './Title.svelte';

  interface Props {
    variant?: 'text' | 'title' | 'link';
    text?: string;
    props?: Record<string, unknown>;
  }
  let { variant = 'text', text = 'Hello', props = {} }: Props = $props();

  // link variant：把 props.href（及其他 a 属性）作为 link object 透传给 <a>。
  const linkHref = $derived((props as { href?: string }).href ?? 'https://example.com');
  const restProps = $derived.by(() => {
    const { href: _href, ...rest } = props as { href?: string } & Record<string, unknown>;
    return rest;
  });
</script>

<LocaleProvider locale="en_US">
  {#if variant === 'title'}
    <Title {...props}>{text}</Title>
  {:else if variant === 'link'}
    <Text link={{ href: linkHref }} {...restProps}>{text}</Text>
  {:else}
    <Text {...props}>{text}</Text>
  {/if}
</LocaleProvider>
