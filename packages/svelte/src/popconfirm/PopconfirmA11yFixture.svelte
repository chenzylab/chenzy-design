<!--
  Popconfirm a11y 测试夹具：在 LocaleProvider 内渲染 Popconfirm。
  trigger snippet 仅为非交互触发文案——触发包裹 div 自身承载 role=button + tabindex，
  故 trigger 内不嵌套原生交互元素（否则 axe nested-interactive）。
  仅供 Popconfirm.a11y.test.ts 使用，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Popconfirm from './Popconfirm.svelte';

  interface Props {
    open?: boolean;
    title?: string;
    content?: string;
    type?: 'default' | 'danger' | 'warning';
    locale?: string;
  }

  let {
    open = false,
    title = 'Delete this item?',
    content = 'This action cannot be undone.',
    type = 'default',
    locale = 'en_US',
  }: Props = $props();
</script>

<LocaleProvider {locale}>
  <Popconfirm {open} {title} {content} {type}>
    {#snippet trigger()}
      Delete
    {/snippet}
  </Popconfirm>
</LocaleProvider>
