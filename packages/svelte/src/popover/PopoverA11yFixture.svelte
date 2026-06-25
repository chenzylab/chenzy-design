<!--
  Popover a11y 测试夹具：在 LocaleProvider 内渲染 Popover。
  children 仅作触发文案（非交互）——dialog 模式下 Popover 的触发包裹 span 自身承载
  role=button + tabindex=0 + Enter/Space 激活（对齐 Dropdown），故 children 不再嵌套
  原生 <button>（否则 role=button 包裹可聚焦元素 → axe nested-interactive）。
  仅供 Popover.a11y.test.ts 使用，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Popover from './Popover.svelte';

  interface Props {
    open?: boolean;
    content?: string;
    title?: string | undefined;
    trigger?: 'hover' | 'click' | 'focus' | 'custom';
    locale?: string;
  }

  let {
    open = false,
    content = 'Popover body content',
    title,
    trigger = 'custom',
    locale = 'en_US',
  }: Props = $props();
</script>

<LocaleProvider {locale}>
  {#if title !== undefined}
    <Popover {open} {content} {title} {trigger}>Open</Popover>
  {:else}
    <Popover {open} {content} {trigger}>Open</Popover>
  {/if}
</LocaleProvider>
