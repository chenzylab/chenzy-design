<!--
  夹具：复刻 docs localeprovider demo03 的**完整**结构 ——
  Select 在 LocaleProvider **外面**（切语言），LocaleProvider 包着一堆消费语言包的组件。
  之前的 SelectControlledKbdFixture 把 Select 放在 Provider 里面且只挂一个 output，
  是简化版；本夹具用来验证「Select 在外、Provider 在内且子树庞大」这个真实拓扑下
  受控 value 是否仍被 onChange 正常驱动、且切换后子树文案真的跟着变。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { zh_CN, en_US } from '@chenzy-design/locale';
  import type { Locale } from '@chenzy-design/locale';
  import Select from './Select.svelte';
  import Pagination from '../pagination/Pagination.svelte';

  let localeCode = $state<'zh_CN' | 'en_US'>('zh_CN');
  const locale = $derived<Locale>(localeCode === 'zh_CN' ? zh_CN : en_US);
</script>

<div>
  <Select
    prefix="切换语言"
    aria-label="Language"
    style="width: 250px"
    value={localeCode}
    optionList={[
      { value: 'zh_CN', label: '简体中文' },
      { value: 'en_US', label: '英语（美）' },
    ]}
    onChange={(v) => (localeCode = v as 'zh_CN' | 'en_US')}
  />
</div>

<output data-testid="code">{localeCode}</output>

<LocaleProvider {locale}>
  <Pagination total={100} showTotal currentPage={1} pageSize={10} />
</LocaleProvider>
