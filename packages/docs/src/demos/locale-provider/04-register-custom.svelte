<script lang="ts">
  import {
    LocaleProvider,
    registerLocale,
    mergeLocale,
    zh_CN,
    Pagination,
    Empty,
    Text,
  } from '@chenzy-design/svelte';

  // 用 registerLocale 注册自定义语言包到字符串码，之后 locale 直接传该码即可解析。
  // 这里以 zh_CN 为基底，定制几条文案，注册为 'zh-CN-formal'。
  registerLocale(
    'zh-CN-formal',
    mergeLocale(zh_CN, {
      Pagination: { total: '本页之外另有记录，合计 {total} 条' },
      Empty: { noData: '尚无任何数据' },
    }),
  );
</script>

<LocaleProvider locale="zh-CN-formal">
  <div style="display:flex; flex-wrap:wrap; gap:24px; align-items:flex-start">
    <div>
      <Text type="secondary">自定义注册包 zh-CN-formal</Text>
      <Pagination total={256} showTotal currentPage={1} pageSize={10} />
    </div>
    <div>
      <Empty />
    </div>
  </div>
</LocaleProvider>
