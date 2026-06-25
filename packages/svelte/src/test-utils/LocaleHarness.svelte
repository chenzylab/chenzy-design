<!--
  LocaleHarness — a11y 测试专用包装组件。
  把被测组件包进 <LocaleProvider>，使 useLocale() 能拿到 context（默认 en_US）。
  通过 component prop 接收被测组件构造器，props 透传，children 作为默认插槽渲染。
  注意：仅用于测试，不对外导出。
-->
<script lang="ts">
  import type { Component, Snippet } from 'svelte';
  import { LocaleProvider } from '../locale-provider/index.js';

  interface Props {
    // 被测组件构造器（Svelte 5 Component）。
    component: Component<any>;
    // 透传给被测组件的 props。
    props?: Record<string, unknown>;
    // 语言码，默认 en_US。
    locale?: string;
    // 默认插槽内容（如 Button 的文字）。
    children?: Snippet;
  }

  let { component: Cmp, props = {}, locale = 'en_US', children }: Props = $props();
</script>

<LocaleProvider {locale}>
  <Cmp {...props}>
    {#if children}{@render children()}{/if}
  </Cmp>
</LocaleProvider>
