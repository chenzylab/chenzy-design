<!--
  仅供 Select.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  Select 浮层 portal 到 document.body；高亮走 aria-activedescendant（焦点留在
  role=combobox 触发器上不动，由 aria-activedescendant 指向高亮 option）。
  夹具暴露 onChange 写入 lastValue，供测试断言 Enter 选中。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Select from './Select.svelte';

  const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
  ];

  let lastValue = $state<unknown>(undefined);
</script>

<LocaleProvider locale="en_US">
  <Select
    {options}
    ariaLabel="Fruit"
    defaultActiveFirstOption={false}
    onChange={(v) => {
      lastValue = v;
    }}
  />
  <output data-testid="value">{JSON.stringify(lastValue ?? null)}</output>
</LocaleProvider>
