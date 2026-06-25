<!--
  仅供 Transfer.kbd.test.ts（browser project）使用的双 listbox roving 键盘 e2e 夹具。
  受控 value + onChange 回写，使「移动到对侧」真实生效（红线 #1：组件不自改 value）。
  左侧为 SOURCE（role=listbox），条目 role=option + data-transfer-key；
  验证：列内 ↑↓ 真实移动焦点到相邻 option、Space 勾选、Enter 移动后焦点保留在源列合理位置。
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
