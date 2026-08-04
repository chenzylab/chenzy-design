<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import { treeData } from './_data';

  let value = $state<string[]>(['zhejiang', 'ningbo', 'haishu']);
</script>

<Cascader
  style="width: 300px"
  {treeData}
  placeholder="请选择所在地区"
  {value}
  multiple
  filterTreeNode
  onChange={(v) => (value = v as string[])}
/>
