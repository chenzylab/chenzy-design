<!--
  仅供 AutoComplete.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  AutoComplete 输入框 role=combobox，焦点始终留在 input 上；建议浮层渲染在
  .cd-autocomplete 内（非 portal），高亮走 aria-activedescendant 指向 option id。
  夹具暴露 onSelect 写入 lastSelected，供测试断言 Enter 选中。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import AutoComplete from './AutoComplete.svelte';

  const data = ['Apple', 'Apricot', 'Banana'];
  let lastSelected = $state<unknown>(undefined);
</script>

<LocaleProvider locale="en_US">
  <AutoComplete
    {data}
    ariaLabel="Fruit"
    onSelect={(v) => {
      lastSelected = v;
    }}
  />
  <output data-testid="selected">{JSON.stringify(lastSelected ?? null)}</output>
</LocaleProvider>
