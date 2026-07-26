<!--
  Popconfirm a11y 测试夹具：在 LocaleProvider 内渲染 Popconfirm。
  trigger 文案非交互——click 模式下触发包裹 span 承载 role=button + aria-haspopup/expanded；
  custom 模式（受控）触发器纯透传（对齐 Semi：trigger=custom 不 wrap、语义归使用方）。
  仅供 Popconfirm.a11y.test.ts 使用，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Popconfirm from './Popconfirm.svelte';

  interface Props {
    visible?: boolean;
    title?: string;
    content?: string;
    locale?: string;
    trigger?: 'click' | 'custom';
  }

  let {
    visible = false,
    title = 'Delete this item?',
    content = 'This action cannot be undone.',
    locale = 'en_US',
    trigger = 'custom',
  }: Props = $props();
</script>

<LocaleProvider {locale}>
  <Popconfirm {visible} {trigger} {title} {content}>Delete</Popconfirm>
</LocaleProvider>
