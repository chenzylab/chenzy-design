<script lang="ts">
  // 本库补充能力：registerLocale 把自定义语言包注册到字符串码，
  // 之后 locale 直接传该码即可解析（Semi 的 locale 只接受语言包对象，无注册表）。
  // 这里以 zh_CN 为基底改写两条真实存在的文案，注册为 'zh-CN-formal'。
  import {
    LocaleProvider,
    registerLocale,
    mergeLocale,
    zh_CN,
    Pagination,
    Select,
    Text,
    type Locale,
  } from '@chenzy-design/svelte';

  registerLocale(
    'zh-CN-formal',
    mergeLocale(zh_CN, {
      Pagination: { total: '本页之外另有记录，合计 {total} 页' },
      Select: { emptyText: '尚无可选项' },
    }) as Locale,
  );
</script>

<div style="display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start">
  <div>
    <Text type="secondary">默认 zh_CN</Text>
    <LocaleProvider locale="zh_CN">
      <Pagination total={256} showTotal currentPage={1} pageSize={10} />
      <div style="width: 200px; margin-top: 8px">
        <Select filter optionList={[]} placeholder="搜索无结果时看空态" />
      </div>
    </LocaleProvider>
  </div>
  <div>
    <Text type="secondary">自定义注册包 zh-CN-formal</Text>
    <LocaleProvider locale="zh-CN-formal">
      <Pagination total={256} showTotal currentPage={1} pageSize={10} />
      <div style="width: 200px; margin-top: 8px">
        <Select filter optionList={[]} placeholder="搜索无结果时看空态" />
      </div>
    </LocaleProvider>
  </div>
</div>
