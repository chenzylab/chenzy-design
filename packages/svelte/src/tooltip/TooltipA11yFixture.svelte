<!--
  Tooltip a11y 测试夹具：在 LocaleProvider 内渲染 Tooltip，
  并提供一个真实可聚焦的触发按钮作为 children（trigger 文案）。
  仅供 Tooltip.a11y.test.ts 使用，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Tooltip from './Tooltip.svelte';

  interface Props {
    visible?: boolean;
    content?: string;
    trigger?: 'hover' | 'focus' | 'click' | 'custom';
    locale?: string;
  }

  let {
    visible = false,
    content = 'More info',
    trigger = 'custom',
    locale = 'en_US',
  }: Props = $props();
</script>

<LocaleProvider {locale}>
  <Tooltip {visible} {content} {trigger}>
    <button type="button">Hover me</button>
  </Tooltip>
</LocaleProvider>
