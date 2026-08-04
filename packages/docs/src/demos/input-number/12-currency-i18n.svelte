<script lang="ts">
  // 复刻 Semi「货币展示」第一个 demo：LocaleProvider + Select 切换语言，
  // InputNumber 用 currency={true}（布尔模式）自动根据当前 locale 推断币种展示，
  // 无需手动指定 currency 字符串。
  // 本库语言包只有 zh_CN / en_US（Semi 演示了 21 种），故切换项为两档；
  // InputNumber 内部通过 useLocale() 读 LocaleProvider 注入的 code 做推断（对齐 Semi LocaleConsumer 透传）。
  import { LocaleProvider, zh_CN, en_US, InputNumber, Select, type Locale } from '@chenzy-design/svelte';

  let localeCode = $state<'zh_CN' | 'en_US'>('zh_CN');
  const locale = $derived<Locale>(localeCode === 'zh_CN' ? zh_CN : en_US);
</script>

<div style="padding-bottom: 20px">
  <Select
    insetLabel="切换语言"
    style="width: 250px"
    value={localeCode}
    optionList={[
      { value: 'zh_CN', label: '简体中文' },
      { value: 'en_US', label: '英语（美）' },
    ]}
    onChange={(v) => (localeCode = v as 'zh_CN' | 'en_US')}
  />
</div>

<LocaleProvider {locale}>
  {#key localeCode}
    <InputNumber currency defaultValue={123456.78} />
  {/key}
</LocaleProvider>
