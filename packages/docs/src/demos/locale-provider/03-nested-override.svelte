<script lang="ts">
  import { LocaleProvider, mergeLocale, zh_CN, Pagination, Text } from '@chenzy-design/svelte';

  // 嵌套：内层 inherit（默认）会深合并外层语言包，子覆盖父、未覆盖继承父。
  // 这里在 zh_CN 基础上只改写 Pagination.total，其余文案（上一页/下一页等）仍继承中文。
  const customPagination = mergeLocale(zh_CN, {
    Pagination: { total: '总计 {total} 条记录' },
  });
</script>

<LocaleProvider locale={zh_CN}>
  <div style="margin-bottom:8px">
    <Text type="secondary">外层（zh_CN 原文案）</Text>
    <Pagination total={88} showTotal currentPage={1} pageSize={10} />
  </div>

  <LocaleProvider locale={customPagination}>
    <div>
      <Text type="secondary">内层（仅覆盖 total 文案，其余继承外层）</Text>
      <Pagination total={88} showTotal currentPage={1} pageSize={10} />
    </div>
  </LocaleProvider>
</LocaleProvider>
