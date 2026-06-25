<!--
  仅供 Cascader.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  Cascader 浮层 portal 到 document.body；列内高亮走 aria-activedescendant
  （焦点留在 role=combobox 触发器上，方向键移动列内高亮，options tabindex=-1）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Cascader from './Cascader.svelte';

  const treeData = [
    {
      label: 'Zhejiang',
      value: 'zj',
      children: [{ label: 'Hangzhou', value: 'hz' }],
    },
    {
      label: 'Jiangsu',
      value: 'js',
      children: [{ label: 'Nanjing', value: 'nj' }],
    },
    {
      label: 'Fujian',
      value: 'fj',
      children: [{ label: 'Xiamen', value: 'xm' }],
    },
  ];
</script>

<LocaleProvider locale="en_US">
  <Cascader {treeData} ariaLabel="Region" placeholder="Select region" />
</LocaleProvider>
