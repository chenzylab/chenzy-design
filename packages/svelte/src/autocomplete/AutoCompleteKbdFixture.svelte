<!--
  仅供 AutoComplete.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  AutoComplete 输入框 role=combobox，焦点始终留在 input 上；浮层经 use:floating portal 到 body，
  高亮走 aria-activedescendant 指向 option id。
  对齐 Semi：组件不做本地过滤，data 由外部按输入 query 准备（此处 onChange 里就地过滤）。
  夹具暴露 onSelect 写入 lastSelected，供测试断言 Enter 选中。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import AutoComplete from './AutoComplete.svelte';

  const all = ['Apple', 'Apricot', 'Banana'];
  let value = $state('');
  let data = $state<string[]>([]);
  let lastSelected = $state<unknown>(undefined);

  // 组件不做本地过滤：外部按 query 准备 data（对齐 Semi data 驱动）。
  function filter(v: string | number) {
    const query = String(v);
    value = query;
    const q = query.toLowerCase();
    data = q ? all.filter((o) => o.toLowerCase().includes(q)) : [];
  }
</script>

<LocaleProvider locale="en_US">
  <AutoComplete
    {value}
    {data}
    defaultActiveFirstOption
    ariaLabel="Fruit"
    onChange={filter}
    onSelect={(v) => {
      lastSelected = v;
    }}
  />
  <output data-testid="selected">{JSON.stringify(lastSelected ?? null)}</output>
</LocaleProvider>
