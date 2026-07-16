<!--
  Upload a11y 测试夹具：在 LocaleProvider 内渲染 Upload，不传 children。
  说明：LocaleHarness 总会注入一个 children 插槽，会命中 Upload 的 {#if children}
  分支，使添加区/拖拽区跳过内置 locale 文案（渲染空插槽），故这里直接包
  LocaleProvider 渲染、不经 harness。仅供 Upload.a11y.test.ts 使用，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Upload from './Upload.svelte';
  import type { UploadFileItem } from './types.js';

  interface Props {
    draggable?: boolean;
    fileList?: UploadFileItem[];
    locale?: string;
  }

  let { draggable = false, fileList, locale = 'en_US' }: Props = $props();
</script>

<LocaleProvider {locale}>
  <Upload {draggable} action="/upload" {...(fileList !== undefined ? { fileList } : {})} />
</LocaleProvider>
