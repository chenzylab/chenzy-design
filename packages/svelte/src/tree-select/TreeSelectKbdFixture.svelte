<!--
  仅供 TreeSelect.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  TreeSelect 浮层 portal 到 document.body；高亮走 aria-activedescendant
  （焦点留在 role=combobox 触发器上，方向键在可见树上 roving，treeitem tabindex=-1）。
  用三个顶层叶子节点，使初始可见列表稳定（无展开态干扰）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import TreeSelect from './TreeSelect.svelte';

  const treeData = [
    { key: 'a', label: 'Apple' },
    { key: 'b', label: 'Banana' },
    { key: 'c', label: 'Cherry' },
  ];
</script>

<LocaleProvider locale="en_US">
  <TreeSelect {treeData} ariaLabel="Fruit tree" placeholder="Pick a fruit" />
</LocaleProvider>
