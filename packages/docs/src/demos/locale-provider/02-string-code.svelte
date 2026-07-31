<script lang="ts">
  // 严格复刻 Semi「自定义国际化组件」demo：
  //  - 上半部分读**内置组件**的 i18n 文本（Semi 用 TimePicker.begin，本库同）；
  //  - 下半部分读**自定义组件**注入的键（Semi 的 ComponentA.customKey，本库同）。
  // 三个语言包各自 mergeLocale 出一份带 ComponentA 的副本（对齐 Semi 的 `{...zh_CN, ComponentA: {...}}`）。
  // 本库语言包只有 zh_CN / en_US，故第三档用「en_US 基底 + 自定义 code」演示注册自定义包。
  import { LocaleProvider, zh_CN, en_US, mergeLocale, type Locale } from '@chenzy-design/svelte';
  import LocaleConsumerView from './LocaleConsumerView.svelte';

  const new_zh_CN = mergeLocale(zh_CN, { ComponentA: { customKey: 'semi' } }) as Locale;
  const new_en_US = mergeLocale(en_US, { ComponentA: { customKey: 'design' } }) as Locale;
  const new_custom = mergeLocale(en_US, {
    code: 'en-GB',
    ComponentA: { customKey: 'dsm' },
  }) as Locale;
</script>

<LocaleProvider locale={new_zh_CN}>
  <LocaleConsumerView componentName="TimePicker" field="begin" />
</LocaleProvider>
<LocaleProvider locale={new_en_US}>
  <LocaleConsumerView componentName="TimePicker" field="begin" />
</LocaleProvider>
<LocaleProvider locale={new_custom}>
  <LocaleConsumerView componentName="TimePicker" field="begin" />
</LocaleProvider>

<LocaleProvider locale={new_zh_CN}>
  <LocaleConsumerView componentName="ComponentA" field="customKey" />
</LocaleProvider>
<LocaleProvider locale={new_en_US}>
  <LocaleConsumerView componentName="ComponentA" field="customKey" />
</LocaleProvider>
<LocaleProvider locale={new_custom}>
  <LocaleConsumerView componentName="ComponentA" field="customKey" />
</LocaleProvider>
