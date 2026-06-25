<!--
  仅供 Tree.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  Tree 高亮走 aria-activedescendant：焦点留在 role=tree 容器（tabindex=0），
  treeitem tabindex=-1 从不真实聚焦；高亮由容器 aria-activedescendant 指向的
  treeitem id 表达。顶层为叶子 + 一个可展开父节点，用于 ↑↓/Home/End/typeahead/`*`。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Tree from './Tree.svelte';

  // 顶层：Apple / Banana / Cherry（叶子）+ Date（可展开，含子）。
  // typeahead：输入 c 跳到 Cherry、b 跳到 Banana。
  const treeData = [
    { key: 'a', label: 'Apple' },
    { key: 'b', label: 'Banana' },
    { key: 'c', label: 'Cherry' },
    {
      key: 'd',
      label: 'Date',
      children: [
        { key: 'd1', label: 'Deglet' },
        { key: 'd2', label: 'Medjool' },
      ],
    },
  ];
</script>

<LocaleProvider locale="en_US">
  <Tree {treeData} ariaLabel="Fruit tree" />
</LocaleProvider>
