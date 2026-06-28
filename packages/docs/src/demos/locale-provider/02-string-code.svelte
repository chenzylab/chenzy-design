<script lang="ts">
  import { LocaleProvider, Empty, Pagination, Text } from '@chenzy-design/svelte';

  // locale 既可传语言包对象，也可传内置字符串码（'zh-CN' / 'en-US'）。
  let code = $state<'zh-CN' | 'en-US'>('zh-CN');
</script>

<div style="display:flex; gap:8px; margin-bottom:12px">
  <button type="button" onclick={() => (code = 'zh-CN')}>中文（zh-CN）</button>
  <button type="button" onclick={() => (code = 'en-US')}>English (en-US)</button>
</div>

<LocaleProvider locale={code}>
  <div style="display:flex; flex-wrap:wrap; gap:24px; align-items:flex-start">
    <div>
      <Text type="secondary">Empty 内置文案</Text>
      <Empty image="noResult" />
    </div>
    <div>
      <Text type="secondary">Pagination 内置文案</Text>
      <Pagination total={120} showTotal currentPage={1} pageSize={10} />
    </div>
  </div>
</LocaleProvider>
