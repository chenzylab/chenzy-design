<script lang="ts">
  import { LocaleProvider, zh_CN, en_US, Button, Pagination, Text } from '@chenzy-design/svelte';

  let isZh = $state(true);
</script>

<Button onclick={() => (isZh = !isZh)}>切换语言：{isZh ? '中文' : 'English'}</Button>
<div style="margin-top:12px">
  <LocaleProvider locale={isZh ? zh_CN : en_US}>
    {#snippet children({ locale, t, formatNumber })}
      <div style="line-height:2; margin-bottom:8px">
        <div>生效 locale：<strong>{locale}</strong></div>
        <div>Modal.okText：<strong>{t('Modal.okText')}</strong></div>
        <div>格式化数字 1234567.89：<strong>{formatNumber(1234567.89)}</strong></div>
      </div>
    {/snippet}
    <Pagination total={200} showTotal currentPage={1} pageSize={10} />
  </LocaleProvider>
</div>
