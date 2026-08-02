<!--
  browser project 夹具：复现「受控 value + onChange + inline optionList + prefix 字符串」
  这一组合（docs 的 localeprovider demo03「切换语言」Select 就是这么写的）。
  验证真实 chromium 里点击选项后受控值确实被 onChange 驱动更新。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Select from './Select.svelte';

  let value = $state<'zh_CN' | 'en_US'>('zh_CN');
</script>

<LocaleProvider locale="en_US">
  <Select
    prefix="切换语言"
    aria-label="Language"
    style="width: 250px"
    {value}
    optionList={[
      { value: 'zh_CN', label: '简体中文' },
      { value: 'en_US', label: '英语（美）' },
    ]}
    onChange={(v) => (value = v as 'zh_CN' | 'en_US')}
  />
  <output data-testid="value">{value}</output>
</LocaleProvider>
