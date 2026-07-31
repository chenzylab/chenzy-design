<script lang="ts">
  // 严格复刻 Semi「国际化」demo：两个 LocaleProvider 并列，各包一个 Pagination，
  // 直观对比同一组件在不同语言下的内置文案。
  // 本库语言包目前只有 zh_CN / en_US（Semi 有 57 个），故用这两个演示。
  import { LocaleProvider, zh_CN, en_US, Pagination } from '@chenzy-design/svelte';
</script>

<LocaleProvider locale={en_US}>
  <Pagination total={100} showTotal showSizeChanger style="margin: 20px" />
</LocaleProvider>
<LocaleProvider locale={zh_CN}>
  <Pagination total={100} showTotal showSizeChanger style="margin: 20px" />
</LocaleProvider>
