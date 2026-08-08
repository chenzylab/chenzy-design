<!--
  仅供 Cascader.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  Cascader 浮层 portal 到 document.body；列内高亮走 aria-activedescendant
  （焦点留在 role=combobox 触发器上，方向键移动列内高亮，options tabindex=-1）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Cascader from './Cascader.svelte';

  interface Props {
    multiple?: boolean;
    /** 真机 RTL 键义对调测试：包一层 .cd-rtl 令 direction:rtl 生效（本库 RTL 触发机制）。 */
    rtl?: boolean;
  }
  const { multiple = false, rtl = false }: Props = $props();

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
  <div class={rtl ? 'cd-rtl' : undefined}>
    <Cascader {treeData} {multiple} aria-label="Region" placeholder="Select region" />
  </div>
</LocaleProvider>
