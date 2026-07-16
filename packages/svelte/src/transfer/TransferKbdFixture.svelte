<!--
  Transfer 键盘 e2e 夹具（browser project）。对齐 Semi：左侧原生 Checkbox，中间原生
  移动 Button。受控 value + onChange 回写使「移动到对侧」真实生效（红线 #1）。
  验证：Tab/focus 到左侧 Checkbox、Space 勾选、点击移动按钮把勾选项移到右侧。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Transfer from './Transfer.svelte';

  const dataSource = [
    { key: 'a', label: 'Apple' },
    { key: 'b', label: 'Banana' },
    { key: 'c', label: 'Cherry' },
    { key: 'd', label: 'Date' },
  ];

  let value = $state<string[]>([]);
</script>

<LocaleProvider locale="en_US">
  <Transfer {dataSource} {value} onChange={(next) => (value = next as string[])} />
</LocaleProvider>
