<!--
  Popover a11y 测试夹具：在 LocaleProvider 内渲染 Popover，
  并提供一个真实可聚焦的触发按钮作为 children（trigger 文案）。
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
    <Popover {open} {content} {title} {trigger}>
      <button type="button">Open</button>
    </Popover>
  {:else}
    <Popover {open} {content} {trigger}>
      <button type="button">Open</button>
    </Popover>
  {/if}
</LocaleProvider>
