<!--
  测试夹具：renderSelectedItem 自定义渲染 + draggable 组合场景（对齐 Semi
  renderSelectedItem 官方 demo 的 sortableHandle 用法）。用于回归验证自定义渲染下
  data-sortable-item / sortableHandle attachment 标记正确挂载（Transfer.a11y.test.ts）。
-->
<script lang="ts">
  import Transfer from './Transfer.svelte';
  import type { TransferItem, TransferGroup, TransferTreeNode } from './types.js';

  interface Props {
    dataSource: TransferItem[] | TransferGroup[] | TransferTreeNode[];
    defaultValue?: (string | number)[];
  }
  let { dataSource, defaultValue = [] }: Props = $props();
</script>

<Transfer {dataSource} {defaultValue} draggable>
  {#snippet renderSelectedItem({ item, onRemove, sortableHandle })}
    <div style="display:flex;align-items:center;gap:8px">
      <span {@attach sortableHandle()}>::</span>
      <span>{item.label}</span>
      <button type="button" onclick={onRemove}>x</button>
    </div>
  {/snippet}
</Transfer>
